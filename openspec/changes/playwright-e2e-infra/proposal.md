## Why

The repository has no E2E testing infrastructure: no `playwright.config.ts`, no tests, and no CI. We need a maintainable and scalable Playwright suite against `https://www.saucedemo.com/` that runs identically in a Docker container (local) and in GitHub Actions on a Free account, without installing any packages on the host machine. The project doubles as an interview-ready QA portfolio (public repo, green CI, professional structure).

## What Changes

- Add a Docker Compose runner based on `mcr.microsoft.com/playwright:v1.62.0-noble`; the project mounts at `/tests` and tests live in `/tests/e2e`. All dependencies install inside the container (`corepack` + `pnpm install --frozen-lockfile`), never on the host.
- Add `run-e2e.sh` as the single entrypoint: accepts shard count and mode (smoke/full), runs N containers in parallel, aggregates exit codes, runs the report merge, and cleans up. Used locally AND from CI (Option A).
- Add a Playwright TypeScript suite of ~16–18 passing tests (auth, inventory, cart, checkout) using Page Object Model, semantic locators, and a mix of soft (`expect.soft`) and hard assertions.
- Add secure multi-user authentication via Playwright `storageState` for 2 users (`standard_user`, `locked_out_user`); credentials come only from environment variables / GitHub Secrets.
- Add `.github/workflows/ci.yml` with **2 shards** (matrix `shard: [1,2]` + `merge` job) using `blob` reporter and `playwright merge-reports`:
  - `pull_request` → smoke (`--grep @smoke`)
  - `push` to `main` (merge) → full suite
  - `schedule` cron `"0 0 1,15 * *"` → full suite (every ~15 days)
- Add volumes for persistent evidence (`./backups` → HTML report + screenshots) and an intermediate `blob-report` volume; `.auth/` storage states are treated as secrets (gitignored, never in backups).
- Add README (portfolio format) and 3 sample bug reports in `/bug-reports/`.
- Non-goals (YAGNI): no multi-browser matrix, no API tests (saucedemo has no public API — documented in README), no visual tests, no custom Dockerfile, only 2 users for now.

## Capabilities

### New Capabilities

- `e2e-testing`: E2E test execution environment (Docker Compose runner, volumes, evidence) and the Playwright suite behavior (secure multi-user auth via storageState, test organization by feature with tags, soft/hard assertion strategy, and parallel execution with 2 shards and merged reports).

### Modified Capabilities

- None (no existing specs).

## Impact

- New files: `docker-compose.yml`, `run-e2e.sh`, `playwright.config.ts`, `.env.example`, `.gitignore` entries, `e2e/**` (pages, fixtures, specs, data, auth setup), `.github/workflows/ci.yml`, `README.md`, `bug-reports/*.md`.
- `package.json`: adds `@playwright/test` (pinned to `1.62.0` to match the Docker image's browsers) and a `test:e2e` script.
- GitHub repository settings: Secrets (`SAUCEDEMO_*`) and Variables (`BASE_URL`) must be configured for CI.
- No changes to existing application code (there is none yet in this repo).
