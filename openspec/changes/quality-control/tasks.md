## 1. Directory Structure

- [x] 1.1 Create `quality-control/` directory at project root
- [x] 1.2 Create `quality-control/test-plans/` subdirectory
- [x] 1.3 Create `quality-control/bug-reports/` subdirectory
- [x] 1.4 Move existing `bug-reports/*` files into `quality-control/bug-reports/`
- [x] 1.5 Remove empty `bug-reports/` directory from project root

## 2. Templates

- [x] 2.1 Create `quality-control/test-plans/TEST-PLAN-TEMPLATE.md` with metadata, scope, environment, test data matrix, test cases table, and traceability matrix sections
- [x] 2.2 Create `quality-control/bug-reports/BUG-TEMPLATE.md` with title, ID, environment, severity/priority matrix, preconditions, steps, expected/actual, attachments, related tests, and status fields

## 3. Test Plans — Module Specs

- [x] 3.1 Create `01-authentication.md` — login positive/negative cases, logout, empty fields, locked user, session invalidation
- [x] 3.2 Create `02-inventory.md` — product list, sort (A-Z, Z-A, price low-high, price high-low), product detail, add to cart from detail
- [x] 3.3 Create `03-cart.md` — add/remove items, badge updates, cart persistence, continue shopping, quantity display
- [x] 3.4 Create `04-checkout.md` — happy path, field validation, order totals, cancel step 1/step 2, complete page, special chars
- [x] 3.5 Create `05-cross-cutting.md` — menu (reset, about, all items), navigation (direct URL, back/forward), responsive viewports

## 4. Test Case Tables

- [x] 4.1 Populate authentication test plan with full table: AUTH-001 through AUTH-006+ covering critical, positive, and negative cases
- [x] 4.2 Populate inventory test plan with full table: INV-001 through INV-008+ with coverage status mapped to `e2e/specs/inventory.spec.ts`
- [x] 4.3 Populate cart test plan with full table: CART-001 through CART-006+ with coverage status mapped to `e2e/specs/cart.spec.ts`
- [x] 4.4 Populate checkout test plan with full table: CO-001 through CO-007+ with coverage status mapped to `e2e/specs/checkout.spec.ts`
- [x] 4.5 Populate cross-cutting test plan with full table: MENU-001 through NAV-002+ (all marked as Planned — no automated coverage yet)

## 5. Validation

- [x] 5.1 Verify all 3 existing bug reports moved intact with identical content
- [x] 5.2 Verify every test plan conforms to `TEST-PLAN-TEMPLATE.md` structure
- [x] 5.3 Verify every test case has a Coverage Status referencing a spec file or marked as "Planned"
