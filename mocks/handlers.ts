import { http, HttpResponse } from 'msw';
import { MOCK_USER, MOCK_USERS } from '@mocks/data/mock-users';

/**
 * Builds MSW request handlers for the configured API base URL.
 *
 * Handlers mirror the live JSONPlaceholder-style contracts used by API tests:
 * - `GET /users` → list
 * - `GET /users/:id` → single user or 404
 * - `POST /posts` → echoes body with a stub `id`
 *
 * Wired by {@link createMswServer} / the `mswServer` worker fixture.
 * Keep payloads in sync with {@link MOCK_USER} and Zod schemas in `schemas/api.schemas.ts`.
 *
 * @param apiBaseUrl - Absolute API origin from config (trailing slash stripped).
 */
export function createApiHandlers(apiBaseUrl: string) {
  const base = apiBaseUrl.replace(/\/$/, '');

  return [
    http.get(`${base}/users`, () => HttpResponse.json(MOCK_USERS)),

    http.get(`${base}/users/:id`, ({ params }) => {
      const id = Number(params.id);
      if (id !== MOCK_USER.id) {
        return HttpResponse.json({ message: 'Not found' }, { status: 404 });
      }
      return HttpResponse.json(MOCK_USER);
    }),

    http.post(`${base}/posts`, async ({ request }) => {
      const body = (await request.json()) as Record<string, unknown>;
      return HttpResponse.json({ ...body, id: 999 }, { status: 201 });
    }),
  ];
}
