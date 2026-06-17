import { mswTest as test, expect } from '@fixtures/msw.fixture';
import { asUserId } from '@models/branded.types';
import { MOCK_USER } from '@mocks/data/mock-users';
import { ApiUserSchema, ApiUsersSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';

test.describe('API - MSW mocks', () => {
  test(
    'should return mocked users list via MSW + fetch',
    { tag: ['@mock', '@regression'] },
    async ({ fetchApiClient }) => {
      const users = await fetchApiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe(MOCK_USER.name);
    },
  );

  test(
    'should return mocked user by id via MSW + fetch',
    { tag: ['@mock', '@regression'] },
    async ({ fetchApiClient }) => {
      const userId = asUserId(MOCK_USER.id);
      const user = await fetchApiClient.getValidated(
        API_ENDPOINTS.userById(userId),
        ApiUserSchema,
        200,
      );
      expect(user.username).toBe(MOCK_USER.username);
      expect(user.email).toBe(MOCK_USER.email);
    },
  );
});
