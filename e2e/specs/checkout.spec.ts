import { expect } from '@playwright/test';
import { authenticatedTest as test } from '../fixtures/authenticated';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';
import { CheckoutPage } from '../pages/CheckoutPage';

test.describe('Checkout', () => {
  test('completes a purchase for a standard user @smoke', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.fillInformation('Leandro', 'Barros', '12345');
    await expect(page).toHaveURL(/.*checkout-step-two\.html/);
    await checkout.finish();
    await expect(page).toHaveURL(/.*checkout-complete\.html/);
    await expect(checkout.completeHeader).toHaveText(/thank you for your order/i);
  });

  test('validates required checkout fields with soft assertions @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.continueButton.click();
    // Soft assertions collect every missing field in a single validation pass.
    await expect.soft(checkout.errorMessage).toContainText(/first name is required/i);
    await expect.soft(checkout.firstName).toBeEmpty();
    await expect.soft(checkout.lastName).toBeEmpty();
    await expect.soft(checkout.postalCode).toBeEmpty();
  });

  test('shows correct order totals with a hard assertion @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.checkout();
    await checkout.fillInformation('Leandro', 'Barros', '12345');
    const subtotal = await checkout.subtotalLabel.textContent();
    const tax = await checkout.taxLabel.textContent();
    const total = await checkout.totalLabel.textContent();
    const toNum = (s: string | null) => parseFloat((s ?? '').replace(/[^0-9.]/g, ''));
    // Hard assertion: the displayed total MUST equal subtotal + tax (gatekeeper).
    expect(toNum(total)).toBeCloseTo(toNum(subtotal) + toNum(tax), 2);
  });

  test('cancel from step one returns to the cart @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    const checkout = new CheckoutPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.checkout();
    await page.getByTestId('cancel').click();
    await expect(page).toHaveURL(/.*cart\.html/);
  });
});
