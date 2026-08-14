import { chromium, type FullConfig } from '@playwright/test';
import * as fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { USERS, type UserKey } from './e2e/data/users';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';

const FRESH_MS = 5 * 60_000; // reuse a state file written in the last 5 minutes
const STALE_LOCK_MS = 2 * 60_000; // a setup lock older than this is considered dead

/**
 * globalSetup: log in each user once and persist the authenticated session to
 * `.auth/<role>.json`. Denied users (e.g. locked_out_user) cannot produce a
 * session — their denial is asserted by dedicated tests instead.
 *
 * Concurrency: local multi-shard runs share the `.auth` bind mount and each run
 * this globalSetup. An atomic `mkdir` lock serializes the login per user so two
 * shards can't log the same user in twice (which makes saucedemo.com drop the
 * first session). A shard that fails to acquire the lock waits for the winner
 * to write the state file instead of logging in itself.
 *
 * Freshness: even a "fresh" file can be rejected by the server if the
 * server-side session expired, so a reused session is verified before use and
 * re-authenticated if it redirects back to login.
 */
async function globalSetup(_config: FullConfig) {
  const authDir = fileURLToPath(new URL('.auth/', import.meta.url));
  fs.mkdirSync(authDir, { recursive: true });
  cleanupStaleLocks(authDir);

  for (const key of Object.keys(USERS) as UserKey[]) {
    const user = USERS[key];
    const stateFile = path.join(authDir, `${user.role}.json`);
    const deniedFile = path.join(authDir, `${user.role}.denied`);
    const lockDir = path.join(authDir, `.lock-${user.role}`);

    // Fast path: a fresh session file already exists.
    if (fs.existsSync(stateFile) && Date.now() - fs.statSync(stateFile).mtimeMs < FRESH_MS) {
      if (await isSessionValid(stateFile)) {
        console.log(`[auth.setup] ${user.role} reusing fresh, verified storageState.`);
        continue;
      }
      console.log(`[auth.setup] ${user.role} session stale/expired — will re-authenticate.`);
      fs.rmSync(stateFile, { force: true });
      fs.rmSync(deniedFile, { force: true });
    } else if (fs.existsSync(deniedFile) && Date.now() - fs.statSync(deniedFile).mtimeMs < FRESH_MS) {
      // A denied user (e.g. locked_out_user) never produces a session; a prior
      // setup recorded that so concurrent setups don't wait for a file that will
      // never be written.
      console.log(`[auth.setup] ${user.role} reuse: known-denied, no session needed.`);
      continue;
    }

    // Serialize the login with an atomic mkdir so concurrent local shards can't
    // both authenticate the same user and invalidate each other's session.
    if (!acquireLock(lockDir)) {
      await waitForFileOrDenied(stateFile, deniedFile, FRESH_MS);
      console.log(`[auth.setup] ${user.role} reused result from a concurrent setup.`);
      continue;
    }

    try {
      const browser = await chromium.launch({ args: ['--no-sandbox'] });
      const page = await browser.newPage({ baseURL: BASE_URL, testIdAttribute: 'data-test' });
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.locator('[data-test="username"]').waitFor({ state: 'visible' });
      await page.locator('[data-test="username"]').fill(user.username);
      await page.locator('[data-test="password"]').fill(user.password);
      await page.locator('[data-test="login-button"]').click();

      const error = page.locator('[data-test="error"]');
      if (await error.count()) {
        // Denied users never produce a session. Record a marker so concurrent
        // setups waiting on this user don't block on a file that won't appear.
        fs.writeFileSync(deniedFile, '');
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
    } finally {
      fs.rmdirSync(lockDir, { recursive: true });
    }
  }
}

/** Atomic lock via mkdir (non-recursive) — only one caller succeeds per dir. */
function acquireLock(lockDir: string): boolean {
  try {
    fs.mkdirSync(lockDir, { recursive: false });
    return true;
  } catch (e: any) {
    if (e.code === 'EEXIST') return false;
    throw e;
  }
}

/** Remove lock dirs left behind by crashed setups so they can't deadlock. */
function cleanupStaleLocks(authDir: string): void {
  for (const name of fs.readdirSync(authDir)) {
    if (!name.startsWith('.lock-')) continue;
    const lockPath = path.join(authDir, name);
    try {
      if (Date.now() - fs.statSync(lockPath).mtimeMs > STALE_LOCK_MS) {
        fs.rmdirSync(lockPath, { recursive: true });
      }
    } catch {
      // Best-effort cleanup; ignore races / missing entries.
    }
  }
}

/** Poll until either the session file or the denied marker exists, or timeout. */
async function waitForFileOrDenied(
  file: string,
  denied: string,
  timeoutMs: number,
): Promise<void> {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    if (fs.existsSync(file) || fs.existsSync(denied)) return;
    await new Promise((r) => setTimeout(r, 250));
  }
  throw new Error(`[auth.setup] timed out waiting for ${file} or ${denied}`);
}

/** Verify a stored session is still accepted (not redirected to login). */
async function isSessionValid(stateFile: string): Promise<boolean> {
  const browser = await chromium.launch({ args: ['--no-sandbox'] });
  try {
    const ctx = await browser.newContext({
      storageState: stateFile,
      baseURL: BASE_URL,
      testIdAttribute: 'data-test',
    });
    const page = await ctx.newPage();
    await page.goto('/inventory.html', { waitUntil: 'domcontentloaded' });
    // A valid session lands on inventory.html; an expired one redirects to login.
    const valid = page.url().includes('inventory.html');
    await ctx.close();
    return valid;
  } catch {
    return false;
  } finally {
    await browser.close().catch(() => {});
  }
}

export default globalSetup;
