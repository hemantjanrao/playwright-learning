import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
import { ROUTES } from '@utils/constants';
import { TAGS } from '@utils/tags';

test.describe('Authenticated session', () => {
  test(
    'should access dashboard using storageState without UI login',
    { tag: [TAGS.smoke, TAGS.regression] },
    async ({ page, dashboardPage }) => {
      await dashboardPage.open();

      await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
      await expect(dashboardPage.pageTitle).toHaveText('Products');
      await expect(dashboardPage.inventoryList).toBeVisible();
    },
  );

  test(
    'should logout from user menu',
    { tag: [TAGS.regression] },
    async ({ page, dashboardPage, userProfilePage }) => {
      await dashboardPage.open();
      await userProfilePage.logout();

      await expect(page).toHaveURL(/\/$/);
      await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
    },
  );
});
