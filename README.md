# Playwright TypeScript Test Automation Framework

My Playwright + TypeScript practice framework for advanced patterns beyond my production work: Page Object Model, Zod contracts, typed fixtures, tiered CI with sharding, and API mocking with MSW and WireMock.

---

## Quick start

```bash
npm install
npx playwright install
cp .env.example .env.dev
npm run test:pr        # CI PR tier — ~10s
```

---

## Architecture snapshot

```mermaid
flowchart TB
    subgraph SPECS["tests/ — what runs"]
        direction LR
        UNIT["unit/<br/>no browser"]
        API["api/<br/>HTTP contracts"]
        UI["ui/<br/>browser E2E"]
        SETUP["setup/<br/>auth storageState"]
    end

    subgraph FX["fixtures/ — typed DI"]
        direction LR
        BASE["index.ts<br/>test · config · apiClient · pages"]
        AUTH["authenticated.fixture"]
        MSWF["msw.fixture"]
        CONT["container.fixture"]
    end

    subgraph FW["Framework"]
        direction LR
        POM["pages/ + components/<br/>BasePage → Header"]
        CLIENT["utils/api-client<br/>ApiClient · ApiResult"]
        CFG["utils/config-loader<br/>.env → Zod"]
        SCH["schemas/<br/>Zod contracts"]
    end

    subgraph TARGETS["Systems under test"]
        direction LR
        TS["Toolshop UI :4200 + API :8091<br/>docker/toolshop"]
        JP["JSONPlaceholder<br/>live API"]
        MOCKS["MSW · WireMock<br/>Testcontainers"]
    end

    UNIT --> BASE
    API --> BASE
    API --> MSWF
    API --> CONT
    UI --> BASE
    UI --> AUTH
    SETUP --> AUTH
    BASE --> POM
    BASE --> CLIENT
    BASE --> CFG
    CLIENT --> SCH
    CFG --> SCH
    POM --> TS
    CLIENT --> JP
    MSWF --> MOCKS
    CONT --> MOCKS
```

---

## Running tests

| Command                   | What runs                    | When to use               |
| ------------------------- | ---------------------------- | ------------------------- |
| `npm run test:pr`         | unit + api + `@smoke`        | Before every push         |
| `npm run test:smoke`      | Critical path                | Quick confidence          |
| `npm run test:regression` | Full `@regression`           | Pre-release               |
| `npm run test:shard`      | Pass `--shard=i/N` + filters | Simulate CI sharding      |
| `npm run test:mock`       | MSW + Docker + `page.route`  | Mocking work              |
| `npm run test:unit`       | Framework unit tests         | After utils changes       |
| `npm run test:api`        | Live API contracts           | After API client changes  |
| `npm run test:ui`         | UI E2E chromium              | After page object changes |
| `npm run validate`        | typecheck + lint + format    | Quality gate              |

---

## Project structure

```
playwright-ts-framework/
├── schemas/                   # Zod — single source of truth
├── mocks/                     # MSW handlers
├── docker/wiremock/           # Testcontainers stub mappings
├── fixtures/                  # Typed DI layers (base, auth, msw, container)
├── pages/                     # Page Objects
├── builders/                  # Fluent test data
├── types/                     # Branded types, unions
├── utils/                     # API clients, config, route mocks
├── tests/
│   ├── unit/                  # No browser
│   ├── api/                   # HTTP contracts + mocks
│   ├── ui/                    # Browser E2E
│   └── setup/                 # Auth storageState
└── .github/
    ├── workflows/             # PR, nightly, mock
    └── actions/               # Reusable composite actions
```

---

## Demo targets

| Layer     | Target                                                  | Project                           |
| --------- | ------------------------------------------------------- | --------------------------------- |
| Unit      | Framework code                                          | `unit`                            |
| API       | [JSONPlaceholder](https://jsonplaceholder.typicode.com) | `api`                             |
| API mocks | MSW + WireMock Docker                                   | `api-mock`                        |
| UI        | Toolshop (local Docker, `docker/toolshop`)              | `chromium` / `firefox` / `webkit` |

---

## CI tiers

```mermaid
flowchart TB
    subgraph PR["PR + push main — playwright.yml"]
        Q["Lint & Typecheck"]
        U["Unit tests<br/>--project=unit"]
        A["API contracts<br/>--project=api"]
        DK["Start Toolshop (Docker)<br/>migrate:fresh --seed"]
        S["Smoke E2E<br/>chromium + chromium-guest · @smoke"]
        F["PR failure summary<br/>comment on PR"]
        Q --> U
        Q --> A
        Q --> DK --> S
        U -.->|on failure| F
        A -.->|on failure| F
        S -.->|on failure| F
    end

    subgraph MOCK["PR + push main — playwright-mock.yml"]
        MK["@mock · MSW + WireMock + page.route"]
    end

    subgraph NIGHTLY["02:00 UTC / manual — playwright-nightly.yml"]
        MX["build shard matrix<br/>api 1/1 · 6 browser projects × N shards"]
        M["@regression per shard<br/>environment: dev / qa / staging"]
        MERGE["merge blob reports → HTML"]
        PUB["publish-pages<br/>if ENABLE_GITHUB_PAGES=true"]
        MX --> M --> MERGE --> PUB
    end
```

### Required branch protection checks

On `main`, require these status checks from the PR workflow:

- `Lint & Typecheck`
- `Unit tests`
- `API contracts`
- `Smoke E2E`

### CI reports

1. Failed PR → workflow run → **Artifacts** → `playwright-html-report-*`
2. Open `index.html` locally: `npm run report`
3. Traces: download `playwright-test-results-*` → [trace.playwright.dev](https://trace.playwright.dev)
4. Nightly dashboard: enable **Settings → Pages → Source: GitHub Actions**, set repo variable `ENABLE_GITHUB_PAGES=true`, then re-run nightly

```bash
CI=true npm run test:pr    # reproduce PR tier locally
```

---

## Code patterns

```typescript
// API contract (live)
const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema);

// Authenticated UI
import { authenticatedTest as test } from '@fixtures/authenticated.fixture';

// CI tiering
test('...', { tag: ['@smoke', '@regression'] }, async () => { ... });
```

---

## License

Personal project, shared for reference.

### Review hardening

Shell/CI environment variables override local dotenv files. Environment files are ignored;
copy `.env.example` for each environment you need. Browser commands include their guest
projects; direct `--project=chromium` selects only the authenticated browser project.
Use `--project=chromium-guest` to run login and guest-access checks without auth setup.

Mock tests run on every PR and main/master push. Quarantined tests are excluded by default;
use `npm run test:quarantine` for an explicit investigation run.

