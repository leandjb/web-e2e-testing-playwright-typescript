## ADDED Requirements

### Requirement: Test isolation and reliable state reset

Authenticated tests SHALL start from a known, empty cart so that server-side cart state tied to the shared session cookie cannot leak between tests. The system SHALL reset cart state in a `beforeEach` hook (or equivalent) for every test that depends on cart contents.

#### Scenario: Cart starts empty for every test

- **WHEN** an authenticated test begins that later asserts cart contents
- **THEN** the cart is empty at the start of the test regardless of what prior tests added to the shared session

#### Scenario: Order independence

- **WHEN** the cart/checkout specs execute in any order or across shards
- **THEN** each test's cart assertions pass deterministically, independent of prior test execution

### Requirement: Deterministic navigation waits

The system SHALL navigate using `waitUntil: 'domcontentloaded'` combined with an explicit ready-locator wait (the page's primary content is visible) rather than `waitUntil: 'networkidle'`. This applies to both page-object `goto` helpers and `auth.setup`.

#### Scenario: Navigate without networkidle

- **WHEN** a page object or global setup navigates to a route
- **THEN** it waits on document readiness plus an explicit element-visibility condition, never on network idle

#### Scenario: Sort re-render settles before assertion

- **WHEN** a test changes a client-side sort order and then reads rendered prices
- **THEN** it waits for the re-rendered DOM to settle before asserting order

### Requirement: Safe concurrent authentication setup

`auth.setup` SHALL acquire an atomic lock before logging a user in and writing the `storageState` file, so that concurrent local shard runs sharing the same `.auth` bind mount cannot log the same user in twice and invalidate each other's session.

#### Scenario: Two local shards share setup without clobbering

- **WHEN** two shard containers run `auth.setup` concurrently against the same `.auth` directory
- **THEN** exactly one login occurs per user and both shards end with a valid, non-dropped session

### Requirement: Session freshness enforcement

The system SHALL verify the persisted `storageState` is still accepted by the application before relying on it; if the server-side session is stale or expired, the system SHALL re-authenticate rather than run tests against a dead session that silently redirects to login.

#### Scenario: Stale session is detected and refreshed

- **WHEN** a stored session is older than the application's effective TTL or is rejected on first use
- **THEN** the system re-logs-in and rewrites a fresh `storageState` before tests proceed

## MODIFIED Requirements

### Requirement: Secure multi-user authentication

The system SHALL authenticate test users once per run, persist each user's authenticated session (cookies and storage) to a secrets-protected location, and reuse it across tests. Credentials SHALL come exclusively from environment variables or CI secrets, never from committed code. Authenticated session files MUST NOT be included in the evidence backups. Setup SHALL be concurrency-safe (see Safe concurrent authentication setup) and SHALL enforce session freshness (see Session freshness enforcement).

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
- **THEN** the system verifies the user is denied access and asserts that the user remains on the login page and was NOT redirected into the application

### Requirement: Locator and assertion quality rules

The system SHALL use semantic, user-facing locators (role, label, test id) and SHALL NOT use fixed sleeps. Assertions SHALL be either soft (collecting multiple failures within a step without stopping) or hard (stopping immediately on failure), chosen per the assertion's role. Negative/outcome assertions SHALL be meaningful: a denial test SHALL assert the user is NOT redirected to an authenticated area (e.g., inventory), never a tautological URL match. Navigation waits SHALL be deterministic (see Deterministic navigation waits), not `networkidle`.

#### Scenario: Semantic locators only

- **WHEN** tests interact with the UI
- **THEN** they locate elements by accessible role, label, text, or explicit test id, and never by fixed sleep waits

#### Scenario: Soft assertions report all field discrepancies

- **WHEN** validating a form or a view with multiple fields
- **THEN** all discrepancies are collected and reported in a single pass without aborting mid-validation

#### Scenario: Hard assertion guards critical invariants

- **WHEN** asserting a gatekeeper condition (e.g., login success, blocked user denial, checkout total)
- **THEN** the test stops immediately if the condition fails

#### Scenario: Denial assertions are not tautological

- **WHEN** a test asserts a login was rejected
- **THEN** it asserts the URL/state proves the user stayed on login and was not redirected into the application

### Requirement: Test organization by feature with tags

The system SHALL organize tests by business feature (auth, inventory, cart, checkout), split into multiple focused spec files, and tag tests so subsets can be selected (`@smoke` for fast feedback, `@regression` for full runs). A `@flaky` tag SHALL mark tests that are known-flaky and opted into retries; only `@flaky` tests may use retries, so flakiness stays visible and is root-caused rather than masked by a blanket retry. Unused user-persona tags/env wiring SHALL NOT be committed (dead config is removed).

#### Scenario: Smoke subset selection

- **WHEN** the suite runs in smoke mode
- **THEN** only tests tagged `@smoke` execute

#### Scenario: Full regression selection

- **WHEN** the suite runs in full mode
- **THEN** all tests execute regardless of tag

#### Scenario: Balanced shard distribution

- **WHEN** tests are distributed across shards
- **THEN** distribution happens at spec-file granularity so no single shard receives an entire heavy feature's workload

#### Scenario: Flaky tests are quarantined, not masked

- **WHEN** a test is known to be intermittently failing for reasons not yet root-caused
- **THEN** it is tagged `@flaky` and runs with retries while a fix is pursued; non-flaky tests run with zero retries
