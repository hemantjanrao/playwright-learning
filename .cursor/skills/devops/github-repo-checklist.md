# GitHub repo checklist — test automation

Use this when guiding the user to make the repository production-ready. Work top-to-bottom; skip items already done.

## 1. Repository basics

- [ ] **Default branch** is `main` (or `master` — match workflow `branches` filters).
- [ ] **README** includes: quick start, `npm run test:pr`, CI badge, link to architecture doc.
- [ ] **`.gitignore`** excludes `node_modules/`, `reports/`, `test-results/`, `.env*`, `auth/.auth/`.
- [ ] **`.env.example`** lists every secret key CI needs (no real values).

### README badges (add after first green CI run)

```markdown
![Playwright PR](https://github.com/OWNER/REPO/actions/workflows/playwright.yml/badge.svg)
![Nightly](https://github.com/OWNER/REPO/actions/workflows/playwright-nightly.yml/badge.svg)
```

Replace `OWNER/REPO` with the actual path.

---

## 2. GitHub Actions secrets

**Settings → Secrets and variables → Actions → New repository secret**

| Secret         | Purpose        | Required for demo                          |
| -------------- | -------------- | ------------------------------------------ |
| `BASE_URL`     | App under test | Optional (workflow has Sauce Demo default) |
| `API_BASE_URL` | API contracts  | Optional                                   |
| `E2E_USERNAME` | Login user     | Optional                                   |
| `E2E_PASSWORD` | Login password | Optional                                   |

For real environments, **all four are required**. Never put values in the repo.

### Environment-scoped secrets (recommended for qa/staging)

**Settings → Environments → New environment**

| Environment | Use case                         |
| ----------- | -------------------------------- |
| `dev`       | Default PR / development         |
| `qa`        | QA URL + credentials             |
| `staging`   | Pre-prod; optional approval gate |

Add the same secret names per environment with different values. Reference in workflow:

```yaml
environment: qa
env:
  TEST_ENV: qa
```

---

## 3. Branch protection

**Settings → Branches → Add branch protection rule → `main`**

- [ ] Require a pull request before merging
- [ ] Require status checks to pass:
  - `Lint & Typecheck` (job name from `playwright.yml`)
  - `Unit + API + Smoke E2E`
- [ ] Require branches to be up to date (optional but recommended)
- [ ] Do not allow bypassing (except admins, per team policy)

Job names must match workflow `jobs.<id>.name` exactly.

---

## 4. Actions permissions

**Settings → Actions → General**

- [ ] **Workflow permissions:** Read repository contents (default); grant write only in publish jobs via `permissions:` block.
- [ ] **Fork PR workflows:** Require approval for outside contributors (recommended).

---

## 5. GitHub Pages (report dashboard)

Only needed if publishing a persistent report site. See [reporting.md](reporting.md).

**Settings → Pages**

- [ ] **Source:** GitHub Actions (not "Deploy from branch" unless using legacy gh-pages branch flow)
- [ ] Custom domain (optional)

After first deploy, report URL is typically:
`https://<owner>.github.io/<repo>/` or environment-specific URL shown in Pages settings.

---

## 6. Pull request & issue templates

Create `.github/pull_request_template.md`:

```markdown
## Summary

-

## Test evidence

- [ ] `npm run validate` passes locally
- [ ] `npm run test:pr` passes locally
- [ ] New/changed tests tagged (`@smoke` / `@regression`)

## CI

- [ ] PR checks green
```

Optional: `.github/ISSUE_TEMPLATE/bug_report.md` for test failures with trace attachment instructions.

---

## 7. Dependabot

Create `.github/dependabot.yml`:

```yaml
version: 2
updates:
  - package-ecosystem: npm
    directory: /
    schedule:
      interval: weekly
    groups:
      playwright:
        patterns:
          - '@playwright/*'
          - 'playwright'
  - package-ecosystem: github-actions
    directory: /
    schedule:
      interval: monthly
```

---

## 8. CODEOWNERS (optional)

`.github/CODEOWNERS`:

```
.github/          @your-team/devops
playwright.config.ts  @your-team/qa-leads
tests/            @your-team/qa
```

---

## 9. Debugging CI failures (document in README)

Add a short section:

1. Open the failed PR check → **Summary** → download `playwright-html-report-pr` artifact.
2. Unzip and open `index.html`, or run locally: `npx playwright show-report reports/html`.
3. For traces: unzip `playwright-test-results-pr` → open `trace.zip` in [trace.playwright.dev](https://trace.playwright.dev).
4. Re-run locally with same env: `CI=true npm run test:pr`.

---

## 10. Optional enterprise features

| Feature                  | When                                             |
| ------------------------ | ------------------------------------------------ |
| Rulesets (org)           | Centralized branch rules across repos            |
| OIDC to cloud            | Tests need AWS/GCP roles without long-lived keys |
| Environments + reviewers | Staging/prod test gates                          |
| Repository rules         | Block force-push, require signed commits         |

---

## Verification script (for the agent)

After setup, confirm:

```bash
gh workflow list
gh secret list
gh api repos/{owner}/{repo}/branches/main/protection 2>/dev/null || echo "No branch protection API access"
```

Ask the user to confirm green PR run and artifact download works end-to-end.
