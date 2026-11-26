# Toolshop: documented capabilities and hands-on practice

Reviewed 21 November 2026. This is a documentation review, not a successful execution report. Validate availability against the pinned application revision, matching API and seed data before writing assertions. The public deployment and local variants can differ.

Use this with the [four-week plan](HANDS-ON-MASTERY-PLAN.md) and [exercise briefs](TOOLSHOP-EXERCISE-BRIEFS.md). Exercises below are proposed learning assignments, not claims that the framework already covers them.

## What the documentation changes in our plan

Toolshop is a suitable main practice target for frontend and backend automation. GraphQL and TOTP do not require a separate application, as the previous plan suggested. The official feature matrix includes both in normal v5; it also distinguishes product comparison, localization and social login by version. [Feature matrix](https://testsmith-io.github.io/practice-software-testing/#/features)

Sprint 5 documents cart APIs, TOTP setup/verification/login, and separate PDF status/download endpoints. These enable stateful and asynchronous testing beyond basic page clicks. [Sprint 5](https://testsmith-io.github.io/practice-software-testing/#/sprints/sprint5)

## Practical exercise map

The cases and evidence below are our test-design proposals. Select a thin slice per day; this table is a menu, not an additional mandatory workload.

| Area                           | Hands-on assignment                                                                                              | Skill and evidence                                                                                         | Day / priority            |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------- |
| Catalog                        | Seed distinguishable products; test combined filters, sorting and page transitions                               | Partitions, meaningful assertions, result identity; deliberately wrong sort must fail                      | 5 / core                  |
| Product comparison             | Compare products with equal and different specifications; toggle differences-only                                | State transitions, scoped table locators, missing-value handling                                           | 5 / stretch               |
| Cart and rentals               | Build a small quantity/duration table; add/remove mixed item types                                               | Boundary analysis and independently calculated monetary expectations                                       | 6, 15 / core slice        |
| Discounts                      | Change basket eligibility and location; check discount removal as well as application                            | Decision tables, permission states, rounding and order-of-calculation questions                            | 15 / stretch              |
| Checkout                       | Complete one payment path, then switch payment type with invalid prior input                                     | State model, conditional validation, UI-to-API persistence checks                                          | 15 / core                 |
| REST API                       | Create/read/update/delete an owned entity; test invalid input and authorization                                  | HTTP semantics, runtime contracts, data builders, cleanup                                                  | 8–11 / core               |
| GraphQL                        | Inspect the actual schema; send one valid query and one invalid selection; inspect errors as well as HTTP status | Schema-driven design; distinguish transport success from operation success                                 | 9 / stretch               |
| Authentication                 | Exercise account lock transitions using isolated users                                                           | State transitions, role differences, reset strategy, secret-safe evidence                                  | 10 / core slice           |
| TOTP                           | Enroll a local account; verify valid and invalid codes; investigate time-window behavior                         | Multi-step auth, controlled secrets, clock-boundary diagnosis; browser clock alone cannot move server time | 10 / optional hour        |
| Authorization                  | Compare customer A, customer B, guest and admin for one resource                                                 | Object ownership and server-side enforcement; hiding a button is insufficient proof                        | 10, 20 / core             |
| External address dependency    | Make local backend call a stub; introduce slow, failed and malformed replies                                     | Service virtualization, contract boundaries, error mapping and UI recovery                                 | 12 / core slice           |
| Async email and PDFs           | Correlate a unique recipient/order; poll completion with a deadline; validate downloaded content                 | Eventual consistency, stale-data prevention, job/log diagnosis                                             | 16 / core slice           |
| Contact attachments            | Verify a supported file and a rejected boundary; inspect stored message outcome                                  | Upload handling, negative cases, UI/API agreement                                                          | 16 / core slice           |
| Localization and accessibility | Run one journey in two locales; examine focus, keyboard navigation and accessible names                          | Browser context isolation, resilient locators, manual plus automated accessibility                         | 18 / core slice + stretch |
| Admin and reporting            | Change owned data and reconcile one report against independent expected values                                   | SQL-assisted diagnosis, aggregation reasoning, permissions                                                 | 11, 26 / capstone option  |
| Performance                    | Compare baseline with the local performance variant using an identical bounded workload                          | Percentiles, error rates, resource/log correlation, reproducible experiments                               | 19 / core slice           |
| Bug hunting                    | Explore a chosen feature without reading its known-bug list first; create the smallest detecting regression      | Charters, severity versus priority, product/test/environment classification                                | 21 / core                 |
| Framework and CI               | Isolate accounts, run workers/shards, merge reports and inspect first-attempt failures                           | Fixture scope, architecture tradeoffs, CI selection, flake ownership                                       | 22–25 / core              |

The business areas above are documented in the [v5 user stories](https://testsmith-io.github.io/practice-software-testing/#/user-stories/v5) and [feature matrix](https://testsmith-io.github.io/practice-software-testing/#/features). Exact limits and status codes must come from the selected revision, not remembered examples.

## Particularly valuable lab: external postcode lookup

The documented address lookup supports a deterministic fake or an HTTP dependency, with local configuration for a stub server. Registration and checkout use it; upstream failures are mapped to a backend error. The admin override is local-only. [Postcode lookup documentation](https://github.com/testsmith-io/practice-software-testing/blob/main/docs/postcode-lookup.md)

Practice these layers separately:

1. Browser route mock: test the UI's reaction to the application's response.
2. Backend → WireMock: test the application's actual dependency handling.
3. Normal integration: prove the connected path still works.

Your deliverable is a sequence diagram, one failure test at each relevant boundary, and an explanation of what each test cannot prove. A browser mock does not prove the backend called its dependency. MSW in the Node test process does not automatically intercept requests originating in Laravel.

## Choose the right environment

| Environment                  | Intended practice                                | Constraint                                                       |
| ---------------------------- | ------------------------------------------------ | ---------------------------------------------------------------- |
| Hosted normal site           | Exploration and small read-only checks           | Shared catalog/accounts are not deterministic fixtures           |
| Pinned local normal Sprint 5 | Main UI, API, data, TOTP, GraphQL and async labs | Confirm each capability in the selected revision                 |
| Local with-bugs variant      | Defect discovery and regression design           | Feature parity with normal v5 is not guaranteed                  |
| Local performance variant    | Load and timing/failure diagnosis                | Different feature set; do not reuse every normal-v5 test blindly |
| Supplemental local lab       | Unsupported browser controls and protocols       | Label evidence as lab mechanics, not product coverage            |

The performance variant documents configurable delays, simulated gateway failures and temporarily disabled UI controls. It is useful for studying actionability and failure diagnosis as well as load testing. Keep workload and environment identical when comparing runs; injected degradation is not a real production capacity measurement. [Performance variant](https://testsmith-io.github.io/practice-software-testing/#/sprints/sprint5-performance)

The buggy variant documents intentional UI/API/accessibility faults. Its overview says some features are missing, while its bug list and the feature matrix describe cart-related behavior. Treat this as a documentation inconsistency to resolve against the pinned version; missing functionality is not automatically a newly discovered defect. [Buggy variant](https://testsmith-io.github.io/practice-software-testing/#/sprints/sprint5-with-bugs)

## Four-week scope and limits

Keep the existing 5-hour daily core and optional sixth hour:

- Week 1: product understanding, test design, frontend reliability and integration setup.
- Week 2: REST/data/auth; postcode mocking replaces the generic HTTP mock example. GraphQL and TOTP use optional time, replacing other stretch work.
- Week 3: complete customer outcomes, async work, accessibility, performance and debugging.
- Week 4: CI, parallel isolation, architecture, review and an independent capstone.

Do not attempt every table row in depth. Choose one representative risk, implement a detecting test, inject a controlled fault, diagnose it, and explain the tradeoff. Record unfinished topics in the [tracker](PRACTICE-TRACKER.md); documentation review earns no competency score.

This target does not establish coverage of all automation cases. gRPC, distributed event delivery, native mobile, real payment-provider settlement/webhooks and production incident operations require separately verified systems. A chat widget does not prove WebSocket support. Demo payment forms do not prove payment-network integration. Real social-provider testing requires its own configured environment and test-account policy.

Your first assignment: create a one-page risk map for catalog → cart → checkout → invoice. For each risk, choose UI/API/unit coverage, identify the test oracle and data owner, and name the evidence that would justify release. Then implement only the highest-value thin slice.
