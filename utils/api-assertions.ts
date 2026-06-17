import type { ApiPost, ApiUser } from '@models/api.types';

export function assertUserShape(user: ApiUser): void {
  if (!user.id || !user.email || !user.username) {
    throw new Error(`Invalid user shape: ${JSON.stringify(user)}`);
  }

  if (!user.email.includes('@')) {
    throw new Error(`User email is invalid: ${user.email}`);
  }
}

export function assertPostShape(post: ApiPost): void {
  if (!post.title?.trim() || !post.body?.trim()) {
    throw new Error(`Invalid post shape: ${JSON.stringify(post)}`);
  }

  if (typeof post.userId !== 'number' || post.userId < 1) {
    throw new Error(`Invalid post userId: ${post.userId}`);
  }
}

export function assertArrayOfUsers(users: unknown): asserts users is ApiUser[] {
  if (!Array.isArray(users)) {
    throw new Error('Expected an array of users');
  }

  users.forEach((user, index) => {
    try {
      assertUserShape(user as ApiUser);
    } catch (error) {
      throw new Error(
        `User at index ${index} failed validation: ${error instanceof Error ? error.message : String(error)}`,
      );
    }
  });
}
