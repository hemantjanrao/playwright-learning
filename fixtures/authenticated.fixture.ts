import { test as base } from '@fixtures/index';
import type { TestFixtures } from '@fixtures/index';
import { AUTH_STORAGE_PATH } from '@utils/constants';

/**
 * Authenticated fixture layer — composes on top of base TestFixtures.
 * Injects saved storageState so UI tests skip the login form.
 */
export type AuthenticatedFixtures = TestFixtures & {
  storageState: string;
};

export const authenticatedTest = base.extend<AuthenticatedFixtures>({
  storageState: AUTH_STORAGE_PATH,
});

export { expect } from '@fixtures/index';
