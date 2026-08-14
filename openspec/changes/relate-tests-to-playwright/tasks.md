## 1. Establish canonical traceability

- [ ] 1.1 Inventory all 56 test-plan rows and the 17 current Playwright tests, then produce a one-to-one mapping of existing automated cases to spec files and test titles.
- [ ] 1.2 Add the canonical plan ID to every automated Playwright test title and preserve the existing `@smoke`/`@regression` classification.
- [ ] 1.3 Remove the duplicate `AUTH-010` direct-route ownership from `01-authentication.md`, make `NAV-001` the canonical cross-cutting case, and update both traceability tables.
- [ ] 1.4 Keep every out-of-scope or known-defect case explicitly `Planned` or `Blocked` with its gap or bug reference; do not list those cases as smoke coverage.

## 2. Verify locator map and page-object foundations

- [ ] 2.1 Inspect the target DOM in the pinned Playwright Docker image and confirm the accessible-role and `data-test` locators for menu links, detail-page controls, cart rows/quantities, and checkout navigation.
- [ ] 2.2 Create `e2e/pages/MenuPage.ts` with page-object locators and methods for opening the menu, resetting app state, opening All Items, opening About, and logging out.
- [ ] 2.3 Extend `e2e/pages/InventoryPage.ts` with the back-to-products control, item-price locator, and `getPrices()`/`getNames()` helpers needed by the inventory cases.
- [ ] 2.4 Extend `e2e/pages/CartPage.ts` with a reliable item-count/empty-state representation and the reusable navigation/action methods needed by cart cases.
- [ ] 2.5 Extend `e2e/pages/CheckoutPage.ts` with Cancel and Back Home locators plus `cancel()` and `goBackHome()` methods.
- [ ] 2.6 Refactor existing direct menu, cart-navigation, and checkout-navigation interactions in specs to call page-object methods so specs contain behavior and assertions rather than selectors.
- [ ] 2.7 Add destination ready-locator waits to each new page-object navigation method and avoid fixed sleeps or raw selectors in spec files.

## 3. Add the 13 scoped Playwright cases

- [ ] 3.1 Add `AUTH-009` to `e2e/specs/auth.spec.ts` to verify a logged-in session remains usable after refresh, using the login page object and the configured authenticated route assertion.
- [ ] 3.2 Add `INV-002` and `INV-003` to `e2e/specs/inventory.spec.ts` for name ascending and descending sorting, reading names through `InventoryPage`.
- [ ] 3.3 Add `INV-008` and `INV-009` to `e2e/specs/inventory.spec.ts` for adding from a product detail page and returning with Back to Products; tag `INV-008` as `@smoke`.
- [ ] 3.4 Add `CART-006` and `CART-008` to `e2e/specs/cart.spec.ts` for cart persistence across navigation and quantity display, using `CartPage` helpers.
- [ ] 3.5 Add `CO-005` and `CO-007` to `e2e/specs/checkout.spec.ts` for canceling from overview and returning home after completion, using `CheckoutPage` methods.
- [ ] 3.6 Add `e2e/specs/menu.spec.ts` with `MENU-001`, `MENU-002`, and `MENU-003` for reset state, About, and All Items; tag only `MENU-003` as `@smoke`.
- [ ] 3.7 Add `e2e/specs/navigation.spec.ts` with an isolated unauthenticated `NAV-001` direct-inventory-route test; tag it `@smoke` and prove the result is not an authenticated inventory state.
- [ ] 3.8 Confirm all 13 new cases use the authenticated fixture where required, establish their own cart state, and do not rely on execution order.

## 4. Synchronize quality-control test plans

- [ ] 4.1 Update `01-authentication.md`, `02-inventory.md`, `03-cart.md`, `04-checkout.md`, and `05-cross-cutting.md` with the final canonical IDs, exact spec/test-title references, and accurate Automated/Planned/Blocked statuses.
- [ ] 4.2 Update the affected case names and traceability references so `AUTH-010` is not duplicated and all automated rows have one canonical Playwright owner.
- [ ] 4.3 Create `quality-control/test-plans/00-smoke.md` using the established template, containing only `AUTH-001`, `AUTH-002`, `AUTH-005`, `AUTH-006`, `INV-001`, `INV-008`, `CART-001`, `CO-001`, `MENU-003`, and `NAV-001` with their `@smoke` test titles.
- [ ] 4.4 Review every smoke-plan row against the actual Playwright tag and ensure no Planned, Blocked, or manual-only case appears in `00-smoke.md`.

## 5. Verify implementation and traceability

- [ ] 5.1 Run the TypeScript/Playwright static checks inside the pinned Docker container and fix page-object or test-title errors without weakening assertions.
- [ ] 5.2 Run `bash run-e2e.sh 1 smoke` in Docker and confirm every case listed in `00-smoke.md` executes and passes with evidence in `backups/`.
- [ ] 5.3 Run the relevant full suite in Docker, including the new menu/navigation and regression cases, and retain known-defect failures as Blocked rather than hiding them.
- [ ] 5.4 Compare the Playwright `@smoke` listing with `00-smoke.md` and review all module traceability tables for missing, duplicate, or stale IDs before marking the change complete.
