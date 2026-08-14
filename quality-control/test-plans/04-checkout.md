# Test Plan: Checkout

## Metadata

| Field | Value |
|-------|-------|
| Module | Checkout |
| Author | Leandro Barros |
| Date | 2026-08-14 |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-08-14 |

## Scope

### In Scope

- Complete purchase flow (step 1 → step 2 → complete)
- Field validation (required fields)
- Order totals calculation (subtotal, tax, total)
- Cancel from step 1 and step 2
- Back Home after completion
- Special characters in checkout fields

### Out of Scope

- Payment processing
- Shipping address validation
- Order history
- Return/refund flow

## Environment

| Property | Value |
|----------|-------|
| Base URL | https://www.saucedemo.com/checkout-step-one.html |
| Browser | Chromium (Playwright Docker image) |
| OS | Linux (container) |
| Viewport | 1280x720 (Desktop Chrome) |
| Users | standard_user (pre-authenticated via globalSetup) |

## Test Data

| Data | Value | Notes |
|------|-------|-------|
| First Name | Leandro | Any valid string |
| Last Name | Barros | Any valid string |
| Postal Code | 12345 | Any valid string |
| Product | Sauce Labs Backpack | $29.99 |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| CO-001 | Complete purchase happy path | Critical | P0 | 1. Add item 2. Open cart 3. Click Checkout 4. Fill info 5. Click Continue 6. Click Finish | Order complete; "Thank you for your order" displayed | Automated | `e2e/specs/checkout.spec.ts` |
| CO-002 | Required fields validation | Negative | P0 | 1. Add item 2. Open cart 3. Click Checkout 4. Click Continue without filling fields | Error: "First Name is required"; fields remain empty | Automated | `e2e/specs/checkout.spec.ts` |
| CO-003 | Order total equals subtotal + tax | Critical | P0 | 1. Add item 2. Complete checkout to step 2 3. Verify totals | `total = subtotal + tax` (mathematical equality) | Automated | `e2e/specs/checkout.spec.ts` |
| CO-004 | Cancel from step 1 returns to cart | Positive | P1 | 1. Start checkout 2. Click "Cancel" | Returned to `/cart.html` | Automated | `e2e/specs/checkout.spec.ts` |
| CO-005 | Cancel from step 2 returns to inventory | Positive | P1 | 1. Complete step 1 2. Click "Cancel" on overview | Returned to `/inventory.html` | Planned | — |
| CO-006 | Checkout with empty cart | Negative | P1 | 1. Navigate to cart (empty) 2. Click Checkout 3. Fill info 4. Continue | Error or empty cart behavior | Planned | — |
| CO-007 | Back Home after completion | Positive | P2 | 1. Complete purchase 2. Click "Back Home" | Returned to `/inventory.html` | Planned | — |
| CO-008 | Checkout with special characters in name | Negative | P2 | 1. Add item 2. Start checkout 3. Enter `<script>alert(1)</script>` in name 4. Continue | No XSS; either accepted or validation error | Planned | — |
| CO-009 | Checkout with very long strings | Negative | P2 | 1. Add item 2. Start checkout 3. Enter 500+ chars in name fields 4. Continue | Handled gracefully (accepted or truncated) | Planned | — |
| CO-010 | Checkout with numbers in name field | Negative | P2 | 1. Add item 2. Start checkout 3. Enter "12345" in first name 4. Continue | Accepted (no client-side name format validation) | Planned | — |
| CO-011 | Item total matches cart contents | Critical | P0 | 1. Add 2 items 2. Complete to step 2 3. Verify item total matches cart sum | Item total equals sum of all cart items | Blocked (BUG-002) | — |
| CO-012 | Cancel from step 1 preserves cart | Positive | P1 | 1. Add item 2. Start checkout 3. Cancel 4. Verify cart | Cart items unchanged after cancel | Planned | — |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| CO-001 | Complete purchase | `e2e/specs/checkout.spec.ts` | Covered |
| CO-002 | Field validation | `e2e/specs/checkout.spec.ts` | Covered |
| CO-003 | Order totals | `e2e/specs/checkout.spec.ts` | Covered |
| CO-004 | Cancel step 1 | `e2e/specs/checkout.spec.ts` | Covered |
| CO-005 | Cancel step 2 | — | Gap |
| CO-006 | Empty cart checkout | — | Gap |
| CO-007 | Back Home | — | Gap |
| CO-008 | Special characters | — | Gap |
| CO-009 | Long strings | — | Gap |
| CO-010 | Numbers in name | — | Gap |
| CO-011 | Item total accuracy | — | Blocked (BUG-002) |
| CO-012 | Cart preserved after cancel | — | Gap |
