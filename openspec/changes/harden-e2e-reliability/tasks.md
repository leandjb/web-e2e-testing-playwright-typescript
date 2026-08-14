## 1. Cart / server-state isolation

- [x] 1.1 Add a `beforeEach` to `e2e/fixtures/authenticated.ts` that navigates to the cart and removes every item until the cart is empty, so each authenticated test starts from a known-empty cart.
- [x] 1.2 Verify cart/checkout specs pass regardless of execution order (run with `--workers=1` and reversed file order as a sanity check).

## 2. Denial-path assertion correctness

- [x] 2.1 In `e2e/specs/auth.spec.ts`, replace `toHaveURL(/.*$/)` on the wrong-credentials and locked-out tests with `expect(page).not.toHaveURL(/inventory\.html/)` (keep the existing `errorMessage` assertions).
- [x] 2.2 Confirm a simulated "login succeeds but we assert denial" scenario would now fail (i.e., the assertion is no longer tautological).

## 3. Deterministic navigation waits

- [x] 3.1 In `e2e/pages/BasePage.ts`, change `goto` to `waitUntil: 'domcontentloaded'` and ensure an explicit ready-locator wait follows for every caller.
- [x] 3.2 In `auth.setup.ts`, change the login `page.goto('/')` to `domcontentloaded` and wait for the username field before filling.
- [x] 3.3 In `e2e/specs/inventory.spec.ts`, add a settle wait (assert first item price / `expect.poll`) after `sortBy('lohi')` before reading all prices.

## 4. Safe concurrent `auth.setup`

- [x] 4.1 In `auth.setup.ts`, acquire an atomic lock via `fs.mkdirSync(authDir + '/.lock-<role>', { recursive: false })` before login; the winner logs in and writes state, others reuse it. Remove the lock dir on completion/error.
- [x] 4.2 Add a stale-lock cleanup at setup start (ignore/remove lock dirs older than a short threshold, e.g. 2 min) so a crashed container doesn't deadlock future runs.

## 5. Session freshness enforcement

- [x] 5.1 In `auth.setup.ts`, after reuse/creation, verify the session by navigating a throwaway context to `/inventory.html`; if it redirects to login, delete the state file, drop the lock, and re-login.
- [x] 5.2 Keep the 5-minute mtime fast-path but ensure it no longer masks an expired server session.

## 6. Retry / flake policy

- [x] 6.1 In `playwright.config.ts`, set `retries: 0`.
- [x] 6.2 Add an `@flaky` quarantine mechanism (a separate project entry or env-driven `retries` for `@flaky`-tagged tests, e.g. `retries: 2`) and document the tag-and-root-cause process in the README.

## 7. Dead config pruning

- [x] 7.1 Remove unused `SAUCEDEMO_USER_PROBLEM/PERFORMANCE/ERROR/VISUAL` wiring from `docker-compose.yml` and `.github/workflows/ci.yml`, OR define those users in `e2e/data/users.ts` and wire real tag filters. Default: remove dead wiring.
- [x] 7.2 Remove the non-functional `@user-locked` tag from `auth.spec.ts`, or convert it into a real grep filter.

## 8. Verification (Docker-only, no host installs)

- [x] 8.1 Run `bash run-e2e.sh 2 full` locally and confirm all tests pass and evidence lands in `backups/`.
- [x] 8.2 Run `bash run-e2e.sh 1 smoke` and confirm the smoke subset passes.
- [x] 8.3 Re-run the full suite a second time within the cache window to confirm the `auth.setup` lock + freshness path is stable under repeated local runs.
- [ ] 8.4 (User) Push and confirm the PR smoke run and merge full run go green with 2 shards and a merged report.
