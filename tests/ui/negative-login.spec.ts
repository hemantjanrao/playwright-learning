import { test, expect } from '@fixtures/index';
import { ERROR_MESSAGES } from '@utils/constants';
import { TAGS } from '@utils/tags';
import { loadLoginTestData } from '@utils/test-data-factory';

const loginTestData = loadLoginTestData();

const cases = [
  {
    name: 'invalid password',
    username: loginTestData.invalidPassword.username,
    password: loginTestData.invalidPassword.password,
    expected: ERROR_MESSAGES.invalidCredentials,
  },
  {
    name: 'locked out user',
    username: loginTestData.lockedUser.username,
    password: loginTestData.lockedUser.password,
    expected: ERROR_MESSAGES.lockedOut,
  },
  {
    name: 'username is empty',
    username: '',
    password: loginTestData.validUser.password,
    expected: ERROR_MESSAGES.requiredUsername,
  },
  {
    name: 'password is empty',
    username: loginTestData.validUser.username,
    password: '',
    expected: ERROR_MESSAGES.requiredPassword,
  },
] as const;

test.describe('Negative login', () => {
  for (const testCase of cases) {
    test(
      `should show error when ${testCase.name}`,
      { tag: [TAGS.regression] },
      async ({ loginPage }) => {
        await loginPage.open();
        await loginPage.fillCredentials(testCase.username, testCase.password);
        await loginPage.submit();
        await expect(loginPage.errorMessage).toContainText(testCase.expected);
      },
    );
  }
});
