## Why

The project has E2E tests and 3 known bugs documented in `bug-reports/`, but there is no structured quality control process. Test plans don't exist, bug reports use an ad-hoc format, and there is no traceability between test cases and requirements. As the suite grows, this lack of structure makes it hard to know what is tested, what is not, and how to report new issues consistently.

## What Changes

- Create `quality-control/` directory as the single source of truth for all QA artifacts
- Move existing `bug-reports/` into `quality-control/bug-reports/`
- Create `quality-control/test-plans/` with:
  - A reusable test plan template (`TEST-PLAN-TEMPLATE.md`)
  - Category-specific test plans: Authentication, Inventory, Cart, Checkout, Cross-cutting
  - E2E test case tables covering critical, positive, and negative scenarios
- Create `quality-control/bug-reports/BUG-TEMPLATE.md` — a standardized bug report template with severity/priority matrix, environment details, and traceability to test specs

## Capabilities

### New Capabilities

- `quality-control/test-plans`: Structured test plans with categorized E2E test cases, reusable templates, and coverage matrices for the SauceDemo E2E suite
- `quality-control/bug-reports`: Standardized bug reporting templates with severity classification, environment capture, and linkage to test specifications

### Modified Capabilities

<!-- None — this change adds documentation structure, it does not change existing spec-level behavior. -->

## Impact

- **Files moved**: `bug-reports/*` → `quality-control/bug-reports/*`
- **New files**: ~8 markdown files under `quality-control/`
- **No code changes**: This is a documentation/structure change only
- **No breaking changes**: Existing bug reports are preserved with identical content
- **CI/CD**: No impact — test runner and workflow are unaffected
