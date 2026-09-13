import type { ApiFailure, ApiResult } from '@models/api.types';
import { expect } from '@playwright/test';

/**
 * Assertion helpers for {@link ApiResult} discriminated unions.
 *
 * Keeps negative API specs free of manual `if (!result.ok)` branching —
 * TypeScript narrows the type after these helpers run.
 */

/**
 * Narrows `ApiResult` to {@link ApiFailure}.
 * Fails the test when `result.ok` is true.
 *
 * @example
 * ```ts
 * const result = await apiClient.getResult('/users/99999/nonexistent');
 * expectApiFailure(result);
 * expect(result.status).toBeGreaterThanOrEqual(400);
 * ```
 */
export function expectApiFailure<T>(result: ApiResult<T>): asserts result is ApiFailure {
  expect(result.ok).toBe(false);
}
