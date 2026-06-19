import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
import { ROUTES } from '@utils/constants';
import { TAGS } from '@utils/tags';

test.describe('Dashboard', () => {
  test.beforeEach(async ({ dashboardPage }) => {
    // Uses storageState from authenticatedTest — no UI login per test
    await dashboardPage.open();
  });

  test(
    'should display inventory items after successful login',
    { tag: [TAGS.regression] },
    async ({ page, dashboardPage }) => {
      await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
      await expect(dashboardPage.pageTitle).toHaveText('Products');

      const productCount = await dashboardPage.getProductCount();
      expect(productCount).toBeGreaterThan(0);
    },
  );

  test(
    'should add a product to cart',
    { tag: [TAGS.smoke, TAGS.regression] },
    async ({ dashboardPage }) => {
      await dashboardPage.addProductToCartByName('Sauce Labs Backpack');
      await expect(dashboardPage.cartBadge).toHaveText('1');
    },
  );
});
