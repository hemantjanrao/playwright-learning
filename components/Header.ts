import type { Locator, Page } from '@playwright/test';

/** Toolshop global header — rendered by app.component on every route. */
export class Header {
  readonly home: Locator;
  readonly categories: Locator;
  readonly contact: Locator;
  readonly signIn: Locator;
  readonly userMenu: Locator;
  readonly cart: Locator;
  readonly cartQuantity: Locator;

  constructor(private readonly page: Page) {
    this.home = page.getByTestId('nav-home');
    this.categories = page.getByTestId('nav-categories');
    this.contact = page.getByTestId('nav-contact');
    this.signIn = page.getByTestId('nav-sign-in');
    this.userMenu = page.getByTestId('nav-menu');
    this.cart = page.getByTestId('nav-cart'); // only rendered when cart has items
    this.cartQuantity = page.getByTestId('cart-quantity');
  }

  async openContact(): Promise<void> {
    await this.contact.click();
  }

  async openCart(): Promise<void> {
    await this.cart.click();
  }

  /** Category slug matches data-test: 'hand-tools' -> nav-hand-tools. */
  async openCategory(
    slug: 'hand-tools' | 'power-tools' | 'other' | 'special-tools' | 'rentals',
  ): Promise<void> {
    await this.categories.click();
    await this.page.getByTestId(`nav-${slug}`).click();
  }

  /** Two steps: sign-out lives inside the user dropdown. */
  async signOut(): Promise<void> {
    await this.userMenu.click();
    await this.page.getByTestId('nav-sign-out').click();
  }
}
