import { test as base } from '@fixtures/index';
import { ApiClient } from '@utils/api-client';
import type { WireMockContext } from '@utils/testcontainers';
import { startWireMockContainer } from '@utils/testcontainers';

type ContainerTestFixtures = {
  mockApiClient: ApiClient;
};

type ContainerWorkerFixtures = {
  wireMock: WireMockContext;
};

/**
 * Testcontainers fixture — worker-scoped WireMock container.
 * Points `mockApiClient` at the Docker stub instead of the real API.
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
