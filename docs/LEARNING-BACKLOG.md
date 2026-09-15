# Hands-on learning backlog

Practical tickets for this repository. Work them **one at a time** with the Senior SDET mentor in chat. Do not implement a ticket until you have proposed an approach and been challenged on it.

**How we work**

1. Read the ticket and the evidence files.
2. Propose an approach (no complete solution from the mentor unless you ask).
3. Implement a small first step; get review against acceptance criteria.
4. Explain the design and show that the test fails for the intended bug.
5. Close with a recap; pick the next ticket.

Playwright lockfile version: **1.61.0**. Check compatibility before using APIs newer than that.

---

## Status

| ID | Title | Priority | Effort | Type | Status |
| --- | --- | --- | --- | --- | --- |
| [T-01](#t-01--inventory-locators-and-product-count-assertion) | Inventory locators and product-count assertion | P0 | 45–60 min | Repo need | **Next** |
| [T-02](#t-02--assert-the-cart-not-only-the-badge) | Cart page after add-to-cart | P0 | 60–75 min | Repo need | Open |
| [T-03](#t-03--negative-login-empty-password--fixture-data) | Negative login: empty password + fixture data | P1 | 45 min | Repo need | Open |
| [T-04](#t-04--one-job-per-spec-login-vs-session-vs-catalog) | Thin duplicate authenticated vs dashboard specs | P1 | 45–60 min | Repo need | Open |
| [T-05](#t-05--make-local-failures-debuggable) | Local traces with retries 0 | P1 | 45 min | Repo need | Open |
| [T-06](#t-06--test-the-msw-404-already-stubbed) | MSW 404 path already in handlers | P1 | 45–60 min | Repo need | Open |
| [T-07](#t-07--align-firefoxwebkit-with-the-chromium-mock-split) | Firefox/WebKit vs `chromium-mock` project split | P1 | 45–60 min | Repo need | Open |
| [T-08](#t-08--checkout-happy-path) | Checkout happy path | P2 | 75–90 min | Repo need | Open |
| [T-09](#t-09--sort-catalog-with-parameterized-tests) | Product sort with `test.each` | P2 | 60 min | Repo need | Open |
| [T-10](#t-10--unit-tests-must-not-leak-processenv) | Unit test env isolation (`try/finally`) | P2 | 45 min | Repo need | Open |
| [T-11](#t-11--new-window-from-the-sauce-demo-footer) | New window from Sauce Demo footer | P2 | 60 min | Repo need | Open |
| [T-12](#t-12--practice-diagnose-a-forced-failure-with-trace) | Diagnose a forced failure with trace | P2 | 45–60 min | **Practice** | Open |

Update **Status** to `In progress` / `Done` as you close tickets. Concepts practiced independently are tracked at the [bottom](#concepts-tracker).

**Suggested order:** T-01 → T-02 → T-03 → T-04 → T-05 → T-06 → T-07, then T-08–T-12 as time allows. T-05 and T-10 can slot in earlier if you want a short config/unit ticket between UI work.

---

## Inspection snapshot (why these tickets exist)

Grounded in files, not curriculum wish-lists. Distinguishes confirmed issues from hypotheses.

**Confirmed**

- Inventory CSS prefix `[data-test^="inventory-item-"]` does not match Sauce Demo **cards** (`data-test="inventory-item"`). Product count is inflated; the spec only asserts `> 0`.
- Cart smoke stops at the badge. `ROUTES.cart` is unused; there is no cart page object.
- Negative login covers empty username, not empty password. Empty-username uses a hard-coded `'secret_sauce'`.
- `login.spec.ts`, `authenticated.spec.ts`, and `dashboard.spec.ts` all assert inventory URL + “Products”.
- Local `trace: 'on-first-retry'` never fires because `retries` is 0 except nightly.
- MSW handlers already return 404 for unknown user ids; no spec calls that path.
- Chromium `testIgnore`s `network-mock.spec.ts`; firefox/webkit do not. Nightly never runs project `chromium-mock`. Mock workflow path filters omit `utils/route-mocks.ts`.
- `loadConfig rejects invalid TEST_ENV` mutates `process.env.TEST_ENV` without `try/finally`.

**Hypotheses (verify on the live DOM or a run)**

- `addProductToCartByName` may be scoped to the **name** node, which typically does not contain Add to cart. Confirm before “fixing” from memory.
- `standard_user` cart is session-scoped; `fullyParallel` is probably safe with a fresh context per test.

**Out of scope (do not invent framework for these)**

- File upload, download, and iframes — Sauce Demo does not have them. Do not add dummy pages.
- Visual regression against a third-party demo site — snapshot flake risk is high.
- Extra mock layers — MSW, WireMock, and `page.route` already exist on purpose.

---

## T-01 — Inventory locators and product-count assertion

| Field | Value |
| --- | --- |
| **Priority** | P0 |
| **Difficulty** | Beginner–intermediate |
| **Effort** | 45–60 min |
| **Type** | Repo need |

**Evidence**

- `pages/DashboardPage.ts` — `getProductCount()`, `addProductToCartByName()`
- `tests/ui/dashboard.spec.ts` — `expect(productCount).toBeGreaterThan(0)`

**Problem**

The page object’s CSS prefix is documented as product **rows**, but on Sauce Demo the **card** is `data-test="inventory-item"`. Children use `inventory-item-name`, `-desc`, and `-price`. `getProductCount()` over-counts. A broken or empty catalog can still pass `> 0`.

**Concepts**

Locator priority (`getByTestId` vs CSS prefix), strict mode, scoping `filter({ hasText })` to the card, web-first `expect(locator)` vs reading `.count()` into a number, auto-waiting.

**Scope**

Inspect the live inventory DOM → propose locators → tighten the assertion. Optionally align add-to-cart scoping if the DOM shows the button is not inside the name node.

**Files**

- `pages/DashboardPage.ts`
- `tests/ui/dashboard.spec.ts`

**Prerequisites**

None.

**Acceptance criteria**

- [ ] Count locator matches **product cards**, not name/desc/price nodes.
- [ ] Assertion is specific (known `standard_user` catalog size, or `toHaveCount` on the card locator).
- [ ] Add-to-cart still clicks the button for “Sauce Labs Backpack” without a child-prefix CSS locator.
- [ ] No `waitForTimeout` / hard-coded sleeps.

**Verification**

```bash
npx playwright test --project=chromium tests/ui/dashboard.spec.ts
```

Temporarily break the locator or assertion and confirm a **clear** failure, then revert the break.

**Design decisions to explain**

- Why `getByTestId('inventory-item')` (or equivalent) is the card.
- Why `expect(locator).toHaveCount(n)` is stronger than `count()` + `> 0`.
- How strict mode behaves if the Add to cart button is unscoped.

**Stretch**

Replace remaining CSS in this page object. If any CSS remains, add a one-line comment explaining why it is required.

---

## T-02 — Assert the cart, not only the badge

| Field | Value |
| --- | --- |
| **Priority** | P0 |
| **Difficulty** | Intermediate |
| **Effort** | 60–75 min |
| **Type** | Repo need |

**Evidence**

- `utils/constants.ts` — `ROUTES.cart` is unused
- `tests/ui/dashboard.spec.ts` — only `expect(dashboardPage.cartBadge).toHaveText('1')`

**Problem**

Badge text `1` can pass if the wrong item was added or if the cart page is empty.

**Concepts**

Page object composition, navigation after an action, asserting visible product text, keeping assertions in the spec (not in the page object).

**Scope**

A small cart page object (or equivalent) plus one spec: add backpack → open cart → named item visible. Do **not** build checkout yet.

**Files**

- New page object (e.g. `pages/CartPage.ts`)
- `fixtures/index.ts`
- `tests/ui/dashboard.spec.ts` or a focused cart spec

**Prerequisites**

T-01 (inventory locators must be trustworthy).

**Acceptance criteria**

- [ ] Cart URL is asserted (`ROUTES.cart`).
- [ ] Named product is visible on the cart page.
- [ ] Badge is still checked.
- [ ] Isolated: empty cart at start (fresh browser context / `storageState` snapshot without cart items).

**Verification**

Run the Chromium spec. Fail it on purpose by expecting a different product name and confirm the assertion catches it.

**Design decisions to explain**

- Why a `CartPage` vs extra methods on `DashboardPage`.
- Badge vs line-item as different risks.

**Stretch**

Add “Remove” and assert the badge is hidden (`toHaveCount(0)` / `not.toBeVisible`).

---

## T-03 — Negative login: empty password + fixture data

| Field | Value |
| --- | --- |
| **Priority** | P1 |
| **Difficulty** | Beginner |
| **Effort** | 45 min |
| **Type** | Repo need |

**Evidence**

- `tests/ui/negative-login.spec.ts`
- `utils/constants.ts` — `ERROR_MESSAGES`
- `test-data/login-users.json`

**Problem**

Username-required is covered; password-required is not. Empty-username uses a literal `'secret_sauce'` instead of `loginTestData`.

**Concepts**

Negative cases, fixture-backed test data, asserting error copy with web-first `expect` (no sleeps).

**Scope**

One new test + error constant. Use `loginTestData` in the empty-username case. **Confirm exact Sauce Demo copy on the live page** before hard-coding it.

**Files**

- `tests/ui/negative-login.spec.ts`
- `utils/constants.ts`
- `test-data/login-users.json` (only if a new persona is justified)

**Prerequisites**

None. Prefer after T-01 so the first ticket stays locator-focused.

**Acceptance criteria**

- [ ] Empty password shows the **real** banner text observed on the app.
- [ ] No `'secret_sauce'` literal in the spec.
- [ ] Tagged `@regression` only (not `@smoke`).

**Verification**

```bash
npx playwright test tests/ui/negative-login.spec.ts --project=chromium
```

**Design decisions to explain**

Why empty username and empty password are different product branches, not two copies of “invalid login”.

**Stretch**

Parameterize invalid / locked / empty with `test.each` **only** if the spec stays readable.

---

## T-04 — One job per spec: login vs session vs catalog

| Field | Value |
| --- | --- |
| **Priority** | P1 |
| **Difficulty** | Intermediate |
| **Effort** | 45–60 min |
| **Type** | Repo need |

**Evidence**

- `tests/ui/login.spec.ts`
- `tests/ui/authenticated.spec.ts`
- `tests/ui/dashboard.spec.ts`

All three assert inventory URL + “Products”.

**Problem**

Three tests prove “we are on Products”. That hides why the files exist: login form, `storageState`, catalog behavior.

**Concepts**

`test` vs `authenticatedTest`, `storageState`, risk-based coverage, deleting tests without losing signal.

**Scope**

Re-read the three files. Propose which assertions stay where. Implement the thinning. Do **not** invent a new fixture layer.

**Files**

The three UI specs only (optional rename of `UserProfilePage` in stretch).

**Prerequisites**

T-01 so dashboard assertions are already trustworthy.

**Acceptance criteria**

- [ ] Login spec still proves **form → inventory**.
- [ ] Authenticated spec proves **session without the login form**.
- [ ] Dashboard spec proves **catalog/cart**, not “we logged in”.
- [ ] `@smoke` still covers the critical path.

**Verification**

```bash
npm run test:smoke
```

Paste the output in chat. Do not claim green without that evidence.

**Design decisions to explain**

What would break if we deleted `tests/setup/auth.setup.ts` vs if we deleted `login.spec.ts`.

**Stretch**

Rename `UserProfilePage` if you can justify it (it is the burger menu, not a profile). Renaming is optional; do not churn fixtures for cosmetics.

---

## T-05 — Make local failures debuggable

| Field | Value |
| --- | --- |
| **Priority** | P1 |
| **Difficulty** | Beginner |
| **Effort** | 45 min |
| **Type** | Repo need |

**Evidence**

`playwright.config.ts`:

- `retries: isNightly ? 1 : 0`
- `trace: isCi ? 'retain-on-failure' : 'on-first-retry'`

**Problem**

Local retries are 0, so `on-first-retry` never writes a trace. The “open the trace” debugging loop does not work on a normal local failure.

**Concepts**

Trace modes (`on`, `on-first-retry`, `retain-on-failure`), retries vs masking flakes, `npx playwright show-trace`.

**Scope**

Config only. Keep PR retries at 0. Pick a local trace policy and defend the disk-cost trade-off.

**Files**

- `playwright.config.ts`
- One-line comment only if the policy is not obvious from the code

**Prerequisites**

None.

**Acceptance criteria**

- [ ] A forced local failure produces a trace artifact.
- [ ] CI PR still `retries: 0`.
- [ ] Nightly still max 1 retry.

**Verification**

Force-fail one test locally, open the trace, revert the fail. The mentor needs the command output — do not claim it worked without evidence.

**Design decisions to explain**

Why `on-first-retry` + `retries: 0` is a silent no-op.

**Stretch**

Time a local smoke with `trace: 'on'` vs `retain-on-failure`.

---

## T-06 — Test the MSW 404 already stubbed

| Field | Value |
| --- | --- |
| **Priority** | P1 |
| **Difficulty** | Intermediate |
| **Effort** | 45–60 min |
| **Type** | Repo need |

**Evidence**

- `mocks/handlers.ts` — 404 when `id !== MOCK_USER.id`
- `tests/api/msw-users.spec.ts` — happy paths only
- Live API negative: `tests/api/users-get.spec.ts` uses `getResult` + `expectApiFailure`

**Problem**

Happy-path MSW tests cannot detect a handler that always returns 200.

**Concepts**

`fetchApiClient` vs `apiClient` (MSW does **not** patch Playwright `request`), negative API, `getResult` vs `getValidated` throwing, `@mock` tagging.

**Scope**

One MSW test for an unknown user id. Reuse `expectApiFailure` if the client supports it. Do **not** add a new mock layer.

**Files**

- `tests/api/msw-users.spec.ts`
- `utils/fetch-api-client.ts` only if you discover it lacks `getResult`

**Prerequisites**

Read [ARCHITECTURE.md — Mocking strategies](./ARCHITECTURE.md#6-mocking-strategies) first.

**Acceptance criteria**

- [ ] Unknown id → **404** (exact status, not `>= 400`).
- [ ] Tagged `@mock` and `@regression`.
- [ ] Unhandled URLs still fail (`onUnhandledRequest: 'error'`).

**Verification**

```bash
npm run test:mock
```

Use `--project=api-mock` if Docker is noisy. Flip the handler to 200 and confirm the new test fails, then restore.

**Design decisions to explain**

Why this belongs in MSW, not live JSONPlaceholder, and why live `/users/99999/nonexistent` is a weak path.

**Stretch**

Tighten the live negative test to a status the public API actually returns — only after you observe it.

---

## T-07 — Align Firefox/WebKit with the chromium-mock split

| Field | Value |
| --- | --- |
| **Priority** | P1 |
| **Difficulty** | Intermediate |
| **Effort** | 45–60 min |
| **Type** | Repo need |

**Evidence**

- `playwright.config.ts` — chromium `testIgnore: /network-mock\.spec\.ts/`; firefox/webkit have no ignore
- `.github/workflows/playwright-nightly.yml` — matrix is `api` + chromium/firefox/webkit; no `chromium-mock`
- `.github/workflows/playwright-mock.yml` — path filters omit `utils/route-mocks.ts`

**Problem**

Nightly burns Firefox/WebKit time on a `page.setContent` demo. The dedicated mock project is unused at night. Route-helper edits may skip the mock workflow.

**Concepts**

Playwright projects, `testMatch` / `testIgnore`, `dependencies`, CI path filters.

**Scope**

Align firefox/webkit ignores with chromium. Decide whether nightly should include `chromium-mock` (default recommendation: **no** — `playwright-mock.yml` already covers it). Add `utils/route-mocks.ts` to mock path filters.

**Files**

- `playwright.config.ts`
- `.github/workflows/playwright-mock.yml`

**Prerequisites**

[Lesson 02 — Playwright projects](./lessons/02-playwright-projects.md).

**Acceptance criteria**

- [ ] `npx playwright test --project=firefox --list` does **not** list `network-mock`.
- [ ] `--project=chromium-mock --list` **does** list it.
- [ ] Mock workflow paths include `utils/route-mocks.ts`.

**Verification**

`--list` for `chromium`, `chromium-mock`, and `firefox`. Full WebKit run is not required.

**Design decisions to explain**

Why `chromium-mock` has **no** `setup` dependency.

**Stretch**

Add `utils/fetch-api-client.ts` to the mock path filter only if you can argue a handler-contract risk.

---

## T-08 — Checkout happy path

| Field | Value |
| --- | --- |
| **Priority** | P2 |
| **Difficulty** | Intermediate |
| **Effort** | 75–90 min |
| **Type** | Repo need |

**Evidence**

Sauce Demo checkout (info → overview → complete) is untested. T-02 only covers cart.

**Problem**

Highest-risk UI journey after login is unpaid. There is no checkout API on Sauce Demo, so this belongs at the UI layer.

**Concepts**

Multi-page POM, test data for forms, `@regression` vs `@smoke`, parallel-safe customer data.

**Scope**

One user, one product, full checkout. No visual snapshots. **Not** `@smoke` until the journey is stable.

**Files**

- New page object(s) for checkout steps
- `fixtures/index.ts`
- One UI spec

**Prerequisites**

T-02.

**Acceptance criteria**

- [ ] Unique-enough customer data (faker and/or worker suffix from `uniqueSuffix()`).
- [ ] Complete page heading/text asserted.
- [ ] No sleeps.
- [ ] Parallel-safe (session cart only; fresh context).

**Verification**

Chromium on that spec. Optional: `--repeat-each=3`.

**Design decisions to explain**

Why checkout is E2E here (no checkout API) vs why a JSONPlaceholder-style checkout would be API-first.

**Stretch**

First-name required negative case only — do not expand into a full negative matrix in this ticket.

---

## T-09 — Sort catalog with parameterized tests

| Field | Value |
| --- | --- |
| **Priority** | P2 |
| **Difficulty** | Intermediate |
| **Effort** | 60 min |
| **Type** | Repo need |

**Evidence**

Inventory has a sort control. No spec covers it. `DashboardPage` has no sort helper.

**Problem**

Catalog order regressions would go unnoticed.

**Concepts**

`getByRole` / `selectOption`, `test.each`, asserting order from visible names/prices (not CSS nth-child).

**Scope**

Two sort options max (e.g. Name Z–A and Price low–high). Authenticated. `@regression`.

**Files**

- `pages/DashboardPage.ts`
- `tests/ui/dashboard.spec.ts` or a dedicated sort spec

**Prerequisites**

T-01.

**Acceptance criteria**

- [ ] First/last item (or full ordered list) asserted from **visible** names/prices.
- [ ] Data table lives in the spec, not a new framework helper.
- [ ] No `nth-child` locators.

**Verification**

Chromium. Fail by expecting the opposite order and confirm the test catches it.

**Design decisions to explain**

When `test.each` helps vs when it hides a single unclear assertion.

**Stretch**

Do **not** add `performance_glitch_user` unless you first measure that `standard_user` is insufficient.

---

## T-10 — Unit tests must not leak `process.env`

| Field | Value |
| --- | --- |
| **Priority** | P2 |
| **Difficulty** | Beginner |
| **Effort** | 45 min |
| **Type** | Repo need |

**Evidence**

`tests/unit/config-and-schemas.spec.ts` — `loadConfig rejects invalid TEST_ENV` sets `process.env.TEST_ENV = 'invalid-env'` and restores only if the test body continues.

**Problem**

If `toThrow` failed or the test aborted, later tests in the worker could see `invalid-env`. Playwright `fullyParallel` does **not** isolate `process.env`.

**Concepts**

Worker isolation vs browser context isolation, `try/finally`, mutating global process state in unit tests.

**Scope**

That one test. No new helper or fixture.

**Files**

- `tests/unit/config-and-schemas.spec.ts`

**Prerequisites**

None.

**Acceptance criteria**

- [ ] Restore `TEST_ENV` in `finally`.
- [ ] `npm run test:unit` is green (show output).

**Verification**

```bash
npm run test:unit
```

**Design decisions to explain**

What happens if restore is skipped, and why a Playwright page fixture would not have saved you here.

**Stretch**

Scan other unit tests for env mutation. Only change them if you find a real leak.

---

## T-11 — New window from the Sauce Demo footer

| Field | Value |
| --- | --- |
| **Priority** | P2 |
| **Difficulty** | Intermediate |
| **Effort** | 60 min |
| **Type** | Repo need |

**Evidence**

Sauce Demo inventory footer includes Twitter / Facebook / LinkedIn links that open a **new tab**. There is no spec covering `page` vs popup, and no upload/download/iframe in this app — this is the natural multi-page interaction.

**Problem**

Engineers often confuse `page`, `context`, and popup events. This journey exists in the app; we should not invent a dummy second page.

**Concepts**

`page.waitForEvent('popup')`, browser contexts vs pages, asserting the new page URL, not leaking the extra page.

**Scope**

One authenticated test: open inventory, click **one** social link, assert the popup URL host, close the popup. Do not automate all three networks.

**Files**

- New or existing UI spec under `tests/ui/`
- Locator on `DashboardPage` or a tiny footer component — only if it stays small

**Prerequisites**

T-01 (you already know inventory locators). T-04 optional so this does not land in a duplicated “we are logged in” spec.

**Acceptance criteria**

- [ ] Uses `waitForEvent('popup')` (or equivalent 1.61 API) — no `waitForTimeout`.
- [ ] Asserts the **new page** URL, not only that a click happened.
- [ ] Popup is closed; original inventory page still usable.
- [ ] `@regression` only. External site content is **not** deeply asserted (host/path is enough).

**Verification**

```bash
npx playwright test --project=chromium tests/ui/<your-spec>.spec.ts
```

**Design decisions to explain**

Why we do not scrape the third-party social page, and why this is still a useful Playwright skill in this repo.

**Stretch**

Same pattern with a second link using `test.each` — only if the first test is stable.

---

## T-12 — Practice: diagnose a forced failure with trace

| Field | Value |
| --- | --- |
| **Priority** | P2 |
| **Difficulty** | Beginner–intermediate |
| **Effort** | 45–60 min |
| **Type** | **Practice exercise** (do not merge a permanent failing test) |

**Evidence**

Depends on T-05. If local traces still do not appear, finish T-05 first.

**Problem**

Curriculum Lesson 10 is theoretical unless you have walked a real failure: locator vs assertion vs timeout vs app bug.

**Concepts**

HTML report, trace viewer, classifying failures, `npx playwright test --debug` / `--ui` (pick one, not both in the same hour).

**Scope**

1. With T-05 in place, introduce a **temporary** wrong assertion or locator in an existing spec.
2. Run it, open the trace, write a short failure diagnosis (template below).
3. Revert the break. Do not commit the failing change.

**Files**

None to keep. Diagnosis lives in chat (or a local note you discard).

**Prerequisites**

T-05.

**Acceptance criteria**

- [ ] Trace opened from `test-results` / report.
- [ ] Diagnosis filled in (Failure / Evidence / Root cause / Fix).
- [ ] Temporary break reverted; git status clean of the fail.

**Verification**

Mentor reviews the diagnosis against the trace/screenshot you describe. Command output required.

**Failure diagnosis template**

```markdown
## Failure
[One-line summary]

## Evidence
[Trace step, screenshot, or log excerpt]

## Root cause
[locator | assertion | env | data | app] — [explanation]

## Fix
[Concrete change — then revert the practice break]
```

**Design decisions to explain**

How you told “wrong locator” from “page not ready” without adding a sleep.

**Stretch**

Run the same failing test with `--repeat-each=5` and confirm it fails **every** time (deterministic) vs intermittently.

---

## Concepts tracker

Mark when you can **explain** the concept from this repo’s files, then when you have **implemented** it yourself on a ticket.

| Concept | Ticket | Explained | Implemented independently | Needs reinforcement |
| --- | --- | --- | --- | --- |
| Locators, strictness, web-first assertions, auto-wait | T-01, T-09 | | | |
| POM composition vs extra page methods | T-02, T-08 | | | |
| Negative UI + fixture test data | T-03 | | | |
| Browser context, `storageState`, fixture choice | T-04 | | | |
| Traces, retries, failure classification | T-05, T-12 | | | |
| API mocking, `fetch` vs `request`, negative HTTP | T-06 | | | |
| Projects, `testIgnore`, CI path filters | T-07 | | | |
| Multi-step UI journey, tags (`@smoke` vs `@regression`) | T-08 | | | |
| `test.each`, asserting order | T-09 | | | |
| Worker isolation vs `process.env` | T-10 | | | |
| Multiple pages / popup | T-11 | | | |

---

## Related docs

- [LEARNING.md](./LEARNING.md) — curriculum index (lessons 01–11)
- [ARCHITECTURE.md](./ARCHITECTURE.md) — projects, fixtures, mocking, CI
- [README.md](../README.md) — commands
