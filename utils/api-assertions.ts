import type { ApiFailure, ApiResult } from '@models/api.types';
import { expect } from '@playwright/test';

/** Narrows `ApiResult` to `ApiFailure` — avoids conditionals in negative API tests. */
export function expectApiFailure<T>(result: ApiResult<T>): asserts result is ApiFailure {
  expect(result.ok).toBe(false);
}
