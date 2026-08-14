## Context

The suite runs only inside the pinned Playwright Docker image (`v1.62.0-noble`, root, `--no-sandbox`), one Playwright worker per container, sharding at the container level. A single `storageState` file (`.auth/standard_user.json`) seeds every authenticated test via `fixtures/authenticated.ts`. SauceDemo keeps cart state server-side, keyed by the session cookie that lives in that file — so reusing one file across sequentially-run tests in a worker shares cart state. Page navigation uses `waitUntil: 'networkidle'`. `auth.setup` runs per container and guards reuse with a 5-minute mtime check. `playwright.config.ts` sets `retries: 1`. All fixes must remain Docker-only, not install anything on the host, and not change the public target or evidence paths.

## Goals / Non-Goals

**Goals:**
- Make every test order-independent and hermetic with respect to shared server state.
- Make denial-path assertions actually prove denial.
- Eliminate `networkidle`-based flakiness.
- Make `auth.setup` safe under concurrent local shards and against stale sessions.
- Surface (not hide) flakiness via an explicit `@flaky` quarantine.

**Non-Goals:**
- Introducing per-test ephemeral users / a user pool (a valid alternative, but heavier; cart-reset keeps one user and is lower-risk).
- Adding API-level tests or changing BASE_URL/target.
- Reworking the Docker/CI sharding topology.

## Decisions

### D1. Cart isolation via `beforeEach` reset (not per-test users)
Add a `beforeEach` to the authenticated fixture that navigates to the cart and removes every item until the cart is empty, then returns to a neutral page (or just leaves cart empty). This is the least-invasive fix and keeps a single `standard_user` session. Trade-off vs. a per-test user pool: simpler, no extra logins, but still depends on a shared session cookie; the reset makes that irrelevant to assertions.

### D2. Denial assertions use `not.toHaveURL`
Replace `toHaveURL(/.*$/)` in auth.spec.ts with `await expect(page).not.toHaveURL(/inventory\.html/)` (and optionally assert `errorMessage` visibility, which those tests already do). This proves the user was not redirected into the app.

### D3. Navigation waits: `domcontentloaded` + ready locator
- `BasePage.goto`: use `waitUntil: 'domcontentloaded'`; callers already wait on a page-specific ready locator (`InventoryPage.goto` waits `items.first().waitFor visible`; `CartPage.goto` same). For routes without an explicit ready wait, add one.
- `auth.setup` login: use `domcontentloaded` then wait for the username field, then proceed.

### D4. `auth.setup` atomic lock
Before login, `fs.mkdirSync(path.join(authDir, '.lock-' + role), { recursive: false })` — `mkdir` is atomic on the shared bind mount; the first shard to create the dir wins the lock, others skip login and reuse the state file. On completion (or error) the winner removes the lock dir. A small retry/sleep loop handles the brief window. This removes the TOCTOU race where two shards both saw "no file" and both logged in.

### D5. Session freshness check
After obtaining/reusing `storageState`, open a lightweight check (a `context().newPage()` navigating to `/inventory.html`) — if it redirects to `/` (login), treat the session as stale: delete the state file, drop the lock, and re-run the login. Keep the existing 5-minute mtime short-circuit as a fast path, but it no longer masks an expired server session.

### D6. Retry policy: `retries: 0` + `@flaky` quarantine
Set `retries: 0` in `playwright.config.ts`. Add a project or `testConfig` override so tests tagged `@flaky` run with `retries: 2` (via a separate project entry or an env-driven `retries` value). Document the quarantine process: a flaky test is tagged `@flaky`, investigated, then untagged once fixed. This makes non-flaky green trustworthy while keeping a safety net for known issues.

### D7. Sort settle wait
In `inventory.spec.ts` sort test, after `sortBy('lohi')`, assert the re-render settled before reading prices — e.g. `await expect(inventory.items.first().locator(price)).toHaveText(expectedLowestPrice)` or poll with `expect.poll` on the first item's price — then read all prices.

### D8. Prune dead config
Remove `SAUCEDEMO_USER_PROBLEM/PERFORMANCE/ERROR/VISUAL` from `docker-compose.yml` and `ci.yml` (or, if a user pool is later wanted, actually define those users in `users.ts` and filter tags). Remove the non-functional `@user-locked` tag, or wire it as a real grep filter. Default: remove dead wiring.

## Risks / Trade-offs

- **D1 reset adds a navigation per authenticated test** (minor runtime cost); acceptable for a ~17-test suite.
- **D4 lock dir** depends on atomic `mkdir` on the bind-mounted filesystem; overlay/ext4 both provide this. If the lock dir is left behind by a crashed container, a stale-lock guard (max age) or manual `rm` is needed — include a stale-lock cleanup at setup start.
- **D5 extra check navigation** adds one request per fresh session; negligible and only on cache miss.
- **D6 removing blanket retries** may briefly increase visible failures until D1–D5 land; that is the intended signal, not a regression.
- **D8** is cosmetic; safe to defer if the user prefers keeping env plumbing for future personas.
