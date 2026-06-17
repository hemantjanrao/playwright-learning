# Lesson 02: Playwright Projects

## 1. Simple explanation

A **Playwright project** is a named configuration slice: which tests to run, which browser to use, and what dependencies exist between projects.

## 2. Why it matters

One `playwright.config.ts` can run unit, API, and UI tests with different rules. API tests skip browser install overhead. UI tests share one auth setup.

## 3. Example from this framework

```typescript
// playwright.config.ts (simplified)
projects: [
  { name: 'unit', testMatch: /tests\/unit\// },
  { name: 'api', testMatch: /tests\/api\// },
  { name: 'setup', testMatch: /auth\.setup\.ts/ },
  { name: 'chromium', testMatch: /tests\/ui\//, dependencies: ['setup'] },
];
```

- `api` has **no** `dependencies` — runs immediately
- `chromium` **depends on** `setup` — auth runs first

## 4. Good vs bad

**Bad:** All tests in one project → API tests launch browser 3× and wait for UI login.

**Good:** Separate `api` project → HTTP only, parallel, fast.

## 5. Common mistakes

- Adding `dependencies: ['setup']` to API project
- Using `testIgnore` instead of `testMatch` (harder to reason about)
- Running full matrix on every PR

## 6. Mini exercise

Run only the API project and time it:

```bash
time npm run test:api
```

Compare with:

```bash
time npm test
```

## 7. Checkpoint questions

1. Which project runs `auth.setup.ts`?
2. Why doesn't the `unit` project need `npx playwright install` for all browsers?
3. What happens if you delete `dependencies: ['setup']` from chromium?

---

**Next:** [Lesson 03 — Fixtures](../LEARNING.md) — ask the agent: "Teach me Lesson 03"
