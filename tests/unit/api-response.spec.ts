import { createServer } from 'node:http';
import type { AddressInfo } from 'node:net';
import { test as base, expect } from '@playwright/test';
import { z } from 'zod';
import { ApiClient } from '@utils/api-client';
import { FetchApiClient } from '@utils/fetch-api-client';
import { ApiParseError, ApiRequestError, ApiValidationError } from '@utils/api-errors';
import { ApiPostSchema } from '@schemas/api.schemas';

const test = base.extend<{ serviceUrl: string }>({
  // Playwright requires fixture dependencies to use object destructuring.
  // eslint-disable-next-line no-empty-pattern
  serviceUrl: async ({}, use) => {
    const server = createServer((request, response) => {
      if (request.url === '/gateway') {
        response.writeHead(502).end('<html>Bad gateway</html>');
      } else if (request.url === '/invalid-json') {
        response.writeHead(200).end('not json');
      } else if (request.url === '/empty') {
        response.writeHead(200).end();
      } else if (request.url === '/missing-id') {
        response.end(JSON.stringify({ userId: 1, title: 'Title', body: 'Body' }));
      } else if (request.url === '/unauthorized') {
        response.writeHead(401).end(JSON.stringify({ message: 'Unauthorized' }));
      } else {
        response.end(JSON.stringify({ token: request.headers['x-test-token'] }));
      }
    });
    await new Promise<void>((resolve, reject) => {
      server.once('error', reject);
      server.listen(0, '127.0.0.1', resolve);
    });
    try {
      await use(`http://127.0.0.1:${(server.address() as AddressInfo).port}`);
    } finally {
      await new Promise<void>((resolve, reject) => {
        server.close((error) => (error ? reject(error) : resolve()));
        server.closeAllConnections();
      });
    }
  },
});

for (const transport of ['playwright', 'fetch'] as const) {
  test.describe(`API response contract — ${transport}`, () => {
    const schema = z.object({ token: z.string() });
    const clientTest = test.extend<{ client: ApiClient | FetchApiClient }>({
      client: async ({ request, serviceUrl }, use) => {
        const headers = { 'x-test-token': 'test-token' };
        await use(
          transport === 'playwright'
            ? new ApiClient(request, { baseUrl: serviceUrl, extraHeaders: headers })
            : new FetchApiClient(serviceUrl, headers),
        );
      },
    });

    clientTest('prioritizes unexpected status over non-JSON error body', async ({ client }) => {
      await expect(client.getValidated('/gateway', schema)).rejects.toBeInstanceOf(ApiRequestError);
    });
    clientTest('rejects malformed success JSON', async ({ client }) => {
      await expect(client.getValidated('/invalid-json', schema)).rejects.toBeInstanceOf(
        ApiParseError,
      );
    });
    clientTest('rejects empty success bodies that violate the contract', async ({ client }) => {
      await expect(client.getValidated('/empty', schema)).rejects.toBeInstanceOf(
        ApiValidationError,
      );
    });
    clientTest('requires IDs in post responses', async ({ client }) => {
      await expect(client.getValidated('/missing-id', ApiPostSchema)).rejects.toBeInstanceOf(
        ApiValidationError,
      );
    });
    clientTest('forwards headers and validates successful data', async ({ client }) => {
      expect(await client.getValidated('/headers', schema)).toEqual({ token: 'test-token' });
    });
    clientTest('returns structured negative responses without throwing', async ({ client }) => {
      expect(await client.getResult('/unauthorized')).toMatchObject({
        ok: false,
        status: 401,
        error: { message: 'Unauthorized' },
      });
    });
  });
}
