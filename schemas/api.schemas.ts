import { z } from 'zod';

/**
 * API contract schemas — single source of truth for runtime validation
 * and compile-time types via `z.infer`.
 *
 * Used by:
 * - {@link ApiClient} / {@link FetchApiClient} (`getValidated` / `postValidated`)
 * - Unit tests under `tests/unit/`
 * - Mock payloads in `mocks/data/`
 *
 * Prefer exporting types from these schemas instead of hand-written interfaces
 * so contracts cannot drift.
 */

/** Nested geo coordinates on a user address. */
export const ApiGeoSchema = z.object({
  lat: z.string(),
  lng: z.string(),
});

/** Postal address block on {@link ApiUserSchema}. */
export const ApiAddressSchema = z.object({
  street: z.string(),
  suite: z.string(),
  city: z.string(),
  zipcode: z.string(),
  geo: ApiGeoSchema,
});

/** Company block on {@link ApiUserSchema}. */
export const ApiCompanySchema = z.object({
  name: z.string(),
  catchPhrase: z.string(),
  bs: z.string(),
});

/** Full user resource from `GET /users` / `GET /users/:id`. */
export const ApiUserSchema = z.object({
  id: z.number().int().positive(),
  name: z.string().min(1),
  username: z.string().min(1),
  email: z.string().email(),
  phone: z.string(),
  website: z.string(),
  address: ApiAddressSchema,
  company: ApiCompanySchema,
});

/**
 * Post resource. `id` is optional on create responses that echo the client payload
 * before the server assigns an id (or when testing request shapes).
 */
export const ApiPostSchema = z.object({
  userId: z.number().int().positive(),
  id: z.number().int().positive().optional(),
  title: z.string().min(1),
  body: z.string().min(1),
});

/** Request body for `POST /posts` — server `id` omitted. */
export const CreatePostSchema = ApiPostSchema.omit({ id: true });

/** Non-empty user list from `GET /users`. */
export const ApiUsersSchema = z.array(ApiUserSchema).min(1);

/** Loose error envelope used when mapping failed HTTP bodies into {@link ApiResult}. */
export const ApiErrorResponseSchema = z.object({
  message: z.string().optional(),
  statusCode: z.number().optional(),
});

export type ApiUser = z.infer<typeof ApiUserSchema>;
export type ApiPost = z.infer<typeof ApiPostSchema>;
export type CreatePostPayload = z.infer<typeof CreatePostSchema>;
export type ApiErrorResponse = z.infer<typeof ApiErrorResponseSchema>;
