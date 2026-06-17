import { test as base } from '@fixtures/index';
import type { TestFixtures } from '@fixtures/index';
import { AUTH_STORAGE_PATH } from '@utils/constants';

/** Composed fixture types — authenticated layer extends base fixtures explicitly. */
export type AuthenticatedFixtures = TestFixtures & {
  storageState: string;
};

export const authenticatedTest = base.extend<AuthenticatedFixtures>({
  storageState: AUTH_STORAGE_PATH,
});

export { expect } from '@fixtures/index';
