import { test, expect } from '@fixtures/index';
import { postBuilder } from '@builders/post.builder';
import { ApiPostSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { loadApiPayloads } from '@utils/test-data-factory';
import { TAGS } from '@utils/tags';

const apiPayloads = loadApiPayloads();

test.describe('API - POST', () => {
  test(
    'should create a post using fluent builder',
    { tag: [TAGS.smoke, TAGS.regression] },
    async ({ apiClient, generatedUser }) => {
      const payload = postBuilder()
        .withUserId(1)
        .withUniqueTitle(`Post by ${generatedUser.username}`)
        .withBody(apiPayloads.samplePost.body)
        .build();

      const created = await apiClient.postValidated(
        API_ENDPOINTS.posts,
        payload,
        ApiPostSchema,
        201,
      );

      expect(created.title).toBe(payload.title);
      expect(created.id).toBeDefined();
    },
  );

  test(
    'should create a post with static payload',
    { tag: [TAGS.regression] },
    async ({ apiClient }) => {
      const created = await apiClient.postValidated(
        API_ENDPOINTS.posts,
        apiPayloads.samplePost,
        ApiPostSchema,
        201,
      );

      expect(created.userId).toBe(apiPayloads.samplePost.userId);
    },
  );
});
