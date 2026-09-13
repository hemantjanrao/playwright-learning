import type { UserId } from '@models/branded.types';
import type { CreatePostPayload } from '@schemas/api.schemas';
import { uniqueSuffix } from '@utils/test-data-factory';

/**
 * Fluent builder for `POST /posts` request payloads.
 *
 * **Why a builder?**
 * - Scales when payloads gain optional fields
 * - Readable arrange steps: `postBuilder().withUserId(1).withUniqueTitle('x').build()`
 * - Returns typed {@link CreatePostPayload} (server-assigned `id` omitted)
 *
 * Prefer {@link postBuilder} factory over `new PostBuilder()` in specs.
 *
 * @example
 * ```ts
 * const payload = postBuilder()
 *   .withUserId(asUserId(1))
 *   .withUniqueTitle('smoke-post')
 *   .build();
 * await apiClient.postValidated(API_ENDPOINTS.posts, payload, ApiPostSchema, 201);
 * ```
 */
export class PostBuilder {
  private payload: CreatePostPayload = {
    userId: 1,
    title: 'Default post title',
    body: 'Default post body content.',
  };

  /** Sets the author user id (accepts branded {@link UserId} or plain number). */
  withUserId(userId: UserId | number): this {
    this.payload.userId = userId;
    return this;
  }

  /** Sets a fixed title (not unique across parallel workers). */
  withTitle(title: string): this {
    this.payload.title = title;
    return this;
  }

  /** Sets the post body text. */
  withBody(body: string): this {
    this.payload.body = body;
    return this;
  }

  /**
   * Sets title to `${prefix}-${uniqueSuffix()}`.
   * Use in parallel runs so titles do not collide across workers.
   */
  withUniqueTitle(prefix: string): this {
    this.payload.title = `${prefix}-${uniqueSuffix()}`;
    return this;
  }

  /**
   * Returns a shallow copy of the payload.
   * Later builder mutations do not affect previously built objects.
   */
  build(): CreatePostPayload {
    return { ...this.payload };
  }
}

/** Factory for a new {@link PostBuilder} with default payload values. */
export function postBuilder(): PostBuilder {
  return new PostBuilder();
}
