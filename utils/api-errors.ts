import type { ZodError } from 'zod';

/** Thrown when HTTP status code does not match expected value. */
export class ApiRequestError extends Error {
  readonly name = 'ApiRequestError';

  constructor(
    readonly method: string,
    readonly url: string,
    readonly expectedStatus: number,
    readonly actualStatus: number,
    readonly body: string,
  ) {
    super(
      `${method} ${url} failed. Expected ${expectedStatus}, got ${actualStatus}. Body: ${body}`,
    );
  }
}

/** Thrown when response JSON fails Zod contract validation. */
export class ApiValidationError extends Error {
  readonly name = 'ApiValidationError';

  constructor(
    readonly url: string,
    readonly status: number,
    readonly zodError: ZodError,
    readonly rawBody: unknown,
  ) {
    super(`Contract validation failed for ${url} (${status}): ${zodError.message}`);
  }
}

/** Thrown when response body is not valid JSON. */
export class ApiParseError extends Error {
  readonly name = 'ApiParseError';

  constructor(
    readonly url: string,
    readonly status: number,
    readonly body: string,
  ) {
    super(`Failed to parse JSON from ${url} (${status}). Body: ${body}`);
  }
}
