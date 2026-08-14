import { test as base } from '@playwright/test';

/**
 * Authenticated test surface: starts every test already logged in as
 * `standard_user` by reusing the storageState written by `auth.setup.ts`.
 * Use this for cart / checkout / inventory specs that require a session.
 * The storageState path is resolved relative to the Playwright config (repo root).
 */
export const authenticatedTest = base.extend({});
authenticatedTest.use({ storageState: '.auth/standard_user.json' });
