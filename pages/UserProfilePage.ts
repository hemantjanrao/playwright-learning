import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

/**
 * Page Object for the Sauce Demo side navigation / user menu.
 *
 * The burger menu is a third-party component (react-burger-menu).
 * We prefer getByRole for links; sideMenu uses class only where no test-id exists.
 */
export class UserProfilePage extends BasePage {
  readonly sideMenu: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    // Third-party menu wrapper — no data-test attribute available
    this.sideMenu = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.getByRole('link', { name: 'All Items' });
    this.aboutLink = page.getByRole('link', { name: 'About' });
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
