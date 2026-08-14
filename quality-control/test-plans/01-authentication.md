# Test Plan: Authentication

## Metadata

| Field | Value |
|-------|-------|
| Module | Authentication |
| Author | Leandro Barros |
| Date | 2026-08-14 |
| Version | 1.0 |
| Status | Active |
| Last Updated | 2026-08-14 |

## Scope

### In Scope

- Login with valid and invalid credentials
- Locked user handling
- Empty field validation
- Logout and session invalidation
- Error message display

### Out of Scope

- OAuth/SSO authentication
- Password reset flow
- Multi-factor authentication
- Session timeout behavior

## Environment

| Property | Value |
|----------|-------|
| Base URL | https://www.saucedemo.com |
| Browser | Chromium (Playwright Docker image) |
| OS | Linux (container) |
| Viewport | 1280x720 (Desktop Chrome) |
| Users | standard_user, locked_out_user |

## Test Data

| Data | Value | Notes |
|------|-------|-------|
| Password | secret_sauce | Shared across all users |
| Standard User | standard_user | Full access |
| Locked User | locked_out_user | Intentionally locked |
| Wrong Password | definitely_wrong_password | Any invalid string |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| AUTH-001 | Login with valid credentials | Positive | P0 | 1. Navigate to `/` 2. Enter valid username 3. Enter valid password 4. Click login | Redirected to `/inventory.html`; cart icon visible | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-002 | Login with wrong password | Negative | P0 | 1. Navigate to `/` 2. Enter valid username 3. Enter wrong password 4. Click login | Error message: "Username and password do not match"; stays on login page | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-003 | Login with empty username | Negative | P1 | 1. Navigate to `/` 2. Leave username empty 3. Enter valid password 4. Click login | Error message: "Username is required" | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-004 | Login with empty password | Negative | P1 | 1. Navigate to `/` 2. Enter valid username 3. Leave password empty 4. Click login | Error message: "Password is required" | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-005 | Locked user is denied access | Negative | P0 | 1. Navigate to `/` 2. Enter `locked_out_user` 3. Enter valid password 4. Click login | Error message: "Sorry, this user has been locked out"; stays on login page | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-006 | Logout returns to login page | Positive | P1 | 1. Login as standard_user 2. Open menu 3. Click "Logout" | Returned to login page; session invalidated | Automated | `e2e/specs/auth.spec.ts` |
| AUTH-007 | Login with special characters in username | Negative | P2 | 1. Navigate to `/` 2. Enter `<script>alert(1)</script>` as username 3. Enter valid password 4. Click login | Error message displayed; no XSS execution | Planned | — |
| AUTH-008 | Login with SQL injection in username | Negative | P2 | 1. Navigate to `/` 2. Enter `' OR 1=1 --` as username 3. Enter valid password 4. Click login | Error message displayed; no SQL injection | Planned | — |
| AUTH-009 | Session persists after page refresh | Positive | P1 | 1. Login as standard_user 2. Refresh page 3. Navigate to `/inventory.html` | Still authenticated; inventory page loads | Planned | — |
| AUTH-010 | Direct URL access without auth redirects to login | Negative | P1 | 1. Navigate directly to `/inventory.html` without login | Redirected to login page | Planned | — |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| AUTH-001 | Valid login | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-002 | Invalid credentials | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-003 | Empty username | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-004 | Empty password | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-005 | Locked user | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-006 | Logout | `e2e/specs/auth.spec.ts` | Covered |
| AUTH-007 | XSS prevention | — | Gap |
| AUTH-008 | SQL injection prevention | — | Gap |
| AUTH-009 | Session persistence | — | Gap |
| AUTH-010 | Auth redirect | — | Gap |
