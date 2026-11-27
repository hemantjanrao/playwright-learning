import { Page } from "@playwright/test";
import { BasePage } from "./BasePage";
import { ROUTES } from "@utils/constants";

export class HomePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async open(): Promise<void> {
    await this.page.goto(ROUTES.home);
  }
}