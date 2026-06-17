# Playwright Learning — Cursor Agent Guide

Production-ready Playwright TypeScript framework. Use this file as the project brief when working here.

## Agent mode

| Mode            | When                                                                       | How to invoke                                                            |
| --------------- | -------------------------------------------------------------------------- | ------------------------------------------------------------------------ |
| **Senior SDET** | Write/review tests, design coverage, debug flakiness, extend framework, CI | Say: _"Use senior-sdet skill"_ or `@.cursor/skills/senior-sdet/SKILL.md` |

Default to **Senior SDET** for all testing, QA automation, and Playwright work in this repo.

## Layout

```
playwright-learning/
├── docs/
│   ├── ARCHITECTURE.md     # System design + mermaid diagrams
│   ├── LEARNING.md         # Curriculum index — start here for learning
│   └── lessons/            # Step-by-step lessons
├── tests/
│   ├── unit/               # Framework unit tests (no browser)
│   ├── api/                # HTTP contract tests (no browser)
│   ├── ui/                 # Browser E2E specs
│   └── setup/              # Auth storageState setup
├── pages/                  # Page Object Model (locators + actions)
├── fixtures/               # Custom Playwright fixtures
├── schemas/                # Zod schemas — single source of truth
├── builders/               # Fluent test data builders
├── types/                  # TypeScript types (branded, unions, utilities)
├── utils/                  # Config, API client, logger, tags
├── test-data/              # Static JSON (Zod-validated at load)
└── .github/workflows/      # PR fast tier + nightly regression
```

## Key commands

```bash
npm install && npx playwright install
npm test                  # full suite (all projects)
npm run test:unit         # framework unit tests
npm run test:api          # API contract tests only
npm run test:ui           # UI E2E (chromium)
npm run test:smoke        # @smoke tagged tests
npm run test:regression   # @regression tagged tests
npm run test:pr           # simulates CI PR pipeline
npm run test:headed       # headed mode
npm run test:debug        # debug mode
npm run report            # HTML report
npm run validate          # typecheck + lint + format
```

## Architecture

See **[docs/ARCHITECTURE.md](docs/ARCHITECTURE.md)** for diagrams and layer responsibilities.

## Learning path

See **[docs/LEARNING.md](docs/LEARNING.md)** — start with Lesson 01.

## Senior SDET focus areas

- **Test strategy** — pyramid, risk-based coverage, CI tiers
- **Playwright** — resilient locators, page objects, fixtures, traces
- **Reliability** — retries 0 on PR, no sleep-based waits
- **Contracts** — Zod schemas for API, env, and test data
- **CI** — fast PR (`test:pr`), nightly regression

## Skills map

| Skill                                | Path                                                |
| ------------------------------------ | --------------------------------------------------- |
| Senior SDET                          | `.cursor/skills/senior-sdet/SKILL.md`               |
| Playwright patterns (deep reference) | `.cursor/skills/senior-sdet/playwright-patterns.md` |

## Safety

- Never commit `.env`, credentials, or session tokens
- Use `.env.example` with placeholder keys only
- Prefer test accounts and isolated environments over production
