import type { ApiErrorResponse } from '@schemas/api.schemas';

/** Discriminated union — callers narrow with `result.ok` instead of try/catch. */
export type ApiSuccess<T> = {
  readonly ok: true;
  readonly data: T;
  readonly status: number;
};

export type ApiFailure = {
  readonly ok: false;
  readonly status: number;
  readonly error: ApiErrorResponse;
  readonly rawBody: unknown;
};

export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

export interface ApiClientOptions {
  baseUrl: string;
  extraHeaders?: Record<string, string>;
}

// Re-export contract types from schemas (single source of truth)
export type { ApiUser, ApiPost, CreatePostPayload, ApiErrorResponse } from '@schemas/api.schemas';

export {
  ApiUserSchema,
  ApiPostSchema,
  CreatePostSchema,
  ApiUsersSchema,
  ApiErrorResponseSchema,
} from '@schemas/api.schemas';
