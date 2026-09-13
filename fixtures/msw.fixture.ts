import { test as base } from '@fixtures/index';
import { createMswServer, type MswServer } from '@mocks/server';
import { FetchApiClient } from '@utils/fetch-api-client';
import { loadConfig } from '@utils/config-loader';

type MswTestFixtures = {
  /**
   * HTTP client over Node `fetch` — the only client MSW can intercept.
   * Do not use `apiClient` (Playwright `request`) in MSW specs.
   */
  fetchApiClient: FetchApiClient;
};

type MswWorkerFixtures = {
  /** Worker-scoped MSW server; started once per worker, auto-used by tests. */
  mswServer: MswServer;
};

/**
 * MSW (Mock Service Worker) fixture layer for in-process API stubs.
 *
 * **How it works**
 * - Worker-scoped `mswServer` patches Node `fetch` before tests run
 * - Handlers come from `mocks/handlers.ts` and match `config.apiBaseUrl`
 * - Unhandled requests fail the test (`onUnhandledRequest: 'error'`)
 *
 * **Import**
 * ```ts
 * import { mswTest as test, expect } from '@fixtures/msw.fixture';
 * ```
 *
 * Used by `tests/api/msw-*.spec.ts` under the `api-mock` Playwright project.
 *
 * @see docs/ARCHITECTURE.md — Mocking strategies (MSW)
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
