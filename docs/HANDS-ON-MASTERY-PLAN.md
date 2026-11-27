# Four-week senior SDET practice plan — Toolshop

Updated: **21 November 2026**. Capacity: **5–6 focused hours daily × 28 days = 140–168 hours**. Start on any date. Current framework baseline: Playwright 1.65.0 and 11 projects; Toolshop integration is **planned, not implemented**.

## What you will be able to demonstrate

Own a feature from requirement review through risk analysis, frontend/backend automation, test-data management, diagnosis, CI evidence, architecture review, and a release recommendation. Build a coherent test system around **Toolshop**, not a collection of unrelated tutorial examples.

Four weeks gives broad practical experience and a defensible portfolio. It cannot establish mastery of every technology or replace production incident experience. The competency map explicitly separates core work, stretch exercises, and later specialization. Your independent evidence determines progress.

**Primary target:** [Toolshop](https://practicesoftwaretesting.com/), backed by its own REST API. Use a pinned private local installation for persistent data, destructive scenarios, faults, email, database checks, and CI. Sauce Demo/JSONPlaceholder remain reference examples only. Read [Toolshop setup and integration plan](TOOLSHOP-PRACTICE-GUIDE.md) before day 2.

See the [documented capabilities and hands-on exercise map](TOOLSHOP-HANDS-ON-CAPABILITIES.md) for feature/version prerequisites and optional labs.

## Daily working pattern

| Block               | Minutes | What you do                                                                  |
| ------------------- | ------- | ---------------------------------------------------------------------------- |
| Recall and risk     | 30      | Explain yesterday without notes; write today's expected outcomes and risks   |
| Targeted reading    | 45      | Inspect relevant source, contract, and a small documentation section         |
| Implementation      | 120     | Write the tests or framework change yourself                                 |
| Break and diagnose  | 60      | Introduce one controlled local fault; reproduce, inspect evidence, repair    |
| Review and evidence | 45      | Review the diff, run relevant checks, explain an alternative, update tracker |
| Optional extension  | 60      | Repeat a weak skill or complete one stretch case                             |

Breaks are additional. Assessment days replace reading/implementation with an unseen assignment. Do not force a hard exercise into two hours by copying a solution: finish its core slice, record unfinished work, and use the optional hour or reduce stretch scope. Repeat key work after 48 hours and seven days.

## Week 1 — Understand the product and build a reliable frontend foundation

**Exit:** you can select a risk, write a meaningful Toolshop test, explain the framework path, and diagnose a UI failure.

| Day | Practical assignment                                                                                                                                                                                                                    | Fault/debugging challenge                                                        | Required evidence                                                                             |
| --- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| 01  | Explore hosted catalog, product, contact, and authentication screens; inspect Swagger. Inventory the existing framework and draft a browser → API → database diagram. Write an exploratory charter and questions before scripting.      | Distinguish a requirement, observed behavior, and an unsupported assumption      | Baseline versions/commands, feature map, five risks, exploratory notes                        |
| 02  | Establish the private local Toolshop environment using a pinned revision and matching sprint; confirm UI/API health, logs, database and mail service. Record dependencies and startup/stop instructions.                                | Diagnose one startup/port/config mismatch using service logs                     | Reproducible setup manifest and sanitized health evidence; no false green if setup is blocked |
| 03  | Add a separate Toolshop configuration and one API + one UI smoke test. Compare guest/auth projects, fixture scope, output paths and target-specific URLs. Use the existing framework as reference, not by changing its global base URL. | Make discovery select the wrong project, then prove the correction with `--list` | Small integration diff; Toolshop and reference suites select separately                       |
| 04  | Practice TypeScript, async/await, generics, discriminated unions, `unknown`, Zod and `try/finally` through a Toolshop product schema/client. Design partitions, boundaries and a decision table for one feature.                        | Missing `await`, wrong inferred type, and invalid runtime payload                | Compile/runtime evidence, ten-scenario risk map, three justified test-layer choices           |
| 05  | Automate search, sorting, combined filters and pagination against seeded local data. Use scoped locators, numeric price comparisons and unique test names. Pick three core scenarios, not every combination.                            | A substring locator or fixed sleep makes a test unreliable                       | Focused specs that detect wrong results/order, with independently computed expectations       |
| 06  | Model product and cart interactions with small page/component objects; introduce typed fixtures only for repeated setup. Verify identity, price, quantity, totals and empty state.                                                      | Wrong item passes a badge-only assertion; cleanup after a failed test            | Correct-item failure evidence, fixture lifecycle explanation, focused POM review              |
| 07  | **Gate 1:** independently automate one multi-item cart or filter transition and investigate an unseen locator/timing fault. Defend smoke versus regression selection.                                                                   | Mentor hides one UI defect or test defect                                        | Requirement → test → deliberate failure → repair; review and rubric score                     |

## Week 2 — Backend, contracts, authentication, database and isolation

**Exit:** you can test persisted behavior, distinguish failure classes, and own data across parallel tests.

| Day | Practical assignment                                                                                                                                                                                                                                                                                                                     | Fault/debugging challenge                                                           | Required evidence                                                                                   |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| 08  | Map methods, query parameters, headers, bodies, status and auth from the pinned OpenAPI description. Test product list/detail and a local resource's create/read/update/delete flow. Confirm documented status/body behavior rather than assuming all mutations return JSON.                                                             | Wrong status with an HTML body versus invalid JSON with a success status            | Endpoint/expected-outcome matrix; meaningful positive and negative contract checks                  |
| 09  | Build request and response schemas; test missing, null, wrong-type, boundary and unexpected values. Compare runtime schema checks with generated types and consumer/provider compatibility. Use a local response fixture for deliberate contract drift. Stretch: one GraphQL query and invalid-field response against the pinned schema. | A schema that is too permissive passes a missing business field                     | Contract regression, compatibility note, and proposed consumer/provider verification example        |
| 10  | Create isolated local customer A, customer B and an admin fixture. Test missing/invalid authentication, one role restriction and one cross-customer resource request. Add one local account-lock transition; use the optional hour for TOTP setup/verification. Inspect expiry/refresh only if supported by the pinned version.          | Customer B can access A's resource, or a forbidden action only hides its UI control | Role × operation matrix; exact documented response assertions and ownership rules                   |
| 11  | Seed data through supported API/setup boundaries; verify read-after-write and deletion. Inspect schema and execute focused read-only SQL joins/counts for a diagnostic check. Build teardown that owns only its run's data.                                                                                                              | Shared ID collision, stale data or orphaned child resource                          | Create/use/cleanup fixture, one API/database consistency investigation, successful failure cleanup  |
| 12  | Exercise MSW, WireMock and browser routes with the correct transports. Use postcode lookup as the local HTTP scenario: configure a backend stub, inject an upstream failure, and assert the UI outcome. Prove per-test override/reset isolation. Inspect one existing upstream backend test.                                             | MSW used with Playwright request; leaked handler; mocked response never reaches app | Mock-selection table, regression evidence, explanation of app-unit versus framework-unit coverage   |
| 13  | Test an invalid state transition and duplicate/concurrent local mutation. Define intended invariants before asserting outcomes. Explore transaction boundaries and idempotency without inventing guarantees absent from the contract.                                                                                                    | Duplicate records or interference between workers                                   | Concurrency reproduction and outcome, root-cause hypothesis, minimal guard or product defect report |
| 14  | **Gate 2:** diagnose three hidden incidents: one HTTP/contract issue, one auth/data issue, one configuration/mock issue. Trace a request from browser to API/logs and relevant stored state.                                                                                                                                             | Product bug versus test bug versus infrastructure failure                           | Three evidence-backed incident reports and a backend design review                                  |

## Week 3 — Integrated journeys, browser depth and nonfunctional quality

**Exit:** you can prove a complete customer outcome and identify gaps that ordinary happy-path E2E misses.

| Day | Practical assignment                                                                                                                                                                                                                                                         | Fault/debugging challenge                                                   | Required evidence                                                                                 |
| --- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| 15  | Build one local customer purchase journey: API-arranged data → browser cart/checkout → API order/invoice verification. Use supported demo payment behavior. Add one validation or cancellation transition.                                                                   | UI success displayed without the expected persisted result                  | One critical E2E plus focused lower-layer cases and independently derived amount assertions       |
| 16  | Exercise contact attachment boundaries and a supported invoice download or password-recovery email locally. Inspect file content and MailCatcher; correlate by a unique resource/recipient. Trigger/poll documented background work with a deadline.                         | Wrong recipient/file, stale message or background job never completes       | Upload/download evidence plus one asynchronous email/document flow; unsupported features recorded |
| 17  | Practice event ordering, popup/dialog/frame ownership, controlled browser time, and polling. Use Toolshop where applicable; use a minimal isolated local fixture page for absent interactions. Core: two event cases and one timer/polling case.                             | Listener registered too late, wrong frame, or retries repeating a write     | Three small demonstrations; explicit distinction between lab mechanics and product coverage       |
| 18  | Test keyboard/focus/accessibility behavior and run an automated accessibility scan on a chosen local screen. Add one ARIA or visual snapshot with fixed data and viewport; run a responsive/cross-browser scenario.                                                          | Structural regression versus rendering noise; blindly updated baseline      | Findings with impact, reviewed snapshot diff, and manual accessibility limits                     |
| 19  | Run a bounded local API performance experiment against normal Sprint 5 and its performance variant using one appropriate load tool. Define workload, concurrency, warmup, p95 latency and error-rate targets for the exercise before running; correlate logs/query behavior. | Slow response, resource saturation or misleading averages                   | Baseline-versus-change report; chosen thresholds labeled learning targets, not production SLOs    |
| 20  | Verify authorization, validation, token handling/redaction and an allowed local abuse-boundary case. Review dependencies and artifact exposure. Compare normal and deliberately buggy local variants using the same acceptance criteria.                                     | UI-only access control, leaked token in evidence, or invalid input accepted | Small security-risk checklist, one reproduced local defect, impact and remediation proposal       |
| 21  | **Gate 3:** run a time-boxed bug-hunting charter against the pinned buggy variant, then a changed user journey. Propose a minimal regression set and triage findings.                                                                                                        | Unknown fault location; incomplete requirements                             | Reproducible bug report, regression test, cross-layer evidence and release-risk note              |

## Week 4 — CI engineering, architecture, ownership and independent delivery

**Exit:** you can maintain the system, explain what CI proves, and defend a release recommendation.

| Day | Practical assignment                                                                                                                                                                                                                                   | Fault/debugging challenge                                             | Required evidence                                                                      |
| --- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| 22  | Design PR/nightly/on-demand tiers; provision local Toolshop services for CI with health checks, seed, tests and cleanup. Verify selection locally; map secrets, browser/runtime versions and artifacts. Hosted execution is a separate authorized run. | Wrong target or dependency outage creates a misleading green pipeline | CI design + local execution evidence; hosted run labeled unverified until actually run |
| 23  | Run selected scenarios with one and multiple workers, then two shards with separate outputs/auth state. Merge blobs and compare application test identities. Record timing and interference.                                                           | Missing shard, overwritten report, shared account or auth file        | Complete run manifest/merged report and isolation diagnosis                            |
| 24  | Exercise retry-pass reporting, quarantine selection, owner/expiry policy and failure classification. Review trace/log redaction and artifact retention. Define actionable quality metrics rather than test-count targets.                              | A flaky pass or skipped critical scenario hides lost coverage         | First-attempt/flaky/skipped metrics, quarantine example and incident runbook           |
| 25  | Review a flawed change; design two interfaces for one real seam (config, response validation, data lifecycle or page composition). Implement a small refactor with behavior tests and a rollback plan.                                                 | Over-generalization, coupling or swallowed error                      | Impact-ranked review, short architecture decision, focused diff, green relevant checks |
| 26  | **Capstone design:** clarify a Toolshop feature/change, define risks and acceptance, choose layers, data ownership, compatibility scope and CI budget. Run a short exploratory session.                                                                | Ambiguous expected behavior or missing requirement                    | Test strategy, scenario matrix, assumptions and implementation plan before coding      |
| 27  | **Capstone implementation:** independently deliver a thin API + UI slice with positive, negative, boundary and transition cases across suitable layers; diagnose a hidden fault.                                                                       | Unexpected auth/data/API failure                                      | Reviewable patch, fault-detection proof, relevant cross-browser and isolation evidence |
| 28  | **Gate 4:** demonstrate and teach the capstone, review an unseen small diff, and make a ship/no-ship recommendation using actual evidence and residual risk.                                                                                           | A green subset is presented as full release confidence                | Portfolio case study, rubric scores, retrospective and next three priorities           |

## Target and prerequisite policy

- **Hosted Toolshop:** day 1 exploration and limited read-only comparison; do not rely on shared demo accounts or changing catalog data for deterministic CI.
- **Pinned local Toolshop:** core target from day 2 onward. All database resets, shared-resource changes, deliberate backend defects, load and security experiments stay here.
- **Buggy variant:** a separate local environment or sequentially rebuilt disposable environment. Verify its routes and API pairing; do not point normal tests at an unrelated sprint API.
- **Supplemental lab:** only for browser mechanisms Toolshop does not expose. GraphQL and TOTP are documented Toolshop features; verify them in the pinned normal Sprint 5 version. WebSockets, payment-provider webhooks and unsupported browser controls need a separate verified target.
- **Setup blocked:** spend at most the first build block diagnosing it, request a setup-only assist, and continue contract/design/read-only tasks. Mark local integration exercises blocked until actually run; a mock is not replacement evidence for persistence.

## Senior SDET competency map

“Core” means a hands-on slice within the 28-day plan, not exhaustive proficiency. “Stretch” uses the optional hour. “Follow-up” needs a suitable system or additional time.

| Competency                                                                  | Required practical proof                                                                                     | Days         | Depth                                 |
| --------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ | ------------ | ------------------------------------- |
| Requirements and exploratory testing                                        | Charter, assumptions, reproducible defect, acceptance criteria                                               | 1, 7, 21, 26 | Core                                  |
| Risk-based strategy and test pyramid                                        | Risk → layer → scenario → tier → owner map; justify omissions                                                | 4, 7, 26, 28 | Core                                  |
| Partitions, boundaries, decisions, transitions                              | Design invalid/edge cases before automation; independent expected result                                     | 4–6, 13, 15  | Core                                  |
| Pairwise and combinatorial selection                                        | Reduce browser/input matrix without dropping critical combinations                                           | 18, 26       | Stretch                               |
| TypeScript, asynchronous programming, Git                                   | Typed client/fixtures, compiler evidence, reviewable commits, cleanup                                        | 3–6, 25      | Core                                  |
| Locators, waits, assertions, parameterization                               | Reliable search/cart checks and diagnosed race/ambiguity                                                     | 5–7, 17      | Core                                  |
| POM/component design and typed fixtures                                     | Small cohesive abstractions with explicit scope/ownership                                                    | 3, 6, 25     | Core                                  |
| REST and negative API tests                                                 | Methods, parameters, headers, bodies, exact contract outcomes                                                | 8–10         | Core                                  |
| Schema and compatibility contracts                                          | Runtime validation and a deliberate incompatible response                                                    | 9            | Core                                  |
| Consumer/provider contracts and OpenAPI generation                          | One version-compatible Pact or generated-types experiment; explain limitations                               | 9, 12        | Stretch                               |
| Authentication and authorization                                            | Guest/customer/admin and cross-customer matrix                                                               | 10, 20       | Core                                  |
| Test-data lifecycle and reproducibility                                     | Per-run namespace, seed and cleanup on failure                                                               | 11, 13, 23   | Core                                  |
| SQL, persistence, constraints and transaction reasoning                     | Diagnostic join and persisted-state invariant; no DB assertion in every UI test                              | 11, 13       | Core                                  |
| Mocking and service virtualization                                          | Correct MSW/WireMock/browser transport, isolation and failure scenario                                       | 12           | Core                                  |
| Backend unit and frontend component tests                                   | Read one existing app test; write one small isolated rule/component test if the upstream environment permits | 12, 18       | Exposure core; implementation stretch |
| Cross-layer E2E and background work                                         | Browser action plus API outcome; deadline-based job/email/document check                                     | 15–16        | Core                                  |
| Uploads, downloads and browser events                                       | File-content validation, event-before-action, owner cleanup                                                  | 16–17        | Core                                  |
| Clock, poll, ARIA and feature evaluation                                    | Controlled timing/structure test and version-supported adoption note                                         | 17–18        | Core                                  |
| Accessibility and responsive compatibility                                  | Keyboard/focus test, scan finding, viewport/browser decision                                                 | 18           | Core                                  |
| Visual regression                                                           | Stable local baseline with intentional change review                                                         | 18           | Core slice                            |
| Performance and observability                                               | Local workload, percentile/error evidence, logs/query diagnosis                                              | 19           | Core slice                            |
| Security testing foundations                                                | Authorization/input checks and sensitive-evidence handling on local target                                   | 20           | Core slice                            |
| Containers, CI/CD, shards and artifacts                                     | Health checks, selection, isolated shard inputs and merged evidence                                          | 2, 22–23     | Core                                  |
| Reliability and test operations                                             | First-attempt failures, flakes, skips, ownership and expiry                                                  | 24           | Core                                  |
| Architecture, code review and mentoring                                     | Alternatives, migration/rollback, impact-ranked review, teach-back                                           | 25–28        | Core                                  |
| Mutation/property-based testing                                             | One assertion-strength or generated-input experiment on pure logic                                           | 9, 25        | Stretch                               |
| gRPC, WebSockets, external OAuth provider integration                       | Separate target and explicit contract; do not invent Toolshop capabilities                                   | After day 28 | Follow-up                             |
| Native mobile, large distributed systems, production load/security programs | Dedicated tools, environment, requirements and operational ownership                                         | After day 28 | Follow-up                             |

## Practical exercise standard

Every lab must define: **risk, expected result, target/version, layer, test data, owned resources, assertion, CI tier, fault to detect, evidence**. Each day produces a small artifact; ten meaningful cases are better than fifty repeated clicks.

1. Work in a focused practice branch/worktree. Inspect existing edits; never reset others' work to create a fault.
2. Propose the approach before implementation. Ask the coach for questions/hints, not complete code by default.
3. Show the test fails for the intended defect, then restore the controlled fault and verify the fix. Keep fault injection local and reversible.
4. Re-run changed scenarios with one and multiple workers when isolation matters; repeated passes do not prove absence of flakiness.
5. Attach sanitized evidence; never commit credentials, tokens, auth storage, database dumps or sensitive traces.
6. Record what was not executed and why. Preserve evidence of failures rather than relabeling them as a pass after increasing timeouts.
7. Explain one design tradeoff and teach the core idea without reading code.

See [PRACTICE-TRACKER.md](PRACTICE-TRACKER.md) for daily entries and scoring, and [TOOLSHOP-EXERCISE-BRIEFS.md](TOOLSHOP-EXERCISE-BRIEFS.md) for concrete acceptance criteria and incident drills.

## Four independent assessments

Score each dimension **0: cannot explain; 1: completes with hints; 2: independently implements and explains; 3: diagnoses variants and teaches tradeoffs**.

- **Day 7:** test design, TypeScript, locators/assertions, fixtures, basic diagnosis.
- **Day 14:** HTTP/contracts, auth, SQL/data ownership, mock selection, cross-layer diagnosis.
- **Day 21:** complete journeys, browser events, accessibility/visual/performance/security boundaries, bug triage.
- **Day 28:** CI, isolation, architecture/review, release judgment and independent capstone delivery.

Advance on independent evidence in relevant core dimensions, not elapsed days. Carry any skill below 2 into the next week's revision allocation. If foundational correctness/isolation remains unresolved, reduce stretch scope or extend the plan rather than declaring mastery.

## Capstone choices

Choose one narrow Toolshop workflow verified in your pinned version:

- **Customer purchase:** seeded product/customer → multi-item cart → checkout → persisted order/invoice → another customer's access denied.
- **Catalog change:** local admin updates a product → API response and storefront reflect the change → validation/permission boundaries hold.
- **Support journey:** local customer attachment/message → persisted record and supported admin response → correct recipient/document outcome where supported.

Deliver a requirement/risk map, test implementation, clean setup/teardown, debugging incident, CI selection evidence, review/architecture decision and release recommendation. Do not require every scenario to run end-to-end; defend the smallest layer that proves each risk.

## Using the existing repository without confusing the targets

The 11 current projects and page objects still target Sauce Demo/JSONPlaceholder. Their routes, credentials, integer IDs, schemas and storage files are not Toolshop contracts. Day 3 creates the integration as a learning task; simply changing `BASE_URL` will not work.

- [LEARNING.md](LEARNING.md): lessons 01–11 for concepts; examples remain reference-app examples.
- [LEARNING-BACKLOG.md](LEARNING-BACKLOG.md): T-tickets for locator/assertion practice; adapt the principle, not the target-specific expected data.
- [LEARNING-TASKS.md](LEARNING-TASKS.md): H-01/H-02 for client errors, H-03/H-04/H-05 for mocks, H-08/H-10 for fixtures/data, H-11/H-12 for CI, H-13 for review.
- [PRODUCTION-READINESS-PLAN.md](PRODUCTION-READINESS-PLAN.md): architectural proposals; none are automatically done because a lesson is finished.
- [COVERAGE.md](COVERAGE.md): current reference-suite coverage. Toolshop planned coverage is tracked separately until implemented.
- [DOCS-REVIEW.md](DOCS-REVIEW.md): historical exercise reconciliation.

## Day 1: start here

1. Record versions, working-tree state and current project selection with `git status --short`, `npx playwright --version`, and `npx playwright test --list`.
2. Explore Toolshop catalog, filters, product detail, contact and login without creating shared data. Read its API description.
3. Sketch frontend → backend → database and identify where evidence for a failure would come from.
4. Write five risks, five unanswered questions, and three scenarios with expected outcomes.
5. Submit your notes for review; day 2 is setup, not a request for the coach to prewrite the suite.

Prompt: **“Coach me through Toolshop D01. Give the assignment and checkpoints; let me investigate and answer before showing solutions.”**

## Sources and feature maintenance

Target-specific facts were checked against [upstream project documentation](https://github.com/testsmith-io/practice-software-testing), its [stack and sprint guide](https://github.com/testsmith-io/practice-software-testing/blob/main/docs/README.md), and [Swagger](https://api.practicesoftwaretesting.com/api/documentation). They establish available practice surfaces, not a verified local installation or contractual behavior of every deployment. Re-check pinned-version source and docs before each exercise.

For Playwright mechanisms use the official [parameterization](https://playwright.dev/docs/test-parameterize), [assertions](https://playwright.dev/docs/test-assertions), [clock](https://playwright.dev/docs/clock), [ARIA snapshots](https://playwright.dev/docs/aria-snapshots), [sharding](https://playwright.dev/docs/test-sharding), and [release notes](https://playwright.dev/docs/release-notes). Every week select one feature, verify installed-version support, and write adopt/defer reasoning. No dependency upgrade is required merely because a newer feature exists.
