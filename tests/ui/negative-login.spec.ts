import { test, expect } from '@fixtures/index';
import { ERROR_MESSAGES } from '@utils/constants';

test.describe('Negative login', () => {
  test('should show error for invalid password', async ({ loginPage, loginTestData }) => {
    const { invalidPassword } = loginTestData;

    await loginPage.open();
    await loginPage.login(invalidPassword.username, invalidPassword.password);

    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.invalidCredentials);
  });

  test('should show error for locked out user', async ({ loginPage, loginTestData }) => {
    const { lockedUser } = loginTestData;

    await loginPage.open();
    await loginPage.login(lockedUser.username, lockedUser.password);

    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.lockedOut);
  });

  test('should show error when username is empty', async ({ loginPage }) => {
    await loginPage.open();
    await loginPage.fillCredentials('', 'secret_sauce');
    await loginPage.submit();

    await expect(loginPage.errorMessage).toContainText(ERROR_MESSAGES.requiredUsername);
  });
});
