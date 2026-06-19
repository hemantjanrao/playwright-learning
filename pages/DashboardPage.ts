import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

/**
 * Page Object for the Sauce Demo inventory / dashboard page.
 *
 * Locator strategy:
 * - getByTestId for Sauce Demo data-test attributes (preferred for this app)
 * - getByRole for buttons
 * - `[data-test^="inventory-item-"]` for product rows (dynamic suffix per product)
 */
export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    // Sauce Demo uses data-test="title" on a div — not a semantic heading
    this.pageTitle = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.inventory);
  }

  async getProductCount(): Promise<number> {
    return this.page.locator('[data-test^="inventory-item-"]').count();
  }

  /**
   * Adds a product to cart by visible name.
   * Assertion on cart badge belongs in the test, not here.
   */
  async addProductToCartByName(productName: string): Promise<void> {
    const product = this.page
      .locator('[data-test^="inventory-item-"]')
      .filter({ hasText: productName });
    await product.getByRole('button', { name: 'Add to cart' }).click();
  }
}
