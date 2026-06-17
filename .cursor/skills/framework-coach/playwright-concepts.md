# Playwright Concepts in This Framework

Reference for QA engineers learning Playwright through this repo. Each section: plain English → repo example → common mistake.

---

## 1. `@playwright/test` vs `playwright` library

**Plain English:** `@playwright/test` is the **test runner** (describe, test, expect, fixtures, config). The `playwright` package is the **browser automation library** — used inside Page Objects via `Page`, `Locator`.

**In this framework:** Tests and fixtures import from `@playwright/test`. Page Objects import `Page`, `Locator` types from the same package.

```typescript
import { test, expect } from '@fixtures/index'; // NOT @playwright/test directly
import type { Page, Locator } from '@playwright/test';
```

---

## 2. Test structure: `test.describe` / `test`

```typescript
test.describe('Login', () => {
  test('should login with valid credentials...', async ({ loginPage }) => {
    // Arrange → Act → Assert
  });
});
```

- `describe` — groups related tests (shows in reports).
- `test` — one scenario; must be independent of other tests.
- Callback receives **fixtures** as the first argument.

---

## 3. Fixtures (dependency injection)

**Plain English:** Fixtures are setup/teardown hooks with a name. Playwright creates them per test (or per worker) and injects them by name.

**Layers in this repo:**

| Import                            | Fixtures added                          | Use for                 |
| --------------------------------- | --------------------------------------- | ----------------------- |
| `@fixtures/index`                 | `config`, `loginPage`, `apiClient`, ... | Most tests              |
| `@fixtures/authenticated.fixture` | + `storageState`                        | UI tests skipping login |
| `@fixtures/msw.fixture`           | + `mswServer`, `fetchApiClient`         | MSW API tests           |
| `@fixtures/container.fixture`     | + `mockApiClient`, WireMock container   | Docker API tests        |

**Fixture lifecycle:**

```typescript
config: async ({}, use) => {
  const config = loadConfig();  // setup
  await use(config);            // test runs here
  // teardown (if any) runs after
},
```

**`scope: 'worker'`** (MSW): one server for all tests in a worker — faster startup.

**Common mistake:** Using `apiClient` (Playwright `request`) with MSW — MSW only patches Node `fetch`. Use `fetchApiClient`.

---

## 4. Playwright projects

**Plain English:** A project is a named config slice in `playwright.config.ts`: which files match, which browser, what must run first.

**Eight projects:**

| Project         | Tests                            | Browser | Depends on |
| --------------- | -------------------------------- | ------- | ---------- |
| `unit`          | `tests/unit/`                    | No      | —          |
| `api`           | `tests/api/` (not msw/container) | No\*    | —          |
| `api-mock`      | `msw-*`, `container-*`           | No\*    | —          |
| `setup`         | `auth.setup.ts`                  | Yes     | —          |
| `chromium`      | `tests/ui/`                      | Chrome  | `setup`    |
| `chromium-mock` | `network-mock.spec.ts`           | Chrome  | —          |
| `firefox`       | `tests/ui/`                      | Firefox | `setup`    |
| `webkit`        | `tests/ui/`                      | Safari  | `setup`    |

\*API projects set `devices['Desktop Chrome']` for user-agent only — no visible browser.

**Run one project:**

```bash
npm run test:api      # --project=api
npm run test:ui       # --project=chromium
```

---

## 5. `dependencies: ['setup']`

**Plain English:** Before `chromium` tests run, Playwright runs the `setup` project once. Setup saves cookies/localStorage to a file; UI tests reuse it.

```typescript
// tests/setup/auth.setup.ts
await page.context().storageState({ path: AUTH_STORAGE_PATH });
```

```typescript
// fixtures/authenticated.fixture.ts
storageState: AUTH_STORAGE_PATH,
```

**Why:** Login once (~2s), reuse for every UI test — PR stays fast.

**Common mistake:** Running `authenticatedTest` specs without running `setup` first — use `npm run test:ui` (not a single spec in isolation without setup).

---

## 6. Locators and auto-waiting

**Plain English:** A `Locator` is a recipe to find an element. Playwright **auto-waits** until the element is actionable before clicking/filling.

**Priority in this repo:**

1. `getByRole('button', { name: 'Login' })` — accessibility tree
2. `getByPlaceholder('Username')` — form labels
3. `getByTestId('error')` — `data-test` attribute (configured in `playwright.config.ts`)

```typescript
// playwright.config.ts
testIdAttribute: 'data-test',  // Sauce Demo uses data-test, not data-testid
```

**Common mistake:** `page.waitForTimeout(3000)` — use `await expect(locator).toBeVisible()` instead.

---

## 7. Page Object Model (POM)

**Plain English:** Page Objects encapsulate **where** elements are and **how** to interact. Tests keep **what** to verify.

**Rules in this repo:**

| Layer    | Owns                                         | Does not own  |
| -------- | -------------------------------------------- | ------------- |
| `pages/` | Locators, user actions (`login()`, `open()`) | Assertions    |
| `tests/` | Test intent, `expect()`                      | Raw selectors |

```typescript
// Good — assertion in spec
await loginPage.login(user, pass);
await expect(dashboardPage.pageTitle).toHaveText('Products');

// Bad — assertion in Page Object
async login() {
  await this.submit.click();
  await expect(this.page).toHaveURL('/inventory');  // don't do this
}
```

---

## 8. `expect` assertions

**Plain English:** Playwright's `expect` retries until pass or timeout — use for anything that may take a moment.

```typescript
await expect(page).toHaveURL(/inventory/);
await expect(dashboardPage.pageTitle).toHaveText('Products');
await expect(dashboardPage.inventoryList).toBeVisible();
```

**Config:** `expect.timeout` from `TIMEOUTS.expect` in `playwright.config.ts`.

**Common mistake:** `expect(locator).toBeTruthy()` — use state matchers (`toBeVisible`, `toHaveText`, `toHaveCount`).

---

## 9. `request` fixture (API testing)

**Plain English:** Playwright's `APIRequestContext` sends HTTP without opening a browser — fast API contract tests.

```typescript
apiClient: async ({ request, config }, use) => {
  await use(new ApiClient(request, { baseUrl: config.apiBaseUrl }));
},
```

```typescript
const users = await apiClient.getValidated('/users', ApiUsersSchema, 200);
```

---

## 10. Tags and grep

```typescript
test('should login...', { tag: ['@smoke', '@regression'] }, async () => { ... });
```

```bash
npm run test:smoke       # --grep @smoke
npm run test:regression  # --grep @regression
npm run test:mock        # --grep @mock
```

**CI PR** runs only `@smoke` on chromium after unit + api.

---

## 11. Trace, screenshot, video

```typescript
// playwright.config.ts
trace: isCi ? 'retain-on-failure' : 'on-first-retry',
screenshot: 'only-on-failure',
video: 'retain-on-failure',
```

**Debug a failure:**

```bash
npm run test:debug          # step through
npx playwright show-report  # HTML report with traces
```

Open trace → see each action, network, console, DOM snapshot at failure time.

---

## 12. Mocking by layer

| Who calls the API?           | Tool                      | Fixture                                   |
| ---------------------------- | ------------------------- | ----------------------------------------- |
| Browser (`fetch` in page)    | `page.route`              | `mockJsonRoute` in `utils/route-mocks.ts` |
| Node `fetch` in test process | MSW                       | `mswTest` + `fetchApiClient`              |
| Playwright `request`         | Testcontainers + WireMock | `containerTest` + `mockApiClient`         |

See `docs/lessons/11-mocking-strategies.md` for the full decision tree.

---

## 13. Parallelism and isolation

```typescript
// playwright.config.ts
fullyParallel: true,
workers: isCi ? 2 : undefined,
retries: isNightly ? 1 : 0,  // 0 on PR — don't mask flakes
```

Each test should use unique data (`generateUserProfile()`) or read-only shared data to avoid worker collisions.

---

## 14. `test.only` / `test.skip`

- `test.only` — run just this test (local debug). **Never commit** — CI has `forbidOnly: true`.
- `test.skip(condition, 'reason')` — skip when Docker unavailable, etc.

---

## Quick reference

| Concept             | File to open                                                     |
| ------------------- | ---------------------------------------------------------------- |
| Base fixtures       | `fixtures/index.ts`                                              |
| Auth reuse          | `fixtures/authenticated.fixture.ts`, `tests/setup/auth.setup.ts` |
| MSW                 | `fixtures/msw.fixture.ts`, `mocks/handlers.ts`                   |
| Page Object example | `pages/LoginPage.ts`                                             |
| UI test example     | `tests/ui/login.spec.ts`                                         |
| API test example    | `tests/api/users-get.spec.ts`                                    |
| Config              | `playwright.config.ts`                                           |
