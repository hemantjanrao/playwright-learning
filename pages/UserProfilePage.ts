import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';

export class UserProfilePage extends BasePage {
  readonly sideMenu: Locator;
  readonly allItemsLink: Locator;
  readonly aboutLink: Locator;
  readonly logoutLink: Locator;
  readonly menuButton: Locator;

  constructor(page: Page) {
    super(page);
    this.menuButton = page.getByRole('button', { name: 'Open Menu' });
    this.sideMenu = page.locator('.bm-menu-wrap');
    this.allItemsLink = page.getByRole('link', { name: 'All Items' });
    this.aboutLink = page.getByRole('link', { name: 'About' });
    this.logoutLink = page.locator('#logout_sidebar_link');
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
