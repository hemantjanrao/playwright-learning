declare const brand: unique symbol;

/**
 * Nominal (branded) typing helpers — prevent mixing raw numbers with domain IDs
 * at compile time while remaining plain numbers at runtime.
 *
 * @example
 * ```ts
 * const userId = asUserId(1);
 * // apiClient.getValidated(API_ENDPOINTS.userById(userId), ApiUserSchema);
 * // Passing a PostId where UserId is expected fails typecheck.
 * ```
 */

/** Brands primitive `T` with a unique string tag `B`. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

/** Domain id for a user resource (`GET /users/:id`). */
export type UserId = Brand<number, 'UserId'>;
/** Domain id for a post resource (`GET /posts/:id`). */
export type PostId = Brand<number, 'PostId'>;

/**
 * Validates and brands a positive integer as {@link UserId}.
 * @throws {RangeError} When `id` is not an integer ≥ 1.
 */
export function asUserId(id: number): UserId {
  if (!Number.isInteger(id) || id < 1) {
    throw new RangeError(`Invalid UserId: ${id}`);
  }
  return id as UserId;
}

/**
 * Validates and brands a positive integer as {@link PostId}.
 * @throws {RangeError} When `id` is not an integer ≥ 1.
 */
export function asPostId(id: number): PostId {
  if (!Number.isInteger(id) || id < 1) {
    throw new RangeError(`Invalid PostId: ${id}`);
  }
  return id as PostId;
}
