import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

/**
 * Page Object for the Sauce Demo login screen (`/`).
 *
 * **When to use**
 * - Unauthenticated UI specs (`tests/ui/login.spec.ts`, negative login)
 * - Auth setup project (`tests/setup/auth.setup.ts`) before saving `storageState`
 *
 * **Locator strategy (priority)**
 * 1. `getByRole` / `getByPlaceholder` — accessibility-first
 * 2. `getByTestId` — stable `data-test` attributes (configured in playwright.config)
 *
 * Locators are public `readonly` so specs can assert on them
 * (e.g. `expect(loginPage.errorMessage)`). Actions live here; assertions do not.
 *
 * Injected via the `loginPage` fixture from `@fixtures/index`.
 */
export class LoginPage extends BasePage {
  /** Username text field (placeholder "Username"). */
  readonly usernameInput: Locator;
  /** Password text field (placeholder "Password"). */
  readonly passwordInput: Locator;
  /** Primary submit control. */
  readonly loginButton: Locator;
  /** Inline error banner shown on failed login (`data-test="error"`). */
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
  }

  /** Opens the login page (root route). */
  async open(): Promise<void> {
    await this.goto(ROUTES.login);
  }

  /**
   * Fills username and password without submitting.
   * Use when a test needs to assert intermediate UI state before click.
   */
  async fillCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  /** Clicks the Login button. Does not wait for navigation — assert in the test. */
  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  /**
   * Full login flow: fill credentials and submit.
   * Specs should assert the landing URL / inventory visibility afterward.
   */
  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.submit();
  }
}
