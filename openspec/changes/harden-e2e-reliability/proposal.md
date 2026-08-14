## Why

The suite currently passes, but investigation surfaced two genuine correctness bugs and several reliability weaknesses that make green runs untrustworthy. A single shared authenticated `storageState` leaks server-side cart state across tests (SauceDemo keeps the cart per session), so cart/checkout specs are execution-order dependent. Two "denial path" tests assert `toHaveURL(/.*$/)` — a tautology that matches any URL — so they never prove the user was blocked. Navigation relies on `waitUntil: 'networkidle'` (a known flake source on live sites), `auth.setup` has a globalSetup race under local multi-shard runs, and a blanket `retries: 1` masks rather than fixes flakiness. These must be corrected before the suite can be relied on for CI gating.

## What Changes

- **Fix cart/server-state isolation**: authenticated tests no longer leak cart state across tests (reset cart in `beforeEach` so each test starts from a known-empty cart).
- **Fix denial-path assertions**: replace the tautological `toHaveURL(/.*$/)` on the wrong-credentials and locked-out tests with assertions that the user remains on the login page / is not redirected to inventory.
- **Replace `networkidle` waits**: navigation uses `domcontentloaded` plus an explicit ready-locator wait instead of `networkidle`.
- **Harden `auth.setup` against the parallel-setup race**: serialize globalSetup login with an atomic lock so concurrent local shards cannot invalidate each other's session.
- **Add a session-freshness check**: reject a stale/Server-expired `storageState` and re-authenticate instead of silently running against a dead session.
- **Stop masking flakes with `retries: 1`**: set retries to 0 by default; introduce an explicit `@flaky` quarantine tag that may opt into retries, so flakiness is visible and root-caused.
- **Stabilize the sort test**: wait for the client-side re-render to settle before reading prices.
- **Prune dead config**: remove the unused `SAUCEDEMO_USER_PROBLEM/PERFORMANCE/ERROR/VISUAL` wiring and the non-functional `@user-locked` tag (or wire them properly if a user-pool is introduced).

## Capabilities

### New Capabilities
<!-- none -->

### Modified Capabilities
- `e2e-testing`: modifies the Secure multi-user authentication, Locator and assertion quality rules, and Test organization by feature with tags requirements; adds a Test isolation and reliability requirement covering per-test state reset, deterministic waits, setup-race safety, session freshness, and flake handling.

## Impact

- `e2e/fixtures/authenticated.ts` (add cart-reset `beforeEach`, freshness check)
- `e2e/specs/auth.spec.ts` (denial-path URL assertions)
- `e2e/pages/BasePage.ts` and `auth.setup.ts` (navigation wait strategy)
- `auth.setup.ts` (atomic lock; freshness check)
- `playwright.config.ts` (`retries` policy; optional `@flaky` retry group)
- `e2e/specs/inventory.spec.ts` (sort settle wait)
- `docker-compose.yml` / `.github/workflows/ci.yml` / `e2e/data/users.ts` (prune dead user env/tags)
- No change to the external public contract (SauceDemo target, Docker-only execution, evidence paths).
