# Test Plan: Cross-cutting

## Metadata

| Field | Value |
|-------|-------|
| Module | Cross-cutting |
| Author | Leandro Barros |
| Date | 2026-08-14 |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-08-14 |

## Scope

### In Scope

- Burger menu (Reset App State, About, All Items, Logout)
- Navigation integrity (direct URL, browser back/forward)
- Responsive viewports (mobile, tablet, desktop)
- Page load behavior

### Out of Scope

- Performance testing
- Accessibility testing (WCAG compliance)
- Internationalization / localization
- Network error handling

## Environment

| Property | Value |
|----------|-------|
| Base URL | https://www.saucedemo.com |
| Browser | Chromium (Playwright Docker image) |
| OS | Linux (container) |
| Viewport | 1280x720 (Desktop Chrome), 375x812 (Mobile), 768x1024 (Tablet) |
| Users | standard_user (pre-authenticated via globalSetup) |

## Test Data

| Data | Value | Notes |
|------|-------|-------|
| Reset App State URL | https://www.saucedemo.com/reset-app-state.html | Via menu |
| About URL | https://saucelabs.com | External link |
| All Items URL | https://www.saucedemo.com/inventory.html | Via menu |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| MENU-001 | Reset App State clears cart | Positive | P1 | 1. Add items to cart 2. Open menu 3. Click "Reset App State" 4. Refresh page | Cart badge gone; cart empty | Planned | — |
| MENU-002 | About opens Sauce Labs page | Positive | P2 | 1. Open menu 2. Click "About" | Navigated to saucelabs.com | Planned | — |
| MENU-003 | All Items returns to inventory | Positive | P1 | 1. Navigate to cart 2. Open menu 3. Click "All Items" | Returned to `/inventory.html` | Planned | — |
| MENU-004 | Logout from menu | Positive | P0 | 1. Login 2. Open menu 3. Click "Logout" | Returned to login page; session ended | Automated | `e2e/specs/auth.spec.ts` |
| NAV-001 | Direct URL without auth redirects | Negative | P1 | 1. Open browser 2. Navigate directly to `/inventory.html` | Redirected to login page | Planned | — |
| NAV-002 | Browser back after login | Positive | P2 | 1. Login 2. Navigate to cart 3. Press browser back | Stays on inventory (SPA routing) | Planned | — |
| NAV-003 | Browser forward after logout | Positive | P2 | 1. Login 2. Logout 3. Press browser forward | Cannot re-enter app (session ended) | Planned | — |
| NAV-004 | Direct URL to cart page with auth | Positive | P1 | 1. Login 2. Navigate directly to `/cart.html` | Cart page loads correctly | Planned | — |
| NAV-005 | Direct URL to checkout without cart | Negative | P1 | 1. Login 2. Navigate directly to `/checkout-step-one.html` | Behavior: redirect or empty state | Planned | — |
| RESP-001 | Desktop viewport (1280x720) | Positive | P1 | 1. Set viewport to 1280x720 2. Login 3. Navigate inventory | All elements visible and properly laid out | Planned | — |
| RESP-002 | Mobile viewport (375x812) | Positive | P2 | 1. Set viewport to 375x812 2. Login 3. Navigate inventory | Layout adapts; core functionality accessible | Planned | — |
| RESP-003 | Tablet viewport (768x1024) | Positive | P2 | 1. Set viewport to 768x1024 2. Login 3. Navigate inventory | Layout adapts; core functionality accessible | Planned | — |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| MENU-001 | Reset app state | — | Gap |
| MENU-002 | About link | — | Gap |
| MENU-003 | All items navigation | — | Gap |
| MENU-004 | Logout | `e2e/specs/auth.spec.ts` | Covered |
| NAV-001 | Auth redirect | — | Gap |
| NAV-002 | Browser back | — | Gap |
| NAV-003 | Browser forward | — | Gap |
| NAV-004 | Direct cart URL | — | Gap |
| NAV-005 | Direct checkout URL | — | Gap |
| RESP-001 | Desktop viewport | — | Gap |
| RESP-002 | Mobile viewport | — | Gap |
| RESP-003 | Tablet viewport | — | Gap |
