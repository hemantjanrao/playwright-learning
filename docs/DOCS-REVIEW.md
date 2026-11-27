# Learning documentation review

Reviewed against repository source on **21 November 2026**. This is a documentation/source audit, not a new execution report or assessment of the learner.

## Toolshop learning-plan revision — 21 November 2026

The learner selected Toolshop as the primary target and confirmed 5–6 hours daily for four weeks. The current mastery plan now schedules local setup on day 2 and framework integration on day 3, followed by frontend/backend, database, auth, integration, debugging, nonfunctional, CI and architecture work. It replaces the earlier Sauce Demo-centered schedule and generic local-app build.

New supporting documents: [Toolshop environment guide](TOOLSHOP-PRACTICE-GUIDE.md) and [exercise briefs](TOOLSHOP-EXERCISE-BRIEFS.md). The tracker now uses D01–D28, TS-01–TS-16 and BUG-01–BUG-12. No learner results existed in the prior tracker, so all entries remain unassessed.

The source audit below still describes the existing reference framework. Toolshop functionality, setup and test coverage must not be reported as implemented merely because they appear in the learning plan. `COVERAGE.md` continues to report existing reference-suite coverage.

## Findings and disposition

| Finding                                                            | Why it matters                                                        | Resolution in this documentation update                                                 |
| ------------------------------------------------------------------ | --------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| Three competing sequences: lessons, T-tickets, H-tickets           | No single route from novice to independent engineer                   | Use the four-week mastery plan as the sequence; reuse existing exercises                |
| T-tickets describe several already-fixed defects as open           | Learner may duplicate code or regress the framework                   | Add current implementation reconciliation; keep learner mastery separate                |
| Backlogs cite Playwright 1.61.0; lockfile is 1.65.0                | Feature compatibility advice is stale                                 | Correct baseline and require version checks                                             |
| `test.each` appears as Playwright advice                           | It imports a Jest-style API assumption                                | Replace with JavaScript data-driven loops                                               |
| Guest-login exercises still select `chromium`                      | Those specs now belong to `chromium-guest`                            | Correct explicit login commands and update lesson 02                                    |
| H-11 says shards must not share filenames                          | `fullyParallel` distributes tests, so files can appear in both shards | Compare test identities; recognize repeated setup dependencies                          |
| T-07/H-12 require path filters                                     | Mocks now run on every PR/main push                                   | Validate current unconditional execution; assess filtering only as a design alternative |
| Several learning references still describe first-retry-only traces | Current config retains failure traces                                 | Mark old ticket examples historical; correct active coach lesson                        |
| Production readiness says implementation has not started           | Some proposed changes are now present, others remain                  | Mark historical baseline and require per-slice reconciliation                           |
| Lessons cover concepts but lack retention and assessment           | Reading and assistant-generated code can look like mastery            | Add rebuilds, unseen debugging, evidence gates, and an unassessed tracker               |
| Advanced browser and nonfunctional topics excluded entirely        | Good scope control for Sauce Demo, incomplete for broad learning      | Add a separate proposed local lab track, without claiming product coverage              |

## Warmup reconciliation

“Present” means the implementation can be inspected in current source. It does not certify every historical acceptance criterion, a fresh green run, or learner mastery.

| Ticket | Current source assessment                                          | Recommended practice                                                   |
| ------ | ------------------------------------------------------------------ | ---------------------------------------------------------------------- |
| T-01   | Removed: inventory card specs deleted in the Toolshop rewrite      | Rebuild against Toolshop product cards                                 |
| T-02   | Removed: CartPage and cart specs deleted                           | Restore against Toolshop cart; extend to multiple items                |
| T-03   | Removed: negative-login spec and fixture data deleted              | Rebuild against Toolshop login; add a justified boundary               |
| T-04   | Removed: inventory assertions deleted                              | Re-derive coverage before adding duplication back                      |
| T-05   | Present: `trace: 'retain-on-failure'`                              | Produce and inspect your own failure trace                             |
| T-06   | Missing from MSW user specs: unknown-user negative case            | Implement the focused 404 exercise                                     |
| T-07   | Partial: browser/mock projects remain; `network-mock` spec deleted | Restore a `page.route` spec; inspect discovery and CI triggers         |
| T-08   | Removed: checkout suite deleted                                    | Restore against Toolshop checkout; defend totals and state transitions |
| T-09   | No sorting scenario found                                          | Implement data-driven sorting                                          |
| T-10   | Present: environment restoration with `try/finally`                | Explain missing-value restoration and test a variant                   |
| T-11   | No popup scenario found                                            | Observe current target behavior before selecting API                   |
| T-12   | Learner-specific drill; cannot infer completion from source        | Perform hidden-fault diagnosis                                         |
| T-13   | Present: GET post by ID and missing-resource test                  | Explain branded ID and response contract                               |
| T-14   | No dedicated update/delete specs found                             | Practice simulated responses; use local target for persistence         |
| T-15   | No product-detail scenario found                                   | Implement identity/price/navigation checks                             |

## Advanced task reconciliation

| Ticket group | Current evidence                                                                             | Remaining learning work                                                                                            |
| ------------ | -------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------ |
| H-01/H-02    | `api-response.spec.ts` exercises both clients with loopback HTTP; parsing remains duplicated | Explain taxonomy, add missing cases, assess extraction; original no-network stub challenge is still an alternative |
| H-03         | MSW per-test handler reset exists                                                            | Prove it with an isolated same-worker regression exercise                                                          |
| H-04         | WireMock mappings cover GET                                                                  | Add POST behavior and verify request matching                                                                      |
| H-05         | Browser route examples cover success and abort                                               | Add a 500 response/error rendering exercise                                                                        |
| H-06         | Response IDs are required; request schema is separate                                        | Design a justified contract evolution and compatibility test                                                       |
| H-07         | Endpoint helpers still accept branded IDs or raw numbers                                     | Tighten the boundary and demonstrate compile-time behavior                                                         |
| H-08         | Typed cart and checkout fixtures exist                                                       | Rebuild/explain composition; do not duplicate page objects                                                         |
| H-09/H-10    | One auth persona; suffix helper exists                                                       | Explore second persona and collision/run-ownership evidence                                                        |
| H-11         | Sharding and merge workflow exist                                                            | Perform local split/merge; inspect test identities and isolated outputs                                            |
| H-12         | Unconditional mock CI; Docker absence throws in CI                                           | Verify execution policy and skips, not obsolete filter additions                                                   |
| H-13/H-14    | Exercises assess judgment, not file existence                                                | Perform an independent review and timing investigation                                                             |

## Production-readiness plan interpretation

Keep PR-01–PR-13 as engineering proposals. Existing code partially addresses tooling boundaries,
environment precedence, client error ordering, handler resets, UI coverage, guest separation,
mock scheduling, and trace/quarantine defaults. That does not complete the broader slices:
capability-specific configuration, strict config parsing, resource ownership, lint enforcement,
hosted CI evidence, report policy, and sustained reliability still need individual assessment.
Do not check the production-readiness completion list based solely on this audit.

## Maintenance policy

- Source/config determines current behavior; historical ticket descriptions explain the original exercise.
- Update the mastery plan and coverage map when projects or test ownership change.
- Do not duplicate lessons 03–10 into a second source; link to the coach curriculum.
- Separate implementation status, execution evidence, and learner mastery in all progress updates.
- No application code, dependency version, workflow, or exercise solution was changed in this documentation task.
