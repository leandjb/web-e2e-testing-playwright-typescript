## Why

The `quality-control/test-plans` define 56 E2E test cases across 5 modules, while the current Playwright suite automates 17 cases. The plan rows and test titles are not consistently traceable, there is no smoke test plan that maps to the `@smoke` tag used in CI, and menu/navigation coverage is missing from the Page Object Model. This change closes 13 high-value gaps, canonicalizes duplicate case ownership, and makes the remaining Planned/Blocked coverage explicit instead of claiming it is automated.

## What Changes

- Establish one canonical test-case ID for each automated test and include that ID in the Playwright test title and the related test-plan row.
- Move the duplicate direct-URL-without-auth case from `AUTH-010` to the cross-cutting `NAV-001` owner, then update both plan tables and traceability matrices.
- Add 13 high-value Playwright cases: `AUTH-009`; `INV-002`, `INV-003`, `INV-008`, `INV-009`; `CART-006`, `CART-008`; `CO-005`, `CO-007`; `MENU-001` through `MENU-003`; and `NAV-001`.
- Create a `MenuPage` page object for burger-menu operations (reset app state, all items, about, and logout).
- Extend existing page objects with the inventory, cart, and checkout actions and assertions needed by the new cases; keep selectors centralized in page objects.
- Validate and document the stable semantic/data-test locator map before using it in new tests.
- Create `quality-control/test-plans/00-smoke.md` containing only Playwright tests tagged `@smoke`, with exact case-ID and spec/test-title traceability.
- Update all existing module plan tables and traceability matrices to point to current or newly planned Playwright specs, retaining explicit Planned/Blocked statuses for out-of-scope or known-defect cases.

## Capabilities

### New Capabilities

- `e2e/menu`: Playwright coverage for SauceDemo burger-menu navigation and state actions
- `e2e/navigation`: Playwright coverage for protected direct-route access and authentication redirects

### Modified Capabilities

- `quality-control/test-plans`: Add a Playwright-only smoke plan and require canonical, bidirectional mapping between plan cases and Playwright tests

## Impact

- **New files**: `e2e/pages/MenuPage.ts`, `e2e/specs/menu.spec.ts`, `e2e/specs/navigation.spec.ts`, `quality-control/test-plans/00-smoke.md`
- **Modified files**: `e2e/pages/InventoryPage.ts`, `e2e/pages/CartPage.ts`, `e2e/pages/CheckoutPage.ts`, `e2e/specs/auth.spec.ts`, `e2e/specs/inventory.spec.ts`, `e2e/specs/cart.spec.ts`, `e2e/specs/checkout.spec.ts`, and the existing module test plans
- **Known gaps preserved**: security-input, responsive, browser-history, empty-cart, and known-bug cases remain Planned or Blocked unless separately added to this scope; the smoke plan must not list them as automated.
- **No breaking application changes**: This is test and QA-artifact work; the existing Docker/CI entrypoints and public target remain unchanged.
- **CI/CD**: New tests tagged `@smoke` participate in the existing smoke mode; no workflow changes are required.
