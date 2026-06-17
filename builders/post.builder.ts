import type { UserId } from '@models/branded.types';
import type { CreatePostPayload } from '@schemas/api.schemas';
import { uniqueSuffix } from '@utils/test-data-factory';

/** Fluent builder — composable test data with typed chaining. */
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
