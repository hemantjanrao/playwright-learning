import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '@fixtures/index';
import type { ApiPost, ApiUser } from '@models/api.types';
import { API_ENDPOINTS } from '@utils/constants';
import { assertArrayOfUsers, assertUserShape } from '@utils/api-assertions';

const apiPayloads = JSON.parse(
  readFileSync(resolve(process.cwd(), 'test-data/api-payloads.json'), 'utf-8'),
) as { sampleUserId: number; samplePost: ApiPost };

test.describe('API - GET', () => {
  test('should fetch users list and validate schema', async ({ apiClient }) => {
    const users = await apiClient.get<ApiUser[]>(API_ENDPOINTS.users, 200);
    assertArrayOfUsers(users);
    expect(users.length).toBeGreaterThan(0);
  });

  test('should fetch user by id', async ({ apiClient }) => {
    const user = await apiClient.get<ApiUser>(
      API_ENDPOINTS.userById(apiPayloads.sampleUserId),
      200,
    );
    assertUserShape(user);
    expect(user.id).toBe(apiPayloads.sampleUserId);
  });
});
