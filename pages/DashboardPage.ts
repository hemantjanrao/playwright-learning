import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

/**
 * Page Object for the Sauce Demo inventory / products page (`/inventory.html`).
 *
 * **When to use**
 * - Post-login assertions (smoke login, authenticated dashboard specs)
 * - Cart interactions from the product grid
 *
 * **Locator strategy**
 * - `getByTestId` for Sauce Demo `data-test` attributes (preferred for this app)
 * - `getByRole` for buttons
 * - `[data-test^="inventory-item-"]` for product rows (dynamic suffix per product)
 *
 * Injected via the `dashboardPage` fixture from `@fixtures/index`.
 * Prefer `authenticatedTest` when the journey assumes an already-logged-in session.
 */
export class DashboardPage extends BasePage {
  /** Page heading showing "Products" (`data-test="title"` — a div, not a heading role). */
  readonly pageTitle: Locator;
  /** Container for the product grid. */
  readonly inventoryList: Locator;
  /** Shopping-cart badge with item count (visible only when cart is non-empty). */
  readonly cartBadge: Locator;

  /** Container for the product cards. */
  readonly productCards: Locator;

  constructor(page: Page) {
    super(page);
    // Sauce Demo uses data-test="title" on a div — not a semantic heading
    this.pageTitle = page.getByTestId('title');
    this.inventoryList = page.getByTestId('inventory-list');
    this.cartBadge = page.getByTestId('shopping-cart-badge');
    this.productCards = page.getByTestId('inventory-item');
  }

  /** Navigates directly to the inventory route (requires an authenticated session). */
  async open(): Promise<void> {
    await this.goto(ROUTES.inventory);
  }

  /**
   * Returns how many product cards are currently rendered.
   * Useful for smoke checks that the catalog loaded.
   */
  async getProductCount(): Promise<number> {
    return this.page.getByTestId('inventory-item').count();
  }

  /**
   * Adds a product to the cart by its visible name.
   * Assertion on the cart badge belongs in the test, not here.
   *
   * @param productName - Visible product title text (e.g. "Sauce Labs Backpack").
   */
  async addProductToCartByName(productName: string): Promise<void> {
    const product = this.page.getByTestId('inventory-item').filter({ hasText: productName });
    await product.getByRole('button', { name: 'Add to cart' }).click();
  }
}
