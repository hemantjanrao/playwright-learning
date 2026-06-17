import { http, HttpResponse } from 'msw';
import { MOCK_USER, MOCK_USERS } from '@mocks/data/mock-users';

/** Build handlers for a given API base URL (from config). */
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
