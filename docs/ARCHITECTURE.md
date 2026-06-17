# Framework Architecture

Production-grade Playwright + TypeScript automation framework. This document is the **single source of truth** for system design, data flows, and visual architecture.

---

## At a glance

```mermaid
block-beta
    columns 4

    block:ci:1
        columns 1
        CI["CI/CD"]
        PR["PR < 5 min"]
        NIGHTLY["Nightly"]
    end

    block:tests:1
        columns 1
        TESTS["Tests"]
        UNIT["unit"]
        API["api"]
        UI["ui"]
    end

    block:fw:1
        columns 1
        FW["Framework"]
        FIX["fixtures"]
        POM["pages"]
        UTILS["utils"]
    end

    block:contracts:1
        columns 1
        CONTRACTS["Contracts"]
        ZOD["Zod schemas"]
        TYPES["TS types"]
    end

    ci --> tests
    tests --> fw
    fw --> contracts
```

| Principle | Implementation |
|-----------|----------------|
| Test pyramid | `unit` → `api` → `ui` |
| Fast PR feedback | `test:pr` — unit + api + `@smoke` |
| Contract safety | Zod validates API, env, and JSON fixtures |
| Auth efficiency | `storageState` — login once, reuse everywhere |
| No flake masking | `retries: 0` on PR |
| Mocking by layer | MSW · Testcontainers · `page.route` |

---

## Diagram index

| # | Diagram | Section |
|---|---------|---------|
| 1 | [Layered architecture](#1-layered-architecture) | System layers |
| 2 | [Playwright projects](#2-playwright-projects) | Project graph |
| 3 | [Fixture composition](#3-fixture-composition) | Fixture layers |
| 4 | [Authentication flow](#4-authentication-flow) | storageState |
| 5 | [API contract flow](#5-api-contract-flow) | Zod validation |
| 6 | [Mocking strategies](#6-mocking-strategies) | MSW / Docker / route |
| 7 | [CI pipeline](#7-ci-pipeline) | PR vs nightly |
| 8 | [Test decision tree](#8-test-decision-tree) | Where to add tests |

---

## 1. Layered architecture

```mermaid
flowchart TB
    subgraph L0["⓪ CI / Operations"]
        direction LR
        W1["playwright.yml"]
        W2["playwright-nightly.yml"]
        TAGS["@smoke · @regression · @mock"]
    end

    subgraph L1["① Test suites"]
        direction TB
        T_UNIT["tests/unit/"]
        T_API["tests/api/"]
        T_MOCK["tests/api/msw-* · container-*"]
        T_UI["tests/ui/"]
        T_SETUP["tests/setup/"]
    end

    subgraph L2["② Framework"]
        direction TB
        FIX["fixtures/"]
        PAGES["pages/"]
        BUILD["builders/"]
        MOCKS["mocks/"]
        UTILS["utils/"]
    end

    subgraph L3["③ Contracts & types"]
        direction LR
        SCHEMAS["schemas/"]
        TYPES["types/"]
    end

    subgraph L4["④ Config & data"]
        direction LR
        ENV[".env.*"]
        PWCFG["playwright.config.ts"]
        JSON["test-data/"]
        DOCKER["docker/wiremock/"]
    end

    L0 --> L1
    L1 --> L2
    L2 --> L3
    L2 --> L4
    L3 --> L4
```

### Folder responsibilities

| Folder | Owns | Does not own |
|--------|------|--------------|
| `tests/` | Specs, assertions, test intent | Locator logic, HTTP client code |
| `fixtures/` | Dependency injection, lifecycle | Business assertions |
| `pages/` | Locators + user actions | Assertions |
| `schemas/` | Runtime + compile-time contracts | Test scenarios |
| `mocks/` | MSW handlers + mock payloads | Real API calls |
| `utils/` | Config, clients, helpers, tags | Page-specific locators |
| `docker/wiremock/` | HTTP stub mappings | Container orchestration (in `utils/testcontainers.ts`) |

---

## 2. Playwright projects

Eight projects. Each has a single responsibility.

```mermaid
flowchart TB
    subgraph FAST["Fast — no browser auth"]
        UNIT["unit<br/><small>tests/unit/</small>"]
        API["api<br/><small>live API contracts</small>"]
        MOCK["api-mock<br/><small>MSW + Testcontainers</small>"]
    end

    subgraph BROWSER["Browser"]
        SETUP["setup<br/><small>auth.setup.ts</small>"]
        CH["chromium<br/><small>UI E2E</small>"]
        CHM["chromium-mock<br/><small>page.route</small>"]
        FF["firefox"]
        WK["webkit"]
    end

    SETUP --> CH & FF & WK

    style UNIT fill:#e8f5e9
    style API fill:#e8f5e9
    style MOCK fill:#fff3e0
    style CHM fill:#fff3e0
    style SETUP fill:#e3f2fd
```

| Project | `testMatch` | Depends on | Browser | Typical runtime |
|---------|-------------|------------|---------|-----------------|
| `unit` | `tests/unit/**` | — | No | ~2s |
| `api` | `tests/api/**` (excl. mock) | — | No* | ~2s |
| `api-mock` | `msw-*`, `container-*` | — | No* | ~5–40s |
| `setup` | `auth.setup.ts` | — | Yes | ~2s |
| `chromium` | `tests/ui/**` (excl. network-mock) | `setup` | Yes | ~5s |
| `chromium-mock` | `network-mock.spec.ts` | — | Yes | ~2s |
| `firefox` / `webkit` | `tests/ui/**` | `setup` | Yes | nightly |

\*Uses Playwright `request` or Node `fetch` — no browser window.

---

## 3. Fixture composition

Fixtures are **typed dependency injection layers**. Each layer extends the one below.

```mermaid
flowchart BT
    BASE["@fixtures/index<br/>config · pages · apiClient"]
    AUTH["authenticated.fixture<br/>+ storageState"]
    MSW["msw.fixture<br/>+ mswServer · fetchApiClient"]
    TC["container.fixture<br/>+ wireMock · mockApiClient"]

    BASE --> AUTH
    BASE --> MSW
    BASE --> TC

    style BASE fill:#e3f2fd
    style AUTH fill:#f3e5f5
    style MSW fill:#fff8e1
    style TC fill:#fff8e1
```

| Fixture import | Use when |
|----------------|----------|
| `@fixtures/index` | Default UI/API tests |
| `@fixtures/authenticated.fixture` | UI tests that need login (skip login form) |
| `@fixtures/msw.fixture` | API tests with MSW + `fetch` |
| `@fixtures/container.fixture` | API tests against WireMock Docker |

```typescript
// Typed composition example
export type AuthenticatedFixtures = TestFixtures & { storageState: string };
```

---

## 4. Authentication flow

Login runs **once** per test run. Authenticated specs reuse `storageState`.

```mermaid
sequenceDiagram
    autonumber
    participant S as setup project
    participant B as Browser
    participant D as auth/.auth/user.json
    participant T as authenticatedTest

    Note over S,D: Runs once before UI projects
    S->>B: loginPage.login(credentials)
    B->>D: storageState({ path })

    Note over T,B: Every authenticated spec
    T->>B: load storageState (fixture)
    T->>B: dashboardPage.open()
    Note right of T: No login form interaction
```

| Spec type | Auth approach |
|-----------|---------------|
| `login.spec.ts` | Full UI login (tests the login journey) |
| `dashboard.spec.ts` | `authenticatedTest` |
| `authenticated.spec.ts` | `authenticatedTest` |
| `negative-login.spec.ts` | No auth (guest) |

---

## 5. API contract flow

Every live API test validates **status + schema + key fields**.

```mermaid
sequenceDiagram
    autonumber
    participant Spec as *.spec.ts
    participant Client as ApiClient
    participant API as External API
    participant Zod as Zod Schema

    Spec->>Client: getValidated(path, ApiUsersSchema)
    Client->>API: HTTP GET (Playwright request)
    API-->>Client: JSON body + status

    alt status mismatch
        Client-->>Spec: throw ApiRequestError
    else status OK
        Client->>Zod: schema.safeParse(body)
        alt schema fail
            Client-->>Spec: throw ApiValidationError
        else schema OK
            Client-->>Spec: typed data
        end
    end
```

### Error taxonomy

| Error | Trigger |
|-------|---------|
| `ApiRequestError` | HTTP status ≠ expected |
| `ApiValidationError` | Zod contract mismatch |
| `ApiParseError` | Body is not valid JSON |

---

## 6. Mocking strategies

Three tools. **Pick by test layer** — not by preference.

```mermaid
flowchart TD
    START(["Need to stub network?"])

    START --> Q1{"Who initiates<br/>the request?"}

    Q1 -->|Browser fetch/XHR| ROUTE["page.route<br/>utils/route-mocks.ts"]
    Q1 -->|Node fetch| Q2{"Need real HTTP<br/>server?"}
    Q1 -->|Playwright request| TC

    Q2 -->|No — fast stub| MSW["MSW setupServer<br/>FetchApiClient"]
    Q2 -->|Yes — isolated| TC["Testcontainers<br/>WireMock Docker"]

    ROUTE --> UI_TEST["tests/ui/network-mock.spec.ts"]
    MSW --> MSW_TEST["tests/api/msw-users.spec.ts"]
    TC --> TC_TEST["tests/api/container-users.spec.ts"]

    style ROUTE fill:#e8eaf6
    style MSW fill:#fff8e1
    style TC fill:#fce4ec
```

| Strategy | Client | Intercepts | Requires Docker |
|----------|--------|------------|-----------------|
| **MSW** | `FetchApiClient` | Node `fetch` | No |
| **Testcontainers** | `ApiClient` | Real HTTP to container | Yes |
| **page.route** | Browser `fetch` | Browser network | No |

> **Critical:** MSW does **not** patch Playwright's `request` fixture. Use `fetchApiClient` for MSW, or WireMock for `apiClient`.

```bash
npm run test:mock                              # all @mock tests
SKIP_DOCKER_TESTS=true npm run test:mock       # MSW + page.route only
```

---

## 7. CI pipeline

```mermaid
flowchart LR
    subgraph PR["PR — playwright.yml"]
        direction TB
        P1["validate<br/>typecheck · lint · format"]
        P2["test:pr<br/>unit + api + @smoke"]
        P1 --> P2
    end

    subgraph NIGHTLY["Nightly — playwright-nightly.yml"]
        direction TB
        N1["@regression"]
        N2["api · chromium · firefox · webkit"]
        N1 --> N2
    end

    PUSH["git push"] --> PR
    CRON["02:00 UTC"] --> NIGHTLY

    style PR fill:#e8f5e9
    style NIGHTLY fill:#e3f2fd
```

### Test tags

| Tag | Runs on PR | Runs nightly | Purpose |
|-----|------------|--------------|---------|
| `@smoke` | Yes | Yes | Critical path |
| `@regression` | No | Yes | Full coverage |
| `@mock` | No | Yes* | MSW, Docker, page.route |
| `@quarantine` | No | No | Flaky — under investigation |

\*Run locally with `npm run test:mock`.

### Reliability policies

| Policy | Value |
|--------|-------|
| PR retries | `0` |
| Nightly retries | `1` max |
| CI trace | `retain-on-failure` |
| Parallel data | `uniqueSuffix()` includes worker index |
| Sleeps | **Forbidden** — use auto-wait + `expect` |

---

## 8. Test decision tree

```mermaid
flowchart TD
    NEW(["New test needed"])

    NEW --> LAYER{"What layer?"}

    LAYER -->|Pure logic| UNIT["tests/unit/"]
    LAYER -->|HTTP contract| API_Q{"Live or mocked?"}
    LAYER -->|Browser journey| UI_Q{"Needs login?"}

    API_Q -->|Live API| API["tests/api/<br/>apiClient + Zod"]
    API_Q -->|MSW stub| MSW_T["tests/api/msw-*<br/>fetchApiClient"]
    API_Q -->|Docker stub| CON_T["tests/api/container-*<br/>mockApiClient"]

    UI_Q -->|Tests login form| UI_LOGIN["tests/ui/<br/>base test fixture"]
    UI_Q -->|Already logged in| UI_AUTH["tests/ui/<br/>authenticatedTest"]
    UI_Q -->|Network mock only| UI_ROUTE["tests/ui/network-mock<br/>page.route"]

    API --> TAG["Tag @smoke or @regression"]
    MSW_T --> TAG_MOCK["Tag @mock @regression"]
    CON_T --> TAG_MOCK
    UI_LOGIN --> TAG
    UI_AUTH --> TAG
    UI_ROUTE --> TAG_MOCK
```

---

## Locator strategy

Sauce Demo uses `data-test` attributes — configured via `testIdAttribute: 'data-test'`.

| Priority | Method | Example |
|----------|--------|---------|
| 1 | Role / label / placeholder | `getByRole('button', { name: 'Login' })` |
| 2 | Test ID | `getByTestId('shopping-cart-badge')` |
| 3 | CSS (document why) | `.bm-menu-wrap` — third-party burger menu |

---

## Extension points

| Need | Where |
|------|-------|
| New API entity | `schemas/api.schemas.ts` → `ApiClient` methods |
| New page | `pages/NewPage.ts` → `fixtures/index.ts` |
| New environment | `ENVIRONMENTS` + `.env.{name}` |
| New fixture layer | `fixtures/*.fixture.ts` with typed composition |
| New mock handler | `mocks/handlers.ts` or `docker/wiremock/mappings/` |
| OpenAPI contracts | Generate types → align Zod schemas |

---

## Related docs

- [LEARNING.md](./LEARNING.md) — hands-on curriculum
- [lessons/11-mocking-strategies.md](./lessons/11-mocking-strategies.md) — mocking deep dive
- [../README.md](../README.md) — quick start
