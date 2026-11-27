import type { Locator, Page } from '@playwright/test';
import { ROUTES } from '@utils/constants';
import { BasePage } from './BasePage';

export class LoginPage extends BasePage {
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly loginButton: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = this.page.getByTestId('email');
    this.passwordInput = this.page.getByTestId('password');
    this.loginButton = this.page.getByTestId('login-submit');
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTES.signIn);
  }

  async login(email: string, password: string): Promise<void> {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.loginButton.click();
  }
}
