import type { Locator, Page } from '@playwright/test';
import { BasePage } from '@pages/BasePage';
import { ROUTES } from '@utils/constants';

/**
 * Page Object for the Sauce Demo login screen.
 *
 * Locator strategy (priority order):
 * 1. getByRole / getByPlaceholder — accessibility-first
 * 2. getByTestId — stable data-test attributes
 */
export class LoginPage extends BasePage {
  readonly usernameInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;
  readonly errorMessage: Locator;

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
    this.passwordInput = page.getByPlaceholder('Password');
    this.loginButton = page.getByRole('button', { name: 'Login' });
    this.errorMessage = page.getByTestId('error');
  }

  async open(): Promise<void> {
    await this.goto(ROUTES.login);
  }

  async fillCredentials(username: string, password: string): Promise<void> {
    await this.usernameInput.fill(username);
    await this.passwordInput.fill(password);
  }

  async submit(): Promise<void> {
    await this.loginButton.click();
  }

  /** Full login flow: fill credentials and submit. */
  async login(username: string, password: string): Promise<void> {
    await this.fillCredentials(username, password);
    await this.submit();
  }
}
