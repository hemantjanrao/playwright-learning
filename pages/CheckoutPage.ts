import type { Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class CheckoutPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  get items() {
    return this.page.getByTestId('inventory-item');
  }
  get subtotal() {
    return this.page.getByTestId('subtotal-label');
  }
  get total() {
    return this.page.getByTestId('total-label');
  }
  get confirmation() {
    return this.page.getByTestId('complete-header');
  }
  get error() {
    return this.page.getByTestId('error');
  }

  async enterDetails(firstName: string, lastName: string, postalCode: string): Promise<void> {
    await this.page.getByTestId('firstName').fill(firstName);
    await this.page.getByTestId('lastName').fill(lastName);
    await this.page.getByTestId('postalCode').fill(postalCode);
  }
  async continue(): Promise<void> {
    await this.page.getByTestId('continue').click();
  }
  async finish(): Promise<void> {
    await this.page.getByTestId('finish').click();
  }
  async cancel(): Promise<void> {
    await this.page.getByTestId('cancel').click();
  }
}
