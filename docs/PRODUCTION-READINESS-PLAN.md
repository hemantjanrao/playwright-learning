# Production readiness implementation plan

Date: 17 October 2026  
Status: Proposed; implementation has not started  
Scope: coding practices, framework design, automation coverage, CI, and agent guidance

## 1. Intended outcome

Evolve this learning framework into a dependable automation starter with explicit configuration, tested infrastructure, meaningful application coverage, and repeatable CI evidence. Preserve its educational value and existing useful abstractions.

Production readiness here means a reliable framework demonstrated against demo applications. Readiness for a particular production application additionally requires its own environments, accounts, data lifecycle, business contracts, and release criteria. Passing Sauce Demo and JSONPlaceholder tests does not establish those guarantees.

This plan authorizes no implementation, commits, issue creation, external messages, or GitHub settings changes. Each item below is a proposed implementation slice.

## 2. Review baseline

Evidence from the preceding review:

| Check                   | Observed result                                                             |
| ----------------------- | --------------------------------------------------------------------------- |
| TypeScript              | Passed as the first stage of `npm run validate`                             |
| Unit suite              | 12 tests passed                                                             |
| MSW API suite           | 3 tests passed                                                              |
| Full validation         | Failed with 101 lint errors from the nested `workbench-site/dist` directory |
| Targeted formatting     | Five files needed formatting                                                |
| Effective ESLint config | Recommended Playwright rules were overwritten by custom `rules`             |
| Environment precedence  | Dotenv uses `override: true`                                                |
| Mock workflow           | Path filters omit shared utilities, schemas, and dependency files           |
| Docker availability     | Container specs skip when Docker is unavailable, including CI               |
| Local tracing           | First-retry tracing combined with zero local retries                        |
| API client tests        | Cover URL construction, not response/error behavior                         |

Live API, browser, Docker, hosted CI behavior, and repository protection settings were not verified. Re-establish this baseline before implementation; these observations are not permanent claims about future revisions.

## 3. Design decisions

1. Keep TypeScript, Playwright, Zod, typed fixtures, and the current layered mocking tools.
2. Keep transport-specific HTTP clients. Share small response-processing functions where their behavior is genuinely identical; do not introduce a universal transport framework.
3. Separate loading environment inputs from parsing and validating configuration. Explicit process environment values take precedence over local files.
4. Validate configuration at the boundary that needs it. Pure unit tests and offline mocks must not require live UI credentials.
5. Keep business assertions in specs. Page/component objects expose locators and actions; use fixture assertions only for infrastructure readiness or invariants.
6. Use pages for screens and components for reusable UI regions. Inheritance is optional, not a requirement.
7. Use controlled tests for framework failure paths and a small set of live browser journeys for application acceptance.
8. Keep zero retries on PR. Treat retry-pass outcomes explicitly rather than presenting them as ordinary passes.
9. Keep learning material, but distinguish examples and exercises from supported framework contracts.
10. Define shared policies once in `AGENTS.md`; agents and skills link to them.

### Proposed module boundaries

```text
tests/unit/              Pure contracts, configuration, response processing, builders
tests/api/               Live demo contracts and controlled transport integration
tests/ui/                User-visible behavior and a small set of complete journeys
tests/setup/             Authentication preparation
fixtures/                Dependency injection, resource ownership, teardown
pages/                   Screen-specific actions and locators
components/              Reused UI regions, introduced only when needed
schemas/                 Runtime validation and inferred domain types
utils/                   Small infrastructure modules with explicit contracts
mocks/                   Controlled scenarios and payloads
docs/                    Architecture, operating guidance, learning, coverage map
```

Do not move files simply to match this diagram. Introduce boundaries through the slices below.

## 4. Delivery sequence

Effort estimates are focused engineering days for one experienced contributor, including relevant tests and review. They exclude account provisioning, CI queues, and the observation period. A learning implementation will take longer.

| Phase                                        | Items       | Estimated effort          | Exit condition                                                     |
| -------------------------------------------- | ----------- | ------------------------- | ------------------------------------------------------------------ |
| A — Establish reliable foundations           | PR-01–PR-03 | 3–5 days                  | Reproducible validation, enforced rules, predictable configuration |
| B — Harden framework contracts               | PR-04–PR-06 | 3–5 days                  | Tested clients, isolated mocks, explicit auth/data ownership       |
| C — Prove user outcomes                      | PR-07–PR-08 | 3–5 days                  | Reliable page boundaries and a complete purchase journey           |
| D — Make CI trustworthy                      | PR-09–PR-11 | 3–5 days                  | Correct selection, required execution, usable failure evidence     |
| E — Align guidance and demonstrate readiness | PR-12–PR-13 | 2–3 days plus observation | Consistent agent policies and an evidence-backed readiness report  |

Recommended sequence: PR-01 → PR-02 → PR-03 → PR-04 → PR-05 → PR-06 → PR-07 → PR-08 → PR-09 → PR-10 → PR-11 → PR-12 → PR-13. PR-09 can follow PR-03 sooner if missed mock coverage is the immediate concern. Update affected documentation within every slice; PR-12 is a final consolidation, not a reason to leave stale guidance.

## 5. Detailed implementation slices

### PR-01 — Restore a reproducible quality gate

**Priority:** Immediate. **Owner:** DevOps with SDET review. **Dependencies:** None.

**Files:** `eslint.config.js`, `.prettierignore`, `tsconfig.json`, `package.json`, `.github/actions/setup-node-playwright/action.yml`, README, and existing formatting failures.

**Changes:**

- Define the framework tooling boundary so the nested website is validated separately. Do not suppress legitimate framework errors.
- Decide whether `workbench-site` remains an intentionally managed nested repository; document its checkout expectations. Do not delete or rewrite it as part of lint cleanup.
- Correct existing formatting failures in a separate mechanical commit.
- Align declared Node/npm support with actual dependency engine requirements. Select and document one supported CI runtime, with a matching local version file.
- Use `npm ci` for reproducible onboarding; keep dependency updates separate from this cleanup unless required for compatibility.

**Acceptance and validation:**

- `npm ci`, `npm run validate`, and `npm run test:unit` pass in a clean checkout with documented prerequisites.
- Framework validation behaves consistently whether the nested website is populated or absent.
- The documented minimum runtime can actually install and validate the project.

### PR-02 — Enforce coding and test rules

**Priority:** Immediate. **Owner:** Senior SDET. **Dependencies:** PR-01.

**Files:** `eslint.config.js`, `tsconfig.json`, affected tests/fixtures, `AGENTS.md`.

**Changes:**

- Merge Playwright recommended rules rather than overwriting their rule object.
- Enable type-aware checks for floating promises and misused promises where the TypeScript project supports them.
- Resolve findings without blanket disables; document narrowly justified exceptions.
- Permit direct Playwright imports for pure unit tests and framework fixture definitions. Require extended fixtures where application tests depend on them.
- Assess `noUncheckedIndexedAccess` and `exactOptionalPropertyTypes` separately; adopt only with clear fixes and manageable scope.
- Use readable behavior-based names consistently; correct misleading users/posts test names.

**Acceptance and validation:**

- Inspect effective ESLint output to confirm no-wait, await, focus, and assertion checks are active at deliberate severities.
- Temporary representative bad examples are rejected, then removed; do not add a permanent suite that simply retests ESLint.
- Validation and the affected suites pass.

### PR-03 — Separate and secure configuration boundaries

**Priority:** Immediate. **Owner:** Senior SDET with DevOps review. **Dependencies:** PR-01–PR-02.

**Files:** `utils/config-loader.ts`, `schemas/config.schemas.ts`, `types/config.types.ts`, `fixtures/index.ts`, `playwright.config.ts`, environment templates, `.gitignore`, configure-test-env action, config unit tests.

**Changes:**

- Extract pure parsing/validation from environment-file loading. Avoid repeatedly mutating global process state per test.
- Define precedence: explicit environment values → selected local file → documented non-sensitive defaults.
- Add an explicit demo mode. Outside it, missing target configuration fails clearly instead of falling back to public demo systems.
- Validate boolean strings and positive worker counts strictly; reject malformed values.
- Separate shared runner settings from API and authenticated-UI requirements. Ensure Playwright config loading and test discovery do not force UI credentials on unit or offline-mock runs.
- Replace tracked private-environment filenames with templates through a documented migration. Preserve developers' local values; never print them.
- Default certificate validation on. Make any local-only exception explicit.

**Acceptance and validation:**

- Unit tests cover precedence, missing fields by capability, invalid values, and selected-file behavior using injected inputs or temporary files.
- Unit and offline mock commands run without UI credentials; authenticated execution fails early with a clear missing-credential message.
- A supplied `ALLURE_REPORT=true` survives file loading.
- No secrets appear in validation errors, reports, or committed templates.

### PR-04 — Define and test API response contracts

**Priority:** High. **Owner:** Senior SDET. **Dependencies:** PR-02–PR-03.

**Files:** `utils/api-client.ts`, `utils/fetch-api-client.ts`, `utils/api-errors.ts`, `types/api.types.ts`, API unit tests; a small shared response module if warranted.

**Changes:**

- Establish processing order: capture status/body → check expected status → parse expected JSON → validate schema.
- Return `unknown` for unvalidated success data. Require a schema before promising a domain type; update affected callers in the same slice.
- Define empty-body/204 behavior explicitly rather than treating all empty bodies as `{}`.
- Share tested response parsing and validation functions while preserving transport ownership.
- Add an explicit fetch deadline/cancellation mechanism; avoid background requests outliving tests.
- Keep unexpected HTTP, parse, validation, and transport failures distinguishable. Preserve useful causes.
- Bound and redact diagnostic bodies. Do not add automatic mutation retries.

**Acceptance and validation:**

| Scenario                                 | Expected result                     |
| ---------------------------------------- | ----------------------------------- |
| Expected status and valid JSON/schema    | Typed success                       |
| Unexpected status with JSON or HTML body | HTTP-status error preserving status |
| Expected status with malformed JSON      | Parse error                         |
| Expected status with wrong shape         | Validation error with field context |
| Documented no-content operation          | Explicit no-content success         |
| Aborted or timed-out fetch               | Bounded failure with useful cause   |
| Sensitive diagnostic fields              | Redacted output                     |

- Test shared behavior with controlled inputs and verify each transport with focused integration tests. Do not duplicate every pure case across both clients.
- Unit and MSW suites pass; run WireMock checks when the Playwright transport changes.

### PR-05 — Make mock resources isolated and deterministic

**Priority:** High. **Owner:** Senior SDET. **Dependencies:** PR-03–PR-04.

**Files:** `fixtures/msw.fixture.ts`, `fixtures/container.fixture.ts`, `mocks/`, `utils/docker.ts`, mock specs.

**Changes:**

- Reset MSW runtime handlers after every test, including failures.
- Keep unhandled requests as errors; prevent offline tests from silently reaching live services.
- Add a bounded Docker preflight. Local skipping must be explicit; required CI container execution must fail if unavailable.
- Document WireMock worker ownership. If mutable mappings/scenarios are introduced, reset them between tests.
- Preserve container and server teardown and verify resource cleanup during a controlled failure.

**Acceptance and validation:**

- A scenario override does not affect the next test in the same worker.
- Mock tests pass with one worker and multiple workers.
- Missing Docker cannot produce a green required container job.
- Inspect cleanup after a failing test; avoid implementation-mirroring teardown tests.

### PR-06 — Clarify authentication and test-data ownership

**Priority:** High. **Owner:** Senior SDET. **Dependencies:** PR-03, PR-05.

**Files:** `tests/setup/auth.setup.ts`, auth fixture, data factories/builders, constants, relevant docs.

**Changes:**

- Keep shared Sauce Demo authentication while it is demonstrably independent across browser contexts; do not build an account pool without a need.
- Isolate storage-state paths by target/run where concurrent local invocations could collide; keep them ignored and out of published artifacts.
- Separate deterministic scenario inputs from collision-resistant resource names. Include a run namespace when resources persist beyond a worker.
- Document the extension contract for owned accounts and created resources: acquire/create → use → cleanup in teardown.
- Implement real server-resource cleanup only against a backend that supports persistence. JSONPlaceholder's simulated writes must not be presented as proof of cleanup correctness.
- Restore modified process environment in unit tests with `try/finally`, deleting originally absent keys rather than assigning `undefined`.

**Acceptance and validation:**

- Concurrent authenticated runs do not overwrite one another's state files.
- Relevant tests pass with one and multiple workers.
- Every mutable resource has a documented owner and cleanup strategy, or is explicitly identified as a demo simulation.

### PR-07 — Improve UI boundaries and assertions

**Priority:** High. **Owner:** Senior SDET. **Dependencies:** PR-02, PR-06.

**Files:** `pages/DashboardPage.ts`, `pages/UserProfilePage.ts`, `pages/BasePage.ts`, new cart/component modules, fixtures, UI specs.

**Changes:**

- Model the navigation menu as a component; rename the current misleading profile object and update fixture consumers together.
- Introduce `CartPage` for cart behavior. Stop asserting cart contents through dashboard locators.
- Match product identity precisely and use retrying locator assertions for asynchronous state.
- Replace immediate count snapshots where a retrying assertion expresses the intent.
- Retain `BasePage` only for useful shared behavior; do not require every object to inherit from it.
- Remove redundant authenticated-page checks when they do not protect a distinct risk.

**Acceptance and validation:**

- Adding a backpack asserts its exact identity in the cart, not just the badge/count.
- The test fails if a different product appears.
- Focused Chromium tests pass; run representative changed journeys across Firefox and WebKit before merging.

### PR-08 — Add risk-based application acceptance coverage

**Priority:** High. **Owner:** Senior SDET. **Dependencies:** PR-07.

**Files:** proposed `docs/TEST-STRATEGY.md`, checkout page objects, fixtures, UI/API specs.

**Changes:**

- Create a risk-to-test map with risk, layer, scenario, expected outcome, tier, and ownership.
- Add one complete purchase journey: login/pre-auth → choose exact product → cart → checkout details → overview → confirmation.
- Assert product identity, quantity, displayed amounts, and meaningful confirmation. Derive expected arithmetic from independent input, not by repeating the implementation.
- Add focused cart removal, required-field validation, and unauthenticated protected-route cases.
- Preserve separate login tests; use pre-authentication for journeys whose purpose is checkout.
- Label `page.setContent()` examples as framework demonstrations. Do not count them as proof of real application error handling.
- Do not connect JSONPlaceholder assertions to Sauce Demo business behavior: they are independent demo targets.

**Acceptance and validation:**

- Every new test maps to a distinct risk and observable outcome.
- One successful purchase is included in the agreed release-critical tier; remaining combinations run at appropriate lower layers or nightly.
- Relevant cross-browser journeys pass and do not rely on order, arbitrary sleeps, or shared cart state.
- Accessibility, visual, and performance checks remain explicit follow-up work until concrete product requirements justify them.

### PR-09 — Make CI selection and required checks complete

**Priority:** Immediate CI reliability. **Owner:** DevOps. **Dependencies:** PR-03, PR-05.

**Files:** PR/mock/nightly workflows, composite actions, package scripts, `playwright.config.ts`.

**Changes:**

- Run fast unit and MSW checks on every PR. Run Docker checks on relevant shared/dependency/config changes or on every PR if measured cost is acceptable.
- Include utilities, schemas, fixtures, lockfile, configuration, and CI definitions in dependency-aware change selection.
- Use an always-running aggregate required check if jobs are conditional, so a path-filtered workflow cannot leave protection waiting indefinitely.
- Make local tier scripts and CI selection agree. Separate MSW/container projects only if required for clear scheduling; update the project count and agent docs in the same change.
- Ensure network-mock specs execute on intended browsers without accidental omissions or undocumented duplication.
- Remove browser installation from truly browserless API jobs. Install the required browser plus authentication setup dependencies for each UI job.
- Validate workflow syntax and inspect selected test inventories with `--list` before full execution.

**Acceptance and validation:**

- A change confined to the API client or lockfile triggers the applicable mock coverage.
- Required checks complete correctly for docs-only and code changes.
- CI cannot pass required container coverage entirely through skips.
- A representative hosted run confirms the workflow behavior; local YAML inspection alone is not acceptance.

### PR-10 — Establish trace, quarantine, and flake policy

**Priority:** High. **Owner:** SDET and DevOps. **Dependencies:** PR-09.

**Files:** Playwright config, tags, scripts/workflows, proposed `docs/TEST-OPERATIONS.md`.

**Changes:**

- Retain failure traces locally and in CI; preserve zero PR retries.
- Explicitly exclude quarantine from release gates and execute it separately.
- Require an issue, owner, reason, and expiry for quarantined tests. Do not automatically quarantine failures.
- Define nightly retry-pass handling: fail the acceptance gate on flakiness while keeping retry evidence for diagnosis.
- Record first-attempt failures, retry-pass cases, skips, duration, and quarantine age in the run summary.

**Acceptance and validation:**

- A controlled local failure yields an inspectable trace without enabling retries.
- Test discovery proves quarantined tests are excluded from normal gates and included in quarantine execution.
- A temporary retry-pass example produces the intended nightly result, then is removed.
- Quarantine cannot hide an unowned or expired release-critical test indefinitely.

### PR-11 — Make reports useful and publication deliberate

**Priority:** High. **Owner:** DevOps. **Dependencies:** PR-04, PR-09–PR-10.

**Files:** artifact action, nightly merge/publish workflow, PR feedback job, logger/errors, reporting guidance.

**Changes:**

- Preserve enough success and failure metadata to assess trends, with explicit retention limits.
- Check expected shard reports before merging. Mark partial reports clearly rather than implying complete coverage.
- Fix the documented per-shard HTML expectation when jobs generate blob reports only.
- Keep report publication separate from test success and restrict publishing to intended trusted contexts.
- Scope PR-comment write permission to the feedback job and handle fork PR permissions without weakening checkout security.
- Keep raw credentials, auth state, and unredacted sensitive responses out of logs/reports. HTML redaction alone does not sanitize trace files; use approved synthetic data and appropriate artifact access.
- Verify hosted repository protections and report visibility before declaring them configured.

**Acceptance and validation:**

- From a controlled failed run, a reviewer can locate the failing test, relevant trace, environment identifier, and commit.
- Missing shard artifacts are reported as incomplete coverage.
- Fork PR feedback limitations do not prevent the test result from being available.
- Publication behavior and artifact access are documented and verified in the intended hosting setup.

### PR-12 — Consolidate agents, standards, and onboarding

**Priority:** High. **Owner:** Senior SDET and DevOps; Coach reviews usability. **Dependencies:** Earlier policy decisions stabilized.

**Files:** `AGENTS.md`, `.cursor/agents/*.md`, `.cursor/skills/**`, README, architecture and learning docs.

**Changes:**

- Put shared naming, imports, assertions, resource ownership, retries, and completion requirements in one canonical policy.
- Make agent files short role-specific routing documents. Skills contain workflows and reference shared policies.
- Resolve conflicting folder layouts, timing promises, trace advice, and import prohibitions.
- Replace stale runtime/version claims with validated setup instructions or links to authoritative repository files.
- Remove tool-specific permission recipes that do not apply across execution environments.
- Require implementation summaries to include changed behavior, checks actually run, outcomes, and remaining limitations.
- Require reviews to provide concrete evidence, impact, severity, and proposed fixes, distinguishing defects from future hardening.
- Keep learning exercises separate from implementation acceptance; do not force an interview or exercise gate onto already-authorized engineering work.
- Replace unsupported enterprise/production claims and placeholder badges with accurate scope and verified links.

**Acceptance and validation:**

- Walk through three representative requests: add a negative API test, repair a CI failure, explain auth fixtures. Each routes to the correct guidance without contradictions.
- Referenced files and commands exist; setup instructions work in a clean environment.
- No new agents are required simply to make the framework appear more sophisticated.

### PR-13 — Demonstrate readiness with evidence

**Priority:** Release gate. **Owner:** SDET and DevOps. **Dependencies:** PR-01–PR-12.

**Deliverables:** proposed `docs/READINESS-REPORT.md`, updated risk map and operating guidance.

**Validation sequence:**

1. Install from the lockfile in a clean checkout using the supported runtime.
2. Run quality checks, unit tests, and controlled mock tests.
3. Run required live contracts and browser smoke against explicitly identified targets.
4. Run cross-browser regression and verify merged reports.
5. Verify one-worker and multi-worker behavior for the changed isolation-sensitive suites.
6. Run a targeted repeated stability check for the critical browser journey; use bounded repeats only when investigating unresolved reliability.
7. Observe at least ten ordinary PR runs and seven nightly runs before reporting initial reliability trends. This is an initial observation window, not statistical proof of a long-term flake rate.
8. Publish the readiness report with failures, skips, environmental incidents, and unresolved limitations included.

**Exit criteria:**

- Required validation and tests pass; no required test silently skips for missing infrastructure.
- Zero unowned critical risks and zero unexplained observed flakes in the acceptance window.
- Configuration precedence, response errors, and mock isolation are protected by meaningful tests.
- Failure evidence is accessible and safe for its intended audience.
- The PR feedback budget is measured. Adopt an initial warm-run target of five minutes and report cold-install time separately; revise the target openly if evidence shows it is unrealistic.
- Branch protection and environment settings are marked verified, unavailable, or pending—not inferred from repository YAML.
- Demo-specific limitations and production application onboarding requirements remain explicit.

## 6. Validation policy for every slice

- Run the smallest meaningful checks first, then the shared quality gate.
- Add tests for changed behavioral contracts and genuine failure risks, not mechanical renames, formatting, or wrappers that simply mirror implementation.
- Run browser and Docker checks when the change affects those paths; record unavailable prerequisites instead of claiming success.
- Keep source edits, formatting churn, dependency upgrades, and CI policy changes reviewable and separable.
- Do not change unrelated learning exercises or the nested website to make framework checks pass.
- Link each PR to its plan item and describe the concrete before/after behavior.
- If a gate change must be rolled back, revert the coherent slice and document the lost guarantee; do not silently disable checks.

## 7. Deferred work and adoption conditions

| Work                               | Add when                                                               |
| ---------------------------------- | ---------------------------------------------------------------------- |
| Worker account leasing             | A real target has shared mutable server state or session invalidation  |
| Persistent test-data service       | Multiple suites need managed records across workers/runs               |
| OpenAPI-driven contracts           | The owned service exposes an authoritative specification               |
| Visual baselines                   | Approved UI designs and stable rendering environments exist            |
| Accessibility gate                 | Product accessibility expectations and exception ownership are defined |
| Performance suite                  | Workload, environment, and measurable service objectives exist         |
| Additional browser/device projects | Supported-user requirements justify the runtime cost                   |
| External reporting platform        | Built-in artifacts demonstrably fail a team requirement                |

Avoid new tools, extra layers, and test-count targets without an explicit risk or maintenance benefit.

## 8. Completion checklist

- [ ] PR-01: Reproducible tooling and quality gate
- [ ] PR-02: Enforced coding/test rules
- [ ] PR-03: Explicit, capability-specific configuration
- [ ] PR-04: Tested API response contracts
- [ ] PR-05: Isolated mocks and mandatory CI infrastructure
- [ ] PR-06: Auth/data ownership
- [ ] PR-07: Reliable page/component design
- [ ] PR-08: Risk-based purchase acceptance coverage
- [ ] PR-09: Complete and consistent CI selection
- [ ] PR-10: Trace, quarantine, and flake policy
- [ ] PR-11: Trustworthy reporting and publication
- [ ] PR-12: Consistent agents and onboarding
- [ ] PR-13: Evidence-backed readiness report

## References

- [Existing architecture](ARCHITECTURE.md)
- [Existing learning tasks](LEARNING-TASKS.md)
- [Repository agent instructions](../AGENTS.md)
- [Playwright authentication and account isolation](https://playwright.dev/docs/auth)
- [Playwright configuration and flaky-test behavior](https://playwright.dev/docs/api/class-testconfig)
- [Playwright trace options](https://playwright.dev/docs/api/class-testoptions)
