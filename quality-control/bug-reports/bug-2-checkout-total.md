# Bug Report: Checkout "Item total" excludes the last added product

- **Environment:** SauceDemo (https://www.saucedemo.com), Chromium (Playwright 1.62.0), standard_user.
- **Preconditions:** Logged in as standard_user; at least two distinct products added to the cart.
- **Steps to reproduce:**
  1. Add two products to the cart (e.g. *Sauce Labs Backpack*, *Sauce Labs Bike Light*).
  2. Open the cart and click **Checkout**.
  3. Fill first name, last name, postal code and click **Continue**.
  4. On the overview page, compare the **Item total** against the sum of the cart line items.
- **Expected result:** `Item total` equals the sum of all products in the cart.
- **Actual result:** `Item total` reflects only a subset of the cart (one product missing), while the checkout still completes successfully.
- **Severity:** High — financial/totals correctness; could lead to under-charging.
- **Notes:** Reproducible when adding items across two separate inventory interactions. Suggests the cart state and the overview total are read from different sources.
