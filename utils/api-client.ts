import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import type { ApiClientOptions, ApiErrorResponse, ApiResult } from '@models/api.types';
import { ApiErrorResponseSchema } from '@schemas/api.schemas';
import { ApiParseError, ApiRequestError, ApiValidationError } from '@utils/api-errors';
import { logger } from '@utils/logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

/**
 * Typed HTTP client for live API and WireMock contract tests.
 *
 * **Transport:** Playwright {@link APIRequestContext} (`request` fixture).
 * No browser is required. Prefer this for `api` and `container` projects.
 *
 * **Do not use with MSW** — MSW patches Node `fetch`, not Playwright's network stack.
 * For MSW specs, use {@link FetchApiClient} via the `fetchApiClient` fixture.
 *
 * **Method choice**
 * | Method | When |
 * |--------|------|
 * | `getValidated` / `postValidated` / `putValidated` | Happy path — status + Zod contract |
 * | `getResult` | Negative / exploratory — returns `ApiResult` (no throw on 4xx/5xx) |
 * | `getRaw` | Escape hatch for custom header/status assertions |
 * | `delete` | Status-only DELETE (throws on mismatch) |
 *
 * Injected as `apiClient` from `@fixtures/index`, or as `mockApiClient`
 * from `@fixtures/container.fixture` (base URL points at WireMock).
 *
 * @example
 * ```ts
 * const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
 * const result = await apiClient.getResult('/users/99999');
 * expectApiFailure(result);
 * ```
 */
export class ApiClient {
  /**
   * @param request - Playwright API request context from the `request` fixture.
   * @param options - Base URL and optional extra headers (auth tokens, etc.).
   */
  constructor(
    private readonly request: APIRequestContext,
    private readonly options: ApiClientOptions,
  ) {}

  /** Joins `baseUrl` and path, normalizing trailing/leading slashes. */
  buildUrl(path: string): string {
    const base = this.options.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

  private async logResponse(method: string, url: string, response: APIResponse): Promise<void> {
    logger.debug(`${method} ${url}`, {
      status: response.status(),
      ok: response.ok(),
    });
  }

  /**
   * Contract-driven GET — asserts status, parses JSON, validates against Zod.
   *
   * @param path - Path relative to `apiBaseUrl` (e.g. `/users`).
   * @param schema - Zod schema; return type is `z.infer<S>`.
   * @param expectedStatus - Defaults to 200.
   * @throws {ApiRequestError} Status mismatch.
   * @throws {ApiValidationError} Body fails schema.
   * @throws {ApiParseError} Body is not JSON.
   */
  async getValidated<S extends z.ZodType>(
    path: string,
    schema: S,
    expectedStatus = 200,
  ): Promise<z.infer<S>> {
    return this.requestValidated('GET', path, schema, expectedStatus);
  }

  /**
   * Contract-driven POST — asserts status, parses JSON, validates against Zod.
   *
   * @param expectedStatus - Defaults to 201 (created).
   */
  async postValidated<S extends z.ZodType, B>(
    path: string,
    body: B,
    schema: S,
    expectedStatus = 201,
  ): Promise<z.infer<S>> {
    return this.requestValidated('POST', path, schema, expectedStatus, body);
  }

  /**
   * Contract-driven PUT — asserts status, parses JSON, validates against Zod.
   *
   * @param expectedStatus - Defaults to 200.
   */
  async putValidated<S extends z.ZodType, B>(
    path: string,
    body: B,
    schema: S,
    expectedStatus = 200,
  ): Promise<z.infer<S>> {
    return this.requestValidated('PUT', path, schema, expectedStatus, body);
  }

  /**
   * GET that never throws on HTTP error status.
   * Returns discriminated union {@link ApiResult} — narrow with `result.ok`
   * or {@link expectApiFailure}.
   *
   * Use for negative and exploratory API tests.
   */
  async getResult<T = unknown>(path: string): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, { headers: this.options.extraHeaders });
    await this.logResponse('GET', url, response);
    return this.toApiResult<T>(response);
  }

  /**
   * DELETE that asserts status only (no body validation).
   *
   * @throws {ApiRequestError} When status does not match `expectedStatus`.
   */
  async delete(path: string, expectedStatus = 200): Promise<void> {
    const url = this.buildUrl(path);
    const response = await this.request.delete(url, { headers: this.options.extraHeaders });
    await this.logResponse('DELETE', url, response);

    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new ApiRequestError('DELETE', url, expectedStatus, response.status(), body);
    }
  }

  /**
   * Escape hatch — returns the raw Playwright {@link APIResponse}.
   * Prefer `getValidated` / `getResult` unless you need headers or streaming details.
   */
  async getRaw(path: string): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, { headers: this.options.extraHeaders });
    await this.logResponse('GET', url, response);
    return response;
  }

  private async requestValidated<S extends z.ZodType>(
    method: HttpMethod,
    path: string,
    schema: S,
    expectedStatus: number,
    body?: unknown,
  ): Promise<z.infer<S>> {
    const url = this.buildUrl(path);
    const response = await this.dispatch(method, url, body);
    await this.logResponse(method, url, response);

    const status = response.status();
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

  private async dispatch(method: HttpMethod, url: string, body?: unknown): Promise<APIResponse> {
    const headers = {
      ...(body !== undefined ? { 'Content-Type': 'application/json' } : {}),
      ...this.options.extraHeaders,
    };

    switch (method) {
      case 'GET':
        return this.request.get(url, { headers: this.options.extraHeaders });
      case 'POST':
        return this.request.post(url, { data: body, headers });
      case 'PUT':
        return this.request.put(url, { data: body, headers });
      case 'DELETE':
        return this.request.delete(url, { headers: this.options.extraHeaders });
    }
  }

  private async toApiResult<T>(response: APIResponse): Promise<ApiResult<T>> {
    const status = response.status();
    const bodyText = await response.text();
    const parsed = this.safeParseJson(bodyText);

    if (response.ok()) {
      return { ok: true, data: parsed as T, status };
    }

    const errorResult = ApiErrorResponseSchema.safeParse(parsed);
    const error: ApiErrorResponse = errorResult.success
      ? errorResult.data
      : { message: bodyText || `HTTP ${status}` };

    return { ok: false, status, error, rawBody: parsed };
  }

  private parseJsonStrict(bodyText: string, url: string, status: number): unknown {
    if (!bodyText) {
      return {};
    }
    try {
      return JSON.parse(bodyText);
    } catch {
      throw new ApiParseError(url, status, bodyText);
    }
  }

  private safeParseJson(bodyText: string): unknown {
    if (!bodyText) {
      return {};
    }
    try {
      return JSON.parse(bodyText);
    } catch {
      return bodyText;
    }
  }
}
