import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'https://www.saucedemo.com';

/**
 * The suite always runs inside the Playwright Docker image (as root), so the
 * Chromium sandbox must be disabled. Browsers are already present in the image
 * (PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1), so there is no host-side install.
 */
export default defineConfig({
  testDir: './e2e',
  baseURL: BASE_URL,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // One retry to absorb the occasional flake against a public demo site
  // (transient 503s and session resets on saucedemo.com), both locally and in CI.
  retries: 1,
  // One worker per container: sharding is done at the container level by
  // run-e2e.sh / the CI matrix, not by Playwright workers.
  workers: 1,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  // Hard backstop so a stuck run can never hang a container or a CI job.
  globalTimeout: 600_000,
  reporter: [['blob', { dir: 'blob-report' }]],
  globalSetup: './auth.setup.ts',
  use: {
    baseURL: BASE_URL,
    // SauceDemo marks elements with `data-test`, not the Playwright default `data-testid`.
    testIdAttribute: 'data-test',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
    // Required when launching Chromium as root inside the container.
    chromiumSandbox: false,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Chromium fails to launch under root in a container without this.
        launchOptions: { args: ['--no-sandbox'] },
      },
    },
  ],
});
