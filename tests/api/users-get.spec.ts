import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '@fixtures/index';
import { asUserId } from '@models/branded.types';
import { ApiUserSchema, ApiUsersSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { expectApiFailure } from '@utils/api-assertions';

const apiPayloads = JSON.parse(
  readFileSync(resolve(process.cwd(), 'test-data/api-payloads.json'), 'utf-8'),
) as { sampleUserId: number };

test.describe('API - GET', () => {
  test('should fetch users list and validate contract', async ({ apiClient }) => {
    const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
    expect(users.length).toBeGreaterThan(0);
    expect(users[0]?.email).toContain('@');
  });

  test('should fetch user by id with branded UserId', async ({ apiClient }) => {
    const userId = asUserId(apiPayloads.sampleUserId);
    const user = await apiClient.getValidated(
      API_ENDPOINTS.userById(userId),
      ApiUserSchema,
      200,
    );
    expect(user.id).toBe(userId);
  });

  test('should return ApiFailure for invalid path', async ({ apiClient }) => {
    const result = await apiClient.getResult('/users/99999/nonexistent');
    expectApiFailure(result);
    expect(result.status).toBeGreaterThanOrEqual(400);
  });
});
