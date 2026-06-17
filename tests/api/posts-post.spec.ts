import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { test, expect } from '@fixtures/index';
import type { ApiPost } from '@models/api.types';
import { API_ENDPOINTS } from '@utils/constants';
import { assertPostShape } from '@utils/api-assertions';
import { uniqueSuffix } from '@utils/test-data-factory';

const apiPayloads = JSON.parse(
  readFileSync(resolve(process.cwd(), 'test-data/api-payloads.json'), 'utf-8'),
) as { samplePost: ApiPost };

test.describe('API - POST', () => {
  test('should create a post with dynamic title', async ({ apiClient, generatedUser }) => {
    const payload: ApiPost = {
      userId: 1,
      title: `Post by ${generatedUser.username}-${uniqueSuffix()}`,
      body: apiPayloads.samplePost.body,
    };

    const created = await apiClient.post<ApiPost>(API_ENDPOINTS.posts, payload, 201);
    assertPostShape(created);
    expect(created.title).toBe(payload.title);
    expect(created.id).toBeDefined();
  });

  test('should create a post with static payload', async ({ apiClient }) => {
    const created = await apiClient.post<ApiPost>(API_ENDPOINTS.posts, apiPayloads.samplePost, 201);
    assertPostShape(created);
    expect(created.userId).toBe(apiPayloads.samplePost.userId);
  });
});
