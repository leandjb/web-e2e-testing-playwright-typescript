## Purpose

Defines end-to-end coverage for protected SauceDemo routes so direct URL access cannot bypass authentication and the result is traceable to the cross-cutting test plan.

## ADDED Requirements

### Requirement: Protected routes enforce authentication

An unauthenticated browser SHALL NOT be allowed to enter an authenticated application route through direct URL navigation. The resulting state SHALL remain on or return to the login experience rather than the inventory application.

#### Scenario: Direct inventory URL without authentication redirects to login

- **WHEN** a browser without an authenticated session navigates directly to `/inventory.html`
- **THEN** the browser is on the login experience and is not admitted to the inventory page
