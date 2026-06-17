import { test as base } from '@fixtures/index';
import { AUTH_STORAGE_PATH } from '@utils/constants';

export const authenticatedTest = base.extend({
  storageState: AUTH_STORAGE_PATH,
});

export { expect } from '@fixtures/index';
