import type { Page, Route } from '@playwright/test';

export type MockRouteOptions = {
  status?: number;
  contentType?: string;
  headers?: Record<string, string>;
};

/**
 * Playwright-native network mocking — intercepts browser requests via `page.route`.
 * Use for UI tests when the app calls APIs from the browser context.
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

/** Abort matching requests — simulate network failure or blocked endpoint. */
export async function abortRoute(page: Page, urlPattern: string | RegExp): Promise<void> {
  await page.route(urlPattern, (route) => route.abort('failed'));
}

/** Remove all route handlers registered by the test. */
export async function clearRoutes(page: Page): Promise<void> {
  await page.unrouteAll({ behavior: 'ignoreErrors' });
}
