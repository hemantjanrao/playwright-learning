import type { Page } from '@playwright/test';
import { ROUTES } from '@utils/constants';

/**
 * Abstract base for all Page Objects.
 *
 * Responsibilities:
 * - Shared navigation helpers (`goto`, `waitForUrl`)
 * - Holds the Playwright `Page` instance via `protected readonly page`
 *
 * Page Objects should NOT contain assertions — only actions and locators.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  async goto(path: string = ROUTES.login): Promise<void> {
    await this.page.goto(path);
  }

  async waitForUrl(pattern: RegExp | string): Promise<void> {
    await this.page.waitForURL(pattern);
  }
}
