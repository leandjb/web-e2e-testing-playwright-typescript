# Bug Report: Cart badge not cleared after "Remove" on the last item

- **Environment:** SauceDemo (https://www.saucedemo.com), Chromium (Playwright 1.62.0), standard_user.
- **Preconditions:** Logged in as standard_user; exactly one product in the cart.
- **Steps to reproduce:**
  1. Add a single product to the cart; confirm the cart badge shows `1`.
  2. Open the cart and click **Remove** for that product.
  3. Observe the cart badge in the header.
- **Expected result:** With zero items, the cart badge disappears (no badge shown).
- **Actual result:** The cart badge remains visible showing a stale count (`1`) even though the cart is empty.
- **Severity:** Low — cosmetic, but misleading; can confuse users about cart state.
- **Notes:** Clearing all items should hide the badge entirely. Affected only when the last item is removed; removing from a multi-item cart updates correctly.
