# Pipeline patterns — GitHub Actions

Workflow snippets aligned with this repo's `package.json` scripts and `playwright.config.ts`.

## PR fast tier (existing)

File: `.github/workflows/playwright.yml`

```yaml
name: Playwright PR (fast tier)

on:
  pull_request:
    branches: [main, master]
  push:
    branches: [main, master]

env:
  TEST_ENV: dev
  HEADLESS: true
  CI: true
  CI_TIER: pr

jobs:
  quality:
    name: Lint & Typecheck
    runs-on: ubuntu-latest
    timeout-minutes: 10
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npm run validate

  test-fast:
    name: Unit + API + Smoke E2E
    runs-on: ubuntu-latest
    timeout-minutes: 15
    needs: quality
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:pr
        env:
          BASE_URL: ${{ secrets.BASE_URL }}
          API_BASE_URL: ${{ secrets.API_BASE_URL }}
          E2E_USERNAME: ${{ secrets.E2E_USERNAME }}
          E2E_PASSWORD: ${{ secrets.E2E_PASSWORD }}

      - name: Upload HTML report
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-html-report-pr
          path: reports/html/
          retention-days: 14

      - name: Upload traces on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-test-results-pr
          path: test-results/
          retention-days: 7
```

**Note:** Remove `|| 'default'` fallbacks in production repos — force secrets so misconfiguration fails loudly.

---

## Nightly regression matrix (existing)

File: `.github/workflows/playwright-nightly.yml`

Key patterns:

- `strategy.matrix.project` for `api`, `chromium`, `firefox`, `webkit`
- `fail-fast: false`
- `CI_TIER: nightly` → enables 1 retry in `playwright.config.ts`
- Upload HTML `if: always()` for dashboard history

---

## Mock tier (MSW + Docker)

File: `.github/workflows/playwright-mock.yml` (create when user needs CI for `@mock`)

```yaml
name: Playwright Mock tier

on:
  pull_request:
    paths:
      - 'tests/api/msw-*.spec.ts'
      - 'tests/api/container-*.spec.ts'
      - 'tests/ui/network-mock.spec.ts'
      - 'mocks/**'
      - 'docker/**'
      - 'fixtures/msw.fixture.ts'
      - 'fixtures/container.fixture.ts'
  workflow_dispatch:

env:
  CI: true
  CI_TIER: pr
  TEST_ENV: dev
  HEADLESS: true

jobs:
  mock-tests:
    name: MSW + Docker mocks
    runs-on: ubuntu-latest
    timeout-minutes: 30
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      # Docker available on ubuntu-latest — required for Testcontainers
      - run: npm run test:mock
      - name: Upload report on failure
        if: failure()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-mock-report
          path: reports/html/
          retention-days: 14
```

Skip Docker leg in PRs without Docker:

```yaml
- run: SKIP_DOCKER_TESTS=true npm run test:mock
```

---

## Manual environment run

```yaml
on:
  workflow_dispatch:
    inputs:
      test_env:
        description: Target environment
        type: choice
        options: [dev, qa, staging]
        default: dev
      grep:
        description: Tag filter
        type: choice
        options: ['@smoke', '@regression']
        default: '@smoke'

env:
  TEST_ENV: ${{ inputs.test_env }}
  CI: true
  CI_TIER: nightly

jobs:
  run:
    runs-on: ubuntu-latest
    environment: ${{ inputs.test_env }}
    steps:
      # ... standard setup ...
      - run: npx playwright test --grep ${{ inputs.grep }}
```

---

## Publish HTML report to GitHub Pages

File: `.github/workflows/publish-reports.yml`

Runs after nightly or on `workflow_run` completion. See [reporting.md](reporting.md) for full Pages setup.

```yaml
name: Publish test report

on:
  workflow_run:
    workflows: [Playwright Nightly (full regression)]
    types: [completed]

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: pages
  cancel-in-progress: false

jobs:
  publish:
    if: github.event.workflow_run.conclusion != 'cancelled'
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    steps:
      - uses: actions/download-artifact@v4
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          run-id: ${{ github.event.workflow_run.id }}
          pattern: nightly-report-*
          merge-multiple: true
          path: reports/html

      - uses: actions/upload-pages-artifact@v3
        with:
          path: reports/html

      - id: deployment
        uses: actions/deploy-pages@v4
```

**GitHub UI:** Settings → Pages → Build and deployment → Source: **GitHub Actions**.

---

## Allure in CI

```yaml
- run: npm run test:allure
  env:
    ALLURE_REPORT: true

- name: Generate Allure report
  if: always()
  run: npm run report:allure

- uses: actions/upload-artifact@v4
  if: always()
  with:
    name: allure-report
    path: reports/allure-report/
    retention-days: 30
```

Publish Allure to Pages by uploading `reports/allure-report/` instead of `reports/html/`.

---

## Reusable workflow (org scale)

`.github/workflows/reusable-playwright.yml`:

```yaml
on:
  workflow_call:
    inputs:
      tier:
        type: string
        required: true
      grep:
        type: string
        default: ''
    secrets:
      BASE_URL:
        required: false

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: npm
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: ${{ inputs.tier == 'pr' && 'npm run test:pr' || 'npm run test:nightly' }}
        env:
          CI: true
          CI_TIER: ${{ inputs.tier }}
          BASE_URL: ${{ secrets.BASE_URL }}
```

Caller:

```yaml
jobs:
  test:
    uses: ./.github/workflows/reusable-playwright.yml
    with:
      tier: pr
    secrets: inherit
```

---

## Job splitting (when PR is too slow)

```yaml
jobs:
  quality: ...
  unit-api:
    needs: quality
    steps:
      - run: playwright test --project=unit
      - run: playwright test --project=api
  smoke-ui:
    needs: quality
    steps:
      - run: npx playwright install --with-deps chromium
      - run: playwright test --project=chromium --grep @smoke
```

Parallel jobs reduce wall time; branch protection must list all required job names.

---

## Anti-patterns

| Anti-pattern                                         | Fix                                                        |
| ---------------------------------------------------- | ---------------------------------------------------------- |
| `npm test` without project filter on PR              | Use `npm run test:pr`                                      |
| `retries: 2` in workflow for PR                      | Remove — config sets `0` for PR                            |
| Caching `~/.cache/ms-playwright` without version pin | Use `playwright install` each run or official cache action |
| Uploading artifacts on every PR success              | `if: failure()` on PR tier                                 |
| Secrets in `env:` defaults in committed YAML         | GitHub Secrets only                                        |
