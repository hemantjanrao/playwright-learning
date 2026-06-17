# Playwright TypeScript Test Automation Framework

Production-ready Playwright framework with Page Object Model, typed API client, multi-environment config, custom fixtures, and GitHub Actions CI.

## Tech stack

- Playwright + TypeScript
- ESLint + Prettier
- dotenv (multi-environment)
- Faker.js (dynamic test data)
- Playwright HTML report (+ optional Allure)

## Demo targets

| Layer | Target                                                  | Purpose                      |
| ----- | ------------------------------------------------------- | ---------------------------- |
| UI    | [Sauce Demo](https://www.saucedemo.com)                 | Login, dashboard, auth flows |
| API   | [JSONPlaceholder](https://jsonplaceholder.typicode.com) | GET/POST contract examples   |

Replace URLs and credentials in `.env.*` files when pointing at your own application.

## Prerequisites

- Node.js 20+ (LTS)
- npm 10+

## Setup

```bash
# Install dependencies
npm install

# Install Playwright browsers
npx playwright install

# Copy environment template (if needed)
cp .env.example .env.dev
```

## Environment configuration

Environment files:

| File           | Purpose                     |
| -------------- | --------------------------- |
| `.env.dev`     | Local development (default) |
| `.env.qa`      | QA environment              |
| `.env.staging` | Staging environment         |
| `.env.example` | Template (safe to commit)   |

Set `TEST_ENV` to load the matching file:

```bash
TEST_ENV=qa npm test
# or
npm run test:qa
```

Required variables:

| Variable        | Description            |
| --------------- | ---------------------- |
| `BASE_URL`      | Application under test |
| `API_BASE_URL`  | API base URL           |
| `E2E_USERNAME`  | UI test username       |
| `E2E_PASSWORD`  | UI test password       |
| `HEADLESS`      | `true` / `false`       |
| `ALLURE_REPORT` | Enable Allure reporter |

**Never commit real secrets.** Use GitHub Actions secrets in CI.

## Running tests

```bash
# All tests (all browser projects)
npm test

# UI tests only
npm run test:ui

# API tests only
npm run test:api

# Specific browser
npm run test:chromium
npm run test:firefox
npm run test:webkit

# Headed / debug
npm run test:headed
npm run test:debug

# Environment-specific
npm run test:dev
npm run test:qa
npm run test:staging

# Allure-enabled run
npm run test:allure
npm run report:allure:open
```

## Reports and debugging

```bash
# Open Playwright HTML report
npm run report
```

Artifacts on failure:

- Screenshots (`only-on-failure`)
- Videos (`retain-on-failure`)
- Traces (`on-first-retry`)

Reports output to `reports/html/`. Traces and videos are in `test-results/`.

## Code quality

```bash
npm run lint
npm run lint:fix
npm run format
npm run format:check
npm run typecheck
npm run validate    # typecheck + lint + format check
```

## Folder structure

```
├── .github/workflows/     # CI pipelines
├── config/                # Environment defaults
├── fixtures/              # Custom Playwright fixtures
├── pages/                 # Page Object Model classes
├── test-data/             # Static JSON test data
├── tests/
│   ├── api/               # API contract tests
│   ├── setup/             # Auth storageState setup
│   └── ui/                # UI E2E tests
├── types/                 # Shared TypeScript interfaces
├── utils/                 # Config loader, API client, helpers
├── auth/.auth/            # Generated storageState (gitignored)
├── reports/               # HTML / Allure output (gitignored)
├── playwright.config.ts
└── tsconfig.json
```

## Authentication strategies

1. **UI login** — `LoginPage.login()` in tests (`login.spec.ts`, `dashboard.spec.ts`)
2. **storageState** — `tests/setup/auth.setup.ts` saves session to `auth/.auth/user.json`; `authenticated.spec.ts` reuses it via `authenticated.fixture.ts`

## Adding new tests

### UI test

1. Add or extend a page object in `pages/`
2. Create `tests/ui/<feature>.spec.ts`
3. Import `test` and `expect` from `@fixtures/index`
4. Use role/label locators; avoid `waitForTimeout`
5. Keep assertions in the spec (not in page objects)

### API test

1. Add types in `types/api.types.ts` if needed
2. Use `apiClient` fixture from `@fixtures/index`
3. Validate with `utils/api-assertions.ts` helpers

### Authenticated UI test

```typescript
import { authenticatedTest as test, expect } from '@fixtures/authenticated.fixture';
```

## CI/CD

GitHub Actions workflow: `.github/workflows/playwright.yml`

On each PR/push:

1. Install dependencies and browsers
2. Lint + typecheck
3. Run Playwright (default: Chromium)
4. Upload HTML report artifact
5. Upload traces/videos/screenshots on failure

Manual dispatch supports:

- `test_env`: dev | qa | staging
- `browser`: chromium | firefox | webkit | all

Configure repository secrets: `BASE_URL`, `API_BASE_URL`, `E2E_USERNAME`, `E2E_PASSWORD` (optional — defaults come from `.env.*` files in repo for demo).

## Best practices enforced

- Strict TypeScript (`noImplicitAny`, no unused locals)
- Locator priority: role → label → text → test id
- Parallel-safe tests with isolated data (Faker suffixes)
- No hardcoded URLs or credentials in source
- POM with typed locators and action methods only
- Config validation at startup

## License

Private — learning / internal use.
