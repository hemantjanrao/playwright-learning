import type { ApiFailure, ApiResult } from '@models/api.types';
import {
  ApiPostSchema,
  ApiUserSchema,
  ApiUsersSchema,
  type ApiPost,
  type ApiUser,
} from '@schemas/api.schemas';
import { expect } from '@playwright/test';
import { ApiValidationError } from '@utils/api-errors';

/**
 * Contract assertions backed by Zod schemas.
 * Prefer `getValidated()` in ApiClient — use these when asserting pre-fetched data.
 */

export function assertUserShape(user: unknown): asserts user is ApiUser {
  const result = ApiUserSchema.safeParse(user);
  if (!result.success) {
    throw new ApiValidationError('assertUserShape', 200, result.error, user);
  }
}

export function assertPostShape(post: unknown): asserts post is ApiPost {
  const result = ApiPostSchema.safeParse(post);
  if (!result.success) {
    throw new ApiValidationError('assertPostShape', 200, result.error, post);
  }
}

export function assertArrayOfUsers(users: unknown): asserts users is ApiUser[] {
  const result = ApiUsersSchema.safeParse(users);
  if (!result.success) {
    throw new ApiValidationError('assertArrayOfUsers', 200, result.error, users);
  }
}

/** Narrows `ApiResult` to `ApiFailure` — avoids conditionals in negative API tests. */
export function expectApiFailure<T>(result: ApiResult<T>): asserts result is ApiFailure {
  expect(result.ok).toBe(false);
}
