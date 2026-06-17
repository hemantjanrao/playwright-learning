import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { ApiClientOptions } from '@models/api.types';
import { logger } from '@utils/logger';

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

  async get<T>(path: string, expectedStatus = 200): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, {
      headers: this.options.extraHeaders,
    });
    await this.logResponse('GET', url, response);
    return this.parseJson<T>(response, expectedStatus);
  }

  async post<T, B = unknown>(path: string, body: B, expectedStatus = 201): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.post(url, {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...this.options.extraHeaders,
      },
    });
    await this.logResponse('POST', url, response);
    return this.parseJson<T>(response, expectedStatus);
  }

  async put<T, B = unknown>(path: string, body: B, expectedStatus = 200): Promise<T> {
    const url = this.buildUrl(path);
    const response = await this.request.put(url, {
      data: body,
      headers: {
        'Content-Type': 'application/json',
        ...this.options.extraHeaders,
      },
    });
    await this.logResponse('PUT', url, response);
    return this.parseJson<T>(response, expectedStatus);
  }

  async delete(path: string, expectedStatus = 200): Promise<void> {
    const url = this.buildUrl(path);
    const response = await this.request.delete(url, {
      headers: this.options.extraHeaders,
    });
    await this.logResponse('DELETE', url, response);

    if (response.status() !== expectedStatus) {
      const body = await response.text();
      throw new Error(
        `DELETE ${url} failed. Expected ${expectedStatus}, got ${response.status()}. Body: ${body}`,
      );
    }
  }

  async getRaw(path: string): Promise<APIResponse> {
    const url = this.buildUrl(path);
    const response = await this.request.get(url, {
      headers: this.options.extraHeaders,
    });
    await this.logResponse('GET', url, response);
    return response;
  }

  private async parseJson<T>(response: APIResponse, expectedStatus: number): Promise<T> {
    const status = response.status();
    const bodyText = await response.text();

    if (status !== expectedStatus) {
      throw new Error(
        `API request failed. Expected status ${expectedStatus}, got ${status}. Body: ${bodyText}`,
      );
    }

    if (!bodyText) {
      return {} as T;
    }

    try {
      return JSON.parse(bodyText) as T;
    } catch {
      throw new Error(`Failed to parse JSON response. Body: ${bodyText}`);
    }
  }
}
