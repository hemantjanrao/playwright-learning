import type { z } from 'zod';
import { ApiErrorResponseSchema } from '@schemas/api.schemas';
import type { ApiErrorResponse, ApiResult } from '@models/api.types';
import { ApiParseError, ApiRequestError, ApiValidationError } from '@utils/api-errors';
import { logger } from '@utils/logger';

/**
 * HTTP client using native `fetch` — required for MSW interception in Node.
 * Playwright's `request` fixture uses a separate network stack MSW cannot patch.
 */
export class FetchApiClient {
  constructor(
    private readonly baseUrl: string,
    private readonly extraHeaders?: Record<string, string>,
  ) {}

  buildUrl(path: string): string {
    const base = this.baseUrl.replace(/\/$/, '');
    const normalizedPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${normalizedPath}`;
  }

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
