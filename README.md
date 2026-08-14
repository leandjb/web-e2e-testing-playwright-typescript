# Web E2E Testing — Playwright (TypeScript)

Containerized, parallel end-to-end tests for [SauceDemo](https://www.saucedemo.com/),
built with Playwright + TypeScript and designed to run **identically in local
Docker and GitHub Actions** — with **zero package installation on the host**.

This repo doubles as an interview-ready QA portfolio: green CI, a clean
Page-Object structure, secure multi-user auth, soft/hard assertion discipline,
and a 2-shard matrix with a merged HTML report.

## What it does

- Runs a ~17-test Playwright suite across four feature areas: **auth**,
  **inventory**, **cart**, and **checkout**.
- Authenticates users **once per run** and reuses persisted sessions via
  Playwright `storageState` (no repeated logins inside tests).
- Splits the suite across **2 shards** in CI and merges the per-shard blob
  reports into a single HTML report.
- Persists evidence (HTML report + failure screenshots) to `backups/`.
- Uses semantic, user-facing locators (`getByRole`, `getByTestId`) and never
  fixed `waitForTimeout` sleeps.

## How to run it (Docker only)

You only need **Docker** installed. Everything else (Node, Playwright, browsers)
lives inside the pinned image `mcr.microsoft.com/playwright:v1.62.0-noble`.

1. Copy the env template and fill in credentials (gitignored, never committed):

   ```bash
   cp .env.example .env
   # edit .env — at minimum set SAUCEDEMO_PASSWORD=secret_sauce for local runs
   ```

2. Run the full suite across 2 local shards (installs deps in-container, merges
   the report, and cleans up):

   ```bash
   bash run-e2e.sh 2 full
   ```

   Or just the smoke subset on a single shard:

   ```bash
   bash run-e2e.sh 1 smoke
   ```

3. Open the merged report:

   ```bash
   open backups/report/index.html
   ```

> No `npm install` / `pnpm install` on the host. Dependencies are installed
> **inside the container** via `corepack enable && pnpm install --frozen-lockfile`.

## Architecture

```
┌──────────────┐   ┌──────────────────────────────────────────────┐
│  Host (only  │   │  Docker Compose (mcr.microsoft.com/playwright │
│  Docker CLI) │   │            v1.62.0-noble, working_dir /tests)  │
└──────┬───────┘   └──────────────────────────────────────────────┘
       │ docker compose run --rm e2e (x N shards, parallel)
       │
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  /tests  (project bind-mounted)                                   │
│   ├─ e2e/ (specs, pages, fixtures, data)                          │
│   ├─ playwright.config.ts  (blob reporter → blob-report/)         │
│   ├─ auth.setup.ts        (logs in users → .auth/<role>.json)     │
│   ├─ blob-report/         (per-shard blobs, bind-mounted)         │
│   └─ backups/             (merged HTML report + screenshots)      │
└─────────────────────────────────────────────────────────────────┘
       │ run-e2e.sh aggregates exit codes, then:
       ▼
┌─────────────────────────────────────────────────────────────────┐
│  merge service: playwright merge-reports → backups/report (HTML) │
└─────────────────────────────────────────────────────────────────┘

 CI matrix (shard: [1,2], fail-fast: false)
   e2e (shard 1) ─┐
                  ├─ upload blob-report-1 / blob-report-2 ─┐
   e2e (shard 2) ─┘                                        ▼
                                                  merge job → html-report
```

## Tech used

- **Playwright 1.62.0** (pinned to match the container's browsers) with the
  TypeScript test runner.
- **Page Object Model** (`e2e/pages/`) so specs describe behavior, not selectors.
- **Soft + hard assertions**: `expect.soft` collects every discrepancy in a
  single validation pass (e.g. empty checkout form); hard `expect` guards
  gatekeepers (login success, locked-user denial, checkout total).
- **Tagged execution**: `@smoke` for fast PR feedback, `@regression` for full
  runs, `@user-*` for session requirements.
- **Defense-in-depth timeouts**: `test.timeout`, `expect.timeout`,
  `globalTimeout`, `timeout` wrappers in the script, container `shm_size` /
  `ipc` / `init` / `pids_limit` / `mem_limit`, and a `timeout-minutes` backstop.

## CI: required GitHub Secrets & Variables

The workflow (`.github/workflows/ci.yml`) reads the following from the repo's
**Settings → Secrets and variables → Actions**. They are never committed.

**Secrets** (Settings → Secrets):

| Name                      | Example value      | Purpose                              |
| ------------------------- | ------------------ | ------------------------------------ |
| `SAUCEDEMO_PASSWORD`      | `secret_sauce`     | Shared password for all demo users.  |
| `SAUCEDEMO_USER_STANDARD` | `standard_user`    | Working account.                     |
| `SAUCEDEMO_USER_LOCKED`   | `locked_out_user`  | Intentionally locked-out account.    |
| `SAUCEDEMO_USER_PROBLEM`  | `problem_user`     | Reserved for future expansion.       |
| `SAUCEDEMO_USER_PERFORMANCE` | `performance_glitch_user` | Reserved for future expansion. |
| `SAUCEDEMO_USER_ERROR`    | `error_user`       | Reserved for future expansion.       |
| `SAUCEDEMO_USER_VISUAL`   | `visual_user`      | Reserved for future expansion.       |

**Variables** (Settings → Variables):

| Name       | Example value                 | Purpose              |
| ---------- | ----------------------------- | -------------------- |
| `BASE_URL` | `https://www.saucedemo.com`   | Application under test. |

Triggers: `pull_request` → smoke subset, `push` to `main` → full suite,
`schedule` (`0 0 1,15 * *`) → full suite.

## What I'd add next

- **Expand the user matrix** to the remaining 5 SauceDemo accounts
  (`problem_user`, `performance_glitch_user`, …) with per-role fixtures.
- **Visual regression** on the inventory page (once the suite is larger).
- **Self-hosted runner** if the free-tier minutes become a constraint.
- **API contract checks** — *if* the target ever exposes a public API.

### Why there are no API tests

SauceDemo is a **UI-only** demo site with **no public API** (the login and cart
flows are exercised exclusively through the browser). Adding API tests would
require either a backend we don't own or fabricating endpoints, which would test
nothing real — so the scope is intentionally UI/E2E only (YAGNI).

## Bug reports

Sample defect write-ups live in [`bug-reports/`](./bug-reports).
