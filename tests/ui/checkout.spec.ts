import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
import { TAGS } from '@utils/tags';

const product = 'Sauce Labs Backpack';

test.beforeEach(async ({ dashboardPage, cartPage }) => {
  await dashboardPage.open();
  await dashboardPage.addProductToCartByName(product);
  await cartPage.open();
});

test(
  'completes checkout with the selected product and correct totals',
  { tag: [TAGS.smoke, TAGS.regression] },
  async ({ page, cartPage, checkoutPage }) => {
    await expect(cartPage.items).toHaveCount(1);
    await expect(cartPage.item(product).getByTestId('inventory-item-price')).toHaveText('$29.99');
    await cartPage.checkout();
    await checkoutPage.enterDetails('Test', 'Buyer', '10115');
    await checkoutPage.continue();
    await expect(page).toHaveURL(/\/checkout-step-two\.html$/);
    await expect(checkoutPage.items).toHaveCount(1);
    await expect(checkoutPage.items.getByTestId('inventory-item-name')).toHaveText(product);
    await expect(checkoutPage.subtotal).toHaveText('Item total: $29.99');
    await expect(checkoutPage.total).toHaveText('Total: $32.39');
    await checkoutPage.finish();
    await expect(page).toHaveURL(/\/checkout-complete\.html$/);
    await expect(checkoutPage.confirmation).toHaveText('Thank you for your order!');
    await cartPage.open();
    await expect(cartPage.items).toHaveCount(0);
  },
);

for (const scenario of [
  { first: '', last: 'Buyer', postal: '10115', error: 'First Name is required' },
  { first: 'Test', last: '', postal: '10115', error: 'Last Name is required' },
  { first: 'Test', last: 'Buyer', postal: '', error: 'Postal Code is required' },
]) {
  test(
    `rejects checkout when ${scenario.error}`,
    { tag: [TAGS.regression] },
    async ({ page, cartPage, checkoutPage }) => {
      await cartPage.checkout();
      await checkoutPage.enterDetails(scenario.first, scenario.last, scenario.postal);
      await checkoutPage.continue();
      await expect(checkoutPage.error).toContainText(scenario.error);
      await expect(page).toHaveURL(/\/checkout-step-one\.html$/);
    },
  );
}

test(
  'cancels checkout without losing the cart',
  { tag: [TAGS.regression] },
  async ({ page, cartPage, checkoutPage }) => {
    await cartPage.checkout();
    await checkoutPage.cancel();
    await expect(page).toHaveURL(/\/cart\.html$/);
    await expect(cartPage.item(product)).toBeVisible();
  },
);

test(
  'removes a product and clears the cart badge',
  { tag: [TAGS.regression] },
  async ({ cartPage, dashboardPage }) => {
    await cartPage.remove(product);
    await expect(cartPage.items).toHaveCount(0);
    await expect(dashboardPage.cartBadge).toHaveCount(0);
  },
);
