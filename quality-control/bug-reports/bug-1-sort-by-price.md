# Bug Report: Product sort by price (high → low) is not ordered correctly

- **Environment:** SauceDemo (https://www.saucedemo.com), Chromium (Playwright 1.62.0), standard_user.
- **Preconditions:** Logged in as standard_user; on the inventory page.
- **Steps to reproduce:**
  1. Navigate to the inventory page.
  2. Open the sort dropdown and select **Price (high to low)** (`hilo`).
  3. Read the prices of the six products in display order.
- **Expected result:** Product prices decrease monotonically from top to bottom.
- **Actual result:** The displayed order does not match a descending price sort
  (e.g. a lower-priced item appears above a higher-priced one).
- **Severity:** Medium — affects discoverability/filtering UX; no data loss.
- **Notes:** Sorting by **Price (low to high)** (`lohi`) exhibits the same
  inconsistency, suggesting the comparator is applied to a non-numeric or
  locale-formatted value rather than the parsed price.
