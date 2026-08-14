# Test Plan: Cart

## Metadata

| Field | Value |
|-------|-------|
| Module | Cart |
| Author | Leandro Barros |
| Date | 2026-08-14 |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-08-14 |

## Scope

### In Scope

- Add items to cart (single and multiple)
- Remove items from cart
- Cart badge updates (count and visibility)
- Cart persistence across navigation
- Continue shopping flow
- Quantity display per item

### Out of Scope

- Cart calculation/totals (covered in Checkout)
- Promo codes / discounts
- Save for later / wishlist
- Cart sharing

## Environment

| Property | Value |
|----------|-------|
| Base URL | https://www.saucedemo.com/cart.html |
| Browser | Chromium (Playwright Docker image) |
| OS | Linux (container) |
| Viewport | 1280x720 (Desktop Chrome) |
| Users | standard_user (pre-authenticated via globalSetup) |

## Test Data

| Data | Value | Notes |
|------|-------|-------|
| Product 1 | Sauce Labs Backpack | $29.99 |
| Product 2 | Sauce Labs Bike Light | $9.99 |
| Product 3 | Sauce Labs Bolt T-Shirt | $15.99 |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| CART-001 | Add single item and update badge | Positive | P0 | 1. Navigate to inventory 2. Add Backpack to cart | Badge shows `1` | Automated | `e2e/specs/cart.spec.ts` |
| CART-002 | Add multiple items and update badge | Positive | P0 | 1. Navigate to inventory 2. Add Backpack 3. Add Bike Light | Badge shows `2` | Automated | `e2e/specs/cart.spec.ts` |
| CART-003 | Remove item from cart | Positive | P0 | 1. Add Backpack 2. Open cart 3. Click "Remove" on Backpack | Cart shows 0 items | Automated | `e2e/specs/cart.spec.ts` |
| CART-004 | Remove last item clears badge | Positive | P0 | 1. Add one item to cart 2. Open cart 3. Click "Remove" | Badge disappears (hidden) | Blocked (BUG-003) | — |
| CART-005 | Continue shopping returns to inventory | Positive | P1 | 1. Add item 2. Open cart 3. Click "Continue Shopping" | Returned to `/inventory.html` | Automated | `e2e/specs/cart.spec.ts` |
| CART-006 | Cart persists after navigation | Positive | P1 | 1. Add item 2. Navigate away 3. Return to cart page | Item still in cart | Planned | — |
| CART-007 | Cart badge shows correct count after multiple adds/removes | Positive | P1 | 1. Add 3 items 2. Remove 1 3. Verify badge | Badge shows `2` | Planned | — |
| CART-008 | Cart page shows item quantity | Positive | P1 | 1. Add Backpack 2. Open cart 3. Check quantity column | Quantity shows `1` | Planned | — |
| CART-009 | Empty cart shows no items | Positive | P2 | 1. Navigate to cart without adding items | No items displayed; checkout button still visible | Planned | — |
| CART-010 | Cart icon is clickable from any page | Positive | P2 | 1. Add item 2. Navigate to different pages 3. Click cart icon | Always navigates to cart page | Planned | — |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| CART-001 | Add single item | `e2e/specs/cart.spec.ts` | Covered |
| CART-002 | Add multiple items | `e2e/specs/cart.spec.ts` | Covered |
| CART-003 | Remove item | `e2e/specs/cart.spec.ts` | Covered |
| CART-004 | Badge clearing | — | Blocked (BUG-003) |
| CART-005 | Continue shopping | `e2e/specs/cart.spec.ts` | Covered |
| CART-006 | Cart persistence | — | Gap |
| CART-007 | Badge count accuracy | — | Gap |
| CART-008 | Quantity display | — | Gap |
| CART-009 | Empty cart state | — | Gap |
| CART-010 | Cart icon navigation | — | Gap |
