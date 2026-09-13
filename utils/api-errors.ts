import type { ZodError } from 'zod';

/**
 * Typed API failure hierarchy used by {@link ApiClient} and {@link FetchApiClient}.
 *
 * Catch or assert with `instanceof` in unit/diagnostic helpers:
 * - {@link ApiRequestError} — wrong HTTP status
 * - {@link ApiValidationError} — JSON shape failed Zod contract
 * - {@link ApiParseError} — body was not valid JSON
 *
 * Happy-path helpers (`getValidated`) throw these; negative helpers (`getResult`)
 * return {@link ApiResult} instead of throwing on 4xx/5xx.
 */

/** Thrown when the HTTP status code does not match the expected value. */
export class ApiRequestError extends Error {
  readonly name = 'ApiRequestError';

  /**
   * @param method - HTTP method used for the request.
   * @param url - Absolute request URL.
   * @param expectedStatus - Status the test required.
   * @param actualStatus - Status returned by the server / stub.
   * @param body - Raw response body for debugging in CI logs.
   */
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

/**
 * Thrown when response JSON fails Zod contract validation.
 * Inspect `zodError` for field-level issues and `rawBody` for the payload received.
 */
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

/** Thrown when the response body cannot be parsed as JSON. */
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
