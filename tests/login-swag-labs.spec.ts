import { test, expect } from "@playwright/test";

test.describe('test suite for swag labs login page', () => {
    test('login with valid credentials', async ({ page }) => {

        await page.goto('https://www.saucedemo.com/');
        await page.locator('[data-test="username"]').fill('standard_user');
        await page.locator('[data-test="password"]').fill('secret_sauce');
        await page.getByRole('button', { name: 'LOGIN' }).click();
        
        await expect.soft(page.getByText('Products')).toBeVisible();
        await expect.soft(page.locator('.inventory_filter_container')).toBeVisible();
        await expect.soft(page.getByText('© 2020 Sauce Labs. All Rights')).toBeVisible();
        
        await page.getByRole('button', { name: 'Open Menu' }).click();
        await page.getByRole('link', { name: 'Logout' }).click();
        await expect.soft(page.locator('[data-test="username"]')).toBeEmpty();
        await expect.soft(page.locator('[data-test="password"]')).toBeEmpty();
        await expect(page.getByRole('button', { name: 'LOGIN' })).toBeVisible();
    });
});
