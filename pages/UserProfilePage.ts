import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

/**
 * Page Object for the Sauce Demo side navigation / user menu.
 *
 * The burger menu is a third-party component (react-burger-menu).
 * We prefer getByRole for links.
 */
export class UserProfilePage extends BasePage {
  readonly logoutLink: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.logoutLink = page.getByRole('link', { name: 'Logout' });
  }

  async openMenu(): Promise<void> {
    await this.menuButton.click();
    await this.logoutLink.waitFor({ state: 'visible' });
  }

  async logout(): Promise<void> {
    await this.openMenu();
    await this.logoutLink.click();
  }
}
