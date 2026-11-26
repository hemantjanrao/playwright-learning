import type { Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

export class CartPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get items() {
    return this.page.getByTestId('inventory-item');
  }
  item(name: string) {
    return this.items.filter({
      has: this.page.getByTestId('inventory-item-name').filter({ hasText: name }),
    });
  }
  async open(): Promise<void> {
    await this.goto(ROUTES.cart);
  }
  async remove(name: string): Promise<void> {
    await this.item(name).getByRole('button', { name: 'Remove', exact: true }).click();
  }
  async checkout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Checkout', exact: true }).click();
  }
}
