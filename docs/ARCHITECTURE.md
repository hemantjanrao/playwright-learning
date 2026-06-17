# Framework Architecture

Production-grade Playwright + TypeScript test automation framework. This document explains how layers connect and why each exists.

## High-level diagram

```mermaid
flowchart TB
    subgraph CI["CI/CD Tiers"]
        PR["PR: unit + api + @smoke"]
        NIGHTLY["Nightly: @regression × all browsers"]
    end

    subgraph Tests["Test Layer"]
        UNIT["tests/unit/"]
        API["tests/api/"]
        UI["tests/ui/"]
        SETUP["tests/setup/auth.setup.ts"]
    end

    subgraph Framework["Framework Layer"]
        FIX["fixtures/"]
        PAGES["pages/"]
        BUILD["builders/"]
        UTILS["utils/"]
    end

    subgraph Contracts["Contract Layer"]
        SCHEMAS["schemas/ — Zod"]
        TYPES["types/ — TS types"]
    end

    subgraph Config["Configuration"]
        ENV[".env.* files"]
        PWCFG["playwright.config.ts"]
        LOADER["config-loader.ts"]
    end

    PR --> UNIT & API & UI
    NIGHTLY --> API & UI

    UNIT --> SCHEMAS & UTILS
    API --> FIX & SCHEMAS
    UI --> FIX & PAGES & SETUP

    FIX --> PAGES & UTILS & LOADER
    UTILS --> SCHEMAS & TYPES
    BUILD --> SCHEMAS
    PAGES --> UTILS

    LOADER --> ENV & SCHEMAS
    PWCFG --> LOADER

    SETUP --> FIX & PAGES
```

## Test pyramid (enforced)

```mermaid
flowchart LR
    subgraph Pyramid["Test Pyramid"]
        E2E["E2E UI — few, critical journeys"]
        API_T["API — contract tests"]
        UNIT_T["Unit — framework code"]
    end

    UNIT_T --> API_T --> E2E
```

| Layer    | Location       | Playwright project                | Browser?            |
| -------- | -------------- | --------------------------------- | ------------------- |
| Unit     | `tests/unit/`  | `unit`                            | No                  |
| API      | `tests/api/`   | `api`                             | No (uses `request`) |
| UI setup | `tests/setup/` | `setup`                           | Yes (once)          |
| UI E2E   | `tests/ui/`    | `chromium` / `firefox` / `webkit` | Yes                 |

## Playwright projects

```mermaid
flowchart LR
    SETUP["setup\n(auth.setup.ts)"]
    CH["chromium\n(UI specs)"]
    FF["firefox\n(UI specs)"]
    WK["webkit\n(UI specs)"]
    API_P["api\n(API specs)"]
    UNIT_P["unit\n(unit specs)"]

    SETUP --> CH & FF & WK
    API_P -.->|no dependency| API_P
    UNIT_P -.->|no dependency| UNIT_P
```

**Key design decision:** API and unit tests do **not** depend on browser auth setup. This keeps PR runs fast and layers decoupled.

## Authentication flow

```mermaid
sequenceDiagram
    participant Setup as auth.setup.ts
    participant Browser
    participant Disk as auth/.auth/user.json
    participant Test as authenticated.spec.ts

    Setup->>Browser: UI login once
    Setup->>Disk: save storageState
    Test->>Browser: load storageState
    Test->>Browser: goto /inventory.html
    Note over Test: No login form interaction
```

## Data flow (API contract test)

```mermaid
sequenceDiagram
    participant Spec as users-get.spec.ts
    participant Client as ApiClient
    participant API as External API
    participant Zod as Zod Schema

    Spec->>Client: getValidated(path, ApiUsersSchema)
    Client->>API: HTTP GET
    API-->>Client: JSON body
    Client->>Client: check status code
    Client->>Zod: schema.safeParse(body)
    Zod-->>Client: typed ApiUser[]
    Client-->>Spec: validated data
```

## Folder responsibilities

| Folder         | Responsibility                                            |
| -------------- | --------------------------------------------------------- |
| `tests/unit/`  | Framework logic — config, schemas, builders, URL builder  |
| `tests/api/`   | HTTP contract tests — status + Zod schema + key fields    |
| `tests/ui/`    | Browser E2E — user journeys                               |
| `tests/setup/` | One-time auth, saves `storageState`                       |
| `pages/`       | Page Objects — locators + actions only (no assertions)    |
| `fixtures/`    | Dependency injection — pages, config, apiClient           |
| `schemas/`     | **Single source of truth** — Zod schemas, `z.infer` types |
| `types/`       | TS-only types — branded IDs, unions, utility types        |
| `builders/`    | Fluent test data builders                                 |
| `utils/`       | Config loader, API client, logger, constants, tags        |
| `test-data/`   | Static JSON — validated at load time via Zod              |

## CI tiers

| Tier       | Trigger        | Command                           | Target time |
| ---------- | -------------- | --------------------------------- | ----------- |
| PR         | push / PR      | `npm run test:pr`                 | < 5 min     |
| Nightly    | cron 02:00 UTC | `--grep @regression` all projects | < 45 min    |
| Local full | manual         | `npm test`                        | varies      |

### Test tags

| Tag           | Purpose                                       |
| ------------- | --------------------------------------------- |
| `@smoke`      | Critical path — runs on every PR              |
| `@regression` | Full coverage — runs nightly                  |
| `@quarantine` | Flaky / under investigation — exclude from PR |

## Locator strategy

Priority order (enforced in page objects):

1. `getByRole` / `getByLabel` / `getByPlaceholder`
2. `getByTestId` — `data-test` attributes
3. CSS — only when no semantic alternative (document why)

## Adding a new test (decision tree)

```
New test needed?
├── Pure logic / schema / config?     → tests/unit/
├── HTTP endpoint contract?           → tests/api/ + Zod schema
└── User journey in browser?
    ├── Needs login?
    │   ├── Testing login itself?     → tests/ui/ + base fixture
    │   └── Already logged in?        → authenticatedTest fixture
    └── Tag with @smoke or @regression
```

## Error taxonomy (API layer)

| Error class          | When thrown                |
| -------------------- | -------------------------- |
| `ApiRequestError`    | HTTP status ≠ expected     |
| `ApiValidationError` | Zod schema mismatch        |
| `ApiParseError`      | Response is not valid JSON |

## Reliability policies

- **CI retries:** `0` on PR (`retries: 0`)
- **Nightly retries:** `1` max (`CI_TIER=nightly`)
- **Trace:** `on-failure` in CI, `on-first-retry` locally
- **Parallel data:** `uniqueSuffix()` includes `TEST_PARALLEL_INDEX`
- **No `waitForTimeout`** — use Playwright auto-wait + `expect`

## Extension points

| Need              | Where to extend                                               |
| ----------------- | ------------------------------------------------------------- |
| New API entity    | `schemas/api.schemas.ts` → `ApiClient` methods                |
| New page          | `pages/NewPage.ts` → register in `fixtures/index.ts`          |
| New env           | Add to `ENVIRONMENTS` + `.env.{name}`                         |
| New fixture layer | `fixtures/*.fixture.ts` extending base with typed composition |
| OpenAPI contracts | Generate types → align Zod schemas                            |
