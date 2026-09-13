import type { z } from 'zod';
import { ApiErrorResponseSchema } from '@schemas/api.schemas';
import type { ApiErrorResponse, ApiResult } from '@models/api.types';
import { ApiParseError, ApiRequestError, ApiValidationError } from '@utils/api-errors';
import { logger } from '@utils/logger';

/**
 * HTTP client that uses Node's native `fetch`.
 *
 * **Why a separate client?**
 * MSW intercepts Node `fetch`. Playwright's `request` fixture uses a different
 * network stack that MSW cannot patch — so MSW specs must call this client.
 *
 * **When to use**
 * - Specs under `tests/api/msw-*.spec.ts`
 * - Import `mswTest` from `@fixtures/msw.fixture` and use `fetchApiClient`
 *
 * **When not to use**
 * - Live API or WireMock tests — use {@link ApiClient} (`apiClient` / `mockApiClient`)
 *
 * Public surface mirrors {@link ApiClient} (`getValidated`, `postValidated`, `getResult`)
 * so contract assertions stay consistent across transport layers.
 *
 * @example
 * ```ts
 * import { mswTest as test, expect } from '@fixtures/msw.fixture';
 * const users = await fetchApiClient.getValidated('/users', ApiUsersSchema);
 * ```
 */
export class FetchApiClient {
  /**
   * @param baseUrl - API origin (usually `config.apiBaseUrl`).
   * @param extraHeaders - Optional headers merged into every request.
   */
  constructor(
    private readonly baseUrl: string,
    private readonly extraHeaders?: Record<string, string>,
  ) {}

  /** Joins `baseUrl` and path, normalizing trailing/leading slashes. */
  buildUrl(path: string): string {
    const base = this.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  /**
   * Contract-driven GET via `fetch` — status + Zod validation.
   *
   * @throws {ApiRequestError} Status mismatch.
   * @throws {ApiValidationError} Body fails schema.
   * @throws {ApiParseError} Body is not JSON.
   */
  async getValidated<S extends z.ZodType>(
    path: string,
    schema: S,
    expectedStatus = 200,
  ): Promise<z.infer<S>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, { headers: this.extraHeaders });
    logger.debug(`GET ${url}`, { status: response.status, ok: response.ok });
    return this.parseValidated(url, 'GET', response, schema, expectedStatus);
  }

  /**
   * Contract-driven POST via `fetch` — status + Zod validation.
   *
   * @param expectedStatus - Defaults to 201 (created).
   */
  async postValidated<S extends z.ZodType, B>(
    path: string,
    body: B,
    schema: S,
    expectedStatus = 201,
  ): Promise<z.infer<S>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...this.extraHeaders },
      body: JSON.stringify(body),
    });
    logger.debug(`POST ${url}`, { status: response.status, ok: response.ok });
    return this.parseValidated(url, 'POST', response, schema, expectedStatus);
  }

  /**
   * GET that never throws on HTTP error status.
   * Returns {@link ApiResult} for negative / exploratory MSW tests.
   */
  async getResult<T = unknown>(path: string): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    const response = await fetch(url, { headers: this.extraHeaders });
    const status = response.status;
    const bodyText = await response.text();
    const parsed = this.safeParseJson(bodyText);

    if (response.ok) {
      return { ok: true, data: parsed as T, status };
    }

    const errorResult = ApiErrorResponseSchema.safeParse(parsed);
    const error: ApiErrorResponse = errorResult.success
      ? errorResult.data
      : { message: bodyText || `HTTP ${status}` };

    return { ok: false, status, error, rawBody: parsed };
  }

  private async parseValidated<S extends z.ZodType>(
    url: string,
    method: string,
    response: Response,
    schema: S,
    expectedStatus: number,
  ): Promise<z.infer<S>> {
    const status = response.status;
    const bodyText = await response.text();
    const parsed = this.parseJsonStrict(bodyText, url, status);

    if (status !== expectedStatus) {
      throw new ApiRequestError(method, url, expectedStatus, status, bodyText);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new ApiValidationError(url, status, result.error, parsed);
    }

    return result.data;
  }

  private parseJsonStrict(bodyText: string, url: string, status: number): unknown {
    if (!bodyText) return {};
    try {
      return JSON.parse(bodyText);
    } catch {
      throw new ApiParseError(url, status, bodyText);
    }
  }

  private safeParseJson(bodyText: string): unknown {
    if (!bodyText) return {};
    try {
      return JSON.parse(bodyText);
    } catch {
      return bodyText;
    }
  }
}
