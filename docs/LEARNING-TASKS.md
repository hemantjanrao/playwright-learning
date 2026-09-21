# Medium–hard learning tasks

Hands-on **SDET** work for this repository. These tickets assume you already know the map (lessons 01–11) and can complete a 45-minute UI spec. They are **not** a replacement for [LEARNING-BACKLOG.md](./LEARNING-BACKLOG.md).

| Track | File | Difficulty | Purpose |
| ----- | ---- | ---------- | ------- |
| Warmup / repo gaps | [LEARNING-BACKLOG.md](./LEARNING-BACKLOG.md) | Beginner–intermediate | Fix real Sauce Demo holes; 45–90 min |
| **This file** | `LEARNING-TASKS.md` | **Medium–hard** | Build and defend framework, Playwright, TypeScript, and CI skills |

Playwright lockfile version: **1.61.0**. Check compatibility before using APIs newer than that.

---

## Verdict on T-01–T-12

They are **not** complex enough to teach this framework, Playwright, TypeScript, or programming in depth.

They **are** a strong warmup: locators, a second page object, thinning duplicate specs, a config one-liner, one MSW 404, `test.each`, `try/finally`, a popup, and a practice trace. Almost every ticket is a **small repo-need**, scoped so you cannot gold-plate. That is good for T-01. It is the wrong altitude for “I want to learn this stack.”

| What you need for an SDET job | What T-01–T-12 actually force you to do |
| ----------------------------- | --------------------------------------- |
| Write a typed fixture layer | Forbidden (T-04: do not invent a fixture) |
| Dual HTTP clients (`request` vs `fetch`) | Consume `getResult` once (T-06) |
| Error taxonomy + `instanceof` | Never |
| `z.infer`, `omit`, contract drift | Never design a schema |
| Branded types | Unused (and `userById` still accepts `number`) |
| Worker vs test fixture scope | Never |
| Testcontainers **mappings** | Never (only call existing stubs) |
| `waitForResponse` / route 500 | `page.route` exists; no ticket |
| `storageState` for a second persona | Thin specs only (T-04) |
| Workers vs shards vs blob merge | T-07 is `testIgnore` + path filter |
| Composite GitHub Actions | Never |
| Throw vs `Result`, DRY, isolation | One `try/finally` (T-10) |

**How to use both files:** finish or skip warmup tickets that unblock a task (noted per ticket). Do **not** grind all twelve T-tickets first if you already understand locators and `authenticatedTest`.

---

## Task format (why this shape)

Warmup tickets optimize for a clean PR. These optimize for **struggle + explanation**. A medium–hard task is a 2–5 hour design problem with a small implementation, not a checklist of clicks.

Every ticket below uses this template. Use it if you add more tasks.

```markdown
## H-XX — Problem statement (not the solution)

| Field | Value |
| **Difficulty** | Medium or Hard |
| **Effort** | 2–5 hours (not 45 minutes) |
| **Tracks** | Framework · Playwright · TypeScript · Programming · DevOps |
| **Layer** | unit / api / api-mock / ui / ci |
| **Mentor** | Senior SDET · Framework Coach · DevOps |

### You will be able to
Measurable outcomes (explain + implement).

### Why this is hard
The trap a junior hits. Read this before coding.

### Evidence
Real files in this repo (not a blog).

### Mentor gate (chat, before any code)
Questions you must answer. Mentor challenges the design; does not paste the solution.

### Constraints
Out of scope + instant-reject anti-patterns.

### Scope
What to change. Smallest design that proves the concept.

### Files you may touch
Allow-list. If you need another file, justify it in the gate.

### Prerequisites
Lessons and/or warmup tickets.

### Acceptance criteria
Implementation + **red-first proof** + oral exam.

### Verification
Exact commands. Paste output in chat. Do not claim green without evidence.

### Design decisions (oral exam)
If you cannot answer these from *this repo’s files*, the ticket is not done.
```

**How we work**

1. Read the ticket, evidence files, and architecture section.
2. Pass the **mentor gate** in chat (approach only).
3. Implement the smallest red proof, then the fix.
4. Recap in your own words; pick the next ticket.

Do not implement until the mentor has challenged the design.

---

## Status

| ID | Title | Difficulty | Tracks | Status |
| -- | ----- | ---------- | ------ | ------ |
| [H-01](#h-01--prove-throw-vs-result-on-apiclient) | Prove throw vs Result on `ApiClient` | Medium | TS · Programming · Framework | **Next** |
| [H-02](#h-02--close-the-dual-http-client-contract) | Close the dual HTTP-client contract | Hard | Framework · TS · Programming | Open |
| [H-03](#h-03--prove-msw-worker-scope-cannot-leak-handlers) | Prove MSW worker-scope cannot leak handlers | Hard | Playwright · Framework | Open |
| [H-04](#h-04--wiremock-must-stub-the-same-post-posts-contract) | WireMock must stub `POST /posts` | Hard | Framework · Playwright | Open |
| [H-05](#h-05--wait-on-the-response-not-the-clock) | Wait on the response, not the clock | Medium | Playwright | Open |
| [H-06](#h-06--evolve-a-zod-contract-without-lying-to-typescript) | Evolve a Zod contract without lying to TypeScript | Hard | TS · Framework | Open |
| [H-07](#h-07--branded-ids-must-reject-the-wrong-resource) | Branded IDs must reject the wrong resource | Medium | TS · Programming | Open |
| [H-08](#h-08--compose-a-typed-ui-fixture-layer) | Compose a typed UI fixture layer | Hard | Framework · Playwright · TS | Open |
| [H-09](#h-09--second-persona-storagestate) | Second-persona `storageState` | Hard | Playwright · Framework | Open |
| [H-10](#h-10--prove-parallel-workers-cannot-collide) | Prove parallel workers cannot collide | Medium | Programming · Playwright | Open |
| [H-11](#h-11--reproduce-nightly-sharding-locally) | Reproduce nightly sharding locally | Hard | DevOps · Playwright | Open |
| [H-12](#h-12--make-mock-ci-honest) | Make mock CI honest | Hard | DevOps | Open |
| [H-13](#h-13--capstone-wrong-layer-pr-review) | Capstone: wrong-layer PR review | Hard | All mentors | Open |
| [H-14](#h-14--capstone-glitch-user-without-sleeps) | Capstone: glitch user without sleeps | Hard | Playwright · SDET | Open |

**Suggested order:** H-01 → H-07 → H-02 → H-03 → H-05 → H-04 → H-06 → H-10 → H-08 → H-09 → H-11 → H-12 → H-13 → H-14.

Update **Status** to `In progress` / `Done` as you close tickets. Concepts are tracked at the [bottom](#coverage-matrix).

---

## Coverage matrix (curriculum → this file)

What “learn everything in *this* repo” actually means. Items marked **warmup only** are T-tickets; do not redo them here.

| Concept | Lesson / doc | Ticket | Notes |
| ------- | ------------ | ------ | ----- |
| Repo map, 8 projects | L01–L02 | H-11, H-12 | Warmup T-07 is `testIgnore` only |
| Fixtures, `extend`, scopes | L03, ARCH §3 | H-03, H-08, H-09 | **Missing from warmup** |
| POM + locators | L04–L05 | H-08 | Warmup T-01, T-02, T-08 |
| `storageState` | L06 | H-09 | Warmup T-04 is thinning, not design |
| API contracts, clients | L07, ARCH §5 | H-01, H-02 | Warmup T-06 is one 404 |
| Zod, `z.infer`, branded types | L08, `typescript-concepts.md` | H-06, H-07 | **Missing from warmup** |
| Tags, PR vs nightly | L09 | H-11, H-12 | Warmup T-07 path filter |
| Traces, failure class | L10 | H-14 | Warmup T-05, T-12 |
| MSW / WireMock / `page.route` | L11, ARCH §6 | H-03, H-04, H-05 | Warmup never writes a mapping |
| Generics, unions, `asserts` | `typescript-concepts.md` | H-01, H-02 | |
| Workers, shards, blobs | ARCH §7 | H-10, H-11 | **Missing from warmup** |
| Composite Actions, secrets | DevOps skill | H-12 | |
| Throw vs Result, DRY, isolation | Programming | H-01, H-02, H-03, H-10 | Warmup T-10 only |
| Risk-based layer choice | ARCH §8 | H-13 | |

Out of scope for the whole curriculum (do not invent tickets): file upload, download, iframes, visual snapshots against Sauce Demo, a fourth mock tool.

---

## H-01 — Prove throw vs Result on `ApiClient`

| Field | Value |
| ----- | ----- |
| **Difficulty** | Medium |
| **Effort** | 2–3 h |
| **Tracks** | TypeScript · Programming · Framework |
| **Layer** | `unit` |
| **Mentor** | Senior SDET (implement) · Framework Coach (generics / unions) |

### You will be able to

- Explain when `getValidated` must **throw** and when `getResult` must **not**.
- Name `ApiRequestError`, `ApiValidationError`, and `ApiParseError` from a failing test.
- Stub `APIRequestContext` without hitting the network.
- Use `instanceof` and a discriminated union without `as` casts.

### Why this is hard

`tests/unit/api-client.spec.ts` only checks `buildUrl`. The interesting client — status mismatch, Zod failure, invalid JSON, `ok: false` — is untested at unit level. If you “just add a live API test,” you will not control the body, and you will not learn the error types.

### Evidence

- `utils/api-client.ts` — `getValidated`, `getResult`, private parse helpers
- `utils/api-errors.ts` — error hierarchy
- `types/api.types.ts` — `ApiResult<T>`
- `utils/api-assertions.ts` — `expectApiFailure` (`asserts result is ApiFailure`)
- `tests/unit/api-client.spec.ts` — URL joining only

### Mentor gate (chat, before any code)

1. Why is a **fake** `APIRequestContext` the right layer, not `npx playwright test --project=api`?
2. How will the stub expose `status()`, `ok()`, `text()`, and (if needed) `json()`?
3. Which three failures map to which error class?
4. Why must `getResult` on HTTP 404 **return** `{ ok: false }` instead of throwing `ApiRequestError`?

### Constraints

- Do **not** hit JSONPlaceholder.
- Do **not** add a new HTTP client or mock library (`vi.mock`, nock, MSW).
- Do **not** weaken schemas to make tests pass.
- Instant reject: `as any` on the client; catching `Error` instead of a specific class.

### Scope

Unit tests (and a tiny stub helper in the spec file if needed) for:

1. Wrong status → `ApiRequestError`
2. JSON that fails `ApiUserSchema` (or a local mini-schema) → `ApiValidationError`
3. Non-JSON body → `ApiParseError`
4. `getResult` on 4xx → `ok === false`, then `expectApiFailure` narrows so `result.error` typechecks

### Files you may touch

- `tests/unit/api-client.spec.ts` (or a sibling `api-client-errors.spec.ts`)
- `utils/api-assertions.ts` **only** if you must add `expectApiSuccess` for symmetric narrowing — justify in the gate

### Prerequisites

Lesson 07–08. Warmup T-06 optional.

### Acceptance criteria

- [ ] All four cases above, tagged so `npm run test:unit` picks them up.
- [ ] Red-first: temporarily return `200` from the stub in the status-mismatch test and show `ApiRequestError` is **not** thrown; restore.
- [ ] After `expectApiFailure(result)`, TypeScript allows `result.status` / `result.error` without a cast. Show `tsc --noEmit` (or the editor error you get if you access `result.data` on the failure branch).
- [ ] No network. A thrown `ECONNREFUSED` means the stub is wrong.

### Verification

```bash
npm run test:unit
npx tsc --noEmit
```

### Design decisions (oral exam)

- Why throwing on the happy-path helper makes specs shorter, and why that is dangerous for negative tests.
- What `asserts result is ApiFailure` does at compile time vs runtime.
- Why `tests/unit` imports `test` from `@playwright/test` while UI specs must not.

---

## H-02 — Close the dual HTTP-client contract

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | Framework · TypeScript · Programming |
| **Layer** | unit + api-mock |
| **Mentor** | Senior SDET |

### You will be able to

- List every public method on `ApiClient` vs `FetchApiClient` and explain each gap.
- Choose **one** design: shared parse helper vs duplicated surface vs documented intentional gap — and defend it.
- Keep MSW on `fetch` and live/WireMock on `request` (ARCHITECTURE §6).

### Why this is hard

Two classes exist on purpose (MSW cannot patch Playwright `request`). They have already drifted: `ApiClient` has `putValidated`, `delete`, and `getRaw`; `FetchApiClient` does not. Copy-pasting methods doubles bugs. Extracting a shared class the wrong way can accidentally route MSW tests through `request`.

### Evidence

- `utils/api-client.ts` vs `utils/fetch-api-client.ts`
- `fixtures/index.ts` (`apiClient`) vs `fixtures/msw.fixture.ts` (`fetchApiClient`)
- `docs/ARCHITECTURE.md` §6
- `tests/api/msw-users.spec.ts`

### Mentor gate (chat, before any code)

1. Inventory the public surface of both clients (table in chat).
2. Which gaps are **real product need** vs noise? (MSW specs today only GET users + POST posts in handlers.)
3. Propose the smallest change that makes “happy path + negative GET” identical in behavior (status → error class → `ApiResult`).
4. How will a unit test prove the shared path without Docker or the live API?

### Constraints

- Do **not** make MSW tests use `apiClient`.
- Do **not** add a third client.
- Do **not** “unify” by deleting `FetchApiClient`.
- Instant reject: changing `msw.fixture` to inject `ApiClient`.

### Scope

Close the **behavior** gap on parse/status/`getResult` (the part that can silently diverge). Adding `put`/`delete` to Fetch is **stretch** only if handlers and a spec need them.

Optional shared module (e.g. parse JSON + map to errors) is allowed if both clients call it and unit tests cover the helper.

### Files you may touch

- `utils/fetch-api-client.ts`, `utils/api-client.ts`
- New `utils/` helper only if the gate agreed
- `tests/unit/` for the shared behavior
- `tests/api/msw-users.spec.ts` only to prove parity on an existing handler

### Prerequisites

H-01 (you already know the error types). Lesson 11.

### Acceptance criteria

- [ ] Written inventory of method gaps remains in the PR description or a short comment on the shared helper — not a new markdown essay.
- [ ] Status mismatch, Zod fail, and `getResult` 404 behave the same on both clients (unit and/or MSW).
- [ ] Red-first: break one client’s status check, show **one** suite fails, restore.
- [ ] `npm run test:unit` and `npx playwright test --project=api-mock tests/api/msw-users.spec.ts` green.

### Verification

```bash
npm run test:unit
npx playwright test --project=api-mock tests/api/msw-users.spec.ts
npm run validate
```

### Design decisions (oral exam)

- Why two transports is the architecture, not a smell.
- What you refused to share (and why).
- How a future `PATCH` would be added without a third copy of `parseJsonStrict`.

---

## H-03 — Prove MSW worker-scope cannot leak handlers

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | Playwright · Framework |
| **Layer** | `api-mock` |
| **Mentor** | Senior SDET · Framework Coach (fixture lifecycle) |

### You will be able to

- Explain `scope: 'worker'` + `auto: true` on `mswServer`.
- Reset or isolate handlers so test A cannot make test B pass.
- Keep `onUnhandledRequest: 'error'`.

### Why this is hard

`fixtures/msw.fixture.ts` starts **one** server per worker. If a spec calls `mswServer.use(...)` (or you add a one-off handler) and never resets, the next test in that worker inherits it. Happy-path tests will not catch a handler that always returns 200. Warmup T-06 adds a 404 test; it does **not** prove isolation.

### Evidence

- `fixtures/msw.fixture.ts` — worker fixture
- `mocks/server.ts`, `mocks/handlers.ts`
- MSW `server.use` / `server.resetHandlers` (read MSW docs for the installed major version)

### Mentor gate (chat, before any code)

1. What is shared across tests in one worker today?
2. How will you **demonstrate** a leak (a failing pair of tests) before you fix it?
3. Reset in `afterEach` vs a test-scoped wrapper fixture — which fits this repo?
4. What must still fail if a spec hits `GET /unknown`?

### Constraints

- Do **not** change MSW to test-scoped if that makes Docker-less mock tests slow without a measured reason.
- Do **not** set `onUnhandledRequest: 'warn'` or `'bypass'`.
- Instant reject: `waitForTimeout` to “let the server settle.”

### Scope

1. A **temporary** pair of tests (or a focused spec) that fails if handlers leak.
2. The isolation fix (reset or fixture).
3. Keep or replace the leak-proof as a permanent regression test if it stays readable.

### Files you may touch

- `fixtures/msw.fixture.ts`
- `tests/api/msw-users.spec.ts` or `tests/api/msw-isolation.spec.ts`
- `mocks/handlers.ts` only if a dedicated override path is cleaner than inline `use()`

### Prerequisites

Lesson 03 + 11. Warmup T-06 strongly recommended (404 path exists).

### Acceptance criteria

- [ ] You showed a red run where test B passed on a handler installed by test A (or the reverse).
- [ ] After the fix, the same pair cannot leak (`--workers=1` so they share a worker).
- [ ] Unhandled URL still fails the test.
- [ ] Tagged `@mock` `@regression`.

### Verification

```bash
npx playwright test --project=api-mock tests/api/msw-isolation.spec.ts --workers=1
# if you kept tests in msw-users.spec.ts, run that file with --workers=1 instead
```

### Design decisions (oral exam)

- Worker vs test scope: startup cost vs isolation.
- Why `--workers=1` is required to **prove** the leak, and why CI can still use more workers after the fix.
- What `auto: true` means for specs that never mention `mswServer`.

---

## H-04 — WireMock must stub the same `POST /posts` contract

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | Framework · Playwright |
| **Layer** | `api-mock` (Testcontainers) |
| **Mentor** | Senior SDET |

### You will be able to

- Add a WireMock mapping that matches MSW’s `POST /posts` (echo body + stub `id`, 201).
- Call it through `mockApiClient` (`ApiClient` / Playwright `request`).
- Explain why this cannot be an MSW test.

### Why this is hard

MSW already stubs `POST /posts`. Docker mappings only cover `GET /users` and `GET /users/:id`. People copy the live `posts-post.spec.ts` against WireMock and wonder why it hits the real network or 404s. The hard part is **parity**: JSON body matcher, status, and Zod — not “a file in `mappings/`.”

### Evidence

- `docker/wiremock/mappings/users-list.json`, `user-by-id.json`
- `mocks/handlers.ts` — `http.post` echo + `id: 999`
- `fixtures/container.fixture.ts` — `mockApiClient`
- `utils/testcontainers.ts` — how mappings are mounted
- `tests/api/container-users.spec.ts`, `tests/api/posts-post.spec.ts`
- `builders/post.builder.ts`

### Mentor gate (chat, before any code)

1. Why Playwright `request` works here and fails under MSW.
2. Will WireMock echo the request body or return a static JSON? What does that do to the assertion on `created.title`?
3. How does `test.skip(!isDockerAvailable())` interact with CI `SKIP_DOCKER_TESTS`?
4. Which schema: `ApiPostSchema` vs `CreatePostSchema`?

### Constraints

- Do **not** point `mockApiClient` at `config.apiBaseUrl`.
- Do **not** duplicate the live POST spec as `@smoke`.
- Instant reject: hitting jsonplaceholder from a `container-*` spec.

### Scope

One mapping + one container spec: builder payload → 201 → contract. Assert stub `id` and echoed title if the mapping supports it.

### Files you may touch

- `docker/wiremock/mappings/` (new file)
- `tests/api/container-users.spec.ts` or `tests/api/container-posts.spec.ts`
- `utils/testcontainers.ts` only if mappings are not auto-loaded (prove it)

### Prerequisites

Lesson 11. H-01 helpful. Docker running locally.

### Acceptance criteria

- [ ] Mapping lives with the other WireMock JSON files.
- [ ] Spec uses `containerTest` + `mockApiClient` + `postBuilder` + `ApiPostSchema`.
- [ ] Tagged `@mock` `@regression`.
- [ ] Red-first: wrong status in the mapping (200) → `ApiRequestError` (or equivalent); restore.
- [ ] Skips cleanly when Docker is missing (`SKIP_DOCKER_TESTS` or `isDockerAvailable`).

### Verification

```bash
npx playwright test --project=api-mock tests/api/container-posts.spec.ts
# or the file you chose
SKIP_DOCKER_TESTS=true npx playwright test --project=api-mock tests/api/container-posts.spec.ts
```

### Design decisions (oral exam)

- MSW vs WireMock for the **same** POST: what each proves.
- Why `postBuilder().withUniqueTitle` still matters against a stub.
- Where a body matcher that is too strict will flake.

---

## H-05 — Wait on the response, not the clock

| Field | Value |
| ----- | ----- |
| **Difficulty** | Medium |
| **Effort** | 2–3 h |
| **Tracks** | Playwright |
| **Layer** | `chromium-mock` |
| **Mentor** | Senior SDET |

### You will be able to

- Use `page.waitForResponse` (or `expect(response).toBeOK()` patterns valid in 1.61) with `page.route`.
- Fulfill a **500** JSON error, not only 200 and abort.
- Keep assertions on the UI **and** the HTTP status.

### Why this is hard

`network-mock.spec.ts` clicks and asserts a DOM node. That can pass even if the mock never ran (cached content, wrong URL glob, race). The missing skill is **coupling the click to the network event**. Sauce Demo does not call JSONPlaceholder; the `setContent` demo is the intended UI-mock lab — do not invent a fake storefront.

### Evidence

- `tests/ui/network-mock.spec.ts`
- `utils/route-mocks.ts` — `mockJsonRoute`, `abortRoute`, `clearRoutes`
- `playwright.config.ts` — project `chromium-mock` has **no** `setup` dependency

### Mentor gate (chat, before any code)

1. Why `chromium-mock` must not depend on `setup`.
2. Order: `page.route` → `setContent` → `waitForResponse` + click. What breaks if you wait after the request already finished?
3. Should 500 live in `mockJsonRoute` via `status` or a new helper?
4. What do you assert besides the paragraph text?

### Constraints

- Do **not** add MSW or WireMock to this spec.
- Do **not** mock Sauce Demo inventory HTML.
- Instant reject: `waitForTimeout`.

### Scope

One new test (or a tight `test.each`): fulfill `**/users/1` with `status: 500` and a JSON body; wait for that response; assert UI error **and** `response.status() === 500`. Reuse `clearRoutes` in `afterEach`.

### Files you may touch

- `tests/ui/network-mock.spec.ts`
- `utils/route-mocks.ts` only if `status` support is missing (it is already on `MockRouteOptions`)

### Prerequisites

Lesson 11. Warmup T-07 optional (`chromium-mock` listing).

### Acceptance criteria

- [ ] Predicate or glob for `waitForResponse` is specific enough not to match unrelated requests.
- [ ] 500 path tagged `@mock` `@regression`.
- [ ] Red-first: fulfill 200 in the 500 test → assertion fails; restore.
- [ ] `npx playwright test --project=chromium-mock` lists and runs the spec.

### Verification

```bash
npx playwright test --project=chromium-mock --list
npx playwright test --project=chromium-mock
```

### Design decisions (oral exam)

- `fulfill` vs `abort` vs `continue`.
- Why waiting on a locator alone is insufficient for network teaching.
- Why this spec is excluded from `chromium` (warmup T-07).

---

## H-06 — Evolve a Zod contract without lying to TypeScript

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | TypeScript · Framework |
| **Layer** | unit + api |
| **Mentor** | Framework Coach (schema) · Senior SDET (live compatibility) |

### You will be able to

- Change a schema with `z.infer` as the only type source.
- Unit-test `safeParse` success and failure.
- Decide what to do when the **live** API is looser than the contract you want.

### Why this is hard

`ApiUserSchema` is already a full JSONPlaceholder user. Tightening the wrong field (e.g. `website` as `z.string().url()`) may fail in CI against real data. Hand-writing `interface ApiUser` next to the schema is the classic lie. The skill is **contract evolution with evidence**, not “add `.min(1)` everywhere.”

### Evidence

- `schemas/api.schemas.ts` — `z.infer` exports
- `schemas/test-data.schemas.ts`, `schemas/config.schemas.ts`
- `tests/unit/config-and-schemas.spec.ts`
- `mocks/data/mock-users.ts` — must stay valid
- `tests/api/users-get.spec.ts`

### Mentor gate (chat, before any code)

1. Which **one** field or refinement is worth tightening, and what bug would it catch?
2. Show a payload that should fail (unit) and one that the live API actually returns (observed).
3. If live data fails the new rule: relax the schema, skip with a documented reason, or split `ApiUserSchema` vs `StrictApiUserSchema` — pick one and defend it.
4. Why `CreatePostSchema = ApiPostSchema.omit({ id: true })` is the pattern to copy or avoid.

### Constraints

- Do **not** add a parallel `interface ApiUser`.
- Do **not** use `.passthrough()` to hide extra keys unless you can explain strip vs passthrough vs strict.
- Instant reject: `as ApiUser` on unvalidated JSON.

### Scope

One schema change (or a documented decision to **not** change production schema and instead add a strict variant used only in unit tests). Update mock payloads if they would fail. Unit tests for parse fail. Live `getValidated` still green **or** the skip/split is explicit.

### Files you may touch

- `schemas/api.schemas.ts`
- `tests/unit/config-and-schemas.spec.ts` or `tests/unit/api-schemas.spec.ts`
- `mocks/data/mock-users.ts`
- `docker/wiremock/mappings/*.json` if the mapping would violate the new contract
- Live spec only if assertions must follow the new type

### Prerequisites

Lesson 08. H-01 useful (`ApiValidationError`).

### Acceptance criteria

- [ ] `type X = z.infer<typeof Schema>` still the only exported entity type for that schema.
- [ ] Unit test: invalid payload → `success === false` with a field path you can name.
- [ ] `npm run test:unit` and `npm run test:api` (or documented skip) green.
- [ ] Red-first: valid live-shaped mock fails the **unit** negative case if you accidentally used the happy payload.

### Verification

```bash
npm run test:unit
npx playwright test --project=api tests/api/users-get.spec.ts
npm run validate
```

### Design decisions (oral exam)

- `parse` vs `safeParse` in `ApiClient` vs in unit tests.
- What happens to `ApiUser` TypeScript type when you add `.optional()`.
- Mock payloads as contract fixtures, not “random JSON.”

---

## H-07 — Branded IDs must reject the wrong resource

| Field | Value |
| ----- | ----- |
| **Difficulty** | Medium |
| **Effort** | 2–3 h |
| **Tracks** | TypeScript · Programming |
| **Layer** | unit (compile-time) + api |
| **Mentor** | Framework Coach · Senior SDET |

### You will be able to

- Explain `Brand<T, B>` and `unique symbol`.
- Make `API_ENDPOINTS.userById` reject `PostId` and raw `number` at compile time (or document a **narrow** escape hatch).
- Keep runtime `asUserId` throwing `RangeError` for `0` / floats.

### Why this is hard

`types/branded.types.ts` already exists. `API_ENDPOINTS.userById: (id: UserId | number)` **undoes** the brand. Unit tests only check runtime `asUserId`. You can pass `42` or a `PostId` today. The ticket is to make the type system do its job without breaking every spec.

### Evidence

- `types/branded.types.ts`
- `utils/constants.ts` — `API_ENDPOINTS`
- `types/api-endpoints.types.ts` — template literal paths
- `tests/unit/branded-and-builder.spec.ts`
- `tests/api/users-get.spec.ts` — `asUserId(apiPayloads.sampleUserId)`

### Mentor gate (chat, before any code)

1. Why `UserId | number` was convenient and why it is wrong.
2. How will you prove a **compile** failure? (`tsc` on a tiny snippet, or a commented `// @ts-expect-error` test — pick one.)
3. Should `postBuilder().withUserId` stay `UserId | number`? Same hole or acceptable for builders?
4. What is the difference between a brand and a Zod `.brand()` (and which does this repo use)?

### Constraints

- Do **not** change IDs to strings.
- Do **not** remove runtime checks in `asUserId`.
- Instant reject: `as UserId` in production specs without `asUserId()`.

### Scope

Tighten endpoint function signatures. Update call sites. Add a compile-time guard (`@ts-expect-error` in a unit file **or** a documented `expect-type` style assert if you already have the dependency — do not add a new library without gate approval).

### Files you may touch

- `utils/constants.ts`, `types/api-endpoints.types.ts`
- `tests/unit/branded-and-builder.spec.ts`
- Specs that pass raw numbers into `userById` / `postById`
- `builders/post.builder.ts` only if the gate included it

### Prerequisites

Lesson 08. `typescript-concepts.md` §8.

### Acceptance criteria

- [ ] `userById(asPostId(1))` is a type error.
- [ ] `userById(1)` is a type error (raw number).
- [ ] `userById(asUserId(1))` typechecks; live GET by id still passes.
- [ ] Runtime invalid IDs still throw.
- [ ] `npm run validate` green.

### Verification

```bash
npm run test:unit
npx playwright test --project=api tests/api/users-get.spec.ts
npx tsc --noEmit
```

Show the `@ts-expect-error` (or equivalent) in chat.

### Design decisions (oral exam)

- Brands are compile-time only — what still happens at runtime with `userById(asUserId(1))`.
- Why template literal `UserByIdPath` is not enough without brands.
- Builder loosening vs endpoint strictness.

---

## H-08 — Compose a typed UI fixture layer

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 4–5 h |
| **Tracks** | Framework · Playwright · TypeScript |
| **Layer** | ui + fixtures |
| **Mentor** | Senior SDET · Framework Coach (L03–L04) |

### You will be able to

- Extend `authenticatedTest` with new page objects **without** putting `expect` in `pages/`.
- Type the fixture map so a typo’d fixture name fails `tsc`.
- Keep a multi-step journey (cart and/or checkout) parallel-safe.

### Why this is hard

Warmup T-02 / T-08 add pages and specs. They do not force you to **compose fixtures**. Dumping `new CartPage(page)` in the spec skips the pattern this repo is built on. The hard part is the type: `TestFixtures & { cartPage: CartPage }` on the right `extend` base (`authenticated` vs `index`).

### Evidence

- `fixtures/index.ts` — `TestFixtures`, `base.extend`
- `fixtures/authenticated.fixture.ts` — `AuthenticatedFixtures`
- `pages/BasePage.ts`, `pages/DashboardPage.ts`
- Warmup T-02 / T-08 if already done (`pages/CartPage.ts`, checkout pages)
- `docs/ARCHITECTURE.md` §3

### Mentor gate (chat, before any code)

1. Which base do you extend: `test` from `index` or `authenticatedTest`? What do you lose if you pick wrong?
2. One `CheckoutPage` vs info/overview/complete classes — SRP vs YAGNI. Pick and defend.
3. Where do unique customer names come from (`generatedUser` vs `uniqueSuffix`)?
4. Which assertions stay in the spec?

### Constraints

- Assertions stay in `tests/`.
- Do **not** log in inside the new fixture (that is `setup` + `storageState`).
- Do **not** mark checkout `@smoke` until it is stable (same rule as T-08).
- Instant reject: `waitForTimeout`; CSS `nth-child` for line items.

### Scope

If T-02/T-08 are not done, this ticket **includes** the minimum POM for cart + checkout happy path. If they are done, **do not** rewrite locators — only lift construction into fixtures and tighten types.

One authenticated journey: add product → cart → (checkout if in scope) → assertions. Wire pages through fixtures.

### Files you may touch

- `pages/*` (new or existing cart/checkout)
- `fixtures/index.ts` and/or `fixtures/authenticated.fixture.ts`
- One UI spec
- `utils/constants.ts` — `ROUTES` only if a path is missing

### Prerequisites

Lessons 03–06. Warmup T-01. T-02 (cart locators) before checkout. Prefer T-04 so you do not dump this into a duplicate “we are on Products” spec.

### Acceptance criteria

- [ ] Specs import `authenticatedTest` (or a layer that extends it) and destructure typed pages.
- [ ] Misspelling the fixture name fails typecheck (demonstrate).
- [ ] Fresh context / existing `storageState` — no cart leftover assumed from a previous test.
- [ ] Unique form data if checkout is included.
- [ ] Red-first: wrong product name or heading fails clearly.

### Verification

```bash
npx playwright test --project=chromium tests/ui/<your-spec>.spec.ts
npx tsc --noEmit
```

### Design decisions (oral exam)

- Why `CartPage` is not methods on `DashboardPage`.
- Fixture construction vs `test.beforeEach`.
- What `ReturnType<typeof loadLoginTestData>` in `TestFixtures` is teaching you to copy or not.

---

## H-09 — Second-persona `storageState`

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 4–5 h |
| **Tracks** | Playwright · Framework |
| **Layer** | setup + ui |
| **Mentor** | Senior SDET |

### You will be able to

- Save **two** storage files without committing them.
- Select persona via fixture or project `dependencies`, not `if (user === …)` in every spec.
- Explain why `locked_out_user` is the wrong second persona for `storageState`.

### Why this is hard

One `AUTH_STORAGE_PATH` and one `setup` project. Adding `problem_user` (broken inventory behaviors) or another **logged-in** Sauce Demo user requires a second setup spec, a second gitignored path, and a fixture that does not silently reuse `standard_user`. Copying `authenticated.fixture.ts` blindly will log in as the wrong person and still see “Products.”

### Evidence

- `tests/setup/auth.setup.ts`
- `fixtures/authenticated.fixture.ts`
- `playwright.config.ts` — `setup` + `dependencies`
- `test-data/login-users.json`
- `.gitignore` — `auth/.auth/`

### Mentor gate (chat, before any code)

1. Which second persona, and **what risk** does it test that `standard_user` cannot?
2. Two setup projects vs one setup file with two tests — Playwright `dependencies` implications.
3. Why `locked_out_user` cannot produce a useful inventory `storageState`.
4. How CI still runs `setup` first (`npm run test:ui`).

### Constraints

- Never commit `auth/.auth/*`.
- Do **not** put passwords in specs; use `loginTestData` / config.
- Instant reject: logging in through the UI in every `problem_user` test “to keep it simple” **and** calling it `storageState` work.
- Do **not** automate all Sauce Demo users.

### Scope

One extra persona, one extra storage file, one fixture (or `use.storageState` override) , **one** spec that proves a behavior unique to that user (observe the live app first — do not memorize blog posts about `problem_user`).

### Files you may touch

- `tests/setup/`
- `fixtures/authenticated.fixture.ts` or a new `fixtures/*.fixture.ts`
- `playwright.config.ts` (projects / dependencies)
- `utils/constants.ts` — extra path constant
- One UI spec
- `.env.example` only if a new env var is truly required (prefer JSON personas)

### Prerequisites

Lesson 06. Warmup T-04. H-08 optional but helps.

### Acceptance criteria

- [ ] Two gitignored storage paths; both produced by setup.
- [ ] Spec using persona B cannot pass on persona A’s storage (red-first: swap the path, show failure, restore).
- [ ] `standard_user` smoke path still `@smoke`.
- [ ] Persona B tests are `@regression` unless you can defend smoke cost.

### Verification

```bash
npx playwright test --project=setup
npx playwright test --project=chromium tests/ui/<persona-spec>.spec.ts
```

Confirm `git status` does not list `auth/.auth/`.

### Design decisions (oral exam)

- Project `dependencies` vs fixture-only `storageState`.
- Cost of a second login on every PR vs nightly.
- What is in a `storageState` JSON (cookies vs localStorage) at a high level.

---

## H-10 — Prove parallel workers cannot collide

| Field | Value |
| ----- | ----- |
| **Difficulty** | Medium |
| **Effort** | 2–3 h |
| **Tracks** | Programming · Playwright |
| **Layer** | unit + api |
| **Mentor** | Senior SDET |

### You will be able to

- Distinguish **workers** (one machine), **fullyParallel** (tests in a file), and **shards** (many machines).
- Show `uniqueSuffix()` includes worker index.
- Explain why `process.env` is **not** isolated the way a browser context is (tie to warmup T-10).

### Why this is hard

JSONPlaceholder POST does not persist like a real DB, so collisions are easy to hand-wave. The skill is to **design a proof** (unit or controlled parallel run) that two workers would share a name without the suffix — then connect that to nightly `--shard`.

### Evidence

- `utils/test-data-factory.ts` — `uniqueSuffix`, `generateUserProfile`
- `builders/post.builder.ts` — `withUniqueTitle`
- `playwright.config.ts` — `fullyParallel`, `resolveWorkers()`
- `docs/ARCHITECTURE.md` §7 parallelism
- Warmup T-10 — `process.env` leak

### Mentor gate (chat, before any code)

1. Draw workers vs shards vs `fullyParallel` for **this** repo’s nightly YAML.
2. What proof will you run (`--workers=2`, `--repeat-each`, unit with mocked `TEST_PARALLEL_INDEX`)?
3. Why faker alone is not enough if the clock and worker are omitted?
4. Does `generatedUser` fixture need the suffix too?

### Constraints

- Do **not** disable `fullyParallel` to “make tests stable.”
- Do **not** implement sharding in this ticket (that is H-11).
- Instant reject: `Math.random()` in a spec as the isolation story.

### Scope

Unit tests for `uniqueSuffix` / builder under two fake worker indexes. Optional: run POST spec with `--workers=2` and show distinct titles in the report. Short comment or recap linking to shards (next ticket).

### Files you may touch

- `tests/unit/branded-and-builder.spec.ts` (or sibling)
- `utils/test-data-factory.ts` only if `TEST_PARALLEL_INDEX` is wrong/missing in Playwright 1.61 (prove it)

### Prerequisites

ARCHITECTURE §7. Warmup T-10 recommended.

### Acceptance criteria

- [ ] Tests prove two different worker env values → two different suffixes.
- [ ] You can explain what happens if `uniqueSuffix` only used `Date.now()` on a fast parallel start.
- [ ] Recap names the nightly `--shard=${{ matrix.shardIndex }}/${{ matrix.shardTotal }}` line.

### Verification

```bash
npm run test:unit
npx playwright test --project=api tests/api/posts-post.spec.ts --workers=2
```

### Design decisions (oral exam)

- Browser context isolation vs Node process globals.
- Why API tests still need unique titles if the server is fake.
- `PLAYWRIGHT_WORKERS` vs `workers: 2` in CI.

---

## H-11 — Reproduce nightly sharding locally

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–5 h |
| **Tracks** | DevOps · Playwright |
| **Layer** | ci (local simulation) |
| **Mentor** | DevOps · Senior SDET |

### You will be able to

- Run `--shard=1/2` and `--shard=2/2` and show **disjoint** file sets (`--list`).
- Produce blob reports and `merge-reports` locally.
- Explain `fail-fast: false`, `PLAYWRIGHT_BLOB_REPORT`, and why API is `1/1` in the matrix.

### Why this is hard

Reading `playwright-nightly.yml` is not the same as watching a merge. If you only run `npm run test:regression`, you never see empty shards, missing blobs, or HTML that only contains half the tests.

### Evidence

- `.github/workflows/playwright-nightly.yml` — `build-matrix`, `merge-reports`, `publish-pages`
- `playwright.config.ts` — blob vs HTML reporters
- `package.json` — `test:shard`, `test:shard:regression`
- `docs/ARCHITECTURE.md` §7
- `.github/actions/upload-playwright-artifacts/action.yml`

### Mentor gate (chat, before any code)

1. Walk the nightly job graph (matrix → blobs → merge → Pages).
2. Why `publish-pages` is gated on `vars.ENABLE_GITHUB_PAGES`.
3. What you will **change** in the repo, if anything — this ticket may be evidence-only plus a small doc/script fix.
4. Is a README snippet or `package.json` script missing for local merge?

### Constraints

- Do **not** enable GitHub Pages by committing secrets or forcing `ENABLE_GITHUB_PAGES`.
- Do **not** raise PR retries.
- Instant reject: deleting blob upload “because local HTML is enough.”

### Scope

1. Local shard list + two shard runs on `chromium` `@regression` (or a cheaper grep if regression is huge — justify).
2. Local blob merge matching CI (`PLAYWRIGHT_BLOB_REPORT=true`).
3. If the merge path is painful, add the **smallest** npm script that mirrors CI — no new workflow unless you find a real bug.

If you find a real nightly bug (empty merge, wrong path), fix it as part of this ticket.

### Files you may touch

- `package.json` scripts (optional)
- `.github/workflows/playwright-nightly.yml` only for a proven bug
- `docs/LEARNING.md` or README **one** command table row if local merge was undocumented

### Prerequisites

Lesson 09. H-10. Warmup T-07 useful.

### Acceptance criteria

- [ ] `--list` output for shard 1/2 and 2/2 pasted in chat; no duplicate spec files.
- [ ] Merge produces HTML you opened (`reports/html` or `playwright-report`).
- [ ] Written explanation: API `1/1` vs browsers sharded; `fail-fast: false`.
- [ ] If you added a script: `npm run validate` still green.

### Verification

```bash
npx playwright test --project=chromium --grep @regression --shard=1/2 --list
npx playwright test --project=chromium --grep @regression --shard=2/2 --list
PLAYWRIGHT_BLOB_REPORT=true npx playwright test --project=chromium --grep @regression --shard=1/2
PLAYWRIGHT_BLOB_REPORT=true npx playwright test --project=chromium --grep @regression --shard=2/2
npx playwright merge-reports --reporter html reports/blob
```

Adjust paths if CI uses a different blob dir (`reports/blob`).

### Design decisions (oral exam)

- Why PR does not shard today.
- Artifact retention: blobs vs merged HTML vs failure-only traces.
- `merge-multiple: true` on `download-artifact`.

---

## H-12 — Make mock CI honest

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | DevOps |
| **Layer** | ci |
| **Mentor** | DevOps |

### You will be able to

- Trace a path filter from a file edit to “workflow skipped.”
- Explain composite actions under `.github/actions/`.
- Document `SKIP_DOCKER_TESTS` vs installing Docker on the runner.
- Keep secrets out of YAML.

### Why this is hard

`playwright-mock.yml` path filters omit `utils/route-mocks.ts` (warmup T-07) and likely omit `utils/fetch-api-client.ts`, `utils/testcontainers.ts`, and `utils/docker.ts`. Composite actions already exist; the skill is **when the mock job is a false green** (skipped) vs a real skip inside tests. Nightly does not run `chromium-mock` (by design — defend or change with evidence).

### Evidence

- `.github/workflows/playwright-mock.yml`
- `.github/workflows/playwright.yml`
- `.github/actions/setup-node-playwright/action.yml`
- `.github/actions/configure-test-env/action.yml`
- `utils/docker.ts`, `fixtures/container.fixture.ts`
- Warmup T-07 acceptance (firefox ignore + route-mocks path)

### Mentor gate (chat, before any code)

1. List every path that should retrigger mock CI. Mark missing ones.
2. Should nightly add `chromium-mock` / `api-mock`? Default in T-07 is **no** — keep or overturn with a cost argument.
3. `SKIP_DOCKER_TESTS=true` on GitHub-hosted runners: false confidence or acceptable?
4. Which secrets `configure-test-env` expects, and where they are documented (`.env.example` only).

### Constraints

- Never put secret **values** in YAML or docs.
- Do **not** run Docker-in-Docker hacks if the runner has no daemon — skip is fine if tests skip loudly.
- Instant reject: `on: push` without path filters for a 40-minute mock job on every docs typo.

### Scope

Fix path filters (include T-07’s `route-mocks` plus any H-02/H-04 files you now know matter). Align `SKIP_DOCKER` documentation with actual skip behavior. Optional: one-line job summary when Docker tests skipped.

### Files you may touch

- `.github/workflows/playwright-mock.yml`
- `.github/actions/*` only for a proven reuse bug
- `.env.example` (keys only)
- `README.md` or `docs/LEARNING.md` — how to debug a skipped mock workflow

### Prerequisites

Lesson 09. Warmup T-07. H-04/H-05 useful so you know which files are load-bearing.

### Acceptance criteria

- [ ] Path list includes route mocks and the HTTP clients/containers that `@mock` tests import.
- [ ] You demonstrate with `gh` (or a dry explanation of GitHub path filters) that a docs-only change does **not** need mock CI.
- [ ] PR workflow still `retries: 0` / `CI_TIER=pr`.
- [ ] Secrets remain names-only in docs.

### Verification

```bash
gh workflow list
# After push of a mock-path file on a branch: gh run list --workflow=playwright-mock.yml
```

If `gh` is not authenticated, show the YAML diff and a table of “edit this file → workflow runs.”

### Design decisions (oral exam)

- Composite action vs copy-paste `npm ci` in every job.
- Path filters as a product decision, not a glob hobby.
- Why mock is not in the PR `test:pr` script.

---

## H-13 — Capstone: wrong-layer PR review

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 2–3 h (writing, not a large diff) |
| **Tracks** | Framework · Playwright · TypeScript · DevOps |
| **Layer** | review (practice) |
| **Mentor** | Senior SDET + DevOps |
| **Type** | Practice — do not merge the broken example |

### You will be able to

- Use ARCHITECTURE §8 to reject a test at the wrong layer.
- File a review with **Blocker / Major / Minor**.
- Catch `test.only`, sleeps, `apiClient` + MSW, secrets, and missing tags.

### Why this is hard

Implementation tickets train “make it pass.” Staff SDET work is **stopping** a bad test from entering CI. You need to produce a review, not a green suite.

### Evidence

- `docs/ARCHITECTURE.md` §8
- `.cursor/agents/senior-sdet.md` — review severity
- `.github/pull_request_template.md`

### Mentor gate (chat, before any code)

Agree on a **deliberate** bad PR (local branch or a gist of a spec). It must contain at least four distinct issues spanning layers (e.g. UI test for a JSON contract, MSW + `apiClient`, `waitForTimeout`, `@smoke` on a mock, hard-coded password).

### Constraints

- Do not commit secrets even in the “bad” example — use a fake `password: 'secret_sauce'` only if it already appears as demo data, and still call it out as a pattern smell vs `loginTestData`.
- Revert or abandon the bad branch; do not merge.

### Scope

1. Write the bad spec(s) locally **or** review a mentor-provided diff.
2. Produce the review in chat using Blocker/Major/Minor.
3. Optionally implement the **correct** layer as a follow-up — not required to close H-13.

### Files you may touch

Temporary only. Git status clean of the practice break when done.

### Prerequisites

H-01, H-03, H-05, H-08 (enough layers to recognize). Lesson 09.

### Acceptance criteria

- [ ] Review names the correct layer for each scenario.
- [ ] At least one Blocker is “wrong tool” (MSW/`request`, E2E for unit logic, etc.).
- [ ] You list the CI tier the author should have used.
- [ ] Bad files reverted.

### Verification

Mentor scores the review against the planted bugs. Missing a planted Blocker = ticket not done.

### Design decisions (oral exam)

- When a UI test is still justified (checkout on Sauce Demo — no checkout API).
- When unit is enough (`buildUrl`, branded IDs).
- Cost of `@smoke` abuse on PR.

---

## H-14 — Capstone: glitch user without sleeps

| Field | Value |
| ----- | ----- |
| **Difficulty** | Hard |
| **Effort** | 3–4 h |
| **Tracks** | Playwright · SDET |
| **Layer** | ui |
| **Mentor** | Senior SDET |

### You will be able to

- Classify slowness as **app behavior** vs flake vs bad locator.
- Use web-first `expect` / navigation assertions, not `waitForTimeout`.
- Decide whether `performance_glitch_user` belongs in this repo at all.

### Why this is hard

Sauce Demo’s `performance_glitch_user` is a teaching trap: juniors raise timeouts and call it a fix. Seniors measure whether `standard_user` already covers the risk, whether the user is deterministic delay, and whether putting it on `@smoke` poisons PR time. Warmup T-09 stretch says do not add this user without measurement — this ticket **is** that measurement plus one defended test or an explicit “won’t add” with evidence.

### Evidence

- `test-data/login-users.json`
- `playwright.config.ts` — timeouts, retries
- Warmup T-05 / T-12 — traces
- H-09 if you already have multi-persona setup (reuse; do not create a third storage path unless needed)

### Mentor gate (chat, before any code)

1. Time `standard_user` vs `performance_glitch_user` on the **same** inventory assertion (headed or trace). Paste numbers.
2. Is the delay deterministic enough for CI?
3. If you add a test: which tag, which fixture, which assertion?
4. If you **don’t** add it: what would make you reconsider?

### Constraints

- Instant reject: increasing global `timeout` / `expect.timeout` as the only change.
- Instant reject: `waitForTimeout`.
- Do not add this user to `@smoke` without a brutal cost argument.

### Scope

Measurement write-up in chat (keep it; no new markdown file required) + either one `@regression` spec that fails for the right reason on a broken locator, or a documented skip.

### Files you may touch

- `test-data/login-users.json` only if the persona is missing
- One spec and fixture/setup **only** if the gate said add it
- Config timeouts: **no**, unless you can prove a single test override is required

### Prerequisites

T-05 or equivalent local traces. Lesson 10. Prefer H-09.

### Acceptance criteria

- [ ] Timing evidence in chat.
- [ ] Trace or report from a run with the glitch user.
- [ ] Either a deterministic test with web-first waits, or an explicit “not in suite” decision that the mentor accepts.
- [ ] `--repeat-each=5` on whatever you kept: all pass or all fail the same way (no intermittent).

### Verification

```bash
npx playwright test --project=chromium tests/ui/<spec>.spec.ts --repeat-each=5
```

If you declined to add a spec, still run a **temporary** experiment, then revert.

### Design decisions (oral exam)

- Timeout vs auto-wait.
- Persona risk vs CI minutes.
- How this differs from `problem_user` (wrong UI vs slow UI).

---

## Coverage tracker

Mark when you can **explain from this repo’s files** and when you have **implemented independently**.

| Concept | Ticket | Explained | Implemented independently |
| ------- | ------ | --------- | ------------------------- |
| Throw vs `ApiResult`, error classes, `asserts` | H-01 | | |
| Dual clients, DRY vs two transports | H-02 | | |
| Worker-scoped fixtures, MSW reset | H-03 | | |
| WireMock mappings + `mockApiClient` | H-04 | | |
| `page.route` + `waitForResponse` | H-05 | | |
| Zod evolution, `z.infer`, mock parity | H-06 | | |
| Branded types at API boundaries | H-07 | | |
| Typed fixture composition, POM SRP | H-08 | | |
| Multi-persona `storageState` / setup projects | H-09 | | |
| Workers, `uniqueSuffix`, vs shards | H-10 | | |
| Blob reports, merge, nightly matrix | H-11 | | |
| Path filters, composite actions, secrets | H-12 | | |
| Layering + review severity | H-13 | | |
| Slowness vs flake, traces, tags | H-14 | | |

Warmup concepts (locators, cart POM, negative login, spec thinning, local traces, MSW 404, `testIgnore`, checkout, `test.each`, `try/finally`, popups) stay in [LEARNING-BACKLOG.md](./LEARNING-BACKLOG.md).

---

## Related docs

- [LEARNING.md](./LEARNING.md) — curriculum index (lessons 01–11)
- [LEARNING-BACKLOG.md](./LEARNING-BACKLOG.md) — beginner–intermediate repo tickets
- [ARCHITECTURE.md](./ARCHITECTURE.md) — projects, fixtures, mocking, CI
- `.cursor/skills/framework-coach/typescript-concepts.md` — generics, Zod, brands, unions
- `.cursor/skills/framework-coach/playwright-concepts.md` — fixtures, projects, locators
- `.cursor/skills/devops/pipeline-patterns.md` — workflow patterns
