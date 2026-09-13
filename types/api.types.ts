import type { ApiErrorResponse } from '@schemas/api.schemas';

/**
 * API client shared types — success/failure unions and client options.
 *
 * Contract entity types (`ApiUser`, `ApiPost`, …) are re-exported from
 * `@schemas/api.schemas` so Zod remains the single source of truth.
 */

/** Successful HTTP outcome from `getResult` / similar helpers. */
export type ApiSuccess<T> = {
  readonly ok: true;
  readonly data: T;
  readonly status: number;
};

/** Failed HTTP outcome — narrow with `result.ok === false` or `expectApiFailure`. */
export type ApiFailure = {
  readonly ok: false;
  readonly status: number;
  readonly error: ApiErrorResponse;
  readonly rawBody: unknown;
};

/**
 * Discriminated union for negative / exploratory API tests.
 * Prefer this over try/catch when both success and failure are valid outcomes.
 */
export type ApiResult<T> = ApiSuccess<T> | ApiFailure;

/** Construction options for {@link ApiClient}. */
export interface ApiClientOptions {
  /** Absolute API origin (e.g. `https://jsonplaceholder.typicode.com`). */
  baseUrl: string;
  /** Optional headers merged into every request (auth, correlation ids). */
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
