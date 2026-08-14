## Context

The project currently has:
- 4 Playwright spec files (auth, cart, checkout, inventory) with ~18 test cases
- 3 bug reports in `bug-reports/` with an informal markdown format
- No test plans, no templates, no coverage matrices
- E2E tests target https://www.saucedemo.com (SauceDemo demo app)

The quality control artifacts are pure documentation — no runtime code, no CI changes, no dependencies.

## Goals / Non-Goals

**Goals:**
- Establish a single `quality-control/` directory for all QA artifacts
- Provide reusable templates for test plans and bug reports
- Create categorized test plans with E2E test case tables (critical/positive/negative)
- Map test cases to existing Playwright specs for coverage visibility
- Preserve existing bug reports with identical content

**Non-Goals:**
- Changing Playwright test code or configuration
- Modifying CI/CD workflows
- Adding new automated tests (this change documents what to test, not the tests themselves)
- Creating a test management tool integration

## Decisions

### Directory structure

```
quality-control/
├── bug-reports/
│   ├── BUG-TEMPLATE.md        ← new standardized template
│   ├── bug-1-sort-by-price.md ← moved from root (unchanged)
│   ├── bug-2-checkout-total.md
│   └── bug-3-cart-badge.md
└── test-plans/
    ├── TEST-PLAN-TEMPLATE.md  ← reusable base template
    ├── 01-authentication.md
    ├── 02-inventory.md
    ├── 03-cart.md
    ├── 04-checkout.md
    └── 05-cross-cutting.md
```

**Decision**: Flat numeric prefix naming (`01-`, `02-`, ...) for test plans.
**Rationale**: Explicit ordering, easy to reference in conversations ("see test plan 03"), grep-friendly.
**Alternative considered**: Category-only names (`authentication.md`) — rejected because ordering matters when reviewing coverage sequentially.

### Test plan table format

Each module test plan uses a single markdown table with these columns:

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |

**Decision**: monolithic table per module instead of separate sections per type.
**Rationale**: Easier to scan full coverage at a glance, sort/filter in markdown viewers, and the Type column already distinguishes positive/negative/critical.

### Bug report template improvements

The new `BUG-TEMPLATE.md` adds:
- **Severity** (Critical/High/Medium/Low) independent of **Priority** (P0-P3)
- **Environment** section with mandatory fields: URL, browser, OS, viewport, user
- **Related Tests** linking to spec files or noting "exploratory testing"
- **Status** field with defined workflow: Open → In Progress → Fixed → Verified → Closed
- **Attachments** section for trace files and screenshots

**Decision**: severity and priority as separate axes.
**Rationale**: A cosmetic bug (Low severity) might need immediate fix before a release (P0 priority), while a data loss bug (Critical) might be scheduled for next sprint (P2 priority).

### Test case classification

- **Critical**: Financial correctness, security, data integrity
- **Positive**: Happy-path behavior validation
- **Negative**: Error handling, rejection, edge cases

**Decision**: three-type classification instead of two (positive/negative).
**Rationale**: Critical tests need special attention during regression — they must pass before any release. Separating them from regular positive cases makes risk visible.

## Risks / Trade-offs

- **[Risk] Templates become stale** → Mitigation: Templates include a `Version` field and `Last Updated` date. Review cadence is outside this change's scope.
- **[Risk] Coverage status drift** → Mitigation: Coverage Status column is manually maintained; adding/removing Playwright specs should trigger a test plan update. This is a process concern, not a technical one.
- **[Trade-off] Manual maintenance** → These are markdown files, not a test management tool. The benefit is zero dependencies and version control; the cost is manual updates.
