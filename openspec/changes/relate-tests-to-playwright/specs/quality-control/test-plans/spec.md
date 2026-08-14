## MODIFIED Requirements

### Requirement: Categorized test plans by module

The system SHALL provide one test plan file per application module: Authentication, Inventory, Cart, Checkout, and Cross-cutting. It SHALL also provide a separate Playwright smoke plan that is not a replacement for the module plans.

#### Scenario: Each module has a dedicated test plan

- **WHEN** a tester navigates to `quality-control/test-plans/`
- **THEN** they SHALL find `01-authentication.md`, `02-inventory.md`, `03-cart.md`, `04-checkout.md`, and `05-cross-cutting.md`

#### Scenario: Playwright smoke plan is separate

- **WHEN** a tester needs the fast Playwright subset
- **THEN** they SHALL find `00-smoke.md` containing only smoke scenarios that map to tagged Playwright tests

#### Scenario: Test plans follow the template structure

- **WHEN** a tester opens any module test plan
- **THEN** it SHALL conform to the structure defined in `TEST-PLAN-TEMPLATE.md`

### Requirement: E2E test case tables with classification

Each module test plan SHALL contain a test cases table with columns for: ID, Scenario, Type (Positive/Negative/Critical), Priority (P0-P3), Steps, Expected Result, Coverage Status, and Related Spec. An automated row SHALL identify the corresponding Playwright test title when a spec file contains multiple cases.

#### Scenario: Critical test cases are identified

- **WHEN** a test case affects financial correctness or security
- **THEN** it SHALL be classified as Critical type with P0 priority

#### Scenario: Positive and negative cases are distinguished

- **WHEN** a test case validates happy-path behavior
- **THEN** it SHALL be classified as Positive type
- **WHEN** a test case validates error handling or rejection
- **THEN** it SHALL be classified as Negative type

#### Scenario: Automated cases have a canonical identifier

- **WHEN** a test case is automated in Playwright
- **THEN** its canonical plan ID SHALL appear in the plan row and the Playwright test title, and the Related Spec value SHALL identify the exact spec and test

### Requirement: Coverage gap identification

Each test plan SHALL include a coverage status column indicating whether the test case is Automated, Planned, or Blocked. Automated and smoke rows SHALL map to Playwright test files, while Planned and Blocked rows SHALL explain the remaining gap or defect reference instead of implying coverage.

#### Scenario: Existing tests are mapped

- **WHEN** a test case corresponds to an existing or newly added Playwright spec
- **THEN** its coverage status SHALL reference the exact spec file and canonical test ID

#### Scenario: Gaps are visible

- **WHEN** a feature has no passing automated test or is blocked by a known defect
- **THEN** its coverage status SHALL remain Planned or Blocked and SHALL NOT appear in the smoke plan as an automated case

#### Scenario: Traceability is bidirectional

- **WHEN** a reviewer compares the module plans with the Playwright spec files
- **THEN** every smoke-tagged test SHALL have one plan row and every automated plan row SHALL point to one canonical Playwright test

## ADDED Requirements

### Requirement: Playwright smoke test plan

The project SHALL provide `quality-control/test-plans/00-smoke.md` as the authoritative inventory of the fast Playwright subset. Every row SHALL correspond to a test tagged `@smoke`, identify its source module case ID, and describe the expected observable outcome.

#### Scenario: Smoke plan contains only Playwright tests

- **WHEN** a reviewer opens `00-smoke.md`
- **THEN** every listed case SHALL reference an `e2e/specs/*.spec.ts` test title and the `@smoke` tag, with no manual-only or Planned row

#### Scenario: Smoke execution matches the plan

- **WHEN** the suite runs in smoke mode
- **THEN** the executed `@smoke` cases SHALL be the cases listed in `00-smoke.md`, and each listed case SHALL be discoverable by the configured Playwright grep
