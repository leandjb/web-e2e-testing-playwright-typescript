import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class InventoryPage extends BasePage {
  readonly items: Locator;
  readonly sortSelect: Locator;
  readonly cartLink: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.sortSelect = page.getByTestId('product-sort-container');
    this.cartLink = page.getByTestId('shopping-cart-link');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async goto(): Promise<void> {
    await super.goto('/inventory.html');
    await this.items.first().waitFor({ state: 'visible' });
  }

  /** Adds the product whose name contains `name` to the cart. */
  async addToCartByName(name: string): Promise<void> {
    const item = this.items.filter({ hasText: name });
    await item.getByRole('button', { name: /add to cart/i }).click();
  }

  async sortBy(value: 'az' | 'za' | 'lohi' | 'hilo'): Promise<void> {
    await this.sortSelect.selectOption(value);
  }

  async openCart(): Promise<void> {
    await this.cartLink.click();
  }

  async openItemDetail(name: string): Promise<void> {
    const item = this.items.filter({ hasText: name });
    await item.getByTestId('inventory-item-name').click();
  }
}
