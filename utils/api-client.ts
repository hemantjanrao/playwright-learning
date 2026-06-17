import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';
import type { ApiClientOptions, ApiErrorResponse, ApiResult } from '@models/api.types';
import { ApiErrorResponseSchema } from '@schemas/api.schemas';
import { ApiParseError, ApiRequestError, ApiValidationError } from '@utils/api-errors';
import { logger } from '@utils/logger';

type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly options: ApiClientOptions,
  ) {}

  private buildUrl(path: string): string {
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
   * Contract-driven GET — validates response against a Zod schema at runtime.
   * Preferred for production API tests.
   */
  async getValidated<S extends z.ZodType>(
    path: string,
    schema: S,
    expectedStatus = 200,
  ): Promise<z.infer<S>> {
    return this.requestValidated('GET', path, schema, expectedStatus);
  }

  /**
   * Contract-driven POST — validates response against a Zod schema at runtime.
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
   * Returns a discriminated union — use for negative tests or optional error handling.
   */
  async getResult<T = unknown>(path: string): Promise<ApiResult<T>> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, { headers: this.options.extraHeaders });
    await this.logResponse('GET', url, response);
    return this.toApiResult<T>(url, response);
  }

  /** @deprecated Prefer getValidated() for contract-checked responses. */
  async get<T>(path: string, expectedStatus = 200): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, { headers: this.options.extraHeaders });
    await this.logResponse('GET', url, response);
    return this.parseJson<T>(url, response, expectedStatus);
  }

  /** @deprecated Prefer postValidated() for contract-checked responses. */
  async post<T, B = unknown>(path: string, body: B, expectedStatus = 201): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.post(url, {
      data: body,
      headers: { 'Content-Type': 'application/json', ...this.options.extraHeaders },
    });
    await this.logResponse('POST', url, response);
    return this.parseJson<T>(url, response, expectedStatus);
  }

  async put<T, B = unknown>(path: string, body: B, expectedStatus = 200): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.put(url, {
      data: body,
      headers: { 'Content-Type': 'application/json', ...this.options.extraHeaders },
    });
    await this.logResponse('PUT', url, response);
    return this.parseJson<T>(url, response, expectedStatus);
  }

  async delete(path: string, expectedStatus = 200): Promise<void> {
    const url = this.buildUrl(path);
    const response = await this.request.delete(url, { headers: this.options.extraHeaders });
    await this.logResponse('DELETE', url, response);

    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new ApiRequestError('DELETE', url, expectedStatus, response.status(), body);
    }
  }

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
    const parsed = this.safeParseJson(bodyText);

    if (status !== expectedStatus) {
      throw new ApiRequestError(method, url, expectedStatus, status, bodyText);
    }

    const result = schema.safeParse(parsed);
    if (!result.success) {
      throw new ApiValidationError(url, status, result.error, parsed);
    }

    return result.data;
  }

  private async dispatch(
    method: HttpMethod,
    url: string,
    body?: unknown,
  ): Promise<APIResponse> {
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

  private async toApiResult<T>(_url: string, response: APIResponse): Promise<ApiResult<T>> {
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

  private async parseJson<T>(
    url: string,
    response: APIResponse,
    expectedStatus: number,
  ): Promise<T> {
    const status = response.status();
    const bodyText = await response.text();

    if (status !== expectedStatus) {
      throw new ApiRequestError('REQUEST', url, expectedStatus, status, bodyText);
    }

    if (!bodyText) {
      return {} as T;
    }

    try {
      return JSON.parse(bodyText) as T;
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
