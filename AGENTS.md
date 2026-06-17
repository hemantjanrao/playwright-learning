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
├── tests/ui/           # E2E specs
├── tests/api/          # API specs
├── tests/setup/        # Auth storageState setup
├── pages/              # Page Object Model
├── fixtures/           # Custom Playwright fixtures
├── utils/              # Config, API client, helpers
├── test-data/          # Static JSON fixtures
├── types/              # TypeScript interfaces
├── config/             # Environment defaults
└── .github/workflows/  # CI
```

## Key commands

```bash
npm install && npx playwright install
npm test                  # full suite
npm run test:ui           # UI only
npm run test:api          # API only
npm run test:chromium     # single browser
npm run test:headed       # headed mode
npm run test:debug        # debug mode
npm run report            # HTML report
npm run validate          # typecheck + lint + format
```

## Senior SDET focus areas

- **Test strategy** — pyramid, risk-based coverage, what not to automate
- **Playwright** — resilient locators, page objects, fixtures, traces
- **Reliability** — eliminate flakiness; no sleep-based waits
- **CI** — fast PR feedback, artifacts on failure, parallel workers
- **Quality bar** — clear names, isolated data, actionable failures

## Skills map

| Skill                                | Path                                                |
| ------------------------------------ | --------------------------------------------------- |
| Senior SDET                          | `.cursor/skills/senior-sdet/SKILL.md`               |
| Playwright patterns (deep reference) | `.cursor/skills/senior-sdet/playwright-patterns.md` |

## Safety

- Never commit `.env`, credentials, or session tokens
- Use `.env.example` with placeholder keys only
- Prefer test accounts and isolated environments over production
