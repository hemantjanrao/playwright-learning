# Toolshop practical assignments and debugging drills

Use alongside [the daily plan](HANDS-ON-MASTERY-PLAN.md). These are requirements and checkpoints, **not implementation solutions**. Inspect the pinned application's actual contract before selecting endpoints, status codes, limits, messages or role behavior. Do not assume a suggested boundary is a supported feature.

## Core exercise briefs

| ID / days     | Assignment                               | Acceptance evidence                                                                                                                                    | Design question                                                               |
| ------------- | ---------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------- |
| TS-01 / 1–4   | Product discovery and strategy           | Feature map; ten scenarios covering success, negative, boundary and transition risks; each has layer, oracle, tier and owner                           | What should not be automated through the browser?                             |
| TS-02 / 2–3   | Reproducible target and first test slice | Pinned environment, health evidence, one API + one UI test, separate discovery/artifacts from reference suites                                         | What is reusable infrastructure versus target-specific code?                  |
| TS-03 / 5     | Search/filter/sort/pagination            | Seeded records establish known expected results; prove included and excluded products, ordering and page transitions; one combined-filter case         | How do you avoid assuming the live catalog stays constant?                    |
| TS-04 / 6–7   | Multi-item cart                          | Assert exact identities, quantity, per-item amounts, independently calculated total, removal and empty state as applicable                             | Can a correct badge hide an incorrect cart?                                   |
| TS-05 / 8–9   | API behavior and contracts               | Positive and negative request cases; explicit status/schema/semantic checks; empty/no-content behavior; a deliberate incompatible response fails       | What do generated types fail to prove?                                        |
| TS-06 / 10    | Authentication and authorization         | Guest, customer A/B and admin operation matrix; direct API access check; a protected resource never silently leaks across owners                       | Is hiding an admin control an authorization test?                             |
| TS-07 / 11    | Data lifecycle and persistence           | Create → read → update → read → delete where supported; cleanup after deliberate failure; a targeted SQL diagnostic explains an invariant              | Who owns a leftover record after a process crash?                             |
| TS-08 / 12    | Mock selection and isolation             | MSW fetch scenario, real HTTP stub scenario, actual Toolshop browser-route scenario; override reset verified                                           | Does a passing mock prove the real backend satisfies the contract?            |
| TS-09 / 13    | Concurrent/stateful operation            | Requirement-defined invariant; two controlled requests; recorded final state; deterministic diagnosis of an observed violation                         | Is the behavior a product defect, unsupported guarantee or test race?         |
| TS-10 / 15    | Purchase outcome                         | API-arranged inputs → browser checkout → persisted order/invoice verification; correct customer/product/amount; one invalid/cancel path                | Which assertion must be independent of the application's calculation?         |
| TS-11 / 16    | Attachment, document or email            | Verify configured restrictions and accepted content; correlate unique message/document; bounded wait; wrong content/recipient fails                    | Why is file existence insufficient?                                           |
| TS-12 / 17–18 | Browser and quality mechanisms           | Three small event/timer exercises, keyboard/focus check, scan result, reviewed ARIA/visual change; mark supplementary lab evidence                     | Which checks require manual judgment or a different target?                   |
| TS-13 / 19–20 | Nonfunctional investigation              | Local workload and thresholds declared first; percentile/error measurements; one authorization/input defect or verified invariant; sanitized artifacts | What would need to change before treating this as production evidence?        |
| TS-14 / 22–24 | Trustworthy execution                    | Health checks, complete test inventory, isolated shards and merged evidence, flake/skip classification, quarantine owner/expiry                        | How can all executed tests pass while a required capability was never tested? |
| TS-15 / 25    | Architecture/code review                 | Two candidate interfaces; justified choice; small change with behavioral protection; rollback and actionable review comments                           | What future change becomes easier, and what complexity did you add?           |
| TS-16 / 26–28 | Independent capstone                     | Strategy, implementation, incident, review, run manifest and release recommendation; unresolved risks named                                            | Would another engineer trust and maintain this suite without you?             |

## Twelve incident drills

Each investigation produces: reproduction command, target/version, expected/actual behavior, evidence, ranked hypotheses, isolating experiment, root cause, fix, targeted verification and prevention. The mentor should hide the location of at least one fault at each weekly gate.

| ID     | Injected local fault                                   | First evidence to inspect                                | Successful diagnosis                                                                |
| ------ | ------------------------------------------------------ | -------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| BUG-01 | Role/name changed or ambiguous locator                 | DOM/ARIA snapshot, strictness error, call log            | Prove selector mismatch rather than increasing timeout                              |
| BUG-02 | UI assertion reads before data arrives                 | Browser timeline and relevant response                   | Wait on observable readiness; distinguish actionability from completion             |
| BUG-03 | UI and API target different sprint versions            | Resolved target/version, requests, schema                | Identify environment mismatch before editing expectations                           |
| BUG-04 | Proxy returns HTML with an error status                | Status, content type, body, proxy/backend logs           | Preserve HTTP error meaning; separate parse and status failures                     |
| BUG-05 | Response shape silently loses a field                  | Runtime schema issue and raw payload                     | Explain contract drift and improve the assertion                                    |
| BUG-06 | Wrong transport or stale MSW override                  | Handler hits, network boundary, fixture lifetime         | Correct interception and prove same-worker reset                                    |
| BUG-07 | Account/resource reused across workers                 | Run/worker/resource identifiers and stored state         | Establish ownership and reproduce interference                                      |
| BUG-08 | Teardown skips cleanup after assertion failure         | Fixture teardown, namespace inventory                    | Remove only owned data and preserve original failure evidence                       |
| BUG-09 | Email/invoice job delayed or absent                    | Request record, scheduler/job logs, artifact correlation | Separate background processing failure from UI timing                               |
| BUG-10 | Unauthorized request leaks another customer's resource | Identity/role, API response, resource owner              | Reproduce direct access locally and report impact                                   |
| BUG-11 | Shard report missing or overwritten                    | Selected test identities, artifact paths, merge inputs   | Prove missing execution evidence; setup repeats are not duplicate business coverage |
| BUG-12 | Retry-pass/skip disguises a required failure           | First-attempt result, skip reason, health checks         | Classify flake/infra/policy failure and prevent false confidence                    |

Do not introduce faults into public hosted environments. A deliberately buggy application is an exercise target; do not weaken normal-suite assertions just to make that variant green.

## Strategy template

```markdown
Feature / business objective:
Accepted requirements and unanswered questions:
Users / roles / data owners:
Highest risks (likelihood, impact, rationale):
Scenarios (partitions, boundaries, decisions, state transitions):
Expected outcomes and source of truth:
Layer per scenario and why:
Setup / seed / cleanup / environment requirements:
Supported browsers and compatibility decisions:
Smoke / regression / diagnostic selection:
Entry criteria and release/exit criteria:
What remains manual, deferred, or unverified:
Evidence and owner:
```

## Defect and review template

```markdown
Title and user impact:
Pinned version / environment:
Minimal reproduction:
Expected behavior and requirement source:
Actual behavior:
Sanitized trace/request/log evidence:
Product / test / data / environment classification:
Root cause (confirmed or hypothesis):
Fix or proposed action:
Regression coverage and relevant check results:
Residual risk and owner:
```

## Design-decision template

```markdown
Problem and concrete trigger:
Constraints:
Option A — interface, benefits, costs:
Option B — interface, benefits, costs:
Chosen approach and evidence:
Data/resource ownership and failure behavior:
Migration and test strategy:
Rollback:
Revisit when:
```

## Release recommendation template

```markdown
Scope / application and automation revisions:
Requirements and highest risks:
What executed (projects, workers, shards, targets):
First-attempt passes / failures / flaky passes / skips / not run:
Critical defects and untested capabilities:
Isolation, cleanup and environment confidence:
Ship / no-ship / conditional recommendation with reasoning:
Accepted residual risks and decision owner:
Next actions:
```

## Mentoring contract

The learner writes the test plan and implementation. The coach asks for reasoning, gives incremental hints and reviews evidence. Setup assistance may scaffold infrastructure; it must not silently solve the assigned tests. A full solution is available on explicit request, but that attempt is recorded as assisted and repeated independently later.

Prompts:

- “Start Toolshop D05 / TS-03. Give three acceptance criteria and wait for my approach.”
- “Review my TS-06 authorization tests. Challenge my expected results and data ownership.”
- “Give me a hidden BUG-04 or BUG-09 incident locally. Let me investigate before revealing the cause.”
- “Assess my capstone using actual artifacts. Separate implementation completeness from my independence.”
