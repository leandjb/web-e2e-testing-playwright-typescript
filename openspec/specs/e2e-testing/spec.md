# e2e-testing Specification

## Purpose

Provides a containerized end-to-end testing capability against the public SauceDemo application, with secure multi-user authentication, parallel execution across shards, and persisted evidence, runnable identically in local Docker and CI.

## Requirements

### Requirement: Containerized execution environment

The system SHALL run the E2E test suite inside a container based on a pinned Playwright image, with the project mounted at `/tests` and tests located in `/tests/e2e`. The system SHALL install all dependencies inside the container (never on the host machine) and MUST be runnable with only Docker present on the host.

#### Scenario: Run suite in container without host installs

- **WHEN** the entrypoint is invoked with Docker available and no Node.js tooling installed on the host
- **THEN** the suite installs dependencies inside the container and executes the tests against `https://www.saucedemo.com/`

#### Scenario: Version-pinned environment

- **WHEN** the container is started
- **THEN** it uses the pinned Playwright image `mcr.microsoft.com/playwright:v1.62.0-noble` and the project's test runner version matches the image's browser versions

### Requirement: Evidence persistence

The system SHALL persist test evidence (HTML report and screenshots) to a host-visible `backups` directory and SHALL keep intermediate per-shard report data in a shared volume that survives container teardown.

#### Scenario: Evidence available after run

- **WHEN** a suite run finishes (pass or fail)
- **THEN** the merged HTML report and failure screenshots exist under `backups/` on the host

#### Scenario: Intermediate reports shared across shards

- **WHEN** multiple shard containers run in parallel
- **THEN** each shard writes its report data to the shared intermediate volume without overwriting other shards' data

### Requirement: Secure multi-user authentication

The system SHALL authenticate test users once per run, persist each user's authenticated session (cookies and storage) to a secrets-protected location, and reuse it across tests. Credentials SHALL come exclusively from environment variables or CI secrets, never from committed code. Authenticated session files MUST NOT be included in the evidence backups.

#### Scenario: Session reuse without repeated logins

- **WHEN** a test for an authenticated user starts
- **THEN** it begins already authenticated using the stored session instead of performing a new login

#### Scenario: Credentials not committed

- **WHEN** the repository is scanned for credentials
- **THEN** no user passwords or usernames appear in committed files; they are provided via environment variables

#### Scenario: Session data excluded from evidence

- **WHEN** evidence is collected into `backups/`
- **THEN** stored authentication sessions are never written into `backups/`

#### Scenario: Denied user behavior is covered

- **WHEN** a test targets a user who must be blocked from the application (e.g., a locked account)
- **THEN** the system verifies the user is denied access and asserts that denial

### Requirement: Test organization by feature with tags

The system SHALL organize tests by business feature (auth, inventory, cart, checkout), split into multiple focused spec files, and tag tests so subsets can be selected (`@smoke` for fast feedback, `@regression` for full runs, `@user-*` for session requirements).

#### Scenario: Smoke subset selection

- **WHEN** the suite runs in smoke mode
- **THEN** only tests tagged `@smoke` execute

#### Scenario: Full regression selection

- **WHEN** the suite runs in full mode
- **THEN** all tests execute regardless of tag

#### Scenario: Balanced shard distribution

- **WHEN** tests are distributed across shards
- **THEN** distribution happens at spec-file granularity so no single shard receives an entire heavy feature's workload

### Requirement: Locator and assertion quality rules

The system SHALL use semantic, user-facing locators (role, label, test id) and SHALL NOT use fixed sleeps. Assertions SHALL be either soft (collecting multiple failures within a step without stopping) or hard (stopping immediately on failure), chosen per the assertion's role.

#### Scenario: Semantic locators only

- **WHEN** tests interact with the UI
- **THEN** they locate elements by accessible role, label, text, or explicit test id, and never by fixed sleep waits

#### Scenario: Soft assertions report all field discrepancies

- **WHEN** validating a form or a view with multiple fields
- **THEN** all discrepancies are collected and reported in a single pass without aborting mid-validation

#### Scenario: Hard assertion guards critical invariants

- **WHEN** asserting a gatekeeper condition (e.g., login success, blocked user denial, checkout total)
- **THEN** the test stops immediately if the condition fails

### Requirement: Parallel execution with two shards and merged report

The system SHALL execute the suite across exactly 2 shards in CI, each shard running independently, and SHALL merge the shard reports into a single HTML report. A failing shard MUST NOT cancel the other shard, and the merge MUST still produce a report when at least one shard completed.

#### Scenario: Two shards run concurrently

- **WHEN** CI runs the suite
- **THEN** exactly two shard executions run in parallel, each handling its assigned share of tests

#### Scenario: Report merged from all shards

- **WHEN** all shards have completed
- **THEN** a single merged HTML report is produced containing the results of every shard

#### Scenario: Partial failure still yields report

- **WHEN** one shard fails and the other passes
- **THEN** the passing shard's results are still merged into a report and the pipeline result reflects the failure

### Requirement: CI trigger strategy

The system SHALL run smoke tests on pull requests, the full suite on merges to the default branch, and the full suite on a schedule of approximately every 15 days. CI SHALL respect the free-tier constraints of the hosting platform (single billable unit per shard, short artifact retention).

#### Scenario: Pull request runs smoke

- **WHEN** a pull request is opened or updated
- **THEN** only the smoke subset runs

#### Scenario: Merge to default branch runs full suite

- **WHEN** a commit is pushed to the default branch
- **THEN** the full suite runs

#### Scenario: Scheduled full run every ~15 days

- **WHEN** the schedule fires on days 1 and 15 of each month
- **THEN** the full suite runs

#### Scenario: Artifacts expire quickly

- **WHEN** CI uploads report artifacts
- **THEN** they are retained for no more than 7 days