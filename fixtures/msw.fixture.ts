import { test as base } from '@fixtures/index';
import { createMswServer, type MswServer } from '@mocks/server';
import { FetchApiClient } from '@utils/fetch-api-client';
import { loadConfig } from '@utils/config-loader';

type MswTestFixtures = {
  fetchApiClient: FetchApiClient;
};

type MswWorkerFixtures = {
  mswServer: MswServer;
};

/**
 * MSW fixture layer — worker-scoped server patches Node `fetch` before tests run.
 * Use `fetchApiClient` (not `apiClient`) — Playwright `request` is NOT intercepted by MSW.
 */
export const mswTest = base.extend<MswTestFixtures, MswWorkerFixtures>({
  mswServer: [
    async ({}, use) => {
      const { apiBaseUrl } = loadConfig();
      const server = createMswServer(apiBaseUrl);
      server.listen({ onUnhandledRequest: 'error' });
      await use(server);
      server.close();
    },
    { scope: 'worker', auto: true },
  ],

  fetchApiClient: async ({ config }, use) => {
    await use(new FetchApiClient(config.apiBaseUrl));
  },
});

export { expect } from '@fixtures/index';
