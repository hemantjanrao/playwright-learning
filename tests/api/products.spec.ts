import { toolshopTest as test, expect } from '@fixtures/toolshop.fixture';
import { ToolshopProductPageSchema, ToolshopProductSchema } from '@schemas/toolshop.schemas';


test('GET /products returns a product page', async ({ toolshopApiClient }) => {
  const page = await toolshopApiClient.getValidated('/products', ToolshopProductPageSchema);

  for (const product of page.data) {
    const productResponse = await toolshopApiClient.getValidated(`/products/${product.id}`, ToolshopProductSchema);
    expect(productResponse.id).toBe(product.id);
  }
  expect(page.data.length).toBeGreaterThan(0);
});