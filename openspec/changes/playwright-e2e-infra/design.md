## Context

The repo is a greenfield TypeScript project with no tests, no Playwright config, and no CI (see proposal.md - Why). Constraint from the user: **all execution happens in a Docker container and GitHub Actions; nothing is installed on the host**. Target application is `https://www.saucedemo.com/` (public, no API). CI runs on a GitHub Actions Free account and the project is an interview-ready portfolio, so the pipeline must be green, visible, and cheap.

## Goals / Non-Goals

**Goals:**
- Single execution path (script + Docker Compose) shared by local and CI, with zero host-side package installation.
- Exactly 2 shards in CI (matrix + merged report) that are obvious in the Actions UI.
- Secure multi-user auth via `storageState` (2 users for now) with credentials only from env/secrets.
- Portfolio-grade structure: POM, semantic locators, soft/hard assertion policy, evidence in `backups/`, README.

**Non-Goals:**
- Multi-browser matrix, visual tests, API tests (no public API), custom Dockerfile, >2 users, flaky-quarantine automation, report dashboards.

## Decisions

**1. `run-e2e.sh` as the single entrypoint (Option A).**
The script accepts shard count and mode (`smoke`/`full`), launches N containers via `docker compose run --rm` in parallel, wraps each in `timeout`, aggregates exit codes, runs the merge, and cleans up. CI calls it with `N=1` and the matrix shard index; local users call it with `N=2`.
- *Why*: local/CI parity (DRY) — "what runs on my machine runs in CI" is a strong interview narrative and a real maintenance win.
- *Alternative considered*: inline `docker compose` steps in the workflow YAML — rejected: duplicates logic across local/CI.

**2. CI topology: matrix of 2 shards + `merge` job (Playwright's canonical pattern).**
`e2e` job with `strategy.matrix.shard: [1,2]`, `fail-fast: false`; each job checks out, pulls the image, runs `bash run-e2e.sh 1 <mode>` with `SHARD_INDEX` from the matrix, and uploads its `blob-report/` as an artifact. A `merge` job with `needs: e2e` and `if: always()` downloads the blobs and runs `playwright merge-reports` to produce the HTML report.
- *Why*: documented pattern, scales by editing the matrix array, visible "shard 1/2 / 2/2" jobs in Actions UI, `fail-fast: false` preserves full evidence, `if: always()` still yields a report when a shard fails.
- *Alternative considered*: 1 job running 2 containers in parallel — rejected: sharding invisible in UI and orchestration lives in a custom script instead of declarative YAML.

**3. Containerized execution with no host installs.**
The Compose service uses `mcr.microsoft.com/playwright:v1.62.0-noble`, `working_dir: /tests`, and a command of `corepack enable && pnpm install --frozen-lockfile && npx playwright test ...`. `PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1` avoids re-downloading browsers (already in the image). `@playwright/test` is pinned to `1.62.0` to match the image's browsers.
- *Why*: reproducible, portable, and honors the no-host-install constraint.
- *Alternative*: `npm install` instead of pnpm — rejected: repo already uses pnpm (lockfile committed).

**4. Volume layout.**
- `./:/tests` (project + tests) with anonymous volume `/tests/node_modules` (isolates container deps from any host residue).
- Named volume `blob-report:/tests/blob-report` (shared intermediate for shards; survives teardown).
- Bind mount `./backups:/tests/backups` (host-visible evidence).
- Bind mount `./.auth:/tests/.auth` (storageState files) — **secrets**, gitignored, never mounted into backups.

**5. Sharding data flow via blob reporter.**
`playwright.config.ts` uses `reporter: [['blob', { dir: 'blob-report' }]]`. Each shard writes its own blob files; `merge-reports` in the `merge` service produces the final HTML into `backups/report`.

**6. Secure multi-user auth.**
`auth.setup.ts` (globalSetup) iterates `data/users.ts` (2 users: `standard_user`, `locked_out_user`), performs UI login, and saves `.auth/<role>.json`. Tests consume sessions via `test.use({ storageState })` or a fixture. Credentials come from env/Secrets.
- *Why*: login-once-per-run is faster and less flaky; the pattern is production-grade and interview-relevant.
- *Caveat (documented)*: `storageState` captures cookies + localStorage but **not** `sessionStorage`; if the target app ever used sessionStorage, restore it via `context.addInitScript`.

**7. Timeout defense-in-depth (no hanging containers).**
`test.timeout`, `expect.timeout`, and `globalTimeout` inside the config; `timeout <sec> docker compose run` in the script; `init: true`, `stop_grace_period`, `pids_limit`, `mem_limit`, `shm_size: 2gb`, `ipc: host` in Compose; `timeout-minutes` on the job as the final backstop.

**8. Free-tier CI strategy.**
Public repo (recommended) → unlimited minutes; single job per shard → 2 billable units per run; artifacts retained 7 days; `ubuntu-latest` (Linux 1× multiplier). Secrets: `SAUCEDEMO_PASSWORD` + 6 user names (`SAUCEDEMO_USER_*`); Variables: `BASE_URL`.

**9. Test organization for shard balance.**
Features split into multiple small spec files (Playwright distributes by spec file, so one heavy file would unbalance a shard). Tags: `@smoke`, `@regression`, `@user-*`. PR runs `--grep @smoke`.

**10. Assertion policy.**
Soft (`expect.soft`) for multi-field validation (forms, views) to collect all discrepancies; hard `expect` for gatekeeper invariants (login success, locked denial, checkout total).

## Risks / Trade-offs

- [Chromium sandbox fails when running as root in container] → disable sandbox in launch options (`chromiumSandbox: false` / `--no-sandbox`) — acceptable for CI against a public demo site.
- [Version drift between `@playwright/test` and image browsers] → pin `1.62.0` and note the pin in README.
- [pnpm missing from the base image] → `corepack enable` before `pnpm install`; fallback to `npm` if corepack is unavailable.
- [2 parallel shards against saucedemo could hit rate limits] → only 2 shards, `retries: 1`, small suite.
- [`.auth/` files contain live session cookies] → gitignore + exclusion from `backups/` (tested by spec scenario).
- [Runner resources (2 vCPU/7 GB) bound parallelism] → 1 container per CI job; local `N=2` measured and tuned.
- [Scheduled workflows pause after 60 days of repo inactivity] → accept; cron is a bonus, not the primary trigger.

## Migration Plan

Greenfield repo, no existing code to migrate: create files, push to GitHub, configure repo Secrets and Variables, and verify the Actions run goes green. Rollback = revert the commit (workflow simply stops running).

## Open Questions

- None that affect specs, approach, or tasks. Minor unknowns (exact shard balance, container memory on the host) are tuning items deferred to implementation and measurement.
