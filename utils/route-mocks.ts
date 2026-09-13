import type { Page, Route } from '@playwright/test';

/**
 * Options for {@link mockJsonRoute}.
 */
export type MockRouteOptions = {
  /** HTTP status to fulfill with (default 200). */
  status?: number;
  /** Content-Type header (default `application/json`). */
  contentType?: string;
  /** Extra response headers merged into the fulfill call. */
  headers?: Record<string, string>;
};

/**
 * Playwright-native network mocking — intercepts **browser** requests via `page.route`.
 *
 * **When to use**
 * - UI tests where the app under test calls APIs from the page context
 * - Project `chromium-mock` / specs tagged `@mock`
 *
 * **When not to use**
 * - Node-side API tests → MSW (`msw.fixture`) or WireMock (`container.fixture`)
 *
 * Always call {@link clearRoutes} in `afterEach` (or rely on a fresh page) so
 * handlers do not leak across tests.
 *
 * @see docs/ARCHITECTURE.md — Mocking strategies (`page.route`)
 */

/**
 * Fulfills matching browser requests with a JSON body.
 *
 * @param page - Playwright page whose network to intercept.
 * @param urlPattern - Glob string or RegExp matched against the request URL.
 * @param body - Object serialized as JSON in the response.
 * @param options - Status, content-type, and extra headers.
 */
export async function mockJsonRoute(
  page: Page,
  urlPattern: string | RegExp,
  body: unknown,
  options: MockRouteOptions = {},
): Promise<void> {
  const { status = 200, contentType = 'application/json', headers = {} } = options;

  await page.route(urlPattern, async (route: Route) => {
    await route.fulfill({
      status,
      contentType,
      headers,
      body: JSON.stringify(body),
    });
  });
}

/**
 * Aborts matching browser requests — simulates network failure or a blocked endpoint.
 */
export async function abortRoute(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.route(urlPattern, (route) => route.abort('failed'));
}

/**
 * Removes all route handlers registered on the page.
 * Prefer calling this after each mock-heavy UI test.
 */
export async function clearRoutes(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
