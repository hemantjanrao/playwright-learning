import  { test, expect } from "@fixtures/index";
import { ApiPostSchema } from '@schemas/api.schemas';
import { API_ENDPOINTS } from '@utils/constants';
import { TAGS } from '@utils/tags';
import { asPostId } from '@models/branded.types';
import { expectApiFailure } from "@utils/api-assertions";

test.describe('API - GET BY ID', () => {
  test('should fetch posts list and validate contract', { tag: [TAGS.regression] }, async ({ apiClient }) => {
    
    const post = await apiClient.getValidated(API_ENDPOINTS.postById(asPostId(1)), ApiPostSchema, 200);

    expect(post.id).toBe(1);
    expect(post.title).toContain('sunt aut facere');
  });

  test('should return 404 for missing post id', { tag: [TAGS.regression] }, async ({ apiClient }) => {
    const result = await apiClient.getResult(API_ENDPOINTS.postById(asPostId(999)));
    expectApiFailure(result);
    expect(result.status).toBe(404);
  });
});