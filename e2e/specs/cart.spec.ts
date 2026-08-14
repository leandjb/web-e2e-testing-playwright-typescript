import { expect } from '@playwright/test';
import { authenticatedTest as test } from '../fixtures/authenticated';
import { InventoryPage } from '../pages/InventoryPage';
import { CartPage } from '../pages/CartPage';

test.describe('Cart', () => {
  test('adds a single item and updates the cart badge @smoke', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await expect(inventory.cartBadge).toHaveText('1');
  });

  test('adds multiple items and updates the cart badge @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.addToCartByName('Sauce Labs Bike Light');
    await expect(inventory.cartBadge).toHaveText('2');
  });

  test('removes an item from the cart @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.removeByName('Sauce Labs Backpack');
    await expect(cart.items).toHaveCount(0);
  });

  test('continue shopping returns to the inventory @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    const cart = new CartPage(page);
    await inventory.goto();
    await inventory.addToCartByName('Sauce Labs Backpack');
    await inventory.openCart();
    await cart.continueShoppingButton.click();
    await expect(page).toHaveURL(/.*inventory\.html/);
  });
});
