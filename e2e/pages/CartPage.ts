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
    await this.items.first().waitFor({ state: 'visible' });
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
