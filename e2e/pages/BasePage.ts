import { type Locator, type Page } from '@playwright/test';
import { USERS } from '../data/users';

export class BasePage {
  readonly page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(path = ''): Promise<void> {
    // `domcontentloaded` + an explicit ready-locator wait in each subclass is
    // deterministic; `networkidle` is flaky against a live public site.
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });

    // SauceDemo can intermittently serve the login screen at an authenticated
    // URL (the "Epic sadface: You can only access '/inventory.html' when you are
    // logged in" error, rendered in place with the URL unchanged). If a goto to
    // an authenticated route lands on the login page, re-authenticate and reload
    // once so the navigation still reaches its intended page.
    const isAuthRoute = /^\/(inventory|cart|checkout)/.test(path);
    if (isAuthRoute && (await this.page.locator('[data-test="username"]').isVisible().catch(() => false))) {
      await this.page.locator('[data-test="username"]').fill(USERS.standard.username);
      await this.page.locator('[data-test="password"]').fill(USERS.standard.password);
      await this.page.locator('[data-test="login-button"]').click();
      await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    }
  }
}
