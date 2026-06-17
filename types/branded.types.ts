declare const brand: unique symbol;

/** Nominal typing — prevents mixing raw numbers with domain IDs at compile time. */
export type Brand<T, B extends string> = T & { readonly [brand]: B };

export type UserId = Brand<number, 'UserId'>;
export type PostId = Brand<number, 'PostId'>;

export function asUserId(id: number): UserId {
  if (!Number.isInteger(id) || id < 1) {
    throw new RangeError(`Invalid UserId: ${id}`);
  }
  return id as UserId;
}

export function asPostId(id: number): PostId {
  if (!Number.isInteger(id) || id < 1) {
    throw new RangeError(`Invalid PostId: ${id}`);
  }
  return id as PostId;
}
