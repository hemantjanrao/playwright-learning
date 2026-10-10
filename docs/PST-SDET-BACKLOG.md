# Practice Software Testing: investigation and learning backlog

Investigation date: 10 October 2026. Scope: assessment and planning only. No application tests, framework code, workflows, or credentials changed. Tickets are local learning tasks, not published GitHub issues.

## 1. Verified findings and access limitations

### Evidence register

Use **D** for documented contract, **O** for observed behavior, and **P** for a proposed expectation that needs a decision. A documented response is not proof it was observed. An example value is not a required constant.

| Evidence | Source and finding                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| -------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| D1       | [Official repository](https://github.com/testsmith-io/practice-software-testing): its hosted-version table pairs `https://practicesoftwaretesting.com` with `https://api.practicesoftwaretesting.com` for Sprint 5; `api-v1` is Sprint 1.                                                                                                                                                                                                                                      |
| D2       | [Live Swagger](https://api.practicesoftwaretesting.com/api/documentation) links [this OpenAPI JSON](https://api.practicesoftwaretesting.com/docs?api-docs.json). Downloaded spec: title Toolshop API, version `5.0.0`, deployed server `https://api.practicesoftwaretesting.com`, local server `http://localhost:8091`. Snapshot: [openapi-2026-10-10.json](pst-evidence/openapi-2026-10-10.json). SHA-256 `a1b79c7e0df4ee64f3ae0fbc76401c1e2071fc5fbaa00bb8b89d482df09e9580`. |
| O1       | Live home page title says Toolshop v5.0. Footer says `v2.5`, built `2026-10-10`, Angular `20.0.5`. These are distinct labels; do not treat the footer as the API version. Catalog displayed products, prices, stock labels, pagination, search, category/brand filters, price range, and sorting.                                                                                                                                                                              |
| O2       | Browser: Search `zzzsdetnomatch20261010` displayed `0 products found for 'zzzsdetnomatch20261010'`; pressing `X` restored catalog links. Controls observed: textbox Search, button Search, button X; mobile-width Filters disclosure must be expanded first.                                                                                                                                                                                                                   |
| O3       | Opened a catalog product link. Detail URL `/product/<id>` displayed an H1, unit price, description, quantity initially 1, Add to cart, favourites, comparison, specifications, related products. DOM-confirmed `data-test`: `product-name`, `unit-price`, `product-description`, `quantity`, `increase-quantity`, `decrease-quantity`, `add-to-cart`. Sample name/price were Combination Pliers / 14.15; neither is a permanent test constant.                                 |
| O4       | Sign in navigated to `/auth/login`. Labels: Email address _, Password _; Login button; registration and forgotten-password links. No login was submitted, and no account was created.                                                                                                                                                                                                                                                                                          |
| O5       | Read-only API: `/products?page=1` returned a paginated object with string product IDs, numeric prices, booleans and nested brand/category/image objects. Product ID/name/price matched the inspected UI example. `/products?page=1&sort=price,asc` returned HTTP 200; prices on that page were ascending.                                                                                                                                                                      |
| O6       | Anonymous GET `/users/me` and GET `/invoices` each returned HTTP 401 and `{"message":"Unauthorized"}`.                                                                                                                                                                                                                                                                                                                                                                         |
| O7       | GET `/products/search?q=zzzsdetnomatch20261010` returned `data: []`, `total: 0`, `current_page: 1`, `last_page: 1`, `per_page: 9`, `from: null`, `to: null`.                                                                                                                                                                                                                                                                                                                   |
| R1       | Repository source inspected: config, package files, fixtures, page objects, representative UI/API/unit specs, data factory, API schemas/client/errors/logger, auth setup, mock fixtures, PR/nightly/mock workflows and reporting actions. `npm ls --depth=0` verified installed versions below.                                                                                                                                                                                |
| R2       | `npm run test:unit -- --workers=1`: **12 passed**. `npm run typecheck`: **passed**. CLI help verified `--list`, `--no-deps`, `--trace retain-on-failure`, `--workers`, `--retries`, and `--debug`. No existing live UI/API suites, Docker suite, CI run, full lint or formatting baseline was executed.                                                                                                                                                                        |

### What version verification does—and does not—establish

D1, D2 and O1 establish the same **Sprint 5 environment family**. Matching product data adds supporting evidence. Browser tooling available for this investigation did not expose a network capture; no live UI request-host trace or deployment SHA was captured. Therefore identical deployed revisions across UI/API/docs are **not proved**. SDET-001 records that last check using the browser Network panel. Do not substitute `api-v1` or assume current GitHub main equals production.

### Contract gaps and limits

- **Concrete discrepancy:** D2 declares integer `from`/`to` in the product search response, but O7 returns null for an empty result. Track a contract discrepancy; a nullable compatibility schema must be identified as a deliberate accommodation, not “the OpenAPI contract.”
- ProductResponse lists properties without a `required` array. Requiring ID/name/price for UI consumption is a consumer requirement proposed by this plan, not literal OpenAPI requiredness.
- Login documents only a 200 token response. Invalid-password status, error copy, lockout/rate-limit behavior and token revocation are unverified; do not invent 401/422 rules for login.
- Cart GET's documented CartResponse only describes an ID. It does not adequately define line items, totals or ownership. Cart writes, quantity limits, duplicate-add semantics, deletion behavior and cleanup were not exercised.
- Invoices and authenticated user operations are documented. Account/profile/order-history UI, actual auth storage, authenticated checkout, payment validation and invoice persistence were not observed. They are discovery-gated below.
- No destructive, administrative, bulk, load or purchase exercise ran. No external issue/comment was posted. No OpenAPI export is needed from you: access succeeded.

## 2. Framework assessment and minimal adaptation plan

### Installed baseline

Playwright **1.63.0**, TypeScript **6.0.3**, Zod **4.4.3**, Faker **10.5.0**, MSW **2.14.6**, Testcontainers **12.0.3**, dotenv **16.6.1**, Allure Playwright **3.10.0**, Allure CLI **2.43.0**. These are installed versions, not merely package ranges. No dependency upgrade or new dependency is needed for the first milestones.

### How a test runs

1. [package.json](../package.json) selects the CLI projects/grep. `test:pr` sequentially runs unit, API, then Chromium smoke; GitHub PR jobs instead run those three tiers independently after quality checks.
2. [playwright.config.ts](../playwright.config.ts) calls [loadConfig](../utils/config-loader.ts). It chooses TEST_ENV (default dev), loads `.env.<environment>` or `.env`, validates URLs and credentials, selects reporters, timeouts and projects. **dotenv uses `override: true`.**
3. Project matching selects specs. API has no setup dependency. Chromium/Firefox/WebKit depend on `setup`; [auth.setup.ts](../tests/setup/auth.setup.ts) uses the Sauce Demo LoginPage, asserts inventory navigation, then writes `auth/.auth/user.json`.
4. [fixtures/index.ts](../fixtures/index.ts) lazily supplies requested fixtures: config, pages, generated data, ApiClient. An API-only test requesting apiClient does not launch a browser. Its request context is Playwright-managed. Browser tests get an isolated browser context/page; page console errors are logged.
5. [authenticated.fixture.ts](../fixtures/authenticated.fixture.ts) overrides storageState with the shared saved file. Base-fixture login tests remain unauthenticated but their browser project still runs setup first. A copied browser context does **not** isolate backend account records.
6. Page objects perform actions; specs own assertions. ApiClient joins the API base URL and path, dispatches HTTP, parses JSON, checks expected status and validates Zod. GET negative tests can inspect getResult; other negative methods can use the underlying request fixture rather than adding a generic client framework.
7. Playwright tears down its test-scoped contexts/pages/request fixtures. Worker fixtures close MSW/container resources after use. There is **no general owned-backend-record cleanup fixture**. Browser teardown alone does not delete server data.
8. Failures feed HTML or blob/Allure reporters. CI retains failure traces/screenshots/video and uploads artifacts. Nightly merges blobs; optional Pages publication requires care with authenticated artifacts.

### Reuse versus application coupling

| Existing components                                                                                       | Assessment and smallest action                                                                                                                                                                                                       |
| --------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `fixtures/index.ts`, `pages/BasePage.ts`                                                                  | Keep typed lifecycle/composition and navigation. Add Toolshop fixture layer; do not make Sauce Demo classes conditional on the selected site. BasePage's default route is Sauce Demo login `/`; pass explicit routes.                |
| `utils/api-client.ts`, `api-errors.ts`, `api-assertions.ts`                                               | Reuse positive GET/status/schema validation. Pass explicit expected status, especially invoice creation's documented 200. Use raw request for negative POST/PUT when needed. Redact error body before authenticated cases.           |
| `schemas/api.schemas.ts`, `types/api-endpoints.types.ts`, branded numeric IDs, `builders/post.builder.ts` | JSONPlaceholder-specific. Preserve as learning examples; introduce Toolshop string IDs and schemas separately. Do not coerce Toolshop IDs to numbers or reuse PostBuilder for carts.                                                 |
| `pages/LoginPage.ts`, `DashboardPage.ts`, `UserProfilePage.ts`; `ROUTES`, `ERROR_MESSAGES` in constants   | Sauce Demo-specific. Retain reference implementations; new Toolshop pages belong under proposed `pages/toolshop/`.                                                                                                                   |
| `utils/test-data-factory.ts`                                                                              | Reuse uniqueSuffix; Faker profile alone neither guarantees traceability nor satisfies registration contract. A small plain object factory is sufficient before considering a builder.                                                |
| `fixtures/msw.fixture.ts`, `container.fixture.ts`, `utils/route-mocks.ts`                                 | Keep teaching utilities. MSW intercepts fetch, not Playwright request. WireMock is a stub server, not an isolated real Toolshop backend. Existing page.route tests use setContent and prove an invented page, not Toolshop behavior. |
| reporting, tags, CI actions                                                                               | Reuse structure, but change target defaults, selection, concurrency and artifact policy deliberately. No new dashboard or reporter needed.                                                                                           |

### Concrete weaknesses worth fixing

| Finding and source                                                                                                                                     | Consequence                                                                        | Minimum change / ticket                                                                                                                                                             |
| ------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| dotenv override in `utils/config-loader.ts`; CI fallbacks in `.github/actions/configure-test-env/action.yml` still point to Sauce Demo/JSONPlaceholder | Shell/CI intended target can be replaced by a tracked env file; mixed apps can run | Define precedence and validate paired hosts; SDET-002, 019                                                                                                                          |
| `.gitignore` ignores `.env`/`.env.local` but not `.env.dev`, `.env.qa`, `.env.staging`; those three are tracked                                        | Real credentials could enter version control                                       | Keep templates only; migrate actual environment files out of tracking deliberately. Ignoring alone does not untrack files. No claim that existing demo values are private; SDET-002 |
| All three browser projects depend on Sauce login setup                                                                                                 | Anonymous catalog smoke blocked by unrelated login                                 | Separate anonymous Toolshop project now; add auth fixture after discovery, not before; SDET-004/008                                                                                 |
| Local trace is on-first-retry but ordinary local retries are zero                                                                                      | First failure lacks trace                                                          | Use CLI retain-on-failure during work; align defaults in SDET-020                                                                                                                   |
| `ApiRequestError`/`ApiParseError` embed full bodies; page console logging is unredacted                                                                | Tokens/profile data may enter artifacts                                            | Redact before auth work; do not assume GitHub secret masking covers generated tokens; SDET-006                                                                                      |
| ApiClient parses JSON before checking status; getResult's generic type is an unchecked cast                                                            | HTML error may be classified as parse failure; typed result is not validated       | Report actual status plus sanitized content type; keep schema and status assertions distinct; SDET-006                                                                              |
| Dashboard count reads `.count()` then immediate numeric assertion                                                                                      | No retry while products render                                                     | Use retrying locator assertions in new tests; do not copy this pattern; SDET-004                                                                                                    |
| Existing invalid-path test accepts any status >=400; post tests mostly check echo, no persisted readback                                               | Server outage can pass a “negative” test; creation success is weak evidence        | Exact documented statuses and readback for Toolshop writes; SDET-009/011                                                                                                            |
| Firefox/WebKit include network-mock spec while Chromium excludes it; quarantine is documented but config lacks grepInvert                              | Advertised suite boundaries differ from actual collection                          | Assert collection lists; separate mocked tests and quarantine selection in SDET-019                                                                                                 |
| Nightly uses blob reporter but failure upload action seeks HTML                                                                                        | Per-shard HTML may be absent; merged HTML is the usable report                     | Document expected artifacts or generate them explicitly; SDET-020                                                                                                                   |
| Unit client tests cover URL joining, not diagnostic/error behavior                                                                                     | Redaction/error regressions could escape                                           | Add focused error-path tests only when changing diagnostics; SDET-006                                                                                                               |

### Proposed organization (none of these code paths exist yet)

- `playwright.toolshop.config.ts`: small dedicated config for Toolshop selection; reuse common constants/config/report policy. Start with `toolshop-api`, later `toolshop-ui` with no Sauce setup dependency. Avoid a multi-application configuration framework.
- `tests/api/toolshop/`, `tests/ui/toolshop/`, `pages/toolshop/`, `schemas/toolshop/`, `fixtures/toolshop.fixture.ts`, `utils/toolshop-endpoints.ts`.
- Preserve legacy examples and exclude Toolshop paths from legacy config matching (and vice versa). Existing recursive regexes would otherwise collect new nested specs.
- `.env.example` explains host pair and optional auth input; actual values live in ignored local files/CI secrets. Existing loadConfig requires credentials even for unit/anonymous tests: validate auth at the authenticated fixture boundary instead, with matching schema/unit-test updates.
- First target is one read-only API check, then one browser journey. Extract shared config only when actual duplication justifies it. Do not migrate all eight projects, introduce code generation, add Pact, or rebuild clients upfront.

## 3. Feature / risk / test-layer matrix

| Journey and business risk                          | Confirmed UI / documented operation                                                                                             | Auth and data                                                                 | Lowest effective coverage / status                                                                                                 |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| Browse/detail: wrong item or price                 | O1/O3; GET `/products`, GET `/products/{productId}` (200; 404 documented)                                                       | Anonymous; runtime-discovered product                                         | API schema + ID consistency; one real UI catalog-to-detail journey. UI/API price parity tests mapping, not pricing correctness.    |
| Search: missing matches or stale results           | O2; GET `/products/search?q=...` (200), D2 says name search                                                                     | Anonymous; controlled name fixture for definitive semantics                   | API positive/empty; UI submit/clear. Case sensitivity, whitespace, matching and missing-q outcomes require decisions.              |
| Filter: irrelevant products                        | Category/brand/price controls O1; GET `/products?by_brand=...&by_category=...&between=price,10,30`                              | Discover IDs; exact boundaries use local seeded records                       | API membership/intersections; one UI wiring check. Inclusive/exclusive price edges unverified.                                     |
| Sort/pagination: wrong order or lost items         | Sort options/pagination O1; GET `/products?sort=price,asc&page=1` O5                                                            | Anonymous; stable local catalog for cross-page proof                          | API numeric monotonicity; controlled cross-page completeness. UI sort selection check only.                                        |
| Login/session: wrong identity, access without auth | Login form O4; POST `/users/login` 200; GET `/users/me` 200/401                                                                 | Owned user; token response documented, storage unknown                        | API identity + invalid/missing token checks; one UI login; storage discovery before reuse.                                         |
| Cart: wrong item, count or subtotal                | Add-to-cart control O3; POST `/carts` 201; POST `/carts/{id}` 200; GET `/carts/{cartId}` 200; PUT quantity 200; DELETE cart 204 | No security declared on cart operations; ownership policy unverified          | API state transitions with readback; UI cart integration. No assumed authorization model based solely on missing OpenAPI security. |
| Checkout: invoice not persisted or wrong totals    | API POST `/invoices` 200, GET `/invoices/{invoiceId}` 200; guest operation documented                                           | Bearer for authenticated invoices; own cart/user; local environment preferred | Discover totals/payment rules, then API outcome + one real UI checkout. UI not inspected.                                          |
| Account/profile: wrong user data updated           | GET `/users/me`; PUT/PATCH `/users/{userId}` documented                                                                         | Own user and restoration/cleanup                                              | Discover UI/field rules; API readback; cross-user rejection local only.                                                            |
| History: another user's orders exposed             | GET `/invoices` describes user sees related invoices, admin sees all                                                            | Two owned local users and invoice records                                     | API ownership filtering; one history rendering check after UI discovery. Exact cross-user detail denial code unresolved.           |

**Smoke:** initially anonymous catalog API + catalog-to-detail UI. Add anonymous `/users/me` 401. After fixtures are safe, add one own-user login/identity check and one cart journey. Keep checkout as one local integration smoke when deterministic; public smoke remains read-heavy.

**Regression:** search, filtering, sort/pagination, validation, cart transitions, account ownership, invoice readback, UI errors and a small cross-browser sample. Run public checks with one worker and zero retries; limit aggregate CI jobs too. Nightly can retry once for diagnosis, with flaky classification visible.

**Deferred:** admin/catalog mutations, destructive tests, bulk/load, real payment/provider flows, password recovery/email delivery, Google OAuth, rentals, chat, sustainability, comparisons/favourites and PDF export. Some controls are visible/documented, but they are outside the first useful scope. Local real Toolshop is required for destructive/admin/boundary data exercises; WireMock cannot prove backend business rules.

**Overlap:** API verifies business rules and persistence; UI verifies control wiring, mapping, navigation and rendering; integrated tests establish that the real UI/backend cooperate. Mocked UI errors prove presentation under controlled responses, never backend correctness. Zod response checks are schema validation. Consumer-driven contract testing additionally needs consumer expectations exchanged with and verified by a provider; this plan does not implement that process.

## 4. Ordered backlog index

P1 = unlocks safe adaptation or covers a core revenue/security risk; P2 = valuable regression/maintainability; P3 = optional breadth. Effort is implementation only; allow 20–45 minutes learning per ticket, 45–60 for authentication/ownership. Difficulty: B beginner, I intermediate, A advanced. Discovery tickets are complete when decisions/evidence are recorded, not when speculative tests turn green.

| ID       | Milestone / concrete outcome                              | Priority | Depends on    | Hours / difficulty |
| -------- | --------------------------------------------------------- | -------- | ------------- | ------------------ |
| SDET-001 | M1: Trace this framework and verify Sprint 5 request host | P1       | —             | 1–2 / B            |
| SDET-002 | M1: Safe environment selection + first catalog API smoke  | P1       | 001           | 2–3 / I            |
| SDET-003 | M2: Product list/detail contract and useful assertions    | P1       | 002           | 2 / I              |
| SDET-004 | M2: Anonymous catalog-to-detail browser slice             | P1       | 003           | 2–3 / I            |
| SDET-005 | M2: Search empty state and clear behavior                 | P2       | 004           | 2–3 / I            |
| SDET-006 | M3: Redacted API diagnostics before credentials           | P1       | 003           | 2 / I              |
| SDET-007 | M3: Discover auth storage, registration and cleanup       | P1       | 006           | 1–3 / I            |
| SDET-008 | M3: Owned user fixture and auth-state reuse               | P1       | 007           | 2–3 / A            |
| SDET-009 | M3: Identity and anonymous access protection              | P1       | 008           | 2 / I              |
| SDET-010 | M4: Discover cart state, boundaries and ownership         | P1       | 007           | 1–2 / I            |
| SDET-011 | M4: Cart API add/update/remove persistence                | P1       | 010           | 2–3 / I            |
| SDET-012 | M4: Real UI cart contents and quantity                    | P1       | 004, 011      | 2 / I              |
| SDET-013 | M4: API sort and pagination oracle                        | P2       | 003           | 2 / I              |
| SDET-014 | M4: Filter membership and price-edge decisions            | P2       | 013           | 2–3 / I            |
| SDET-015 | M4: Discover checkout, profile and history rules          | P1       | 008, 011      | 2–3 / A            |
| SDET-016 | M4: One checkout and persisted invoice journey            | P1       | 012, 015      | 2–3 / A            |
| SDET-017 | M4: Account and invoice isolation                         | P1       | 015, 016      | 2–3 / A            |
| SDET-018 | M5: Controlled catalog failure rendering                  | P2       | 004, 006      | 2 / I              |
| SDET-019 | M5: Safe CI selection and aggregate concurrency           | P1       | 005, 009, 012 | 2–3 / I            |
| SDET-020 | M5: Cross-browser sample and diagnostic review            | P3       | 018, 019      | 2–3 / I            |

Order is a learning sequence, not a requirement to serialize independent tickets: 013/014 can proceed while owned-user discovery is unresolved. If any gated ticket exceeds 3 hours, stop at its documented evidence/outcome boundary and split the unresolved feature rather than building speculative infrastructure.

### Run and review conventions for all tickets

**Existing verified commands:** `npm run test:unit -- --workers=1`, `npm run typecheck`, `npm run validate`, `npm run report`. Only unit/typecheck were actually run here. `npm run test:debug -- <file>` exists but would use the old config unless `--config` is provided.

**Proposed-target invocations:** after SDET-002 creates the new config, `npx playwright test --config=playwright.toolshop.config.ts --project=toolshop-api --workers=1 --retries=0`. After SDET-004 adds the browser project, replace project with `toolshop-ui`. Append a ticket's proposed filename to scope execution. Add `--list` before executing to verify collection; `--trace=retain-on-failure` for browser diagnostics; `--debug` for interactive browser debugging. These flags are verified against installed CLI; the config/project/file names are proposed and do not run today.

Every implemented ticket requires: scoped collection/run evidence, relevant quality checks, sanitized failure evidence, and a deliberate assertion challenge (temporarily alter expected data or a local mock response, demonstrate the specific assertion fails, then restore). Do not mutate the public application to perform that challenge. Green alone is insufficient. Distinguish an application discrepancy from automation and environmental failures; never mark outage as a successful negative case.

## 5. First five detailed tickets

### SDET-001 — Trace execution and close the environment-identity gap

**Problem / risk / outcome:** A suite aimed at the wrong sprint can be green and irrelevant. Produce a source-backed execution map and capture the live catalog request host.

**Scope:** Read config → fixture → UI/API spec → assertions → teardown/report. Record one browser Network request for catalog and its response, plus Swagger server/version. **Exclude:** implementation, login, new abstraction or exhaustive application tour.

**Priority/dependencies/effort:** P1; none; 1–2 hours; B. Learning: project dependencies, lazy fixtures, browser versus API contexts, evidence provenance.

**Reuse:** existing config, base/auth fixtures, users-get spec, login spec, auth setup, docs architecture. **Proposed change:** `docs/PST-EXECUTION-NOTES.md` only, with sanitized evidence and distinction between Sprint family and exact build.

| Scenario ID | Test layer            | Preconditions and data            | Actions or request                                      | Exact expected result                                                                                                                                                                                     | Evidence/source              | Cleanup                         |
| ----------- | --------------------- | --------------------------------- | ------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ------------------------------- |
| 001-A       | Framework inspection  | Installed repository              | Trace users-get spec's apiClient dependency             | API project has no setup dependency; request fixture supplies client; no page requested                                                                                                                   | R1 / fixtures/index.ts       | None                            |
| 001-B       | Framework inspection  | Existing login spec               | Trace Chromium project and setup                        | Sauce auth setup precedes test; base login spec itself does not load authenticated fixture                                                                                                                | R1 / config and auth fixture | Do not publish auth state       |
| 001-C       | Environment discovery | Anonymous browser at requested UI | Inspect Network on catalog load; compare Swagger server | Required pairing is api.practicesoftwaretesting.com; record actual request method/path/status. If different, stop adaptation and document conflict. Exact revision remains unknown without build evidence | D1/D2; proposed verification | Close temporary browser context |
| 001-D       | Unit baseline         | Existing local config             | Run existing unit command                               | 12 tests pass on inspected baseline, or record categorized reproducible failure without hiding it                                                                                                         | R2                           | Reports remain ignored          |

**Acceptance:** execution notes name at least six actual source files; explain why anonymous Chromium currently triggers login; identify override precedence and old targets; record request host/date and spec version; no secrets in evidence; distinguish unavailable build identity from a proved mismatch.

**Hints:** Start with one test, not every file. Draw its fixture dependency graph. Inspect the request's actual URL rather than deriving it from the page URL. Record only host/path/status and public product fields.

**Run/debug:** existing unit command above; `npx playwright test --project=chromium --grep @smoke --list` to inspect selection without executing login. Use the browser Network panel for the one request capture.

**Review evidence / common mistakes:** submit map, collection output, unit summary, redacted network observation. Be ready to explain why request-context isolation differs from account isolation. Avoid claiming README timing estimates are measurements or treating a spec version as a deployment SHA.

### SDET-002 — Add safe Toolshop selection and one catalog API smoke

**Problem / risk / outcome:** Changing BASE_URL alone mixes Sauce pages and JSONPlaceholder contracts with Toolshop. Deliver one anonymous API smoke using a paired environment and explicit selection.

**Scope:** small proposed config with `toolshop-api`; prevent legacy config collecting Toolshop specs; preserve shell/CI env precedence; allow anonymous tests without credentials while enforcing credentials where auth is used; update env templates/ignore/tracking intentionally. **Exclude:** migrating legacy tests, auth, Docker, general plugin/config architecture.

**Priority/dependencies/effort:** P1; 001; 2–3 hours; I. Learning: config composition, dotenv precedence, test discovery, minimal vertical slices.

**Reuse:** ApiClient, test/expect base fixture, config schemas/loader and reporting conventions. **Proposed changes:** `playwright.toolshop.config.ts`, `tests/api/toolshop/catalog.spec.ts`, focused config/schema/fixture changes, `.env.example`, `.gitignore`; don't put actual credentials in any tracked env file. If untracking current env files, retain local copies and review the diff; no history rewriting.

| Scenario ID | Test layer  | Preconditions and data                                      | Actions or request                        | Exact expected result                                                                                                                                                                      | Evidence/source       | Cleanup                                  |
| ----------- | ----------- | ----------------------------------------------------------- | ----------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ---------------------------------------- |
| 002-A       | API smoke   | Paired Sprint 5 URLs; no auth                               | GET `/products?page=1`                    | 200; object with array `data`; seeded public catalog contains at least one item; each consumed ID is string. Nonempty is an explicit smoke availability assumption, not an OpenAPI minimum | D2/O5; P availability | No backend writes                        |
| 002-B       | Config unit | File target A and process target B using harmless test URLs | Resolve config                            | Process B wins; no credentials required for anonymous selection                                                                                                                            | P precedence decision | Restore modified process variables/files |
| 002-C       | Config unit | Toolshop UI plus api-v1                                     | Validate paired target                    | Configuration fails before network execution with a clear mismatch message                                                                                                                 | D1 + P guard          | Restore environment                      |
| 002-D       | Collection  | Both configs installed                                      | List legacy and Toolshop specs separately | Toolshop config selects only intended Toolshop API spec; legacy config does not select it; no auth setup/browser dependency                                                                | P boundary            | None                                     |

**Acceptance:** one actual catalog test passes with one worker/zero retries; listing proves no accidental legacy/auth execution; URL metadata shows paired hosts; blank auth allowed only for anonymous work; authenticated fixture retains a clear missing-credentials failure; focused precedence/isolation tests pass; template-only tracked environment policy demonstrated. Account for the existing unit test expecting global missing-credentials rejection when moving that validation boundary.

**Hints:** Keep the first response schema tiny and label it a consumed-field check; SDET-003 expands it. Reuse base fixture rather than copy client creation into tests. Don't add a new environment name just to mean a different application. Do not solve env overrides by editing CI secrets repeatedly.

**Run/debug:** `npm run test:unit -- --workers=1`; `npm run typecheck`; proposed API invocation with `--list`, then without; `npm run validate` and distinguish pre-existing format failures from your diff. Avoid global `npm run format` on unrelated files.

**Review evidence / common mistakes:** sanitized config metadata, spec lists, diff of env policy, passing test and one altered expected-status failure. Don't use `.env.*` ignore without preserving `.env.example` templates; don't assume ignore removes tracked files; don't disable TLS verification for the new target merely because legacy config does.

### SDET-003 — Validate product list and detail with meaningful assertions

**Problem / risk / outcome:** A JSON response or 200 does not establish the correct product. Verify runtime-discovered identity and usable product fields without volatile IDs.

**Scope:** product consumed-field schemas, paginated envelope, list-to-detail ID/name/price mapping. **Exclude:** generated client/types, strict equality of whole payloads, unknown-ID policy and catalog mutation.

**Priority/dependencies/effort:** P1; 002; 2 hours; I. Learning: Zod inference, documented versus consumer requirements, exact HTTP assertions, independent assertions.

**Reuse:** getValidated/getRaw, z.infer, base fixtures; don't reuse numeric branded IDs or ApiUsersSchema. **Proposed changes:** `schemas/toolshop/product.schemas.ts`, `utils/toolshop-endpoints.ts`, extend catalog spec. Accept extra fields; specify required consumed fields as an explicit consumer decision.

| Scenario ID | Test layer  | Preconditions and data                                | Actions or request                                                  | Exact expected result                                                                                                          | Evidence/source                                                | Cleanup |
| ----------- | ----------- | ----------------------------------------------------- | ------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------- | ------- |
| 003-A       | API         | Anonymous; current product list                       | GET `/products?page=1`                                              | 200; pagination current_page is 1; data array items expose string id/name, numeric price; consumed booleans have boolean types | D2/O5; P consumed requiredness                                 | None    |
| 003-B       | API         | Select one list item at runtime, retain id/name/price | GET `/products/{selectedId}`                                        | 200; returned id equals selected ID; name/price equal list snapshot if no catalog change occurred between requests             | D2; P cross-endpoint consistency, not yet observed detail HTTP | None    |
| 003-C       | Schema unit | Synthetic public-product-shaped fixture               | Replace id with numeric value; separately replace price with string | Product consumer schema rejects each malformed consumed field                                                                  | D2 type declarations                                           | None    |

**Acceptance:** no fixed ID/name/price/count; no non-null assertions without a useful precondition failure; list and detail use exact status; extra additive response fields do not break the consumer schema; error identifies the field; readback is identified as cross-endpoint consistency, not an independent oracle for true price correctness. If public catalog changes mid-test, record fixture drift rather than retry until green.

**Hints:** Don't turn every OpenAPI property into required without explaining why the test consumes it. A detail response schema is not a test-data builder. Use explicit 200 even when helper defaults to it. A separate local fixture is the way to prove business price rules later.

**Run/debug:** proposed API command scoped to `tests/api/toolshop/catalog.spec.ts`; unit command; typecheck; inspect schema failure using a synthetic fixture, not a modified public product.

**Review evidence / common mistakes:** show observed list/detail public fields, schema decisions, one intentional schema rejection and one wrong-ID assertion failure. Avoid a schema that makes every field optional, string-coercing prices, snapshots of descriptions, or `status >= 400` negative assertions.

### SDET-004 — Anonymous catalog-to-detail UI vertical slice

**Problem / risk / outcome:** API correctness does not prove a shopper can select an item and view the right detail. Exercise the real UI/backend path without login.

**Scope:** proposed `toolshop-ui` Chromium project, CatalogPage/ProductPage actions and one integrated navigation test. **Exclude:** cart, login, screenshots as visual regression, cross-browser expansion.

**Priority/dependencies/effort:** P1; 003; 2–3 hours; I. Learning: locator scoping, retrying assertions, page-object boundaries, cross-layer mapping.

**Reuse:** BasePage, fixtures, `data-test` setting. **Proposed changes:** `pages/toolshop/CatalogPage.ts`, `ProductPage.ts`, `fixtures/toolshop.fixture.ts`, `tests/ui/toolshop/catalog.spec.ts`; new UI project without Sauce setup dependency. Legacy classes remain readable reference examples.

| Scenario ID | Test layer             | Preconditions and data                                                          | Actions or request                                                             | Exact expected result                                                                                     | Evidence/source                      | Cleanup                |
| ----------- | ---------------------- | ------------------------------------------------------------------------------- | ------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------- | ------------------------------------ | ---------------------- |
| 004-A       | Integrated UI          | Fresh anonymous context, runtime-discovered visible product; no mocked requests | Open `/`, capture selected card's product identity/name/price; follow its link | URL is `/product/<selectedId>`; H1 matches captured name; unit-price equals captured price; quantity is 1 | O1/O3; P general mapping expectation | Close context          |
| 004-B       | UI assertion challenge | Local fixture/mock or temporary wrong expected name                             | Exercise same detail assertion                                                 | Wrong expected name fails at product identity assertion, not only URL or visibility                       | P test effectiveness                 | Restore assertion/mock |

**Acceptance:** project collection contains no Sauce setup; actual backend serves journey; no hardcoded sample product; assert selected identity and price, not just “heading visible”; locators use observed semantic link/heading and `unit-price`/`quantity` IDs; all assertions retry; no arbitrary waits. The price parity assertion cannot detect a shared incorrect price in both pages—state that limit.

**Hints:** Scope catalog product links so footer and related links cannot match. Read the observed card href to obtain the runtime ID. Inspect card DOM before introducing any new test ID; O3 confirms detail IDs only. GetByTestId uses `data-test` in this repo. Browser viewport can hide navigation behind Toggle navigation and Filters.

**Run/debug:** proposed UI command scoped to catalog spec, first `--list`, then `--trace=retain-on-failure`; add `--debug` for locator inspection; `npm run report` after HTML output. `--no-deps` is not the permanent fix for an incorrect project graph.

**Review evidence / common mistakes:** passing journey, trace on intentionally failed name assertion, scoped locator rationale, project dependency list. Do not choose the first arbitrary page link or rely on immediate `.count()` while the grid loads.

### SDET-005 — Search empty results and clear behavior

**Problem / risk / outcome:** Stale results can mislead shoppers, and empty results already expose a contract discrepancy. Cover the UI state transition and make the API difference reviewable.

**Scope:** no-match API characterization plus UI search/clear; document nullable pagination discrepancy and exact matching-rule unknowns. **Exclude:** inventing case/whitespace semantics, every filter combination, treating an observed response as a product requirement.

**Priority/dependencies/effort:** P2; 004; 2–3 hours; I. Learning: state transitions, business versus contract oracles, characterization tests, evidence-based defect reporting.

**Reuse:** catalog page/fixture, ApiClient, product schemas. **Proposed changes:** `tests/api/toolshop/search.spec.ts`, `tests/ui/toolshop/search.spec.ts`, catalog actions, `docs/PST-CONTRACT-DISCREPANCIES.md`.

| Scenario ID | Test layer           | Preconditions and data                                                                                      | Actions or request                                          | Exact expected result                                                                                                                                                           | Evidence/source | Cleanup       |
| ----------- | -------------------- | ----------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------- | ------------- |
| 005-A       | API characterization | Anonymous; controlled absent term locally, or freshly generated traceable improbable term on public catalog | GET `/products/search?q=<encodedTerm>`                      | Documented 200; empty data/total 0 when term is absent; observed pagination from/to null. Keep this compatibility expectation distinct from literal spec's integer declarations | D2/O7           | None          |
| 005-B       | UI                   | Fresh catalog, same absent term                                                                             | Expand Filters if needed; fill Search textbox; press Search | Text `0 products found for '<term>'` appears; prior product cards absent                                                                                                        | O2              | Close context |
| 005-C       | UI                   | Empty-result state from preceding actions in the same test                                                  | Click X                                                     | Search-result message disappears and catalog product links return                                                                                                               | O2              | Close context |
| 005-D       | Contract review      | Saved spec and empty response                                                                               | Compare pagination types                                    | Recorded discrepancy names operation, fields, actual null vs declared integer, sanitized reproduction, and decision owner                                                       | D2/O7           | None          |

**Acceptance:** UI does not pass with stale cards; clear is verified as a transition, not a standalone order-dependent test; no schema silently changes “integer” into nullable without the discrepancy note; no-match data precondition is explicit. For a deterministic assertion use a local known catalog; public random terms make collisions unlikely, not impossible. If one matches, report test-data precondition failure rather than a product defect.

**Hints:** Use the observed textbox/button roles; duplicate “Search” text alone is ambiguous. Avoid automatic broad `.catch()` that treats request failures as zero results. Distinguish API empty results from failed API requests. Do not derive a missing-q status from unrelated validation endpoints.

**Run/debug:** proposed API and UI commands scoped to search specs with one worker; UI trace on failure, report; unit schema checks if compatibility handling changes; validate changed files.

**Review evidence / common mistakes:** sanitized empty response, UI state evidence, exact discrepancy write-up, failed stale-card assertion using a controlled response. Open questions for later discovery: substring versus token matching, case folding, blank query, missing q, and pagination when filtering shrinks results.

## Remaining tickets: scoped summaries and scenario contracts

These are intentionally shorter than the first five. All inherit run/review conventions above and the index's priority, dependencies, effort and difficulty. On “Start SDET-XXX,” expand the selected ticket using current evidence before implementation. An unknown status/body/locator is a discovery gate, never an invitation to guess.

### SDET-006 — Redacted diagnostics

Risk/outcome: failures must be diagnosable without leaking tokens. Reuse ApiClient/errors/logger; change their diagnostic output and focused unit tests, not transport architecture. Learn typed failures and redaction. Exclude new logging dependency.

| Scenario ID | Test layer | Preconditions and data                                    | Actions or request                     | Exact expected result                                                                                         | Evidence/source          | Cleanup                    |
| ----------- | ---------- | --------------------------------------------------------- | -------------------------------------- | ------------------------------------------------------------------------------------------------------------- | ------------------------ | -------------------------- |
| 006-A       | Unit       | Synthetic response containing token/password/email fields | Trigger wrong status/schema/JSON paths | Logs/errors preserve method, sanitized path and status, omit secret values; HTML error retains status context | R1 + P diagnostic policy | Remove synthetic artifacts |

Acceptance/evidence: deliberate failures prove useful, redacted output; inspect report as well as console. Run unit/typecheck/validate. Mistake: masking only Authorization while raw bodies or screenshots still expose secrets.

### SDET-007 — Discover authentication and cleanup before fixtures

Risk/outcome: session reuse and user deletion assumptions can break isolation. Reuse saved spec and existing auth setup as a pattern, not implementation. Proposed auth/data decision note. Learn token storage and lifecycle. Exclude shared default users and automated state reuse.

| Scenario ID | Test layer        | Preconditions and data             | Actions or request                                                                                           | Exact expected result                                                                                                                                   | Evidence/source            | Cleanup                                        |
| ----------- | ----------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------- | ---------------------------------------------- |
| 007-A       | Discovery         | Isolated real Toolshop; owned user | Inspect UserRequest, register, POST `/users/login` with email/password, GET `/users/me` with returned Bearer | Registration documents 201/UserResponse, login 200/token, me 200/UserResponse. Record actual required registration fields/validation and identity match | D2; live writes unobserved | Verify owned-user cleanup or local reset first |
| 007-B       | Browser discovery | Same owned user                    | UI login and inspect storage mechanism; restore fresh context                                                | Record cookie/localStorage/sessionStorage/IndexedDB location and observed restoration behavior; no assumed storageState solution until evidence exists  | O4 + unknown               | Dispose contexts and owned user                |

Acceptance/evidence: sanitized storage keys, lifetime, cleanup method/status/permissions and failure-path plan; no token values. Investigate documented DELETE `/users/{userId}` permissions locally, never delete a default account. Run no new suite required; use API/browser inspection. Mistake: assuming token response means localStorage, or using storageState for sessionStorage without verification.

### SDET-008 — Owned test-user fixture

Risk/outcome: parallel tests must not mutate one shared account. Reuse uniqueSuffix and fixture lifecycle; proposed Toolshop owned-user fixture and minimal registration factory. Learn test versus worker scope. Exclude an elaborate builder or suite-global mutable user.

| Scenario ID | Test layer          | Preconditions and data                   | Actions or request                                                                         | Exact expected result                                                       | Evidence/source  | Cleanup                                              |
| ----------- | ------------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------- | ---------------- | ---------------------------------------------------- |
| 008-A       | Fixture integration | 007 decisions and local real environment | Create two traceable users; restore each in fresh browser context using verified mechanism | Each `/users/me` identity matches its own created user; no cross-user state | D2 + P isolation | Verified teardown, including deliberate test failure |

Acceptance/evidence: two independent users, teardown runs after intentional failure, leaked-ID manifest sanitized, original assertion failure preserved if cleanup also fails. Start test-scoped; worker scope only for read-only sharing. API setup credentials never enter VCS. Run scoped API/UI locally, one worker; controlled two-worker check only locally. Mistake: treating unique email as sufficient cleanup or reporting cleanup failure as test success.

### SDET-009 — Identity and anonymous authorization

Risk/outcome: protected information must require a valid identity. Reuse owned-user fixture and raw request; proposed auth spec. Learn authorization versus authentication. Exclude exhaustive lockout/token expiry until verified.

| Scenario ID | Test layer         | Preconditions and data           | Actions or request                 | Exact expected result                                                                                                                      | Evidence/source  | Cleanup            |
| ----------- | ------------------ | -------------------------------- | ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | ---------------- | ------------------ |
| 009-A       | API                | Fresh request context, no token  | GET `/users/me`; GET `/invoices`   | Each 401, message Unauthorized; no user/invoice data                                                                                       | D2/O6            | Dispose request    |
| 009-B       | API                | Own valid user/token             | GET `/users/me` Bearer token       | 200/UserResponse; id/email equal owned user                                                                                                | D2 + 007         | Owned-user fixture |
| 009-C       | Discovery then API | Local own user, invalid password | POST `/users/login` email/password | Exact failure status/body must be established in 007/this ticket; no authenticated identity after failure; don't hardcode undocumented 401 | D2 gap; P denial | Owned-user fixture |

Acceptance/evidence: exact anonymous statuses, independent contexts, token redaction, no broad >=400 checks. Run scoped API; one UI successful login can be added only if within timebox and inspected identity outcome is known. Mistake: interpreting a 500 as denied access.

### SDET-010 — Discover cart rules and ownership

Risk/outcome: incomplete cart schema cannot support reliable state assertions. Reuse spec, raw request, product discovery; proposed cart decision note. Learn state modeling. Exclude production/admin records.

| Scenario ID | Test layer    | Preconditions and data              | Actions or request                                                                                      | Exact expected result                                                                                                                                                      | Evidence/source        | Cleanup                                                                    |
| ----------- | ------------- | ----------------------------------- | ------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------- | -------------------------------------------------------------------------- |
| 010-A       | API discovery | Local owned cart, available product | POST `/carts` (no body documented), POST `/carts/{id}` `{product_id,quantity:1}`, GET `/carts/{cartId}` | Documented 201/id then 200/result then 200; inspect actual lines/totals and storage ownership. Determine repeat-add, quantity 0/-1/fraction/max and exact rejection bodies | D2, unknown boundaries | DELETE own `/carts/{cartId}` documents 204; prove readback outcome locally |

Acceptance/evidence: response shape, cart ID storage, safe cleanup, ownership/access policy and boundary decision table; explicit open questions if contract conflicts. No guessing maximum stock or 422 for every case. Run focused local discovery. Mistake: assuming anonymous cart IDs are protected user resources.

### SDET-011 — Cart state transitions through API

Risk/outcome: successful writes may not change cart state correctly. Reuse ApiClient/raw request and 010 decisions; proposed cart fixture/spec. Learn persistence and teardown. Exclude UI and full checkout.

| Scenario ID | Test layer   | Preconditions and data                     | Actions or request                                                                          | Exact expected result                                                                                                          | Evidence/source       | Cleanup                       |
| ----------- | ------------ | ------------------------------------------ | ------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | --------------------- | ----------------------------- |
| 011-A       | API          | Own local cart; available product          | Add qty 1; PUT `/carts/{cartId}/product/quantity` `{product_id,quantity:2}`; GET after each | Writes 200; readbacks identify selected product with quantity 1 then 2 using verified 010 shape; totals follow agreed 010 rule | D2 + 010 gate         | Delete owned cart in teardown |
| 011-B       | API          | Own cart with one item                     | DELETE `/carts/{cartId}/product/{productId}`, GET cart                                      | Delete 204; subsequent cart read proves item absent                                                                            | D2 + 010              | Delete cart                   |
| 011-C       | API boundary | Owned cart; invalid quantity chosen by 010 | PUT quantity                                                                                | Exact rejection status/body from 010; GET proves prior state unchanged                                                         | 010 required decision | Delete cart                   |

Acceptance/evidence: readback after each write, invalid update leaves state unchanged, failure cleanup demonstrated. Run scoped local API. Mistake: reusing POST helper's default 201 for add/update or asserting only result string.

### SDET-012 — UI cart identity and quantity

Risk/outcome: badge-only tests miss wrong products. Reuse ProductPage and cart fixture; proposed CartPage only after observing cart UI. Learn integrated assertions. Exclude payments.

| Scenario ID | Test layer    | Preconditions and data                          | Actions or request                                                 | Exact expected result                                                                                                                           | Evidence/source           | Cleanup                            |
| ----------- | ------------- | ----------------------------------------------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- | ---------------------------------- |
| 012-A       | Integrated UI | Fresh context/own cart; selected available item | Add using observed Add to cart; open cart via inspected navigation | Cart row matches selected identity, quantity and price; quantity edit and total obey 010 rules; exact cart locator/route must first be observed | O3 + 010; cart UI unknown | Own cart teardown/context disposal |

Acceptance/evidence: line identity and independently calculated subtotal under agreed rule; verify wrong-product defect fails even with badge 1. Run scoped UI/trace locally first. Mistake: copying Sauce cart URL or using API result as sole oracle for its own arithmetic.

### SDET-013 — Sort and pagination

Risk/outcome: shoppers miss items or see wrong price ordering. Reuse catalog schemas, API client; proposed catalog ordering spec. Learn numeric ordering and pagination invariants. Exclude locale name collation.

| Scenario ID | Test layer | Preconditions and data                 | Actions or request                    | Exact expected result                                                                                                          | Evidence/source          | Cleanup          |
| ----------- | ---------- | -------------------------------------- | ------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------ | ------------------------ | ---------------- |
| 013-A       | API        | Anonymous list, nonempty fixture       | GET `/products?sort=price,asc&page=1` | 200; numeric prices nondecreasing; equal prices allowed                                                                        | D2/O5                    | None             |
| 013-B       | API        | Fixed local catalog spanning two pages | GET successive pages using same sort  | 200; current_page follows requested valid page; union matches controlled eligible fixture IDs without duplicates/missing items | D2 + P fixture invariant | Local seed reset |

Acceptance/evidence: wrong numeric order fails; tie order not invented; no public fixed total/page size. Run scoped API; one UI sort wiring check optional within timebox. Mistake: lexicographic price sorting or pagination completeness against a changing public catalog.

### SDET-014 — Filters and price edges

Risk/outcome: incorrect inclusion/exclusion. Reuse API products and catalog controls. Proposed filter spec/decision table. Learn equivalence classes and boundaries. Exclude exhaustive combinatorics.

| Scenario ID | Test layer             | Preconditions and data                | Actions or request                             | Exact expected result                                                                                                | Evidence/source              | Cleanup     |
| ----------- | ---------------------- | ------------------------------------- | ---------------------------------------------- | -------------------------------------------------------------------------------------------------------------------- | ---------------------------- | ----------- |
| 014-A       | API                    | Known local category/brand membership | GET `/products?by_category=<id>&by_brand=<id>` | 200; exact expected fixture ID set under confirmed intersection rule; first verify combination semantics             | D2 + P intersection          | Local reset |
| 014-B       | API discovery/boundary | Local prices 9.99,10,20,30,30.01      | GET `/products?between=price,10,30`            | Record and resolve inclusive/exclusive 10/30 rule before executable assertions; exact set then follows that decision | D2 format; endpoints unknown | Local reset |

Acceptance/evidence: filter cannot pass vacuously with empty results; independent expected fixture set. Run scoped local API. Mistake: assuming inclusive range or using response-filtered values as expected results.

### SDET-015 — Discover checkout, profile and history

Risk/outcome: invoice/ownership tests need real business rules. Reuse owned users/carts and D2. Proposed workflow decision note, no broad implementation. Learn transaction boundaries and independent oracles. Exclude real payments and public account mutations.

| Scenario ID | Test layer | Preconditions and data | Actions or request                                                                          | Exact expected result                                                                                                                                                  | Evidence/source   | Cleanup                   |
| ----------- | ---------- | ---------------------- | ------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | ------------------------- |
| 015-A       | Discovery  | Local own user/cart    | Inspect checkout UI and InvoiceRequest; use one documented simulated payment method locally | Establish required billing/payment fields, subtotal/tax/shipping/rounding, submit outcome, invoice ID/navigation and readback. POST `/invoices` documents 200, not 201 | D2; UI unverified | Local reset/owned cleanup |
| 015-B       | Discovery  | Same own user          | Inspect account edit and history routes/labels and documented user update operations        | Record exact editable field rules, update status/body, persisted outcome, history empty/populated behavior; identify supported locators                                | D2; UI unknown    | Restore/delete owned data |

Acceptance/evidence: resolve enough for one checkout, one profile field and invoice listing; freeze optional variants out of scope. Never invent tax/shipping assumptions. Run local browser/API discovery. Mistake: treating visible total as an independent expected total.

### SDET-016 — Checkout to persisted invoice

Risk/outcome: UI success without saved order. Reuse verified 015 fields, own fixtures and pages; proposed checkout integration spec. Learn end-to-end transaction verification. Exclude every payment method and failure branch.

| Scenario ID | Test layer        | Preconditions and data                 | Actions or request                                                                | Exact expected result                                                                                                                      | Evidence/source | Cleanup                                      |
| ----------- | ----------------- | -------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------ | --------------- | -------------------------------------------- |
| 016-A       | Integrated UI/API | Local controlled prices, own user/cart | Complete one inspected checkout path; GET `/invoices/{invoiceId}` with own Bearer | Documented read 200; persisted items/quantities and agreed computed totals match controlled input; UI confirmation references same invoice | D2 + 015 gate   | Local reset; invoice cleanup policy from 015 |

Acceptance/evidence: no success-toast-only assertion; one independent totals calculation; persistence proof; failure cleanup. Run scoped local UI/API with trace. Mistake: expecting POST invoice 201 because client defaults to it, or asserting guessed invoice response fields.

### SDET-017 — Account and invoice isolation

Risk/outcome: cross-user data access. Reuse two-user fixture, 015 decisions; proposed authorization spec. Learn ownership rules and non-disclosure. Exclude admin tests on public demo.

| Scenario ID | Test layer | Preconditions and data                 | Actions or request                                                            | Exact expected result                                                                                                               | Evidence/source                                    | Cleanup                       |
| ----------- | ---------- | -------------------------------------- | ----------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------- | ----------------------------- |
| 017-A       | API        | Two local users A/B; invoices for each | GET `/invoices` separately with each Bearer                                   | 200; A list excludes B records and vice versa, own fixture invoices present                                                         | D2 explicitly restricts user lists                 | Local reset                   |
| 017-B       | API        | Same controlled users                  | B requests `/invoices/{A-invoice}`; attempts one verified profile update on A | No disclosure/change proposed; exact denial statuses/body must be agreed from 015 contract/implementation evidence before asserting | P security requirement; detail denial code unknown | Prove A unchanged, then reset |
| 017-C       | API        | Own A profile                          | Update one allowed field using verified method, then GET `/users/me`          | Exact update status from 015; me 200 reflects requested field, identity unchanged                                                   | 015                                                | Restore/delete own user       |

Acceptance/evidence: distinguish list filtering from object-level authorization, request contexts truly separate, 500 never passes rejection. Run local scoped API. Mistake: shared headers or checking only HTTP status without non-disclosure/readback.

### SDET-018 — Mocked catalog error presentation

Risk/outcome: network errors may appear as empty inventory. Reuse route mocks and real CatalogPage; proposed mocked Toolshop UI spec/project selection. Learn controlled faults. Exclude claiming backend resilience.

| Scenario ID | Test layer | Preconditions and data                                | Actions or request                               | Exact expected result                                                                                                                                                        | Evidence/source                                          | Cleanup                       |
| ----------- | ---------- | ----------------------------------------------------- | ------------------------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- | ----------------------------- |
| 018-A       | Mocked UI  | Real Toolshop frontend; actual request route from 001 | Intercept catalog response with failure or abort | First inspect current behavior and agree explicit error/retry outcome; no guessed copy. Verify no stale products and no false zero-results success once expectation approved | P UX requirement; existing mocks are synthetic page only | Remove routes/dispose context |

Acceptance/evidence: interception is proven, fixture matches real consumed schema, assertions distinguish error from empty state, mock excluded from integration claims. Run proposed mock selection plus list; record intentionally injected response. Mistake: keeping setContent and calling it Toolshop coverage.

### SDET-019 — CI tiers and conservative concurrency

Risk/outcome: unintended targets or aggregate parallel load. Reuse PR/nightly/mock actions and scripts; proposed narrow Toolshop workflow changes. Learn CI collection and trust boundaries. Exclude report-platform replacement or sharding public smoke.

| Scenario ID | Test layer    | Preconditions and data                  | Actions or request                                                   | Exact expected result                                                                                                        | Evidence/source     | Cleanup          |
| ----------- | ------------- | --------------------------------------- | -------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------- | ---------------- |
| 019-A       | CI/collection | Proposed config, tags and target inputs | List PR/nightly/mock selections; execute public smoke conservatively | PR selects agreed read-heavy smoke, no legacy/auth/admin surprise; worker 1 and aggregate job concurrency bounded; retries 0 | P suite policy + R1 | Artifacts expire |
| 019-B       | Config/CI     | Missing secret or mismatched hosts      | Resolve environment                                                  | Anonymous tier can run; auth tier fails clearly if required data absent; no silent fallback to old apps                      | P + 002             | None             |

Acceptance/evidence: sanitized lists, workflow run link when available, flaky/environment classification, explicit quarantine exclusion if used, mock paths included in triggers. API business regression belongs in isolated local CI service when it mutates data. Run list/validate then authorized CI branch run; don't merge/publish merely for this ticket. Mistake: one worker per job but seven simultaneous public jobs.

### SDET-020 — Diagnostic effectiveness and small browser matrix

Risk/outcome: failures without usable evidence slow learning. Reuse reporters, blob merge, trace/video settings; proposed diagnostic notes and one stable catalog journey in other browsers. Learn failure classification and artifact review. Exclude blanket UI duplication and arbitrary performance budgets.

| Scenario ID | Test layer    | Preconditions and data                       | Actions or request                             | Exact expected result                                                                     | Evidence/source     | Cleanup                            |
| ----------- | ------------- | -------------------------------------------- | ---------------------------------------------- | ----------------------------------------------------------------------------------------- | ------------------- | ---------------------------------- |
| 020-A       | UI/diagnostic | Local synthetic assertion failure, retries 0 | Run catalog with retain-on-failure             | First failure has trace/screenshot and useful assertion; artifact contains no auth secret | R1 issue + P policy | Remove synthetic failure/artifacts |
| 020-B       | Cross-browser | Same controlled read-only journey            | Run Chromium/Firefox/WebKit serially or capped | Same business assertions hold; failures categorized rather than retried away              | P browser policy    | Context teardown                   |

Acceptance/evidence: open merged report, locate root cause from recorded evidence, verify HTML/blob artifact expectations and retention; keep authenticated reports private unless sanitized. Run scoped browser projects only once added, report and relevant checks. Mistake: assuming on-first-retry captures a zero-retry failure, or publishing raw authenticated traces to Pages.

## 6. Recommended first ticket and mentoring workflow

Start **SDET-001**. It closes the request-host evidence gap and explains why a URL-only migration is unsafe. It is deliberately short; SDET-002 immediately produces a real catalog API test, and SDET-004 adds a shopper journey without waiting for an authentication framework.

When you say **“Start SDET-XXX”**, we will read the exact existing code relevant to that ticket, resolve its gated expectations, outline a small implementation plan and give incremental hints. You implement; complete code is supplied only when requested. Review will cover acceptance criteria, intended-defect detection, isolation, cleanup, diagnostics and unnecessary complexity—not merely a green result. Each ticket ends with a few focused understanding questions.

Existing unrelated working-tree changes at investigation start: `docs/README.md` modified and `docs/AGENTIC-QA-ROADMAP.md` untracked. They were left intact.
