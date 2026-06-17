import { test, expect } from '@fixtures/index';
import { MOCK_USER } from '@mocks/data/mock-users';
import { loadConfig } from '@utils/config-loader';
import { mockJsonRoute, clearRoutes } from '@utils/route-mocks';

const apiUserUrl = `${loadConfig().apiBaseUrl.replace(/\/$/, '')}/users/1`;

test.describe('UI - page.route network mocking', () => {
  test.afterEach(async ({ page }) => {
    await clearRoutes(page);
  });

  test(
    'should render mocked API response intercepted by page.route',
    { tag: ['@mock', '@regression'] },
    async ({ page }) => {
      await mockJsonRoute(page, '**/users/1', MOCK_USER);

      await page.setContent(`
        <button id="load-user">Load user</button>
        <p id="user-name" data-test="user-name"></p>
        <script>
          document.getElementById('load-user').addEventListener('click', async () => {
            const response = await fetch('${apiUserUrl}');
            const user = await response.json();
            document.getElementById('user-name').textContent = user.name;
          });
        </script>
      `);

      await page.getByRole('button', { name: 'Load user' }).click();
      await expect(page.getByTestId('user-name')).toHaveText(MOCK_USER.name);
    },
  );

  test('should handle aborted API route', { tag: ['@mock', '@regression'] }, async ({ page }) => {
    await page.route('**/users/1', (route) => route.abort('failed'));

    await page.setContent(`
        <button id="load-user">Load user</button>
        <p id="error" data-test="error"></p>
        <script>
          document.getElementById('load-user').addEventListener('click', async () => {
            try {
              await fetch('${apiUserUrl}');
            } catch {
              document.getElementById('error').textContent = 'Network failed';
            }
          });
        </script>
      `);

    await page.getByRole('button', { name: 'Load user' }).click();
    await expect(page.getByTestId('error')).toHaveText('Network failed');
  });
});
