import type { Page } from '@playwright/test';
import { ROUTES } from '@utils/constants';

export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = ROUTES.login): Promise<void> {
    await this.page.goto(path);
  }

  async waitForUrl(pattern: RegExp | string): Promise<void> {
    await this.page.waitForURL(pattern);
  }
}
