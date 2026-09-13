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

/**
 * Base fixture layer for this framework.
 *
 * **Import rule:** specs must import `test` / `expect` from this file
 * (or a layer that extends it) — never from `@playwright/test` directly —
 * or they lose typed fixtures (`loginPage`, `config`, `apiClient`, …).
 *
 * **Layers that extend this file**
 * | Module | Export | Adds |
 * |--------|--------|------|
 * | `authenticated.fixture.ts` | `authenticatedTest` | `storageState` for logged-in UI |
 * | `msw.fixture.ts` | `mswTest` | MSW server + `fetchApiClient` |
 * | `container.fixture.ts` | `containerTest` | WireMock + `mockApiClient` |
 *
 * @see docs/ARCHITECTURE.md — Fixture composition
 */

/**
 * Typed fixture map — every custom fixture is declared here for compile-time safety.
 * Destructuring a typo'd fixture name in a test fails at typecheck.
 */
export type TestFixtures = {
  /** Validated env config from `loadConfig()` (URLs, credentials, flags). */
  config: AppConfig;
  /** Sauce Demo login screen page object. */
  loginPage: LoginPage;
  /** Inventory / products page object. */
  dashboardPage: DashboardPage;
  /** Burger menu / logout page object. */
  userProfilePage: UserProfilePage;
  /** Contract HTTP client over Playwright `request` (live API or WireMock). */
  apiClient: ApiClient;
  /** Faker-generated user profile for data isolation. */
  generatedUser: GeneratedUserProfile;
  /** Static login personas from `test-data/login-users.json`. */
  loginTestData: ReturnType<typeof loadLoginTestData>;
};

/**
 * Extended Playwright `test` with framework fixtures.
 * Also overrides `page` to log browser console errors for debugging.
 */
export const test = base.extend<TestFixtures>({
  /** Loads and Zod-validates `.env.<TEST_ENV>` once per test. */
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

  /**
   * API client using Playwright `request` — no browser required.
   * Not intercepted by MSW; use `fetchApiClient` from `msw.fixture` instead.
   */
  apiClient: async ({ request, config }, use) => {
    await use(
      new ApiClient(request, {
        baseUrl: config.apiBaseUrl,
      }),
    );
  },

  /** Fresh faker profile per test — safe for parallel workers. */
  generatedUser: async ({}, use) => {
    await use(generateUserProfile());
  },

  /** Zod-validated static credentials JSON (valid / locked / invalid personas). */
  loginTestData: async ({}, use) => {
    await use(loadLoginTestData());
  },

  /**
   * Wraps the default `page` fixture to capture browser console errors
   * and uncaught page errors into the framework logger.
   */
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
