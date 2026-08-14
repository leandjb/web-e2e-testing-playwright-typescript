import { expect } from '@playwright/test';
import { authenticatedTest as test } from '../fixtures/authenticated';
import { InventoryPage } from '../pages/InventoryPage';

test.describe('Inventory', () => {
  test('displays the full product list @smoke', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await expect(inventory.items).toHaveCount(6);
  });

  test('sorts products by price low to high @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.sortBy('lohi');
    // SauceDemo re-renders the list client-side after the sort; wait for the
    // re-sort to settle (prices become sorted) before reading them.
    const priceLocator = inventory.items.locator('[data-test="inventory-item-price"]');
    await expect
      .poll(
        async () => {
          const nums = (await priceLocator.allTextContents()).map((p) =>
            parseFloat(p.replace('$', '')),
          );
          const sorted = [...nums].sort((a, b) => a - b);
          return JSON.stringify(nums) === JSON.stringify(sorted);
        },
        { timeout: 5_000 },
      )
      .toBe(true);
    const prices = await priceLocator.allTextContents();
    const nums = prices.map((p) => parseFloat(p.replace('$', '')));
    const sorted = [...nums].sort((a, b) => a - b);
    expect(nums).toEqual(sorted);
  });

  test('opens a product detail page @regression', async ({ page }) => {
    const inventory = new InventoryPage(page);
    await inventory.goto();
    await inventory.openItemDetail('Sauce Labs Backpack');
    await expect(page).toHaveURL(/.*inventory-item\.html/);
    await expect(page.getByTestId('inventory-item-name')).toHaveText('Sauce Labs Backpack');
  });
});
