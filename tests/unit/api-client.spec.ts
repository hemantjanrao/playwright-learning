import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { ApiClient } from '@utils/api-client';

test.describe('Unit — ApiClient.buildUrl', () => {
  test('joins base URL and path without double slashes', () => {
    const client = new ApiClient({} as APIRequestContext, {
      baseUrl: 'https://localhost:8091/',
    });

    expect(client.buildUrl('/products')).toBe('https://localhost:8091/products');
  });

  test('preserves path segments', () => {
    const client = new ApiClient({} as APIRequestContext, {
      baseUrl: 'http://localhost:8091',
    });

    expect(client.buildUrl('/products/1')).toBe('http://localhost:8091/products/1');
  });
});
