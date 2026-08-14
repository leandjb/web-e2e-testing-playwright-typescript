import { test as base } from '@playwright/test';
import { USERS } from '../data/users';

/**
 * Authenticated test surface for cart / checkout / inventory specs.
 *
 * Each test logs in fresh as `standard_user` in `beforeEach`. We deliberately
 * do NOT reuse a shared `storageState` file: SauceDemo can invalidate a session
 * that is reused across many successive navigations (server-side TTL or
 * per-account limits), which made a single shared session flaky mid-run no
 * matter when it was created. A fresh login per test is hermetic, starts from an
 * empty cart (no cross-test cart leakage), and is immune to that invalidation.
 *
 * The `storageState` path is resolved relative to the Playwright config (repo root).
 */
export const authenticatedTest = base.extend({});

authenticatedTest.beforeEach(async ({ page }) => {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('[data-test="username"]').fill(USERS.standard.username);
  await page.locator('[data-test="password"]').fill(USERS.standard.password);
  await page.locator('[data-test="login-button"]').click();
  await page.waitForURL(/.*inventory\.html/);

  // Defense-in-depth: ensure no cart state leaks between tests even if the
  // account persists cart server-side. With a fresh login this is usually a
  // no-op, but it keeps assertions order-independent.
  await page.goto('/cart.html', { waitUntil: 'domcontentloaded' });
  const removeButtons = page.getByRole('button', { name: /remove/i });
  while ((await removeButtons.count()) > 0) {
    await removeButtons.first().click();
    await page.waitForLoadState('domcontentloaded');
  }
});
