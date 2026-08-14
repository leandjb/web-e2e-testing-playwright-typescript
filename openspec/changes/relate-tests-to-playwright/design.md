## Context

See `proposal.md` for the motivation and scope. The repository currently has four Playwright spec files, five module test plans, and 56 documented cases. The existing tests already use page objects for most flows, but menu actions and several required assertions are reached through direct page locators. The Playwright configuration uses `data-test` as the test-id attribute, and the suite runs against a public SauceDemo deployment inside Docker.

The test plans currently mix exact spec references with unlinked Planned/Blocked rows. The direct unauthenticated-route case is duplicated as `AUTH-010` and `NAV-001`, and there is no plan whose rows are constrained to the tests selected by `--grep @smoke`.

## Goals / Non-Goals

**Goals:**

- Make every automated case discoverable from a canonical plan ID and every smoke-tagged test discoverable from `00-smoke.md`.
- Add the 13 scoped high-value cases without claiming coverage for the remaining Planned or Blocked cases.
- Keep all UI interaction selectors and reusable actions in page objects.
- Centralize and verify the locator map for menu, inventory, cart, and checkout controls.
- Preserve the existing Docker-only execution model and CI smoke/full mode behavior.

**Non-Goals:**

- Fixing SauceDemo defects referenced by BUG-001, BUG-002, or BUG-003.
- Automating every remaining security-input, responsive, browser-history, empty-cart, or low-priority case in this change.
- Adding API, visual-regression, performance, or external test-management integrations.
- Changing the public target, authentication contract, shard topology, or report paths.

## Decisions

### Canonical case ownership and IDs

Each automated Playwright test will include its plan ID in its title. The module plans will use the same ID in their test-case and traceability rows, and the Related Spec column will include the exact spec file plus the test title when a file contains multiple cases.

The duplicate direct-route case will be owned by the cross-cutting plan: `AUTH-010` is removed from the authentication plan and represented as `NAV-001` in `05-cross-cutting.md` and `navigation.spec.ts`. Authentication retains `AUTH-009` for session persistence after refresh. This prevents one behavior from producing two competing coverage results.

The 13 new cases are deliberately explicit:

| Plan ID | Playwright spec | Default tag |
|---------|-----------------|-------------|
| AUTH-009 | `e2e/specs/auth.spec.ts` | `@regression` |
| INV-002, INV-003, INV-009 | `e2e/specs/inventory.spec.ts` | `@regression` |
| INV-008 | `e2e/specs/inventory.spec.ts` | `@smoke` |
| CART-006, CART-008 | `e2e/specs/cart.spec.ts` | `@regression` |
| CO-005, CO-007 | `e2e/specs/checkout.spec.ts` | `@regression` |
| MENU-001, MENU-002 | `e2e/specs/menu.spec.ts` | `@regression` |
| MENU-003 | `e2e/specs/menu.spec.ts` | `@smoke` |
| NAV-001 | `e2e/specs/navigation.spec.ts` | `@smoke` |

Existing smoke cases remain in the smoke plan: `AUTH-001`, `AUTH-002`, `AUTH-005`, `AUTH-006`, `INV-001`, `CART-001`, and `CO-001`. The resulting smoke plan is a documentation view of the tests selected by the existing `@smoke` grep, not a second execution mechanism.

### Page Object Model and locator ownership

Specs will describe business behavior and call page-object methods; they will not query menu links or form controls directly. The locator map is:

| Page object | Control or data | Locator strategy | Reusable behavior |
|-------------|-----------------|------------------|-------------------|
| `MenuPage` | Open Menu, Reset App State, All Items, About, Logout | Accessible role for the button; verified `data-test` IDs for sidebar links | Open menu and invoke each action |
| `InventoryPage` | Back to products, product name, product price, product names/prices | Verified `data-test` IDs scoped to the relevant item or detail page | Read names/prices and navigate back from detail |
| `CartPage` | Cart rows, item quantity, cart controls | Existing row/quantity IDs and semantic buttons | Return item count and navigate/continue shopping |
| `CheckoutPage` | Cancel, Back Home, checkout summary | Verified `data-test` IDs and existing summary locators | Cancel the current step and return home |

Selectors will be verified against the target in the pinned Playwright container before they are used. If an empty-cart message does not exist in the target DOM, the page object will represent the observable empty state as zero cart rows plus the expected checkout control rather than inventing a selector. No raw CSS or fixed sleep will be added to specs.

### Test isolation and fixtures

Authenticated cases will use the existing authenticated fixture and its cart reset behavior. Tests that explicitly verify unauthenticated redirects will use a context without `storageState`. Each case will establish its own products and route, and page-object methods will wait on the destination's ready locator before assertions.

### Test-plan synchronization

The five module plans will retain their existing template and case IDs, but their Coverage Status and Related Spec columns will be updated from the final test titles. Known bugs remain Blocked with their bug-report reference; cases not included in this change remain Planned. The new `00-smoke.md` will use the same metadata/table conventions and contain no manual-only, Planned, or Blocked rows.

### Validation strategy

The apply phase will validate the mapping in three layers: inspect all plan rows for duplicate/missing IDs, inspect all Playwright titles for canonical IDs and tags, and run the Docker smoke subset plus the relevant full tests. The final smoke-plan table will be checked against the actual `@smoke` grep result so documentation cannot silently drift from execution.

## Risks / Trade-offs

- **[Risk] Public-site locator drift** -> Verify every new locator in the pinned Docker image and keep selectors in page objects so future updates are localized.
- **[Risk] The About action depends on an external destination** -> Keep it out of the critical smoke path and assert the documented destination with a bounded navigation wait.
- **[Risk] Known application bugs make regression assertions fail** -> Preserve Blocked status and bug references; do not weaken expected outcomes or move those cases into smoke.
- **[Risk] Shared cart state causes order-dependent tests** -> Use the authenticated fixture reset and seed each case explicitly before exercising cart/menu behavior.
- **[Trade-off] Manual markdown traceability can drift** -> Require canonical IDs in test titles and review the smoke-plan mapping as part of the verification tasks.

## Migration Plan

1. Add or extend page objects and add the 13 scoped tests with canonical IDs and tags.
2. Update the five module plans, relocate the duplicate direct-route ownership to `NAV-001`, and add `00-smoke.md`.
3. Run locator, type, smoke, and relevant full-suite checks in Docker; correct mapping or selector failures before considering the change ready.

Rollback is limited to reverting the new page objects/specs and restoring the prior plan rows. No application data, user credentials, or deployed service configuration is changed.
