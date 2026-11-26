## Summary

<!-- What changed and why -->

## Test evidence

- [ ] `npm run validate` passes locally
- [ ] `npm run test:pr` passes locally
- [ ] New or changed tests tagged (`@smoke` / `@regression` / `@mock` as appropriate)

## CI

- [ ] PR checks green (`Lint & Typecheck`, `Unit tests`, `API contracts`, `Smoke E2E`)
- [ ] If mock files changed: `Playwright Mock tier` check green or N/A

## Reports (if tests failed in CI)

1. Open the failed workflow run → **Artifacts**
2. Download `playwright-html-report-*` and open `index.html`
3. For traces: download `playwright-test-results-*` → [trace.playwright.dev](https://trace.playwright.dev)
