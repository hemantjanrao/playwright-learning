import { test as base, expect } from '@playwright/test';
import type { AppConfig } from '@models/config.types';
import type { GeneratedUserProfile } from '@models/test-data.types';
import { LoginPage } from '@pages/LoginPage';
import { DashboardPage } from '@pages/DashboardPage';
import { UserProfilePage } from '@pages/UserProfilePage';
import { ApiClient } from '@utils/api-client';
import { loadConfig } from '@utils/config-loader';
import { generateUserProfile, loadLoginTestData } from '@utils/test-data-factory';
import { logger } from '@utils/logger';

export type TestFixtures = {
  config: AppConfig;
  loginPage: LoginPage;
  dashboardPage: DashboardPage;
  userProfilePage: UserProfilePage;
  apiClient: ApiClient;
  generatedUser: GeneratedUserProfile;
  loginTestData: ReturnType<typeof loadLoginTestData>;
};

export const test = base.extend<TestFixtures>({
  config: async ({}, use) => {
    const config = loadConfig();
    await use(config);
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  dashboardPage: async ({ page }, use) => {
    await use(new DashboardPage(page));
  },

  userProfilePage: async ({ page }, use) => {
    await use(new UserProfilePage(page));
  },

  apiClient: async ({ request, config }, use) => {
    await use(
      new ApiClient(request, {
        baseUrl: config.apiBaseUrl,
      }),
    );
  },

  generatedUser: async ({}, use) => {
    await use(generateUserProfile());
  },

  loginTestData: async ({}, use) => {
    await use(loadLoginTestData());
  },

  page: async ({ page }, use) => {
    page.on('console', (message) => {
      if (message.type() === 'error') {
        logger.warn('Browser console error', { text: message.text() });
      }
    });

    page.on('pageerror', (error) => {
      logger.error('Uncaught page error', { message: error.message });
    });

    await use(page);
  },
});

export { expect };
