import { setupServer } from 'msw/node';
import { createApiHandlers } from '@mocks/handlers';

/** MSW Node server type — returned by {@link createMswServer}. */
export type MswServer = ReturnType<typeof setupServer>;

/**
 * Creates an MSW Node server with API handlers for the configured base URL.
 *
 * Prefer the auto worker fixture in `@fixtures/msw.fixture` over calling this
 * from specs. Specs should use `fetchApiClient` against the listening server.
 *
 * @param apiBaseUrl - Must match the origin used by {@link FetchApiClient}.
 */
export function createMswServer(apiBaseUrl: string): MswServer {
  return setupServer(...createApiHandlers(apiBaseUrl));
}
