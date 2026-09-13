import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

/**
 * Page Object for the Sauce Demo side navigation / burger menu.
 *
 * **When to use**
 * - Logout flows from authenticated UI specs
 * - Menu-related navigation that is not on the inventory grid itself
 *
 * The burger menu is a third-party component (`react-burger-menu`).
 * Prefer `getByRole` for the open button and logout link so tests stay resilient
 * to CSS class churn.
 *
 * Injected via the `userProfilePage` fixture from `@fixtures/index`.
 */
export class UserProfilePage extends BasePage {
  /** Link that ends the session and returns to login. Visible after the menu opens. */
  readonly logoutLink: Locator;
  /** Burger-menu toggle ("Open Menu"). */
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  /**
   * Opens the side menu and waits until Logout is visible.
   * Call this before interacting with menu links.
   */
  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  /**
   * Opens the menu and clicks Logout.
   * Specs should assert redirect to the login route afterward.
   */
  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
