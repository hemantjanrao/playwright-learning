import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import { test as setup, expect } from '@fixtures/index';
import { AUTH_STORAGE_PATH, ROUTES } from '@utils/constants';

/**
 * Auth setup project — runs once before UI browser projects that declare
 * `dependencies: ['setup']`.
 *
 * Logs in with config credentials and persists Playwright `storageState`
 * to {@link AUTH_STORAGE_PATH} so authenticated specs skip the login form.
 *
 * The output path must remain gitignored (`auth/.auth/`).
 */
mkdirSync(dirname(AUTH_STORAGE_PATH), { recursive: true });

setup('authenticate and persist storage state', async ({ page, config, loginPage }) => {
  await loginPage.open();
  await loginPage.login(config.credentials.username, config.credentials.password);
  await expect(page).toHaveURL(new RegExp(ROUTES.inventory.replace('.', '\\.')));
  await page.context().storageState({ path: AUTH_STORAGE_PATH });
});
