---
name: devops
description: >-
  DevOps for GitHub and CI/CD in Playwright test automation repos. Creates
  GitHub Actions workflows, configures branch protection and secrets, publishes
  HTML/Allure reports and GitHub Pages dashboards, and guides repo hygiene for
  production-grade test automation. Use when the user mentions pipelines, GitHub
  Actions, CI/CD, reporting pages, artifacts, branch protection, environments,
  badges, gh-pages, or making a test repo CI-ready.
---

# DevOps — GitHub & Test Automation CI/CD

## Quick start

1. Read existing `.github/workflows/` and `playwright.config.ts`.
2. Identify tier: **PR** (`test:pr`), **nightly** (`@regression`), **mock** (`test:mock`).
3. Pick reporting: artifacts (default) → GitHub Pages (dashboard) → Allure (trends).
4. Implement workflow YAML in repo; give user a **GitHub UI checklist** for secrets and branch protection.
5. Verify with `gh workflow list` / `gh run list` when `gh` is available.

## Workflows

### Create a new pipeline

```
- [ ] Define trigger (pull_request, schedule, workflow_dispatch)
- [ ] Add env: CI=true, CI_TIER=pr|nightly, TEST_ENV
- [ ] Job 1: checkout → setup-node (cache npm) → npm ci → npm run validate
- [ ] Job 2: playwright install → npm run test:<tier>
- [ ] Upload reports/html on failure (PR) or always (nightly)
- [ ] Upload test-results on failure
- [ ] Document required secrets in .env.example
- [ ] Add job names to branch protection required checks
```

### Fix a failing pipeline

1. `gh run view <id> --log-failed` or Actions tab logs.
2. Classify: **install** / **env secret** / **test failure** / **timeout** / **Docker**.
3. Install issues → `npx playwright install --with-deps`.
4. Secret issues → document in checklist; never commit values.
5. Test failures → hand off to Senior SDET; keep artifact upload steps intact.

### Add a new environment (qa / staging)

1. Create GitHub Environment: Settings → Environments → New.
2. Add environment-scoped secrets (`BASE_URL`, etc.).
3. Add `workflow_dispatch` input or branch/tag trigger.
4. Set `TEST_ENV: ${{ inputs.test_env }}` in workflow `env`.
5. Optional: required reviewers on environment for production-like gates.

## GitHub repo perfection

Use [github-repo-checklist.md](github-repo-checklist.md) as the master checklist. Summarize for the user in priority order — don't dump the entire doc unless asked.

**Minimum viable production repo:**

| Area       | Must have                                      |
| ---------- | ---------------------------------------------- |
| CI         | PR workflow + validate gate                    |
| Secrets    | Documented in `.env.example`, stored in GitHub |
| Protection | `main` requires PR + passing checks            |
| Reports    | HTML artifact on failure                       |
| Docs       | README badge + "how to debug CI" section       |

**Recommended upgrades:**

- Nightly regression matrix
- GitHub Pages report dashboard ([reporting.md](reporting.md))
- PR template requiring test evidence
- Dependabot for npm + Actions
- Environments for qa/staging

## Reporting

See [reporting.md](reporting.md) for:

- Playwright HTML via artifacts (current default)
- GitHub Pages static report site
- Allure generate + publish
- PR comment with report link

**Rule:** PR workflows upload artifacts on **failure** (save storage). Nightly uploads on **always** (trend/debug).

## Pipeline templates

See [pipeline-patterns.md](pipeline-patterns.md) for copy-paste workflow snippets:

- PR fast tier (existing)
- Nightly browser matrix (existing)
- Mock tier with Docker
- Report publish to GitHub Pages
- Reusable workflow extraction

When adding workflows, **match naming**: `playwright.yml`, `playwright-nightly.yml`, `playwright-mock.yml`, `publish-reports.yml`.

## gh CLI reference

```bash
# Workflows
gh workflow list
gh workflow run playwright-nightly.yml -f test_env=qa
gh run watch

# Secrets (repo-level)
gh secret set E2E_PASSWORD
gh secret list

# Environments
gh api repos/{owner}/{repo}/environments

# Pages status
gh api repos/{owner}/{repo}/pages
```

Use `required_permissions: ["all"]` or `network` when running `gh` in sandboxed shells.

## Security

- Never commit `.env`, `auth/.auth/`, or real credentials.
- Use `${{ secrets.NAME }}` — not `env:` with literal passwords in YAML.
- Restrict `workflow_dispatch` to maintainers if tests hit production-like URLs.
- Pin Actions to major versions (`@v4`); let Dependabot propose bumps.
- `permissions:` block — default read-only; grant `pages: write` only in publish job.

## Coordination with other agents

| Topic                          | Agent                       |
| ------------------------------ | --------------------------- |
| Write/fix tests, tags, flakes  | Senior SDET                 |
| Explain CI concepts to new QAs | Framework Coach (Lesson 09) |
| Pipeline YAML, GitHub settings | DevOps (this skill)         |

## Additional resources

- [github-repo-checklist.md](github-repo-checklist.md) — full GitHub UI setup
- [pipeline-patterns.md](pipeline-patterns.md) — workflow YAML patterns
- [reporting.md](reporting.md) — HTML, Allure, Pages, PR comments
