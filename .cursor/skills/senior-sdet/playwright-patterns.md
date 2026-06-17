# Playwright patterns — reference

Read when implementing non-trivial flows. Keep specs thin; put reuse here or in `tests/pages/`.

## Custom fixture (authenticated user)

```typescript
// tests/fixtures/auth.ts
import { test as base } from '@playwright/test';

type Fixtures = { authedPage: Page };

export const test = base.extend<Fixtures>({
  authedPage: async ({ page }, use) => {
    await page.goto('/login');
    await page.getByLabel('Email').fill(process.env.E2E_USER!);
    await page.getByLabel('Password').fill(process.env.E2E_PASSWORD!);
    await page.getByRole('button', { name: 'Sign in' }).click();
    await expect(page).toHaveURL(/dashboard/);
    await use(page);
  },
});
```

## API seed + E2E assert

```typescript
test('shows order after checkout', async ({ page, request }) => {
  const res = await request.post('/api/orders', { data: { sku: 'ABC' } });
  expect(res.ok()).toBeTruthy();
  const { id } = await res.json();

  await page.goto(`/orders/${id}`);
  await expect(page.getByRole('heading', { name: 'Order confirmed' })).toBeVisible();
});
```

## Network stub

```typescript
await page.route('**/api/rates', (route) =>
  route.fulfill({ status: 200, body: JSON.stringify({ rate: 4.5 }) }),
);
```

## Parallel-safe data

```typescript
const email = `user+${test.info().workerIndex}-${Date.now()}@example.com`;
```

## Visual regression (use sparingly)

```typescript
await expect(page).toHaveScreenshot('dashboard.png', { maxDiffPixelRatio: 0.01 });
```

Pin viewport and disable animations in `playwright.config.ts` for stable snapshots.

## Config baseline

```typescript
// playwright.config.ts
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['html'], ['list']],
  use: {
    baseURL: process.env.BASE_URL ?? 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
```
