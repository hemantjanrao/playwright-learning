# Playwright TypeScript Test Automation Framework

Enterprise-grade Playwright framework: Page Object Model, Zod contract testing, typed fixtures, tiered CI, and a structured learning path.

## Documentation

| Doc                                          | Purpose                                         |
| -------------------------------------------- | ----------------------------------------------- |
| [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) | System design, mermaid diagrams, decision trees |
| [docs/LEARNING.md](docs/LEARNING.md)         | **Start here to learn** — lesson curriculum     |
| [AGENTS.md](AGENTS.md)                       | Cursor agent brief                              |

## Tech stack

- Playwright + TypeScript (strict)
- Zod — runtime contracts (API, env, test data)
- ESLint + Prettier + `eslint-plugin-playwright`
- Faker.js — parallel-safe dynamic data
- GitHub Actions — PR fast tier + nightly regression

## Demo targets

| Layer | Target                                                  | Playwright project                |
| ----- | ------------------------------------------------------- | --------------------------------- |
| Unit  | Framework code                                          | `unit` (no browser)               |
| API   | [JSONPlaceholder](https://jsonplaceholder.typicode.com) | `api` (no browser)                |
| UI    | [Sauce Demo](https://www.saucedemo.com)                 | `chromium` / `firefox` / `webkit` |

## Quick start

```bash
npm install
npx playwright install
cp .env.example .env.dev
npm run test:pr    # simulates CI — unit + api + smoke
```

## Running tests

```bash
npm test                  # full suite (all projects)
npm run test:unit         # framework unit tests
npm run test:api          # API contracts only
npm run test:ui           # UI E2E (chromium)
npm run test:smoke        # @smoke — PR tier
npm run test:regression   # @regression — nightly tier
npm run test:pr           # unit + api + smoke (CI PR pipeline)
npm run test:headed
npm run test:debug
npm run report
npm run validate          # typecheck + lint + format
```

## Test pyramid

```
        ┌─────────┐
        │  UI E2E │  few, @smoke on PR
        ├─────────┤
        │   API   │  contract tests, every PR
        ├─────────┤
        │  Unit   │  framework logic, every PR
        └─────────┘
```

## Folder structure

```
├── docs/                  # Architecture + learning curriculum
├── schemas/               # Zod schemas (single source of truth)
├── builders/              # Fluent test data builders
├── tests/
│   ├── unit/              # No browser
│   ├── api/               # HTTP only
│   ├── ui/                # Browser E2E
│   └── setup/             # Auth storageState
├── pages/                 # Page Objects (locators + actions)
├── fixtures/              # Custom fixtures (typed)
├── types/                 # Branded types, unions, utilities
├── utils/                 # API client, config, logger, tags
├── test-data/             # JSON fixtures (Zod-validated)
└── .github/workflows/
    ├── playwright.yml         # PR: validate + test:pr
    └── playwright-nightly.yml # Full @regression matrix
```

## CI tiers

| Tier    | Workflow                 | What runs                          |
| ------- | ------------------------ | ---------------------------------- |
| PR      | `playwright.yml`         | lint, typecheck, unit, api, @smoke |
| Nightly | `playwright-nightly.yml` | @regression × api + all browsers   |

**Reliability:** `retries: 0` on PR. Traces on failure in CI.

## Authentication

1. **UI login test** — `login.spec.ts` exercises the login form
2. **storageState** — `auth.setup.ts` logs in once; `authenticatedTest` fixture reuses session
3. Dashboard/cart tests use `authenticatedTest` — no repeated UI login

## Adding tests

See the decision tree in [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md#adding-a-new-test-decision-tree).

```typescript
// API contract test
const users = await apiClient.getValidated(API_ENDPOINTS.users, ApiUsersSchema);

// Authenticated UI test
import { authenticatedTest as test } from '@fixtures/authenticated.fixture';

// Tag for CI tiering
test('...', { tag: '@smoke' }, async () => { ... });
```

## Learning

Open **[docs/LEARNING.md](docs/LEARNING.md)** and start with Lesson 01, or ask the agent:

> "Teach me Lesson 01"

## License

Private — learning / internal use.
