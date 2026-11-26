import { test as base } from '@fixtures/index';
import { ApiClient } from '@utils/api-client';
import type { WireMockContext } from '@utils/testcontainers';
import { startWireMockContainer } from '@utils/testcontainers';

type ContainerTestFixtures = {
  /**
   * {@link ApiClient} pointed at the WireMock container base URL
   * instead of the live `config.apiBaseUrl`.
   */
  mockApiClient: ApiClient;
};

type ContainerWorkerFixtures = {
  /** Running WireMock container (mappings from `docker/wiremock/mappings/`). */
  wireMock: WireMockContext;
};

/**
 * Testcontainers fixture layer — real HTTP stub in Docker (WireMock).
 *
 * **How it differs from MSW**
 * - MSW: in-process `fetch` interception (no Docker)
 * - This layer: HTTP traffic hits a WireMock container (Playwright `request` works)
 *
 * Requires a running Docker daemon (or set `SKIP_DOCKER_TESTS=true` to skip).
 * Worker-scoped so one container is shared per worker (startup timeout 120s).
 *
 * **Import**
 * ```ts
 * import { containerTest as test, expect } from '@fixtures/container.fixture';
 * const users = await mockApiClient.getValidated('/users', ApiUsersSchema);
 * ```
 *
 * Used by `tests/api/container-*.spec.ts` under the `api-mock` project.
 *
 * @see docs/ARCHITECTURE.md — Mocking strategies (Testcontainers)
 */
export const containerTest = base.extend<ContainerTestFixtures, ContainerWorkerFixtures>({
  wireMock: [
    async ({}, use) => {
      const context = await startWireMockContainer();
      await use(context);
      await context.stop();
    },
    { scope: 'worker', timeout: 120_000 },
  ],

  mockApiClient: async ({ request, wireMock }, use) => {
    await use(new ApiClient(request, { baseUrl: wireMock.baseUrl }));
  },
});

export { expect } from '@fixtures/index';
