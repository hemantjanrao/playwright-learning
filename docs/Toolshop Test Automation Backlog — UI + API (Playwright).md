# Toolshop Test Automation Backlog — UI + API (Playwright)

Oct 10, 2026 · @Hemant Janrao

## Read first

This backlog holds 45 tickets and 357 scenarios in five epics, ordered so each one exercises a new layer of your Playwright framework against the Toolshop demo app. Three things shape it.

### 1. Your two links are different versions of the app

The site you linked is Sprint 5 (page title "Toolshop - v5.0"). The Swagger link is the Sprint 1 API. They do not talk to each other.


|                   | Sprint 1 API (`api-v1`)                              | Sprint 5 API (`api`)                                                                        |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| Resources         | Brand, Category, Image, Product                      | Adds Cart, Invoice, Payment, Favorite, Contact, User, Report, TOTP, Postcode, Product specs |
| IDs               | Integers                                             | Strings (ULID-style, e.g. `01HHJC7RERZ0M3VDGS6X9HM33A`)                                     |
| List responses    | Plain arrays                                         | Paginated envelope (`current_page`, `data`, `last_page`, `total` ...)                       |
| Auth              | None                                                 | JWT bearer; admin role on some routes                                                       |
| Methods           | GET, POST, PUT, DELETE                               | Adds PATCH, QUERY, OPTIONS                                                                  |
| Documented extras | ETag, Cache-Control, 304, XML via `Accept: text/xml` | 401, 403, 405, 409 and 415 responses                                                        |


Decision taken here: Epic B uses the v1 API as a low-risk onboarding track. Epics C, D and E use Sprint 5 (UI `practicesoftwaretesting.com`, API `api.practicesoftwaretesting.com`). Having two API versions also gives ticket TS-001 a real multi-environment problem to solve.

### 2. The hosted site is shared, so some tests can break it for everyone


| Risk                                                              | Source                                     | Rule for this backlog                                             |
| ----------------------------------------------------------------- | ------------------------------------------ | ----------------------------------------------------------------- |
| 3 failed logins lock the account (HTTP 423)                       | `MAX_LOGIN_ATTEMPTS = 3` in UserController | Negative-login tests only on users you register yourself          |
| `POST /users/forgot-password` sets the password to `welcome02`    | Swagger description                        | Never call it for the seeded accounts                             |
| `POST /refresh` wipes and reseeds the whole database              | `routes/api.php`                           | Never call on hosted; use it as a reset hook on local Docker only |
| Other testers edit and delete seeded brands, categories, products | Shared environment                         | Create your own data, unique names, clean up after                |
| Report endpoints are throttled                                    | `throttle:reports` middleware              | Run report tests serially; expect and handle 429                  |


Recommended split: hosted site for read-only and smoke runs, local Docker stack (`docker compose -f docker-compose.prod.yml up --pull missing -d`, UI on `localhost:4200`, API on `localhost:8091`) for anything tagged `@destructive`.

### 3. What this review is based on

I read the two OpenAPI specs, the Sprint 5 API route file and controllers, and the Sprint 5 Angular templates on the `main` branch. I did not drive the site in a browser, because the page renders client-side. Selectors quoted below come from those templates. Anything marked **(verify)** is from my knowledge of the app and needs a two-minute check in the Playwright Inspector before you code it.

I have not seen your framework. Each ticket names the framework layer it exercises in generic terms; map those to your folder structure.

## Application map

Toolshop is an Angular storefront on a Laravel REST API: catalog, cart, four-step checkout, customer account and an admin back office.

### Environments


| Name               | UI                                      | API                                         | Use in this backlog      |
| ------------------ | --------------------------------------- | ------------------------------------------- | ------------------------ |
| Sprint 1           | `v1.practicesoftwaretesting.com`        | `api-v1.practicesoftwaretesting.com`        | Epic B (API only)        |
| Sprint 5           | `practicesoftwaretesting.com`           | `api.practicesoftwaretesting.com`           | Epics C, D, E            |
| Sprint 5 with bugs | `with-bugs.practicesoftwaretesting.com` | `api-with-bugs.practicesoftwaretesting.com` | TS-406 only              |
| Local Docker       | `localhost:4200`                        | `localhost:8091`                            | All `@destructive` tests |


Every API exposes `GET /status` (version, environment, app name) and its spec as JSON at `/docs?api-docs.json`. Sprints 2 to 4 also exist; they are not used here.

### Seeded accounts


| Role  | Email                                   | Use                                |
| ----- | --------------------------------------- | ---------------------------------- |
| admin | `admin@practicesoftwaretesting.com`     | Admin UI and admin-only API routes |
| user  | `customer@practicesoftwaretesting.com`  | Read-only customer flows           |
| user  | `customer2@practicesoftwaretesting.com` | Second user for isolation checks   |
| user  | `customer3@practicesoftwaretesting.com` | Spare                              |


Passwords are in the [repository README](https://github.com/testsmith-io/practice-software-testing). Load them from environment variables, never from test code.

### UI routes (Sprint 5)


| Route                                                                                                                                                                    | What is there                                                                                         | Hooks confirmed in templates                                                                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `/`                                                                                                                                                                      | Product grid, sort, price slider, search, category and brand filters, eco filter, pagination, compare | `sort`, `search-query`, `search-submit`, `search-reset`, `category-{id}`, `brand-{id}`, `eco-friendly-filter`, `product-{id}`, `product-name`, `product-price`, `out-of-stock`, `no-results`, `search-result-count`, `compare-btn`       |
| `/product/{id}`                                                                                                                                                          | Detail, quantity, add to cart, favorites, compare, specs, related products, rental slider             | `product-name`, `unit-price`, `offer-price`, `quantity`, `increase-quantity`, `decrease-quantity`, `add-to-cart`, `add-to-favorites`, `add-to-compare`, `product-specs`, `spec-row`, `out-of-stock`, `eco-badge`, `co2-rating-badge`     |
| `/category/{slug}`, `/rentals`                                                                                                                                           | Category and rental listings                                                                          | `nav-hand-tools`, `nav-power-tools`, `nav-other`, `nav-special-tools`, `nav-rentals`                                                                                                                                                     |
| `/comparison`                                                                                                                                                            | Product comparison                                                                                    | `comparison-bar`, `compare-link`, `clear-comparison`                                                                                                                                                                                     |
| `/checkout`                                                                                                                                                              | Cart, sign-in, billing address, payment                                                               | `product-title`, `product-quantity`, `line-price`, `cart-subtotal`, `cart-discount`, `cart-eco-discount`, `cart-total`, `continue-shopping`, `proceed-1`, `payment-method`, `finish`, `payment-success-message`, `payment-error-message` |
| `/auth/login`, `/auth/register`, `/auth/forgot-password`                                                                                                                 | Login (plus Google sign-in and TOTP step), registration, password reset                               | `email`, `password`, `login-submit`, `login-error`, `email-error`, `password-error`, `register-link`, `forgot-password-link`, `totp-code`, `verify-totp`                                                                                 |
| `/account`, `/account/favorites`, `/account/profile`, `/account/invoices`, `/account/messages`                                                                           | Customer area                                                                                         | `nav-menu`, `nav-my-account`, `nav-my-favorites`, `nav-my-profile`, `nav-my-invoices`, `nav-my-messages`, `nav-sign-out`                                                                                                                 |
| `/admin/dashboard`, `/admin/brands`, `/admin/categories`, `/admin/products`, `/admin/orders`, `/admin/users`, `/admin/messages`, `/admin/settings`, `/admin/reports/...` | Back office                                                                                           | `nav-admin-dashboard`, `nav-admin-brands`, `nav-admin-categories`, `nav-admin-products`, `nav-admin-orders`, `nav-admin-users`, `nav-admin-messages`, `nav-admin-settings`, `nav-admin-statistics`                                       |
| `/contact`, `/privacy`                                                                                                                                                   | Contact form, static page                                                                             | `nav-contact`                                                                                                                                                                                                                            |
| Header (all pages)                                                                                                                                                       | Navigation, cart badge, language switch (DE, EL, EN, ES, FR, NL, TR)                                  | `nav-home`, `nav-categories`, `nav-sign-in`, `nav-cart`, `cart-quantity`, `language-select`, `lang-{code}`                                                                                                                               |


The app uses `data-test`, not `data-testid`. Set `testIdAttribute: 'data-test'` once and use `getByTestId` everywhere (TS-006).

### API resources (Sprint 5)


| Group              | Routes                                                                                                                                                                                                                                       | Auth                                                                              |
| ------------------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------- |
| Users              | `POST /users/login`, `POST /users/register`, `GET /users/me`, `GET /users/refresh`, `GET /users/logout`, `POST /users/change-password`, `POST /users/forgot-password`, `GET/PUT/PATCH/DELETE /users/{id}`, `GET /users`, `GET /users/search` | Login, register, forgot-password and refresh are open; list and delete need admin |
| TOTP               | `POST /totp/setup`, `POST /totp/verify`, `POST /totp/login/totp`                                                                                                                                                                             | **(verify)**                                                                      |
| Brands, Categories | CRUD plus `PATCH`, `/search`, `/categories/tree`, `/categories/tree/{id}`                                                                                                                                                                    | Spec marks only `DELETE` as secured (admin)                                       |
| Products           | CRUD plus `PATCH`, `/search`, `/{id}/related`, `/{id}/specs`, `/product-specs/names`                                                                                                                                                         | Spec marks only `DELETE` as secured (admin)                                       |
| Carts              | `POST /carts`, `POST /carts/{id}`, `GET /carts/{id}`, `PUT /carts/{id}/product/quantity`, `DELETE /carts/{id}/product/{productId}`, `DELETE /carts/{id}`                                                                                     | None in spec                                                                      |
| Payment            | `POST /payment/check`                                                                                                                                                                                                                        | None                                                                              |
| Invoices           | `GET/POST /invoices`, `POST /invoices/guest`, `GET/PUT/PATCH /invoices/{id}`, `PUT /invoices/{id}/status`, `GET /invoices/search`, `GET /invoices/{number}/download-pdf`, `.../download-pdf-status`                                          | Bearer, except guest                                                              |
| Favorites          | `GET/POST /favorites`, `GET/DELETE /favorites/{id}`                                                                                                                                                                                          | Bearer                                                                            |
| Messages           | `POST /messages`, `POST /messages/{id}/attach-file`, `GET /messages`, `GET /messages/{id}`, `POST /messages/{id}/reply`, `PUT /messages/{id}/status`                                                                                         | Send and attach are open; the rest need bearer                                    |
| Reports            | Seven `GET /reports/...` routes                                                                                                                                                                                                              | Throttled; role **(verify)**                                                      |
| Utility            | `GET /status`, `GET /images`, `GET /postcode-lookup`, `GET /auth/social-login`                                                                                                                                                               | None                                                                              |


Search and list routes on brands, categories, products, invoices and users also accept the HTTP `QUERY` method with a JSON body. Every route answers `OPTIONS` with an `Allow` header.

## Ticket conventions

Every ticket below carries a meta line, the reason it exists, numbered scenarios, acceptance criteria and the framework layer you will touch.

- **Meta line:** priority (P1 must-have, P2 should-have, P3 stretch), size (S about half a day, M about one day, L about two days; my rough estimates), layer, dependencies.
- **Scenario IDs:** `<ticket>-<nn>`, for example `TS-201-03`. Put the ID in the test title or an annotation so reports trace back to the ticket.
- **Tags:** `@smoke`, `@regression`, `@api`, `@ui`, `@e2e`, `@destructive` (mutates shared or seeded data; local Docker only), `@v1`, `@v5`, `@serial`.
- **Findings:** where the spec and the code disagree, the scenario says "record as finding". Write the test to pin current behaviour, mark it with `test.fail()` or an annotation, and log the discrepancy. That is how a real team handles it.



### Definition of done (applies to every ticket)

- [ ] Tests pass 10 consecutive runs locally with `--repeat-each=10` and in CI with retries set to 0
- [ ] No `waitForTimeout`, no XPath, no CSS chained on layout classes; `getByTestId` or role locators only
- [ ] Tests are independent and pass with `--workers=4` and in random order, unless tagged `@serial`
- [ ] Each test creates the data it needs and removes it in teardown, even on failure
- [ ] No credentials, tokens or base URLs in test code
- [ ] Assertions cover status, body shape and at least one business value; UI tests assert a user-visible outcome
- [ ] Failure output is diagnosable from the report alone (trace, request and response attached)
- [ ] Scenario IDs and tags present; ticket linked in the pull request



## Epic A: Framework foundations (6 tickets)

These six tickets point your existing framework at Toolshop and build the plumbing every later ticket relies on. Do them first, in order.

### TS-001 Multi-environment configuration

**P1 · M · Config · no dependencies**

**Why:** Four environments with two incompatible API versions. Tests must select an environment by name and fail fast when it is wrong or down.

**Scenarios**

- TS-001-01 Running with `ENV=v5` resolves UI and API base URLs for Sprint 5; `ENV=v1`, `ENV=bugs`, `ENV=local` resolve theirs.
- TS-001-02 An unknown or missing `ENV` aborts the run before any test starts, with a message listing valid values.
- TS-001-03 Global setup calls `GET /status` and aborts if the API is unreachable or reports an unexpected version.
- TS-001-04 A test tagged `@v1` is skipped with a clear reason when `ENV=v5`, and the reverse.
- TS-001-05 A test tagged `@destructive` is skipped unless `ENV=local`.

**Done when:** One command switches environment. No URL appears outside the config layer. The HTML report shows the environment and API version.

**Framework layer:** `playwright.config`, projects, environment loader, global setup.

### TS-002 Test data factories and cleanup registry

**P1 · M · Data · needs TS-001**

**Why:** The hosted database is shared. Hard-coded names collide with other testers and leftover data pollutes the shop.

**Scenarios**

- TS-002-01 A brand factory returns a valid payload with a unique name and slug per call, including across parallel workers.
- TS-002-02 Factories exist for category, product, user registration, billing address and each payment method, with field overrides.
- TS-002-03 Anything created through a factory helper is registered and deleted in teardown, in reverse dependency order (product before brand and category).
- TS-002-04 Cleanup runs when the test fails and when it times out.
- TS-002-05 A cleanup failure is reported as a warning attachment and does not turn a passing test red.
- TS-002-06 Generated user data satisfies the password policy in the API: at least 8 characters, mixed case, a number, a symbol, and not a known-breached password.

**Done when:** A second run immediately after the first passes with no manual cleanup. A scan for your data prefix after the suite finds nothing.

**Framework layer:** fixtures with teardown, data builders, worker-scoped uniqueness.

### TS-003 Typed API client and schema validation

**P1 · L · API core · needs TS-001**

**Why:** Raw `request.get` calls scattered through tests make contract drift invisible and failures hard to read.

**Scenarios**

- TS-003-01 A client per resource (brands, categories, products for v1; the full set for v5) exposes typed methods and returns status, headers and parsed body.
- TS-003-02 Types are generated from `/docs?api-docs.json`, not hand-written.
- TS-003-03 A reusable matcher validates a response against its schema and prints the failing JSON path.
- TS-003-04 Every request and response is attached to the test report on failure, with `Authorization` redacted.
- TS-003-05 The client never throws on 4xx or 5xx; negative tests assert on the response.
- TS-003-06 The client can send `PATCH`, `QUERY` and `OPTIONS`, and multipart bodies.

**Done when:** A deliberately wrong schema makes a test fail with a readable message. No test file imports `request` directly.

**Framework layer:** API request fixture, custom matchers, type generation, report attachments.

### TS-004 Authentication fixtures and stored sessions

**P1 · M · Auth · needs TS-002, TS-003**

**Why:** Logging in through the UI in every test is slow, and failed attempts can lock shared accounts.

**Scenarios**

- TS-004-01 A setup project logs in once per role through `POST /users/login` and saves a storage state for customer and admin.
- TS-004-02 UI tests opt into a role with a fixture or project; unauthenticated is the default.
- TS-004-03 API tests get an authenticated client per role without logging in again.
- TS-004-04 A fresh, self-registered user is available as a fixture for tests that change password, profile or lock state.
- TS-004-05 An expired or rejected token triggers one re-login, then fails with a clear error.
- TS-004-06 No test in the suite sends a wrong password for a seeded account. Enforce with a lint rule or a guard in the client.

**Done when:** A UI test starts already signed in, in under 2 seconds. Storage-state files are git-ignored.

**Framework layer:** setup projects, `storageState`, role fixtures. Where the UI keeps its token (local storage key) is **(verify)**; inspect after a manual login.

### TS-005 Tagging, traceability and reporting

**P2 · S · Reporting · needs TS-001**

**Why:** With more than 350 scenarios you need to run subsets and trace a red test to a ticket in seconds.

**Scenarios**

- TS-005-01 `--grep @smoke` runs in under 3 minutes and covers one test per epic.
- TS-005-02 Each test reports its scenario ID and ticket as annotations visible in the HTML report.
- TS-005-03 A known-issue annotation links a finding and marks the test as expected to fail.
- TS-005-04 Traces are kept on first retry, screenshots and video on failure only.
- TS-005-05 A JUnit or JSON report is produced for CI alongside HTML.

**Done when:** You can answer "which scenarios cover TS-207?" from the report or one grep.

**Framework layer:** reporters, annotations, tags, artifact settings.

### TS-006 Locator policy and page-object conventions

**P1 · S · UI core · needs TS-001**

**Why:** The app ships stable `data-test` hooks and seven languages. Text-based locators will break on the language switch.

**Scenarios**

- TS-006-01 `testIdAttribute` is set to `data-test`; `getByTestId('add-to-cart')` resolves on a product page.
- TS-006-02 A header component object exposes navigation, cart badge and language switch, and is reused by every page object.
- TS-006-03 Page objects expose user actions and locators, and contain no assertions. Assertions stay in tests or custom matchers.
- TS-006-04 A lint rule blocks `page.locator('xpath=...')`, `waitForTimeout` and `{ force: true }`.
- TS-006-05 A sample test passes unchanged with the UI switched to German.

**Done when:** The conventions are written down in the repo in one page and the sample test follows them.

**Framework layer:** page objects, component objects, lint config.

## Epic B: Catalog API on Sprint 1 (6 tickets)

The v1 API has four resources and no authentication, which makes it the right place to learn your API layer before tokens and roles get involved. All tests here are tagged `@api @v1` and use only data they create.

### TS-101 Brands: CRUD lifecycle and validation

**P1 · M · API · needs TS-002, TS-003**

**Why:** The simplest resource in the app. It proves the client, factories, cleanup and schema matcher work end to end.

**Scenarios**

- TS-101-01 `POST /brands` with a valid name and slug returns 201 and a body matching `BrandResponse` with a numeric `id`.
- TS-101-02 `GET /brands/{id}` returns the created brand; `GET /brands` includes it.
- TS-101-03 `PUT /brands/{id}` returns 200 `{ "success": true }` and a follow-up GET shows the new values.
- TS-101-04 `DELETE /brands/{id}` returns 204; a follow-up GET returns 404 with `message: "Requested item not found"`.
- TS-101-05 Missing `name`, missing `slug` and an empty body each return 422 with a field-keyed error map. Data-driven.
- TS-101-06 Boundary: `name` and `slug` at 120 characters are accepted, at 121 rejected with 422.
- TS-101-07 A second brand with an existing slug returns 409. The body is either a field map or `{ "message": "Duplicate Entry" }`; the test accepts both documented shapes.
- TS-101-08 `GET`, `PUT` and `DELETE` on a non-existent id return the documented status for each (404, 404, and 204 or 422; record what you see).
- TS-101-09 Deleting a brand that a product still references returns 409 with `success: false` and a message.

**Done when:** All nine scenarios pass against `api-v1` in parallel with no leftover brands.

**Framework layer:** resource client, factory, cleanup registry, data-driven tests.

### TS-102 Categories: CRUD and tree

**P1 · M · API · needs TS-101**

**Why:** Introduces parent-child data and a second read model (`/categories/tree`).

**Scenarios**

- TS-102-01 Create a root category, then a child with `parent_id`; both return 201.
- TS-102-02 `GET /categories/tree` shows the child inside the parent's `sub_categories`.
- TS-102-03 `GET /categories/tree/{id}` returns the parent with its children; an unknown id returns 404.
- TS-102-04 `GET /categories/tree?by_category_slug=<root slug>` returns only that root. The same query with a child slug returns no match, as the spec states it does not match sub-category slugs.
- TS-102-05 `GET /categories` returns a flat list where the child carries the parent's id in `parent_id`.
- TS-102-06 `PUT /categories/{id}` renames; duplicate slug returns 409; missing fields return 422.
- TS-102-07 `parent_id` pointing at a non-existent category is rejected; record the status.
- TS-102-08 Deleting a parent that still has a child or a product returns 409; deleting leaf first, then parent, returns 204 twice.

**Done when:** Tree assertions compare structure, not array positions.

**Framework layer:** dependent fixtures (parent before child), ordered teardown.

### TS-103 Products: read, filter and related

**P1 · M · API · needs TS-102**

**Why:** Filtering logic is where catalog bugs live, and these filters drive the UI.

**Scenarios**

- TS-103-01 `GET /products` returns an array where every item matches `ProductResponse`, including nested `brand`, `category` and nullable `product_image`.
- TS-103-02 `by_brand=<id>` returns only products of that brand.
- TS-103-03 `by_brand=<id1>,<id2>` returns the union of both brands.
- TS-103-04 `by_category=<id>` and a comma-separated list behave the same way for categories.
- TS-103-05 `by_category_slug=<parent slug>` includes products in descendant categories.
- TS-103-06 Combining `by_brand` and `by_category` returns the intersection.
- TS-103-07 A filter matching nothing returns 200 with an empty array; a malformed value such as `by_brand=abc` does not return 500.
- TS-103-08 `GET /products/{id}/related` returns an array that excludes the product itself; an unknown id returns 404.

**Done when:** Each filter test seeds two brands, two categories and at least three products, so a wrong filter cannot pass by accident.

**Framework layer:** composed fixtures, query-parameter builders, array matchers.

### TS-104 Products: create, update, delete

**P1 · M · API · needs TS-103**

**Why:** Products have five required fields and three foreign keys, a realistic validation surface.

**Scenarios**

- TS-104-01 `POST /products` with all required fields returns 201 with `id`, `name`, `description`, `price`.
- TS-104-02 Each required field (`name`, `price`, `category_id`, `brand_id`, `product_image_id`) omitted in turn returns 422 naming that field. Data-driven.
- TS-104-03 Boundaries: `name` at 120 and 121 characters, `description` at 1250 and 1251, `description` null.
- TS-104-04 `price` as 0, negative, a string, and with three decimals; record which are accepted.
- TS-104-05 A `brand_id`, `category_id` or `product_image_id` that does not exist returns 422, not 500.
- TS-104-06 `PUT /products/{id}` returns `{ "success": true }` and the change is visible on GET.
- TS-104-07 `PUT` on an unknown id returns 404.
- TS-104-08 `DELETE /products/{id}` returns 204; the product no longer appears in `GET /products`.

**Done when:** Image ids come from `GET /images`, not a hard-coded number.

**Framework layer:** lookup fixtures for reference data, negative-test tables.

### TS-105 HTTP caching and content negotiation

**P2 · S · API · needs TS-101**

**Why:** The v1 spec documents `ETag`, `Cache-Control: public, max-age=120`, 304 responses and XML output. Few suites test these, and they are common production defects.

**Scenarios**

- TS-105-01 `GET /brands` returns `Cache-Control` containing `public` and `max-age=120`, and a non-empty `ETag`.
- TS-105-02 Repeating the request with `If-None-Match: <etag>` returns 304 with an empty body.
- TS-105-03 After creating a brand, the same `If-None-Match` returns 200 and a different `ETag`.
- TS-105-04 The same three checks pass for `GET /products/{id}` and `GET /categories/tree`.
- TS-105-05 `Accept: text/xml` returns `Content-Type: application/xml` and a parseable document carrying the same brand names as the JSON response.
- TS-105-06 `POST`, `PUT` and `DELETE` responses carry no `ETag`.

**Done when:** Header assertions are case-insensitive and tolerate weak validators (`W/`).

**Framework layer:** header access in the client, conditional requests, a second content type.

### TS-106 Contract check against the v1 spec

**P2 · M · API · needs TS-101 to TS-104**

**Why:** Hand-picked field assertions miss drift. One generated check covers every documented response.

**Scenarios**

- TS-106-01 The spec is fetched from `/docs?api-docs.json` at run time and parsed without errors.
- TS-106-02 For every `GET` operation, a live 200 response validates against its schema.
- TS-106-03 Every status code returned in TS-101 to TS-104 is one the spec documents for that operation; anything else is listed as a finding.
- TS-106-04 A snapshot of the spec is committed; the job fails with a readable diff when paths, parameters or schemas change.
- TS-106-05 Fields returned but not in the schema are reported as warnings, not failures.

**Done when:** The report lists each operation as validated, undocumented status, or not covered.

**Framework layer:** spec-driven test generation, snapshot files, custom reporting.

## Epic C: Sprint 5 API (12 tickets)

Sprint 5 adds authentication, roles, carts, payment and invoices, so these tickets cover the business logic behind the UI. All are tagged `@api @v5`. Request body field names marked **(verify)** should be read from the generated types in TS-003.

### TS-201 Login and token lifecycle

**P1 · M · API · needs TS-004**

**Why:** Every protected flow depends on it, and the lockout rule can take down shared accounts if tested carelessly.

**Scenarios**

- TS-201-01 Valid credentials return 200 with `access_token`, `token_type` (compare case-insensitively to `bearer`) and a numeric `expires_in`.
- TS-201-02 Wrong password and unknown email both return 401 with an `error` field, and the two responses do not reveal which one was wrong.
- TS-201-03 Empty body, missing `email` and missing `password` return a 4xx, never 500.
- TS-201-04 `GET /users/me` returns the user with a valid token, and 401 with no token, a malformed token and a token with a changed signature.
- TS-201-05 `GET /users/refresh` returns a new token that works on `/users/me`. Record whether the old token still works.
- TS-201-06 `GET /users/logout` returns 200 `Successfully logged out`; the same token then gets 401.
- TS-201-07 Lockout, on a self-registered user only: wrong passwords until the API returns 423 with the "Account locked" error. Record whether the third or fourth attempt triggers it.
- TS-201-08 After lockout, the correct password still returns 423.
- TS-201-09 A successful login before the limit resets the failed-attempt counter. Record as finding if it does not.
- TS-201-10 A disabled account returns 403 `Account disabled`. `@destructive`; how an admin disables a user is **(verify)**.

**Done when:** No scenario sends a wrong password for a seeded account. The lockout test registers and abandons its own user.

**Framework layer:** auth client, throwaway-user fixture, token decoding helper.

### TS-202 Registration, profile and password rules

**P1 · L · API · needs TS-201**

**Why:** Registration is the entry point for all self-owned test users, and the password rules are stricter than they look.

**Scenarios**

- TS-202-01 `POST /users/register` with a valid payload returns 201 and a user body that contains no password or hash.
- TS-202-02 Each required field omitted in turn returns 422 naming the field. Field list **(verify)** from `UserRequest`.
- TS-202-03 Registering the same email twice returns the documented conflict (409, or 422 from validation; accept both, record which).
- TS-202-04 Weak passwords are rejected, data-driven: under 8 characters, no uppercase, no lowercase, no digit, no symbol, and a well-known breached password.
- TS-202-05 Date of birth and phone rules: future date, under-age date, letters in phone. Rules **(verify)**.
- TS-202-06 `PATCH /users/{id}` with one field changes only that field; `PUT` replaces the profile.
- TS-202-07 User A updating user B returns 403. User A reading user B is denied (the controller answers 404).
- TS-202-08 `POST /users/change-password` with a wrong current password returns 400 and a message.
- TS-202-09 New password equal to the current one returns 400.
- TS-202-10 Policy violation or mismatched confirmation returns 422.
- TS-202-11 After a successful change, login fails with the old password and succeeds with the new one.
- TS-202-12 `POST /users/forgot-password` for an unknown email returns 422. For your own user it returns 200 and the password becomes `welcome02`, as the Swagger text says. Record as finding: a fixed reset password.

**Done when:** The user factory from TS-002 is the only place that knows the registration payload.

**Framework layer:** user factory, self-registered user fixture, boundary tables.

### TS-203 Role-based access matrix

**P1 · M · API · needs TS-201**

**Why:** Authorization bugs are the highest-impact class in a shop. A matrix test catches a missing guard on any new route.

**Scenarios**

- TS-203-01 One table drives the test: rows are operations, columns are anonymous, customer and admin, cells are the expected status.
- TS-203-02 Admin-only routes: `GET /users` and `DELETE /users/{id}` return 401 for anonymous and 403 for a customer.
- TS-203-03 `DELETE` on brands, categories and products returns 401 for anonymous and is refused for a customer.
- TS-203-04 The spec declares no security on `POST`, `PUT` and `PATCH` for brands, categories and products. Pin what anonymous and customer callers actually get. If writes succeed, record as finding.
- TS-203-05 `GET /invoices` and `GET /messages` return only the caller's records for a customer and all records for admin.
- TS-203-06 Customer A requesting customer B's invoice, message or favorite by id is denied.
- TS-203-07 A token whose payload was edited to `role: admin` and left with the old signature returns 401.
- TS-203-08 Favorites as admin: the spec says user role is required. Record the result.

**Done when:** Adding a route to the matrix is a one-line change. The report prints the matrix with pass or fail per cell.

**Framework layer:** multi-role fixtures, parameterised test generation.

### TS-204 Products: pagination, sorting, filters and search

**P1 · M · API · needs TS-003**

**Why:** These parameters are exactly what the storefront sends. Verifying them at API level lets UI tests stay thin.

**Scenarios**

- TS-204-01 `GET /products` returns the envelope `current_page`, `data`, `from`, `last_page`, `per_page`, `to`, `total` with consistent arithmetic.
- TS-204-02 `page=2` returns different ids from page 1; a page past `last_page` returns empty `data`; `page=0`, `-1` and `abc` do not return 500.
- TS-204-03 `sort=name,asc`, `name,desc`, `price,asc`, `price,desc` each return a correctly ordered page. Data-driven.
- TS-204-04 `sort=co2_rating,asc` and `desc` order A to E and back, as the UI offers.
- TS-204-05 `between=price,10,30` returns only prices from 10 to 30. Check both bounds, an inverted range and non-numeric values.
- TS-204-06 `is_rental=true` returns only rentals; with `false` no rental is returned.
- TS-204-07 `by_brand` and `by_category` narrow results and combine with `sort` and `between`.
- TS-204-08 `GET /products/search?q=<term>` returns only matching products; a term with no match returns `total: 0`.
- TS-204-09 `GET /products/{id}` carries the fields the UI reads: `in_stock`, `is_rental`, `is_eco_friendly`, `co2_rating`, `discount_price`, `brand`, `category`, `product_image`, `specs`.
- TS-204-10 `GET /products/{id}/specs` and `GET /product-specs/names` return consistent names.
- TS-204-11 `PATCH /products/{id}` with only `price` changes only the price. `@destructive`, on your own product.

**Done when:** Sort assertions compare the full page to a locally sorted copy using the same collation the API uses.

**Framework layer:** pagination helper that walks all pages, sort and range matchers.

### TS-205 QUERY and OPTIONS methods

**P3 · S · API · needs TS-204**

**Why:** Sprint 5 exposes the HTTP `QUERY` method on search and list routes. It is unusual and checks that your client is not limited to five verbs.

**Scenarios**

- TS-205-01 `QUERY /products` with JSON body `{ "sort": "price,asc", "between": "price,10,30" }` returns the same ids as the equivalent `GET`.
- TS-205-02 The same parity holds for `/products/search`, `/brands/search`, `/categories/search` and `/categories/tree`.
- TS-205-03 `QUERY` with a non-JSON content type returns 415.
- TS-205-04 `QUERY /invoices/search` and `QUERY /users/search` return 401 without a token.
- TS-205-05 `OPTIONS /products` returns 204 with an `Allow` header listing `GET`, `POST` and `QUERY`; `OPTIONS /products/{id}` lists `DELETE`, `GET`, `PATCH`, `PUT`.
- TS-205-06 A method the route does not define returns 405 with the documented message.

**Done when:** The client sends `QUERY` through `request.fetch` with a custom method, with no special-casing in tests.

**Framework layer:** generic request method in the client.

### TS-206 Cart

**P1 · M · API · needs TS-204**

**Why:** The cart holds the pricing and discount logic. UI tests will seed carts through these calls.

**Scenarios**

- TS-206-01 `POST /carts` returns 201 with an `id`.
- TS-206-02 `POST /carts/{id}` with `product_id` and `quantity` returns 200; `GET /carts/{id}` shows one line with that product and quantity.
- TS-206-03 Adding the same product again leaves one line with the summed quantity. **(verify)** against the "item added or updated" message.
- TS-206-04 `PUT /carts/{id}/product/quantity` sets the quantity; GET reflects it.
- TS-206-05 `DELETE /carts/{id}/product/{productId}` returns 204 and the line is gone.
- TS-206-06 `DELETE /carts/{id}` returns 204; a following GET returns 404.
- TS-206-07 Missing `product_id` or `quantity` returns 422; an unknown product or unknown cart id returns 404 or 422, not 500.
- TS-206-08 Quantity 0, negative, decimal and very large. Record each result; the UI caps quantity, the API may not.
- TS-206-09 Adding an out-of-stock product. The UI disables the button; record as finding if the API accepts it.
- TS-206-10 Discounts: pin when `additional_discount_percentage`, per-item `discount_percentage` and the 5% eco discount apply. Rules **(verify)** by reading `CartController` before writing assertions.
- TS-206-11 Two parallel adds of the same product end with the correct total quantity.

**Done when:** A `seedCart(items)` helper exists and returns the cart id for UI tests.

**Framework layer:** cart client, seeding helper reused in Epic D and E.

### TS-207 Payment validation

**P1 · M · API · needs TS-003**

**Why:** `POST /payment/check` validates five methods with different rules. This is a textbook table-driven ticket, and the code has gaps worth pinning.

**Scenarios**

- TS-207-01 A valid payload for each of `bank-transfer`, `cash-on-delivery`, `credit-card`, `buy-now-pay-later` and `gift-card` returns 200 `Payment was successful`.
- TS-207-02 Bank transfer: `bank_name` accepts letters and spaces only; `account_name` accepts letters, digits, space, dot, apostrophe, hyphen; `account_number` digits only. One invalid value per field returns 422.
- TS-207-03 Credit card number must match `####-####-####-####`. Reject 16 digits without hyphens, 15 digits and letters.
- TS-207-04 Expiry must be `MM/YYYY` and in the future. Compute dates at run time: next month passes, last month fails, wrong format fails.
- TS-207-05 Expiry in the current month. A real card is valid until month end; record what the API does.
- TS-207-06 CVV accepts 3 or 4 digits; 2, 5 and letters fail. Card holder name accepts letters and spaces only.
- TS-207-07 Buy now pay later requires numeric `monthly_installments`. The UI offers 3, 6, 9, 12; send 5, 0 and -1 and record as finding if accepted.
- TS-207-08 Gift card number and validation code rules **(verify)**; the UI limits them to 16 and 4 characters.
- TS-207-09 Unknown or missing `payment_method`: the controller has no branch for it and returns success. Pin and record as finding.

**Done when:** One data table per method holds valid and invalid rows; adding a case needs no new test code.

**Framework layer:** parameterised tests from data files, date helpers.

### TS-208 Invoices and order status

**P1 · L · API · needs TS-206, TS-207**

**Why:** Creating an invoice is the checkout. It joins cart, address, payment and user.

**Scenarios**

- TS-208-01 Authenticated `POST /invoices` with a seeded cart, billing address and payment returns 200 with an `invoice_number`. Body fields **(verify)**.
- TS-208-02 Invoice lines and total match the cart, including discounts.
- TS-208-03 The same request without a token returns 401; with missing billing fields returns 422.
- TS-208-04 Reusing the same cart for a second invoice. Record whether it is rejected.
- TS-208-05 `POST /invoices/guest` with `guest_email`, `guest_first_name`, `guest_last_name` and no token returns 200; an invalid email returns 422.
- TS-208-06 `GET /invoices` is paginated; a customer sees only own invoices; the new one is first or findable by `GET /invoices/search?q=<number>`.
- TS-208-07 `GET /invoices/{id}` returns the invoice to its owner and to admin, and is denied to another customer.
- TS-208-08 Admin `PUT /invoices/{id}/status` accepts each of `AWAITING_FULFILLMENT`, `ON_HOLD`, `AWAITING_SHIPMENT`, `SHIPPED`, `COMPLETED`; an unknown value returns 422.
- TS-208-09 `status_message` boundaries: 4 characters fails, 5 and 50 pass, 51 fails.
- TS-208-10 A customer calling the status route is refused. **(verify)**
- TS-208-11 `GET /invoices/{number}/download-pdf-status` moves through `INITIATED`, `IN_PROGRESS`, `COMPLETED`. Poll with `expect.poll`, no fixed sleeps.
- TS-208-12 Once completed, `download-pdf` returns a PDF content type and a body starting with `%PDF`. Record the response before it is ready.

**Done when:** A `placeOrder()` helper returns invoice id and number for later tickets. The PDF scenarios are tagged so they run only where generation is active; locally it is triggered by `php artisan invoice:generate`.

**Framework layer:** multi-step API flows, polling, binary responses.

### TS-209 Favorites

**P2 · S · API · needs TS-201**

**Why:** A small authenticated resource; good practice for per-user isolation.

**Scenarios**

- TS-209-01 `POST /favorites` with a `product_id` returns 200; `GET /favorites` lists it with product details.
- TS-209-02 Adding the same product twice returns 409.
- TS-209-03 An unknown `product_id` is rejected, not 500.
- TS-209-04 `DELETE /favorites/{id}` returns 204; `GET /favorites/{id}` then returns 404.
- TS-209-05 All four routes return 401 without a token.
- TS-209-06 User B does not see user A's favorite and cannot delete it.

**Done when:** Tests use self-registered users, so the seeded customers' favorites are untouched.

**Framework layer:** two-user fixture.

### TS-210 Contact messages

**P2 · M · API · needs TS-201**

**Why:** Covers an anonymous write, a file upload and a status workflow in one resource.

**Scenarios**

- TS-210-01 Anonymous `POST /messages` with a valid payload returns 200 `success: true`. Fields **(verify)** from `ContactRequest`.
- TS-210-02 The same call with a customer token links the message to that user; it appears in the user's `GET /messages`.
- TS-210-03 Missing subject or message and a too-short message are rejected. Minimum length **(verify)**.
- TS-210-04 `POST /messages/{id}/attach-file` as multipart with an allowed file returns 200. Allowed type and size **(verify)**; a disallowed file is rejected.
- TS-210-05 `GET /messages` returns 401 for anonymous, own messages for a customer, all for admin, paginated.
- TS-210-06 `POST /messages/{id}/reply` by admin returns 200; the reply appears on `GET /messages/{id}` for the owner.
- TS-210-07 `PUT /messages/{id}/status` accepts `NEW`, `IN_PROGRESS`, `RESOLVED`.
- TS-210-08 The schema enum also lists `ON_HOLD`, which the description omits. Send it and record as finding either way.
- TS-210-09 An unknown status and a customer caller are both refused. **(verify)** for the customer.

**Done when:** Upload tests build their file in memory; no binary fixtures in the repo.

**Framework layer:** multipart requests, in-memory file buffers.

### TS-211 Reports, rate limiting and postcode lookup

**P2 · M · API · needs TS-203**

**Why:** The report routes are the only group with an explicit throttle in the route file. Your client needs a deliberate 429 strategy.

**Scenarios**

- TS-211-01 As admin, each of the seven report routes returns 200 with a stable shape: `total-sales-of-years`, `total-sales-per-country`, `top10-purchased-products`, `top10-best-selling-categories`, `customers-by-country`, `average-sales-per-month`, `average-sales-per-week`.
- TS-211-02 The two top-10 reports return at most 10 rows, sorted descending.
- TS-211-03 Anonymous and customer access to reports. Record the result; if either can read sales data, record as finding.
- TS-211-04 A burst of requests ends in 429. Assert the rate-limit headers present and that the route recovers after the window. `@serial`, local only. Limit value **(verify)**.
- TS-211-05 The API client retries once on 429 using `Retry-After`, then fails clearly.
- TS-211-06 `GET /postcode-lookup` with `country` and `postcode` returns 200 with `street`, `city`, `state`, `country`, `postcode`.
- TS-211-07 Missing `country` or `postcode`, a postcode over 10 characters or a country over 40 returns 422.

**Done when:** Report tests never run in parallel with each other.

**Framework layer:** serial mode, retry and backoff policy in the client.

### TS-212 Contract and negative baseline for v5

**P2 · M · API · needs TS-106, TS-201**

**Why:** Reuses the contract engine from TS-106 on a much larger spec, plus the generic negative checks every API should pass.

**Scenarios**

- TS-212-01 Every `GET` operation in the v5 spec validates against its schema for anonymous, customer or admin as required.
- TS-212-02 The validator handles the spec's `openapi: 3.2.0` version and its `query` operations. If your tool cannot, document the workaround.
- TS-212-03 Status codes outside the spec are listed as findings per operation.
- TS-212-04 Error bodies are consistent: 401 and 404 carry `message`, 405 carries the method message, 422 is a field map.
- TS-212-05 Malformed JSON, a wrong content type and an empty body on each `POST` route return 4xx, never 500.
- TS-212-06 Search routes given quotes, percent signs, angle brackets, emoji and a 5,000-character string return 200 or 4xx, never 500.
- TS-212-07 Soft check: each list `GET` answers within a budget you set, reported as a warning, not a failure.

**Done when:** The contract report covers both API versions from one command.

**Framework layer:** shared contract engine across environments, soft assertions.

## Epic D: Sprint 5 UI (14 tickets)

These tickets cover the storefront, checkout, account and admin screens. All are tagged `@ui @v5`. The rule throughout: seed state through the API helpers from Epic C, drive only the behaviour under test through the browser, and cross-check results against the API.

### TS-301 Catalog grid, sorting and pagination

**P1 · M · UI · needs TS-006, TS-204**

**Why:** The landing page is the first thing every user sees and the base for all product page objects.

**Scenarios**

- TS-301-01 The home page shows product cards, each with a name, an image whose alt text equals the name, and a price formatted `$0.00`.
- TS-301-02 Card names and prices on page 1 equal `GET /products?page=1`.
- TS-301-03 Each of the four sort options (`name,asc`, `name,desc`, `price,desc`, `price,asc`) reorders the grid to match the API with the same `sort`. Data-driven.
- TS-301-04 CO2 sort options appear only when the CO2 scale feature is on.
- TS-301-05 Pagination: page 2 shows different products; the active page is marked; the last page has no next. Pagination hooks **(verify)**.
- TS-301-06 Clicking a card opens `/product/{id}` and the detail name equals the card name.
- TS-301-07 A product with `in_stock: false` (found through the API) shows the `out-of-stock` label on its card.
- TS-301-08 A discounted product shows both `product-price` and `product-discount-price`.

**Done when:** No test waits on time. Wait on the products response or on the grid container, whose `data-test` value changes with the result state **(verify the values)**.

**Framework layer:** page object, product-card component, network-aware waiting.

### TS-302 Search and filters

**P1 · L · UI · needs TS-301**

**Why:** Six controls can combine. This is where UI and API most often disagree.

**Scenarios**

- TS-302-01 Searching a term shows `search-caption` with the term, a `search-result-count`, and only matching cards.
- TS-302-02 Pressing Enter submits the search the same as the button.
- TS-302-03 A term with no match shows `no-results`.
- TS-302-04 `search-reset` clears the input and restores the full grid.
- TS-302-05 Ticking a parent category ticks its children and shows only products from those categories.
- TS-302-06 Ticking one child category narrows to that category; unticking restores.
- TS-302-07 One brand filters to that brand; two brands show the union.
- TS-302-08 Category plus brand shows the intersection, equal to the API with both parameters.
- TS-302-09 Price slider: move both handles with keyboard arrows; every visible price is inside the range and the request carries `between=price,<min>,<max>`.
- TS-302-10 `eco-friendly-filter`, when the feature is on, leaves only cards with an `eco-badge`.
- TS-302-11 Applying a filter while on page 2 returns to page 1.
- TS-302-12 At a 375-pixel viewport the filter panel is collapsed and opens from the `filters` toggle.

**Done when:** Category and brand ids come from the API at run time; checkboxes are addressed as `category-{id}` and `brand-{id}`.

**Framework layer:** filter-panel component, request assertions with `waitForRequest`, viewport projects.

### TS-303 Product detail

**P1 · L · UI · needs TS-301**

**Why:** Stock, rental and discount each change what this page renders. Each variant needs a product chosen through the API, not a hard-coded id.

**Scenarios**

- TS-303-01 Name, `unit-price`, description, category badge and brand badge equal `GET /products/{id}`.
- TS-303-02 `increase-quantity` and `decrease-quantity` change the value by one; it never goes below 1.
- TS-303-03 Typing a value above the maximum is corrected or rejected. Maximum **(verify)**.
- TS-303-04 `add-to-cart` shows a confirmation toast and the header `cart-quantity` equals the quantity added. Toast text **(verify)**.
- TS-303-05 Adding twice sums the badge.
- TS-303-06 Out-of-stock product: `out-of-stock` is shown; `add-to-cart`, quantity input and both quantity buttons are disabled.
- TS-303-07 Rental product: a duration slider replaces the quantity input, and the total equals price times hours as the slider moves.
- TS-303-08 Discounted product: the percentage badge, the original price and `offer-price` are all shown and consistent.
- TS-303-09 `product-specs` rows equal the API `specs`, name, value and unit.
- TS-303-10 Related products are listed and a related card opens a different product.
- TS-303-11 `add-to-favorites` while signed out shows an error toast; signed in it succeeds; a second click reports it is already a favorite. Messages **(verify)**.
- TS-303-12 A non-existent product id in the URL fails gracefully. Record the behaviour.

**Done when:** A `findProduct({ inStock, isRental, hasDiscount, hasSpecs })` helper picks products through the API.

**Framework layer:** API-driven test data selection, toast component, slider helper.

### TS-304 Navigation, category pages and rentals

**P2 · M · UI · needs TS-006**

**Why:** Cheap smoke coverage of every public route, and the home of the shared header component.

**Scenarios**

- TS-304-01 Each header link reaches its route: home, the four category entries, rentals, contact.
- TS-304-02 `/category/hand-tools` shows only products from that category tree, equal to the API with `by_category_slug`.
- TS-304-03 `/rentals` shows only rental products.
- TS-304-04 Signed out, `nav-sign-in` is visible. Signed in, it is replaced by `nav-menu` showing the user's name.
- TS-304-05 The user menu lists the five account entries plus sign-out for a customer, and the admin entries for an admin.
- TS-304-06 `nav-cart` is absent with an empty cart and appears with the right count after an add.
- TS-304-07 Loading `/category/power-tools` directly, and reloading it, both work.
- TS-304-08 Browser back and forward restore the previous route.
- TS-304-09 At a mobile viewport the menu opens from the toggler and links still work.
- TS-304-10 `/privacy` loads and each route sets a page title.

**Done when:** The route list lives in one data file and drives the smoke test.

**Framework layer:** header component, route table, mobile project.

### TS-305 Authentication UI

**P1 · L · UI · needs TS-004, TS-202**

**Why:** Login, registration and route guards protect everything else. Negative cases must not lock shared accounts.

**Scenarios**

- TS-305-01 A customer logs in and reaches the account page; an admin reaches the admin dashboard. Landing routes **(verify)**.
- TS-305-02 Submitting the empty form shows `email-error` and `password-error`.
- TS-305-03 A malformed email shows the format error; a too-short password shows the length error.
- TS-305-04 Wrong password on a self-registered user shows `login-error`.
- TS-305-05 Repeated wrong passwords on that user show the locked-account message.
- TS-305-06 Error state is accessible: the input has `aria-invalid="true"` and the error container is announced.
- TS-305-07 Sign out returns the header to `nav-sign-in`; `/account` then redirects to login.
- TS-305-08 Guards: anonymous on `/account/*` and `/admin/*` is redirected; a customer on `/admin/*` is refused.
- TS-305-09 Registration with valid data ends on the login page, and the new user can log in.
- TS-305-10 Registration validation: every required field, password policy, date of birth. Rules **(verify)**.
- TS-305-11 Forgot password for the self-registered user shows success; an unknown email shows an error.
- TS-305-12 A session survives a page reload.
- TS-305-13 The Google sign-in button is present on the hosted build. Assert presence only; do not automate a third-party login.

**Done when:** Only this ticket logs in through the form. Every other UI test uses stored sessions.

**Framework layer:** login and register page objects, throwaway-user fixture in UI tests.

### TS-306 Cart page

**P1 · M · UI · needs TS-303, TS-206**

**Why:** Price arithmetic shown to the customer must match what the API will invoice.

**Scenarios**

- TS-306-01 With two products added, the table shows `product-title`, `product-quantity`, `product-price` and `line-price` per row, and `cart-total` equals the sum.
- TS-306-02 Changing a quantity updates its `line-price`, `cart-total` and the header badge.
- TS-306-03 Quantity 0, empty and above the maximum. Record each behaviour.
- TS-306-04 Removing a row deletes it. The remove button has no `data-test`; locate it by role inside the row.
- TS-306-05 Removing the last row shows the empty-cart message and hides `nav-cart`.
- TS-306-06 The cart survives a reload and a visit to another page.
- TS-306-07 A rental line shows the rental explainer text.
- TS-306-08 When a discount applies, `cart-subtotal`, `cart-discount` or `cart-eco-discount` rows appear and the total is subtotal minus discounts.
- TS-306-09 Totals on screen equal `GET /carts/{id}` for the same cart.
- TS-306-10 `continue-shopping` returns to the catalog with the cart intact.

**Done when:** Money is compared as integers of cents, never as floats.

**Framework layer:** table-row component, money helper. How the UI stores the cart id is **(verify)**; once known, seed carts through the API.

### TS-307 Checkout as a signed-in customer

**P1 · L · E2E · needs TS-306, TS-207, TS-208**

**Why:** The revenue path. One happy path per payment method plus the guard rails around it.

**Scenarios**

- TS-307-01 Cash on delivery, end to end: cart, `proceed-1`, sign-in step, billing address, `payment-method`, `finish`, `payment-success-message`, then the confirmation with an invoice number.
- TS-307-02 The same flow for bank transfer, credit card, buy now pay later and gift card. Data-driven from the TS-207 tables.
- TS-307-03 Starting signed out, the customer logs in at the sign-in step and continues with the cart intact.
- TS-307-04 The address step blocks progress until required fields are valid. Hooks **(verify)**.
- TS-307-05 `finish` is disabled until the payment form is valid.
- TS-307-06 Invalid card number, past expiry, bad CVV and missing holder each show their inline error.
- TS-307-07 After confirmation the cart is empty and `nav-cart` is gone.
- TS-307-08 The invoice number on screen exists in `GET /invoices` for that user with the same total and payment method.
- TS-307-09 Clicking `finish` twice quickly creates one invoice, not two.
- TS-307-10 Going back one step and forward again keeps entered data.
- TS-307-11 Postcode lookup fills street and city in the address step, if the UI uses it. **(verify)**

**Done when:** Tests run as a self-registered customer. `@smoke` contains exactly one checkout: TS-307-01.

**Framework layer:** multi-step flow object, `test.step`, UI-to-API cross-checks.

### TS-308 Guest checkout

**P2 · M · E2E · needs TS-307**

**Why:** The API has a guest invoice route. First confirm the UI exposes it **(verify)**; if not, close this ticket and rely on TS-208-05.

**Scenarios**

- TS-308-01 At the sign-in step a guest option accepts email, first name and last name and moves on.
- TS-308-02 An invalid email blocks progress with an inline error.
- TS-308-03 Address and payment complete as in TS-307 and the confirmation shows an invoice number.
- TS-308-04 The browser called `POST /invoices/guest`, not `POST /invoices`.
- TS-308-05 After the order, account routes still redirect to login.

**Done when:** The ticket is either implemented or closed with a one-line note saying the UI has no guest path.

**Framework layer:** request assertions, reuse of the checkout flow object.

### TS-309 Customer account area

**P2 · L · UI · needs TS-208, TS-209, TS-210**

**Why:** Shows the customer the data created in Epic C. Ideal for API-seed, UI-verify tests.

**Scenarios**

- TS-309-01 The account landing page links to favorites, profile, invoices and messages.
- TS-309-02 Profile: changing phone and address shows success, survives reload and matches `GET /users/me`.
- TS-309-03 Profile password change enforces the policy and the confirmation match.
- TS-309-04 A favorite created through the API appears in favorites; removing it there removes it from the API.
- TS-309-05 Favorites with nothing saved shows an empty state.
- TS-309-06 An invoice created through `placeOrder()` appears in the invoice list with the right number, date and total.
- TS-309-07 The invoice detail shows lines, totals, billing address and payment method.
- TS-309-08 PDF download: the button becomes available when the PDF is ready, and the downloaded file starts with `%PDF`.
- TS-309-09 A message sent through the API appears in messages; an admin reply added through the API shows in its detail.
- TS-309-10 Opening another customer's invoice URL is refused.

**Done when:** Every scenario seeds through the API and uses a self-registered user.

**Framework layer:** download handling, API-seed and UI-verify pattern.

### TS-310 Contact form

**P2 · S · UI · needs TS-210**

**Why:** A self-contained form with validation and a file upload.

**Scenarios**

- TS-310-01 A valid anonymous submission shows the success message and the message exists for admin through the API.
- TS-310-02 Signed in, the name and email fields are hidden or prefilled. **(verify)**
- TS-310-03 Each required field shows its error when empty; a malformed email shows a format error.
- TS-310-04 A message under the minimum length is rejected. Length **(verify)**
- TS-310-05 An allowed attachment uploads; a disallowed type or size shows an error. Rule **(verify)**
- TS-310-06 Each subject option can be selected and is stored.

**Done when:** Files are passed to `setInputFiles` as in-memory buffers.

**Framework layer:** form component, file upload.

### TS-311 Admin: brands, categories and products

**P2 · L · UI · needs TS-004, TS-204**

**Why:** The back office is a classic CRUD grid. Works only on data the test creates.

**Scenarios**

- TS-311-01 Admin adds a brand through the form; it appears in the admin list and in the storefront brand filter.
- TS-311-02 Admin edits and deletes that brand; the storefront filter follows.
- TS-311-03 Deleting a brand that has a product shows an error and keeps the brand.
- TS-311-04 Categories: add a child under a parent; it appears nested in the storefront filter.
- TS-311-05 Products: add one with brand, category, image, price and stock; it is findable by storefront search and opens with the right details.
- TS-311-06 Marking a product out of stock disables add-to-cart on its detail page.
- TS-311-07 Marking a product as rental moves it to `/rentals`. Field names **(verify)**.
- TS-311-08 Form validation: required fields, price format, duplicate slug.
- TS-311-09 Admin list search and pagination work.

**Done when:** Admin page selectors are **(verify)**; record them in the page objects. Nothing seeded is edited outside local Docker.

**Framework layer:** generic admin-grid component reused across three entities.

### TS-312 Admin: orders, users, messages, reports and settings

**P2 · L · UI · needs TS-311, TS-208**

**Why:** Closes the loop between admin actions and what the customer sees.

**Scenarios**

- TS-312-01 An order created through `placeOrder()` appears in admin orders with the right customer and total.
- TS-312-02 Admin changes its status; the customer's invoice page shows the new status.
- TS-312-03 Users: admin finds a self-registered user by search, edits a field, and the API reflects it.
- TS-312-04 Admin deletes that user; login then fails for it.
- TS-312-05 Messages: admin opens a seeded message, replies and sets a status; the customer sees the reply.
- TS-312-06 Dashboard and the three report pages render their charts or tables and every report request returns 200.
- TS-312-07 Settings: turning the CO2 scale off removes `co2-rating-badge` and the CO2 sort options from the storefront; turning it on restores them.
- TS-312-08 Settings: the eco badge toggle shows and hides `eco-badge`.

**Done when:** You know whether settings are stored per browser or on the server **(verify)**. If on the server, tag TS-312-07 and 08 `@destructive`.

**Framework layer:** two-role tests in one scenario using two browser contexts.

### TS-313 Product comparison

**P3 · M · UI · needs TS-301**

**Why:** A newer feature with client-side state, and the templates show an inconsistency worth pinning.

**Scenarios**

- TS-313-01 `compare-btn` on a card sets `aria-pressed="true"` and does not navigate to the product.
- TS-313-02 `comparison-bar` appears with the selected count.
- TS-313-03 With two products selected, `compare-link` opens `/comparison` and both products are shown with their attributes.
- TS-313-04 `clear-comparison` removes the bar and unpresses every button.
- TS-313-05 `add-to-compare` on the detail page adds the product and changes the button style.
- TS-313-06 On the catalog the bar shows with one product selected; on the detail page it shows only with two or more. Pin both and record as finding.
- TS-313-07 Selection after reload and the maximum number of products. Record both. **(verify)**

**Done when:** The finding is written up with steps, expected, actual and the two template conditions.

**Framework layer:** client-state assertions, ARIA state matchers.

### TS-314 Two-factor login

**P3 · M · E2E · needs TS-305**

**Why:** Time-based codes are a common automation blocker. Solving it once is reusable knowledge.

**Scenarios**

- TS-314-01 Through the API, a self-registered user sets up TOTP (`POST /totp/setup`) and verifies it with a code generated in the test (`POST /totp/verify`).
- TS-314-02 `POST /users/login` for that user then returns `requires_totp: true` with an interim token instead of a session.
- TS-314-03 In the UI, the login form switches to `totp-code`; a valid code and `verify-totp` complete the login.
- TS-314-04 A wrong code shows an error and does not log in.
- TS-314-05 A code from the previous 30-second window. Record whether it is accepted.
- TS-314-06 Enabling 2FA from the profile page shows a secret or QR code. **(verify)**

**Done when:** The TOTP secret never leaves the test process. No seeded account ever has 2FA enabled.

**Framework layer:** TOTP helper (for example `otplib`), time-sensitive tests.

## Epic E: Hybrid flows and cross-cutting quality (7 tickets)

These tickets turn a set of passing tests into a suite a team would trust: mixed API and UI flows, failure handling, accessibility, visuals, languages, a measure of bug detection, and CI.

### TS-401 Hybrid API and UI flows

**P1 · M · E2E · needs TS-206, TS-208, TS-306**

**Why:** Real suites seed through the API and assert through the UI. This ticket makes that pattern a first-class helper.

**Scenarios**

- TS-401-01 A cart seeded through the API opens in the browser on `/checkout` with the same lines. Requires knowing where the UI keeps the cart id **(verify)**.
- TS-401-02 A user registered through the API logs in through the UI on the first attempt.
- TS-401-03 An order status changed through the API as admin shows on the customer's invoice page after a reload, with no new login.
- TS-401-04 The price of your own product changed through the API shows in the storefront. Product GET responses carry a 120-second cache header; record how long the old price remains visible.
- TS-401-05 A product deleted through the API while it sits in a cart: the cart page handles it without a crash. Record the behaviour. `@destructive`.

**Done when:** A `seedAndOpen` style fixture exists, and at least three Epic D tests are refactored to use it and run faster.

**Framework layer:** fixtures combining API and browser contexts.

### TS-402 Network mocking and resilience

**P2 · M · UI · needs TS-301, TS-307**

**Why:** Error and loading states cannot be reached reliably on a healthy backend. `page.route` reaches them in seconds.

**Scenarios**

- TS-402-01 With the products response delayed 3 seconds, skeleton cards show first and real cards replace them.
- TS-402-02 With the products response forced to 500, the page stays usable. Record what the user sees.
- TS-402-03 With an empty `data` array, `no-results` is shown.
- TS-402-04 With a mocked product carrying a 120-character name, price 0 and `in_stock: false`, the card and detail page render without overflow.
- TS-402-05 With `POST /payment/check` forced to 422, `payment-error-message` is shown and no invoice request is sent.
- TS-402-06 With the invoice request forced to 500 after a successful payment check, the user sees an error and the cart is kept. Record as finding if not.
- TS-402-07 With a 401 returned on an authenticated call mid-session, the user is sent to login.
- TS-402-08 With the browser offline during add-to-cart, the UI reports the failure and the badge does not change.

**Done when:** Mocks live in reusable route helpers, and every mocked test is tagged so it is never mistaken for an integration test.

**Framework layer:** `page.route`, HAR recording and replay, offline mode.

### TS-403 Accessibility

**P2 · M · UI · needs TS-304, TS-307**

**Why:** The European Accessibility Act has applied to most EU online shops since June 2025, and the templates already carry ARIA attributes worth protecting.

**Scenarios**

- TS-403-01 An axe scan with WCAG 2.1 A and AA rules runs on home, product detail, cart, each checkout step, login, register, contact and account.
- TS-403-02 Existing violations are baselined as findings; any new serious or critical violation fails the build.
- TS-403-03 Keyboard only: log in, with visible focus at every stop and a logical tab order.
- TS-403-04 Keyboard only: open a product, add it to the cart and reach the payment step.
- TS-403-05 The categories menu, user menu and language menu open, move and close with the keyboard.
- TS-403-06 On login and register, each error is linked to its input through `aria-describedby` and the input reports `aria-invalid`.
- TS-403-07 An ARIA snapshot of the header guards its structure for anonymous, customer and admin.

**Done when:** The baseline file is committed and reviewed; the scan runs in CI on every pull request.

**Framework layer:** `@axe-core/playwright`, ARIA snapshots, keyboard helpers.

### TS-404 Visual regression

**P3 · M · UI · needs TS-402**

**Why:** Catches layout breaks that functional assertions never see. It only pays off if the screenshots are deterministic.

**Scenarios**

- TS-404-01 Baselines exist for home, product detail, cart, login and the payment step, on desktop and one mobile viewport.
- TS-404-02 Catalog data comes from a recorded HAR, so shared-environment changes cannot alter the picture.
- TS-404-03 Animations are disabled and fonts and images are loaded before capture.
- TS-404-04 Component-level shots cover the header, a product card and the cart table.
- TS-404-05 A deliberate CSS change in a mocked response fails the test with a readable diff.

**Done when:** Baselines are generated in the CI container, not on your laptop. The update procedure is written down.

**Framework layer:** `toHaveScreenshot`, snapshot path templates per project.

### TS-405 Localisation

**P2 · M · UI · needs TS-304**

**Why:** Seven languages ship in the header. Language tests prove your locators are language-independent and find untranslated text.

**Scenarios**

- TS-405-01 For each of DE, EL, EN, ES, FR, NL, TR: selecting `lang-{code}` updates `language-select` and the header labels. Data-driven.
- TS-405-02 The chosen language survives reload and navigation.
- TS-405-03 The catalog-to-cart smoke test passes unchanged in German and in Greek.
- TS-405-04 No raw translation key (text matching `pages.` or `fields.` patterns) is visible on home, product, cart, login or checkout in any language.
- TS-405-05 Prices keep the same currency and format in every language. Record the behaviour.
- TS-405-06 Hard-coded English in the templates: the admin menu labels, "Searched for:" and "Eco-Friendly Discount (5%)". Pin and record as finding.
- TS-405-07 Validation messages from the API in a non-English UI. Record which language they use.

**Done when:** Expected labels come from the app's own translation files or a small fixture, not from strings scattered in tests.

**Framework layer:** locale-parameterised projects, text-independent locators.

### TS-406 Bug-detection benchmark on the with-bugs build

**P2 · M · Suite quality · needs Epics C and D mostly done**

**Why:** The project hosts a deliberately broken Sprint 5. Running your suite against it measures what the suite actually catches, the closest thing to mutation testing for an end-to-end suite.

**Scenarios**

- TS-406-01 The full v5 suite runs with `ENV=bugs` with no code change.
- TS-406-02 Every failure is triaged as a seeded bug or a fragile test. Fragile tests are fixed.
- TS-406-03 Each confirmed bug is logged with scenario ID, steps, expected and actual.
- TS-406-04 Exploratory pass on the with-bugs site: for each bug the suite missed, add a scenario to the right ticket.
- TS-406-05 After those additions the suite is still green on the normal build.

**Done when:** A one-page report lists bugs caught, bugs missed and tests added. This is a strong portfolio artefact.

**Framework layer:** environment switching under real conditions, failure triage.

### TS-407 CI pipeline

**P1 · L · CI · needs TS-005; grows with every epic**

**Why:** A suite that only runs on your machine is not production grade.

**Scenarios**

- TS-407-01 Pull requests run lint, type-check and `@smoke` against hosted v5 in under 5 minutes.
- TS-407-02 A nightly job starts the Docker stack inside the runner, waits for `GET /status`, and runs the full suite including `@destructive`.
- TS-407-03 UI smoke runs on Chromium, Firefox and WebKit; API tests run once.
- TS-407-04 The nightly run is sharded across runners and the blob reports are merged into one HTML report.
- TS-407-05 Retries are 0 locally and 1 in CI; tests that pass on retry are listed as flaky; a quarantine tag is excluded from gating.
- TS-407-06 HTML report, traces for failures and JUnit results are uploaded; the job summary shows pass, fail and flaky counts.
- TS-407-07 Credentials come from CI secrets; the run aborts with a clear message if one is missing.
- TS-407-08 A scheduled job runs the contract checks from TS-106 and TS-212 and fails on spec drift.

**Done when:** A deliberately broken test on a branch blocks the merge and the report shows why.

**Framework layer:** workflow files, sharding, report merging, secrets.

## Build order and what to verify first

By my rough sizing the full backlog is about 53 working days; the 24 P1 tickets alone are about 31. Build in the six phases below and stop after phase 4 if time is short, since that already gives a credible end-to-end suite.


| Phase            | Tickets                                            | Rough days | What you can show at the end                                                |
| ---------------- | -------------------------------------------------- | ---------- | --------------------------------------------------------------------------- |
| 1. Foundations   | TS-001 to TS-006, plus TS-407-01                   | 6          | Framework runs against four environments; smoke job on pull requests        |
| 2. v1 API        | TS-101 to TS-106                                   | 5.5        | Full CRUD, caching and contract coverage of a small API                     |
| 3. v5 API core   | TS-201 to TS-204, TS-206 to TS-208                 | 9          | Auth, roles, cart, payment and order creation through the API               |
| 4. UI core       | TS-301 to TS-303, TS-305 to TS-307, TS-401         | 11         | Catalog to paid order in the browser, seeded and verified through the API   |
| 5. Breadth       | TS-205, TS-209 to TS-212, TS-304, TS-308 to TS-314 | 14.5       | Account, admin, contact, comparison, 2FA, remaining API groups              |
| 6. Suite quality | TS-402 to TS-406, rest of TS-407                   | 7          | Mocking, accessibility, visual, languages, bug-detection report, nightly CI |




### Verify before coding

Each item is a few minutes in the browser dev tools, the Swagger page or the repository, and removes a **(verify)** marker from the tickets.

- [ ] Storage keys the UI uses for the auth token and the cart id (TS-004, TS-306, TS-401)
- [ ] Field names in `UserRequest`, `InvoiceRequest`, `ContactRequest` and `PaymentRequest` (TS-202, TS-208, TS-210)
- [ ] The grid container's `data-test` state values and the pagination hooks (TS-301)
- [ ] `data-test` hooks on register, checkout address, contact, account and admin pages (TS-305, TS-307, TS-309 to TS-312)
- [ ] Whether the UI offers guest checkout and uses postcode lookup (TS-307, TS-308)
- [ ] Contact form minimum message length and attachment rule (TS-210, TS-310)
- [ ] Cart discount rules in the cart controller or service (TS-206, TS-306)
- [ ] Gift card validation rules in `App\Payments\GiftCard` (TS-207)
- [ ] Role required for report routes and the throttle limit (TS-211)
- [ ] Where admin settings are stored, and where 2FA setup lives in the profile (TS-312, TS-314)
- [ ] Whether the hosted build matches the `main` branch I read, and how often the hosted database resets



### Sources

- [Toolshop Sprint 5 site](https://practicesoftwaretesting.com/)
- [Sprint 1 API specification](https://api-v1.practicesoftwaretesting.com/docs?api-docs.json) and [Swagger UI](https://api-v1.practicesoftwaretesting.com/api/documentation)
- [Sprint 5 API specification](https://api.practicesoftwaretesting.com/docs?api-docs.json)
- [Repository README: accounts, environments, Docker](https://github.com/testsmith-io/practice-software-testing)
- [Sprint 5 API routes](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/API/routes/api.php), [UserController](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/API/app/Http/Controllers/UserController.php), [PaymentController](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/API/app/Http/Controllers/PaymentController.php)
- Sprint 5 UI templates: [routing](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/app-routing.module.ts), [header](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/header/header.component.html), [catalog](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/products/overview/overview.component.html), [product detail](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/products/detail/detail.component.html), [login](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/auth/login/login.component.html), [cart](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/checkout/cart/cart.component.html), [payment](https://raw.githubusercontent.com/testsmith-io/practice-software-testing/main/sprint5/UI/src/app/checkout/payment/payment.component.html)

