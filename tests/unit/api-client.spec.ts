import { test, expect } from '@playwright/test';
import type { APIRequestContext } from '@playwright/test';
import { ApiClient } from '@utils/api-client';

test.describe('Unit — ApiClient.buildUrl', () => {
  test('joins base URL and path without double slashes', () => {
    const client = new ApiClient({} as APIRequestContext, {
      baseUrl: 'https://api.example.com/',
    });

    expect(client.buildUrl('/users')).toBe('https://api.example.com/users');
    expect(client.buildUrl('posts')).toBe('https://api.example.com/posts');
  });

  test('preserves path segments', () => {
    const client = new ApiClient({} as APIRequestContext, {
      baseUrl: 'https://api.example.com',
    });

    expect(client.buildUrl('/users/1')).toBe('https://api.example.com/users/1');
  });
});
