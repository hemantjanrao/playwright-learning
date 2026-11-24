import { toolshopTest as test, expect } from '@fixtures/toolshop.fixture';
import { ToolshopProductPageSchema } from '@schemas/toolshop.schemas';

test('GET /products returns a product page', async ({ toolshopApiClient }) => {
  const page = await toolshopApiClient.getValidated('/products', ToolshopProductPageSchema);

  expect(page.data.length).toBeGreaterThan(0);
});
