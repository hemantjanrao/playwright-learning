import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

export class DashboardPage extends BasePage {
  readonly pageTitle: Locator;
  readonly inventoryList: Locator;
  readonly shoppingCartLink: Locator;
  readonly menuButton: Locator;

  readonly cartBadge: Locator;

  constructor(page: Page) {
    super(page);
    this.pageTitle = page.locator('.title');
    this.inventoryList = page.locator('.inventory_list');
    this.shoppingCartLink = page.locator('[data-test="shopping-cart-link"]');
    this.cartBadge = page.locator('[data-test="shopping-cart-badge"]');
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.inventory);
  }

  async getProductCount(): Promise<number> {
    return this.page.locator('.inventory_item').count();
  }

  async addProductToCartByName(productName: string): Promise<void> {
    const product = this.page.locator('.inventory_item').filter({ hasText: productName });
    await product.getByRole('button', { name: 'Add to cart' }).click();
    await this.cartBadge.waitFor({ state: 'visible' });
  }

  async getCartBadgeCount(): Promise<string | null> {
    return this.cartBadge.textContent();
  }
}
