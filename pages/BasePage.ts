import type { Page } from '@playwright/test';
import { ROUTES } from '@utils/constants';

/**
 * Abstract base for all Page Objects in this framework.
 *
 * **Owns**
 * - Shared navigation helpers (`goto`, `waitForUrl`)
 * - The Playwright {@link Page} instance via `protected readonly page`
 *
 * **Does not own**
 * - Assertions (`expect` stays in specs)
 * - Test data / credentials (come from fixtures or config)
 *
 * Extend this class for every screen. Prefer intent-level methods on
 * subclasses (`login`, `addProductToCartByName`) over exposing raw Playwright
 * calls in tests.
 *
 * @example
 * ```ts
 * export class LoginPage extends BasePage {
 *   async open() { await this.goto(ROUTES.login); }
 * }
 * ```
 */
export abstract class BasePage {
  /**
   * @param page - Playwright page injected by fixtures; subclasses must not create their own.
   */
  constructor(protected readonly page: Page) {}

  /**
   * Navigates to a path relative to `baseURL` from Playwright config.
   *
   * @param path - Route path; defaults to the login route.
   */
  async goto(path: string = ROUTES.login): Promise<void> {
    await this.page.goto(path);
  }

  /**
   * Waits until the browser URL matches a string or RegExp.
   * Prefer this over fixed sleeps after navigation or redirects.
   *
   * @param pattern - Exact URL fragment or RegExp (e.g. `/inventory\\.html/`).
   */
  async waitForUrl(pattern: RegExp | string): Promise<void> {
    await this.page.waitForURL(pattern);
  }
}
