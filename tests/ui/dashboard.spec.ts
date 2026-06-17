import { test, expect } from '@fixtures/index';
import { ROUTES } from '@utils/constants';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ loginPage, config }) => {
    await loginPage.open();
    await loginPage.login(config.credentials.username, config.credentials.password);
  });

  test('should display inventory items after successful login', async ({ page, dashboardPage }) => {
    await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
    await expect(dashboardPage.pageTitle).toHaveText('Products');

    const productCount = await dashboardPage.getProductCount();
    expect(productCount).toBeGreaterThan(0);
  });

  test('should add a product to cart', async ({ dashboardPage }) => {
    await dashboardPage.addProductToCartByName('Sauce Labs Backpack');
    await expect(dashboardPage.cartBadge).toHaveText('1');
  });
});
