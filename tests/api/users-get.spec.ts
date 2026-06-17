import { test, expect } from '@fixtures/index';
import { asUserId } from '@models/branded.types';
import { ApiUserSchema, ApiUsersSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { expectApiFailure } from '@utils/api-assertions';
import { loadApiPayloads } from '@utils/test-data-factory';

const apiPayloads = loadApiPayloads();

test.describe('API - GET', () => {
  test(
    'should fetch users list and validate contract',
    { tag: ['@smoke', '@regression'] },
    async ({ apiClient }) => {
      const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
      expect(users.length).toBeGreaterThan(0);
      expect(users[0]?.email).toContain('@');
    },
  );

  test(
    'should fetch user by id with branded UserId',
    { tag: '@regression' },
    async ({ apiClient }) => {
      const userId = asUserId(apiPayloads.sampleUserId);
      const user = await apiClient.getValidated(API_ENDPOINTS.userById(userId), ApiUserSchema, 200);
      expect(user.id).toBe(userId);
    },
  );

  test(
    'should return ApiFailure for invalid path',
    { tag: '@regression' },
    async ({ apiClient }) => {
      const result = await apiClient.getResult('/users/99999/nonexistent');
      expectApiFailure(result);
      expect(result.status).toBeGreaterThanOrEqual(400);
    },
  );
});
