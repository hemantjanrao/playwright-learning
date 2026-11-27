import { test, expect } from '@fixtures/index';

test('guest reaches Contact via header', { tag: '@smoke' }, async ({ homePage, page }) => {
  await homePage.open();
  await homePage.header.openContact();
  await expect(page).toHaveURL(/\/contact$/);
});
