import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USERS, type UserKey } from './e2e/data/users';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';

/**
 * globalSetup: log in each user once and persist the authenticated session to
 * `.auth/<role>.json`. Denied users (e.g. locked_out_user) cannot produce a
 * session — their denial is asserted by dedicated tests instead.
 */
async function globalSetup(_config: FullConfig) {
  const authDir = fileURLToPath(new URL('.auth/', import.meta.url));
  fs.mkdirSync(authDir, { recursive: true });

  for (const key of Object.keys(USERS) as UserKey[]) {
    const user = USERS[key];
    const stateFile = path.join(authDir, `${user.role}.json`);

    // Local parallel shards share the `.auth` bind mount and each run this
    // globalSetup. Logging the same user in twice concurrently makes
    // saucedemo.com drop the first session, so reuse a fresh storageState
    // instead of forcing a second login.
    if (fs.existsSync(stateFile) && Date.now() - fs.statSync(stateFile).mtimeMs < 5 * 60_000) {
      console.log(`[auth.setup] ${user.role} reusing fresh storageState (skipping login).`);
      continue;
    }

    const browser = await chromium.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage({ baseURL: BASE_URL, testIdAttribute: 'data-test' });
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.locator('[data-test="username"]').fill(user.username);
    await page.locator('[data-test="password"]').fill(user.password);
    await page.locator('[data-test="login-button"]').click();

    const error = page.locator('[data-test="error"]');
    if (await error.count()) {
      console.log(
        `[auth.setup] ${user.role} could not authenticate (expected for denied users) — no storageState saved.`,
      );
      await browser.close();
      continue;
    }

    await page.waitForURL('**/inventory.html');
    const storageState = await page.context().storageState();
    fs.writeFileSync(stateFile, JSON.stringify(storageState, null, 2));
    await browser.close();
  }
}

export default globalSetup;
