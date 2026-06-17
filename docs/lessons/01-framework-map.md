# Lesson 01: Framework Map

## 1. Simple explanation

A test automation **framework** is not just test files. It is the structure around tests: configuration, reusable page objects, fixtures, API clients, schemas, and CI pipelines. Tests stay thin; the framework carries complexity.

## 2. Why it matters

Without a framework, every engineer writes tests differently. Locators get copy-pasted, login runs 50 times, API responses are cast with `as any`. A framework enforces **one way** to do things so the suite scales.

## 3. Example from this repository

Open `docs/ARCHITECTURE.md` — it shows how layers connect:

```
tests/ → fixtures/ → pages/ + utils/ → schemas/
```

Run the three layers independently:

```bash
npm run test:unit   # no browser
npm run test:api    # HTTP only
npm run test:ui     # browser E2E
```

## 4. Good vs bad

**Bad — everything in one spec file:**

```typescript
test('login and check products', async ({ page }) => {
  await page.goto('https://www.saucedemo.com');
  await page.fill('#user-name', 'standard_user');
  // 40 more lines...
});
```

**Good — framework layers:**

```typescript
test('should login...', { tag: '@smoke' }, async ({ loginPage, dashboardPage, config }) => {
  await loginPage.open();
  await loginPage.login(config.credentials.username, config.credentials.password);
  await expect(dashboardPage.pageTitle).toHaveText('Products');
});
```

## 5. Common mistakes

- Putting assertions inside Page Objects
- Hard-coding URLs instead of `config.baseUrl`
- Running API tests through browser projects
- Skipping tags — everything runs on every PR (slow CI)

## 6. Mini exercise

1. Run `npm run test:unit`, `npm run test:api`, `npm run test:ui` separately
2. Count how many tests each layer runs
3. Open `playwright.config.ts` and find the `projects` array — list all project names

## 7. Checkpoint questions

1. What Playwright project runs `tests/api/` and does it need a browser?
2. Where does the framework load `BASE_URL` from?
3. Why are Page Objects in `pages/` instead of inside `tests/`?

---

**Next:** [Lesson 02 — Playwright Projects](02-playwright-projects.md)
