import { setupServer } from 'msw/node';
import { createApiHandlers } from '@mocks/handlers';

export type MswServer = ReturnType<typeof setupServer>;

/** Creates an MSW Node server with API handlers for the configured base URL. */
export function createMswServer(apiBaseUrl: string): MswServer {
  return setupServer(...createApiHandlers(apiBaseUrl));
}
