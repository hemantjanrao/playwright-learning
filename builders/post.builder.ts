import type { UserId } from '@models/branded.types';
import type { CreatePostPayload } from '@schemas/api.schemas';
import { uniqueSuffix } from '@utils/test-data-factory';

/**
 * Fluent builder for API post payloads.
 *
 * Why a builder?
 * - Scales when payloads have many optional fields
 * - Readable test setup: postBuilder().withUserId(1).withUniqueTitle('x').build()
 * - Returns typed CreatePostPayload (server `id` omitted)
 */
export class PostBuilder {
  private payload: CreatePostPayload = {
    userId: 1,
    title: 'Default post title',
    body: 'Default post body content.',
  };

  withUserId(userId: UserId | number): this {
    this.payload.userId = userId;
    return this;
  }

  withTitle(title: string): this {
    this.payload.title = title;
    return this;
  }

  withBody(body: string): this {
    this.payload.body = body;
    return this;
  }

  /** Appends worker-safe unique suffix — parallel-test friendly. */
  withUniqueTitle(prefix: string): this {
    this.payload.title = `${prefix}-${uniqueSuffix()}`;
    return this;
  }

  build(): CreatePostPayload {
    return { ...this.payload };
  }
}

export function postBuilder(): PostBuilder {
  return new PostBuilder();
}
