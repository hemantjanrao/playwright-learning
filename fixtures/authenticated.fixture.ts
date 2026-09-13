import { test as base } from '@fixtures/index';
import type { TestFixtures } from '@fixtures/index';
import { AUTH_STORAGE_PATH } from '@utils/constants';

/**
 * Authenticated UI fixture layer.
 *
 * Composes on top of base {@link TestFixtures} and injects Playwright
 * `storageState` from the file written by `tests/setup/auth.setup.ts`.
 * Specs skip the login form and start already logged in.
 *
 * **Requires** the `setup` Playwright project to have run first
 * (chromium / firefox / webkit declare `dependencies: ['setup']`).
 *
 * @example
 * ```ts
 * import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
 * test('should show inventory when already logged in', async ({ dashboardPage }) => {
 *   await dashboardPage.open();
 *   await expect(dashboardPage.inventoryList).toBeVisible();
 * });
 * ```
 */
export type AuthenticatedFixtures = TestFixtures & {
  /** Path to saved browser storage state (`auth/.auth/user.json`). */
  storageState: string;
};

/** Extended `test` with all base fixtures plus authenticated `storageState`. */
export const authenticatedTest = base.extend<AuthenticatedFixtures>({
  storageState: AUTH_STORAGE_PATH,
});

export { expect } from '@fixtures/index';
