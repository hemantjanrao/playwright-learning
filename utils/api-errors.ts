import type { ZodError } from 'zod';

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
