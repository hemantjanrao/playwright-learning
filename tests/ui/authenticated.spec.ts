import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
import { DashboardPage } from '@pages/DashboardPage';
import { ROUTES } from '@utils/constants';

test.describe('Authenticated session', () => {
  test('should access dashboard using storageState without UI login', async ({ page }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.open();

    await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
    await expect(dashboardPage.pageTitle).toHaveText('Products');
    await expect(dashboardPage.inventoryList).toBeVisible();
  });

  test('should logout from user menu', async ({ page, userProfilePage }) => {
    const dashboardPage = new DashboardPage(page);
    await dashboardPage.open();
    await userProfilePage.logout();

    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('button', { name: 'Login' })).toBeVisible();
  });
});
