import { expect, test } from '../fixtures';
import { LoginPage } from '../pages/LoginPage';
import { USERS } from '../data/users';

test.describe('Authentication', () => {
  test('standard user logs in successfully @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
    await expect(page.getByTestId('shopping-cart-link')).toBeVisible();
  });

  test('wrong credentials show an error message @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, 'definitely_wrong_password');
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText(/username and password do not match/i);
    // A rejection must keep the user on the login page — prove they were NOT
    // redirected into the application (the old /.*$/ matched any URL).
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('locked out user is denied access @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.locked.username, USERS.locked.password);
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText(/locked out/i);
    // A locked-out user must stay on the login page, never reach inventory.
    await expect(page).not.toHaveURL(/inventory\.html/);
  });

  test('user can log out and return to the login page @smoke', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, USERS.standard.password);
    await expect(page).toHaveURL(/.*inventory\.html/);
    await page.getByRole('button', { name: 'Open Menu' }).click();
    await page.getByTestId('logout-sidebar-link').click();
    await expect(login.loginButton).toBeVisible();
  });

  test('empty username is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('', USERS.standard.password);
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText(/username is required/i);
  });

  test('empty password is rejected', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login(USERS.standard.username, '');
    await expect(login.errorMessage).toBeVisible();
    await expect(login.errorMessage).toContainText(/password is required/i);
  });
});
