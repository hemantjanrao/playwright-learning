import { test, expect } from '@fixtures/index';
import { TAGS } from '@utils/tags';

test(
  'blocks direct inventory access without authentication',
  { tag: [TAGS.regression] },
  async ({ page, dashboardPage, loginPage }) => {
    await dashboardPage.open();
    await expect(page).toHaveURL(/\/$/);
    await expect(loginPage.loginButton).toBeVisible();
    await expect(loginPage.errorMessage).toContainText('You can only access');
  },
);
