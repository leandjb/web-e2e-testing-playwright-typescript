# Test Plan: [Module Name]

## Metadata

| Field | Value |
|-------|-------|
| Module | [module name] |
| Author | [author name] |
| Date | [YYYY-MM-DD] |
| Version | 1.0 |
| Status | Draft |
| Last Updated | [YYYY-MM-DD] |

## Scope

### In Scope

<!-- What this test plan covers -->

### Out of Scope

<!-- What this test plan does NOT cover -->

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
| Locked User | locked_out_user | Denied access |

## Test Cases

| ID | Scenario | Type | Priority | Steps | Expected Result | Coverage Status | Related Spec |
|----|----------|------|----------|-------|-----------------|-----------------|--------------|
| <!-- ID --> | <!-- Scenario --> | <!-- Positive/Negative/Critical --> | <!-- P0-P3 --> | <!-- Steps --> | <!-- Expected --> | <!-- Automated/Planned/Blocked --> | <!-- spec file path --> |

## Traceability

| Test Case ID | Requirement | Spec File | Status |
|--------------|-------------|-----------|--------|
| <!-- ID --> | <!-- Requirement --> | <!-- spec path --> | <!-- Covered/Gap --> |
