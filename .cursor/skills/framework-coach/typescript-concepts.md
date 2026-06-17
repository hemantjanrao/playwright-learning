# TypeScript Concepts in This Framework

Reference for QA engineers learning TypeScript through this repo. Each section: plain English → repo example → common mistake.

---

## 1. `import` / `export` and path aliases

**Plain English:** Modules split code into files. `import` pulls in code; `export` makes it available. Path aliases (`@fixtures/`, `@pages/`) avoid long relative paths like `../../../fixtures`.

**In this framework:**

```typescript
// tsconfig.json paths (conceptual)
"@fixtures/*" → "fixtures/*"
"@pages/*"      → "pages/*"
"@utils/*"      → "utils/*"
"@schemas/*"    → "schemas/*"
"@models/*"     → "types/*"
```

```typescript
// tests/ui/login.spec.ts
import { test, expect } from '@fixtures/index';
import { ROUTES } from '@utils/constants';
```

**Common mistake:** Importing `test` from `@playwright/test` directly — you lose custom fixtures (`loginPage`, `config`, etc.).

---

## 2. `async` / `await`

**Plain English:** Browser and network operations take time. `async` marks a function that returns a Promise; `await` pauses until that Promise resolves. Playwright actions are almost always awaited.

**In this framework:**

```typescript
// pages/LoginPage.ts
async login(username: string, password: string): Promise<void> {
  await this.fillCredentials(username, password);
  await this.submit();
}
```

**Rules:**

- Every `await` must be inside an `async` function.
- Test callbacks are `async`: `async ({ loginPage }) => { ... }`.
- Missing `await` → test may finish before the action completes → flaky failures.

**Common mistake:** Forgetting `await` on `expect(...)` — Playwright assertions are async too.

---

## 3. Destructuring in test parameters

**Plain English:** Fixtures are injected by name. `{ loginPage, config }` unpacks only what the test needs from the fixture object.

**In this framework:**

```typescript
test('should login...', async ({ page, loginPage, dashboardPage, config }) => {
  await loginPage.login(config.credentials.username, config.credentials.password);
});
```

Playwright builds the fixture object; you declare which keys you use. TypeScript checks names against `TestFixtures` in `fixtures/index.ts`.

**Common mistake:** Typo in fixture name (`loginpage` vs `loginPage`) — compile error, which is good.

---

## 4. `type` vs `interface`

**Plain English:** Both describe object shapes. This repo uses `type` for fixture maps and API results; `interface` for class contracts when extending.

**In this framework:**

```typescript
// fixtures/index.ts
export type TestFixtures = {
  config: AppConfig;
  loginPage: LoginPage;
  apiClient: ApiClient;
};
```

```typescript
// pages/BasePage.ts — abstract class, not interface
export abstract class BasePage {
  constructor(protected readonly page: Page) {}
}
```

**When to use which here:** `type` for unions, fixtures, inferred Zod types. Classes for Page Objects.

---

## 5. Generics (`<S extends z.ZodType>`)

**Plain English:** A generic is a type placeholder. One function works with many schemas while staying type-safe.

**In this framework:**

```typescript
// utils/api-client.ts
async getValidated<S extends z.ZodType>(
  path: string,
  schema: S,
  expectedStatus = 200,
): Promise<z.infer<S>> {
  // ...
}
```

Usage:

```typescript
const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema, 200);
// TypeScript knows `users` is ApiUser[] because ApiUsersSchema = z.array(ApiUserSchema)
```

**Common mistake:** Casting with `as ApiUser[]` instead of using `getValidated` — you lose runtime validation.

---

## 6. Zod schemas and `z.infer`

**Plain English:** Zod validates data at **runtime** (when the test runs). `z.infer<typeof Schema>` derives the **compile-time** TypeScript type from the same schema — one source of truth.

**In this framework:**

```typescript
// schemas/api.schemas.ts
export const ApiUserSchema = z.object({
  id: z.number().int().positive(),
  email: z.string().email(),
  // ...
});

export type ApiUser = z.infer<typeof ApiUserSchema>;
```

If the API returns `{ id: "abc" }`, Zod fails at runtime with a clear error — even though TypeScript thought it was a number.

**Common mistake:** Defining a separate `interface ApiUser` by hand — it drifts from the schema.

---

## 7. Discriminated unions (`ApiResult`)

**Plain English:** A union type where a shared field (`ok`) tells TypeScript which branch you're on.

**In this framework:**

```typescript
// types/api.types.ts (conceptual)
type ApiResult<T> =
  | { ok: true; data: T; status: number }
  | { ok: false; status: number; error: ApiErrorResponse; rawBody: unknown };
```

```typescript
const result = await apiClient.getResult('/bad/path');
if (result.ok) {
  // TypeScript knows: result.data exists
} else {
  // TypeScript knows: result.error exists
  expect(result.status).toBeGreaterThanOrEqual(400);
}
```

Use `getValidated` for happy path; `getResult` for negative tests.

---

## 8. Branded types (`UserId`)

**Plain English:** A branded type wraps a primitive so you can't accidentally pass a random number where a User ID is expected.

**In this framework:**

```typescript
// types/branded.types.ts
export type UserId = number & { readonly __brand: 'UserId' };

export function asUserId(value: number): UserId {
  return value as UserId;
}
```

```typescript
const userId = asUserId(apiPayloads.sampleUserId);
await apiClient.getValidated(API_ENDPOINTS.userById(userId), ApiUserSchema, 200);
```

**Why:** `userById(42)` and `userById("42")` are caught at compile time if the API expects `UserId`.

---

## 9. `readonly` and `private`

**Plain English:** `readonly` = assign once, never reassign. `private` = only visible inside the class.

**In this framework:**

```typescript
export class LoginPage extends BasePage {
  readonly usernameInput: Locator; // set in constructor, not reassigned

  constructor(page: Page) {
    super(page);
    this.usernameInput = page.getByPlaceholder('Username');
  }
}

export class ApiClient {
  constructor(
    private readonly request: APIRequestContext,
    private readonly options: ApiClientOptions,
  ) {}
}
```

Page Object locators are `readonly` — they're defined once per page instance.

---

## 10. `extends` for fixture composition

**Plain English:** `base.extend()` creates a new test runner with extra fixtures. Each layer adds capabilities without copying code.

**In this framework:**

```typescript
// fixtures/index.ts — base layer
export const test = base.extend<TestFixtures>({ ... });

// fixtures/authenticated.fixture.ts — adds storageState
export const authenticatedTest = base.extend<AuthenticatedFixtures>({
  storageState: AUTH_STORAGE_PATH,
});
```

`authenticatedTest` inherits `loginPage`, `config`, etc. from the base `test`.

---

## 11. `ReturnType<typeof fn>`

**Plain English:** Extracts the return type of a function — useful when a fixture mirrors a loader function.

```typescript
loginTestData: ReturnType<typeof loadLoginTestData>;
```

If `loadLoginTestData` changes its return shape, the fixture type updates automatically.

---

## 12. Optional chaining (`?.`) and nullish coalescing (`??`)

```typescript
expect(users[0]?.email).toContain('@'); // safe if array is empty
process.env.GITHUB_SHA ?? 'local'; // default when undefined/null
```

---

## 13. ES modules (`"type": "module"`)

**Plain English:** This project uses ESM — `import`/`export` syntax, not `require()`. Node 20+ runs `.ts` tests via Playwright's loader.

**Common mistake:** Mixing `require` and `import` in the same file.

---

## Quick reference

| Syntax                    | Where you'll see it                  |
| ------------------------- | ------------------------------------ |
| `async`/`await`           | Every Page Object method, every test |
| `z.infer<typeof X>`       | `schemas/*.ts` type exports          |
| Generics `<S>`            | `api-client.ts` validated methods    |
| `type TestFixtures`       | `fixtures/index.ts`                  |
| `asUserId()`              | API tests with path params           |
| Path aliases `@fixtures/` | All test files                       |
