import { containerTest as test, expect } from '@fixtures/container.fixture';
import { asUserId } from '@models/branded.types';
import { ApiUserSchema, ApiUsersSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { isDockerAvailable } from '@utils/docker';

test.describe('API - WireMock Testcontainers', () => {
  test.beforeEach(() => {
    test.skip(!isDockerAvailable(), 'Docker is required for Testcontainers tests');
  });

  test(
    'should return stubbed users from WireMock container',
    { tag: ['@mock', '@regression'] },
    async ({ mockApiClient }) => {
      const users = await mockApiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe('Container Mock User');
    },
  );

  test(
    'should return stubbed user by id from WireMock container',
    { tag: ['@mock', '@regression'] },
    async ({ mockApiClient }) => {
      const user = await mockApiClient.getValidated(
        API_ENDPOINTS.userById(asUserId(1)),
        ApiUserSchema,
        200,
      );
      expect(user.username).toBe('container_user');
    },
  );
});
