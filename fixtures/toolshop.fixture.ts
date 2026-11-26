import { test as base } from '@fixtures/index';
import { ApiClient } from '@utils/api-client';

type ToolshopTestFixtures = {
  toolshopApiClient: ApiClient;
};
export const toolshopTest = base.extend<ToolshopTestFixtures>({
  toolshopApiClient: async ({ request }, use) => {
    const baseUrl = process.env.TOOLSHOP_API_BASE_URL;
    if (!baseUrl) {
      throw new Error('TOOLSHOP_API_BASE_URL is not set');
    }
    await use(new ApiClient(request, { baseUrl }));
  },
});

export { expect } from '@fixtures/index';
