import { mswTest as test, expect } from '@fixtures/msw.fixture';
import { postBuilder } from '@builders/post.builder';
import { asUserId } from '@models/branded.types';
import { MOCK_USER } from '@mocks/data/mock-users';
import { ApiPostSchema, ApiUserSchema, ApiUsersSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { TAGS } from '@utils/tags';

test.describe('API - MSW mocks', () => {
  test(
    'should return mocked users list via MSW + fetch',
    { tag: [TAGS.mock, TAGS.regression] },
    async ({ fetchApiClient }) => {
      const users = await fetchApiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
      expect(users).toHaveLength(1);
      expect(users[0]?.name).toBe(MOCK_USER.name);
    },
  );

  test(
    'should return mocked user by id via MSW + fetch',
    { tag: [TAGS.mock, TAGS.regression] },
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

  test(
    'should create a post via MSW POST handler',
    { tag: [TAGS.mock, TAGS.regression] },
    async ({ fetchApiClient }) => {
      const payload = postBuilder()
        .withUserId(MOCK_USER.id)
        .withUniqueTitle('MSW post')
        .withBody('Created through MSW handler')
        .build();

      const created = await fetchApiClient.postValidated(
        API_ENDPOINTS.posts,
        payload,
        ApiPostSchema,
        201,
      );

      expect(created.title).toBe(payload.title);
      expect(created.id).toBe(999);
      expect(created.userId).toBe(MOCK_USER.id);
    },
  );
});
