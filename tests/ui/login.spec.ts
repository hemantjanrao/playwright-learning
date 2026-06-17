import { test, expect } from '@fixtures/index';
import { ROUTES } from '@utils/constants';

test.describe('Login', () => {
  test(
    'should login with valid credentials and land on inventory page',
    { tag: ['@smoke', '@regression'] },
    async ({ page, loginPage, dashboardPage, config }) => {
      await loginPage.open();
      await loginPage.login(config.credentials.username, config.credentials.password);

      await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
      await expect(dashboardPage.pageTitle).toHaveText('Products');
      await expect(dashboardPage.inventoryList).toBeVisible();
    },
  );
});
