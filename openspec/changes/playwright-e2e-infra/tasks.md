## 1. Project Setup

- [ ] 1.1 Add `@playwright/test` pinned to `1.62.0` and a `test:e2e` script to `package.json`
- [ ] 1.2 Create `.env.example` documenting all environment variables (`BASE_URL`, `SAUCEDEMO_PASSWORD`, `SAUCEDEMO_USER_*` x6, `TEST_MODE`, `TOTAL_SHARDS`)
- [ ] 1.3 Update `.gitignore` to exclude `.env`, `.auth/`, `backups/`, `blob-report/`, `playwright-report/`, `node_modules/`

## 2. Playwright Configuration

- [ ] 2.1 Create `playwright.config.ts` with `testDir: './e2e'`, `baseURL` from `BASE_URL`, and `reporter: [['blob', { dir: 'blob-report' }]]`
- [ ] 2.2 Configure `retries: 1`, `trace: 'on-first-retry'`, `screenshot: 'only-on-failure'`, and a `globalTimeout` hard cap
- [ ] 2.3 Set sensible `test.timeout` / `expect.timeout` and `chromiumSandbox: false` for container execution
- [ ] 2.4 Configure `projects` so authenticated tests load their `storageState` from `.auth/<role>.json`

## 3. Docker Compose Runner

- [ ] 3.1 Create `docker-compose.yml` with an `e2e` service using `mcr.microsoft.com/playwright:v1.62.0-noble`, `working_dir: /tests`
- [ ] 3.2 Add volume mounts: `./:/tests`, anonymous `/tests/node_modules`, named `blob-report`, bind `./backups`, bind `./.auth`
- [ ] 3.3 Add container hardening: `shm_size: 2gb`, `ipc: host`, `init: true`, `pids_limit`, `mem_limit`, `stop_grace_period`
- [ ] 3.4 Add environment defaults (`BASE_URL`, `TOTAL_SHARDS`, `SHARD_INDEX`, `TEST_MODE`, `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1`)
- [ ] 3.5 Set the service command to `corepack enable && pnpm install --frozen-lockfile && npx playwright test` with shard and grep flags from env
- [ ] 3.6 Add a `merge` service (profile `merge`) that runs `playwright merge-reports` into `backups/report`

## 4. Orchestration Script

- [ ] 4.1 Create `run-e2e.sh` (`#!/usr/bin/env bash`) accepting `N` (shards) and `mode` (smoke/full), defaulting `N=1` for smoke and `N=2` for full
- [ ] 4.2 Launch N `docker compose run --rm` processes in parallel, each wrapped in `timeout`, with `SHARD_INDEX` and `TOTAL_SHARDS` set per shard
- [ ] 4.3 Aggregate exit codes (fail if any shard failed), then run the `merge` service and clean up with `docker compose down`

## 5. Authentication

- [ ] 5.1 Create `e2e/data/users.ts` with the 2 users (`standard_user`, `locked_out_user`) reading credentials from env
- [ ] 5.2 Create `auth.setup.ts` (globalSetup) that logs in each user and saves `.auth/<role>.json`
- [ ] 5.3 Create `e2e/fixtures/` exposing authenticated contexts per role for tests

## 6. Page Objects (POM)

- [ ] 6.1 Create `e2e/pages/BasePage.ts` with shared `goto()` / ready-wait helpers
- [ ] 6.2 Create `LoginPage.ts`, `InventoryPage.ts`, `CartPage.ts`, `CheckoutPage.ts` with typed locators and semantic actions (no raw selectors in specs)

## 7. Test Suite (~16-18 tests)

- [ ] 7.1 Write auth specs: login happy path, wrong credentials, locked-out user denial, logout (~6 tests, tagged `@smoke`/`@user-*`)
- [ ] 7.2 Write inventory specs: product list, sort, product detail (~3 tests)
- [ ] 7.3 Write cart specs: add to cart, remove, quantity edit (~3 tests)
- [ ] 7.4 Write checkout specs: happy path, form validation with soft assertions, order totals with hard assertions (~4 tests)
- [ ] 7.5 Apply soft/hard assertion policy and ensure no `waitForTimeout` anywhere

## 8. CI (GitHub Actions)

- [ ] 8.1 Create `.github/workflows/ci.yml`: `e2e` job with `matrix.shard: [1,2]` and `fail-fast: false`, calling `bash run-e2e.sh 1 <mode>` with `SHARD_INDEX`/`TOTAL_SHARDS=2` from env
- [ ] 8.2 Add triggers: `pull_request` → smoke, `push` to `main` → full, `schedule` cron `"0 0 1,15 * *"` → full
- [ ] 8.3 Upload per-shard `blob-report/` artifacts (7-day retention) and add `merge` job with `if: always()` downloading blobs and running the `merge` service
- [ ] 8.4 Upload final `backups/report` HTML artifact with 7-day retention
- [ ] 8.5 Wire env: `BASE_URL` from repo Variables, `SAUCEDEMO_*` from repo Secrets, `TEST_MODE` derived from the triggering event

## 9. Documentation & Evidence

- [ ] 9.1 Write README (portfolio format): what the suite does, how to run it (Docker-only), tech used, what I'd add next (including why no API tests), with the architecture diagram
- [ ] 9.2 Create 3 sample bug reports in `/bug-reports/` as markdown (title, environment, preconditions, steps, expected/actual, severity)
- [ ] 9.3 Document in README the GitHub Secrets and Variables required for CI

## 10. Verification

- [ ] 10.1 Run `bash run-e2e.sh 2 full` locally (Docker only, no host installs) and confirm all tests pass and evidence lands in `backups/`
- [ ] 10.2 Push to GitHub, confirm the PR smoke run and the merge full run go green with 2 shards and a merged report
- [ ] 10.3 Confirm `.auth/` files are gitignored and absent from `backups/` and the repository