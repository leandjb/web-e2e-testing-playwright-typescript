# Test Plan: Inventory

## Metadata

| Field | Value |
|-------|-------|
| Module | Inventory |
| Author | Leandro Barros |
| Date | 2026-08-14 |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-08-14 |

## Scope

### In Scope

- Product list display (6 products)
- Sort functionality (A-Z, Z-A, Price low-high, Price high-low)
- Product detail page navigation
- Add to cart from inventory and detail pages
- Product images, names, prices, descriptions

### Out of Scope

- Product search/filter
- Product reviews/ratings
- Inventory API responses
- Stock quantity management

## Environment

| Property | Value |
|----------|-------|
| Base URL | https://www.saucedemo.com/inventory.html |
| Browser | Chromium (Playwright Docker image) |
| OS | Linux (container) |
| Viewport | 1280x720 (Desktop Chrome) |
| Users | standard_user (pre-authenticated via globalSetup) |

## Test Data

| Data | Value | Notes |
|------|-------|-------|
| Product Count | 6 | Fixed set on SauceDemo |
| Products | Sauce Labs Backpack, Bike Light, Bolt T-Shirt, Fleece Jacket, Onesie, Red T-Shirt | All available for purchase |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| INV-001 | Display full product list | Positive | P0 | 1. Navigate to inventory page | 6 products visible with name, description, price, image | Automated | `e2e/specs/inventory.spec.ts` |
| INV-002 | Sort by name A→Z | Positive | P1 | 1. Navigate to inventory 2. Select "Name (A to Z)" from sort dropdown | Products sorted alphabetically ascending | Planned | — |
| INV-003 | Sort by name Z→A | Positive | P1 | 1. Navigate to inventory 2. Select "Name (Z to A)" from sort dropdown | Products sorted alphabetically descending | Planned | — |
| INV-004 | Sort by price low→high | Positive | P1 | 1. Navigate to inventory 2. Select "Price (low to high)" from sort dropdown | Products sorted by price ascending | Automated (bug) | `e2e/specs/inventory.spec.ts` |
| INV-005 | Sort by price high→low | Positive | P1 | 1. Navigate to inventory 2. Select "Price (high to low)" from sort dropdown | Products sorted by price descending | Blocked (BUG-001) | `e2e/specs/inventory.spec.ts` |
| INV-006 | Open product detail page | Positive | P1 | 1. Navigate to inventory 2. Click product name "Sauce Labs Backpack" | Navigated to detail page; product name matches | Automated | `e2e/specs/inventory.spec.ts` |
| INV-007 | Add to cart from inventory page | Positive | P0 | 1. Navigate to inventory 2. Click "Add to cart" for Backpack | Button changes to "Remove"; badge shows `1` | Automated | `e2e/specs/cart.spec.ts` |
| INV-008 | Add to cart from product detail page | Positive | P1 | 1. Navigate to inventory 2. Open Backpack detail 3. Click "Add to cart" | Button changes to "Remove"; badge shows `1` | Planned | — |
| INV-009 | Back to products from detail page | Positive | P2 | 1. Open product detail 2. Click "Back to products" | Returned to inventory page | Planned | — |
| INV-010 | All products have images | Positive | P2 | 1. Navigate to inventory 2. Verify each product has an image | All 6 product images load successfully | Planned | — |
| INV-011 | All products have prices | Positive | P2 | 1. Navigate to inventory 2. Verify each product has a price | All 6 prices displayed in `$XX.XX` format | Planned | — |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| INV-001 | Product list display | `e2e/specs/inventory.spec.ts` | Covered |
| INV-002 | Sort A→Z | — | Gap |
| INV-003 | Sort Z→A | — | Gap |
| INV-004 | Sort price low→high | `e2e/specs/inventory.spec.ts` | Covered (bug) |
| INV-005 | Sort price high→low | — | Blocked (BUG-001) |
| INV-006 | Product detail | `e2e/specs/inventory.spec.ts` | Covered |
| INV-007 | Add to cart | `e2e/specs/cart.spec.ts` | Covered |
| INV-008 | Add from detail | — | Gap |
| INV-009 | Back navigation | — | Gap |
| INV-010 | Product images | — | Gap |
| INV-011 | Product prices | — | Gap |
