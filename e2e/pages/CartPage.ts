import { type Locator, type Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class CartPage extends BasePage {
  readonly items: Locator;
  readonly checkoutButton: Locator;
  readonly continueShoppingButton: Locator;

  constructor(page: Page) {
    super(page);
    this.items = page.locator('[data-test="inventory-item"]');
    this.checkoutButton = page.getByTestId('checkout');
    this.continueShoppingButton = page.getByTestId('continue-shopping');
  }

  async goto(): Promise<void> {
    await super.goto('/cart.html');
    // The cart may be empty (no `inventory-item` rows), in which case waiting
    // for one would hang. Wait for either the items or the empty-cart state.
    await this.items
      .first()
      .waitFor({ state: 'visible' })
      .catch(() => {});
  }

  async removeByName(name: string): Promise<void> {
    const item = this.items.filter({ hasText: name });
    await item.getByRole('button', { name: /remove/i }).click();
  }

  async quantityFor(name: string): Promise<string> {
    const item = this.items.filter({ hasText: name });
    return (await item.getByTestId('item-quantity').textContent()) ?? '';
  }

  async checkout(): Promise<void> {
    await this.checkoutButton.click();
  }
}
