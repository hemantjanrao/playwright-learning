import { test, expect } from '@playwright/test';
import { asUserId, asPostId } from '@models/branded.types';
import { postBuilder } from '@builders/post.builder';

test.describe('Unit — branded types', () => {
  test('asUserId accepts valid positive integers', () => {
    expect(asUserId(1)).toBe(1);
    expect(asUserId(42)).toBe(42);
  });

  test('asUserId rejects invalid values', () => {
    expect(() => asUserId(0)).toThrow(RangeError);
    expect(() => asUserId(-1)).toThrow(RangeError);
    expect(() => asUserId(1.5)).toThrow(RangeError);
  });

  test('asPostId rejects invalid values', () => {
    expect(() => asPostId(0)).toThrow(RangeError);
  });
});

test.describe('Unit — PostBuilder', () => {
  test('builds typed payload with chained methods', () => {
    const payload = postBuilder()
      .withUserId(5)
      .withTitle('Test title')
      .withBody('Test body')
      .build();

    expect(payload).toEqual({
      userId: 5,
      title: 'Test title',
      body: 'Test body',
    });
    expect(payload).not.toHaveProperty('id');
  });

  test('withUniqueTitle appends suffix', () => {
    const payload = postBuilder().withUniqueTitle('prefix').build();
    expect(payload.title).toMatch(/^prefix-w\d+-/);
  });
});
