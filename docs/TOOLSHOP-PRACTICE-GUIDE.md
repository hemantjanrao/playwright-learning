# Toolshop practice environment and framework integration

Status: **planned exercises; no Toolshop installation or test integration has been performed by this documentation update**. Follow the [28-day plan](HANDS-ON-MASTERY-PLAN.md); setup is day 2 and integration is day 3.

## Targets and versions

| Target                                                                                | Purpose                                                 | Rule                                                                                        |
| ------------------------------------------------------------------------------------- | ------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| [Hosted Toolshop](https://practicesoftwaretesting.com/)                               | Initial exploration and occasional read-only comparison | Shared data is not a stable CI fixture                                                      |
| [Hosted API documentation](https://api.practicesoftwaretesting.com/api/documentation) | Learn endpoints and request/response shapes             | Compare with the exact local version before asserting behavior                              |
| Private local Toolshop, pinned sprint/revision                                        | Main UI/API/data/CI exercises                           | Seed, mutate, reset and inject faults only in your owned environment                        |
| Separate local buggy variant                                                          | Unknown-fault diagnosis and regression practice         | Keep versions/data isolated; classify intentional defects separately from suite reliability |
| Minimal supplemental local pages/service                                              | Absent browser mechanisms, such as frames or timers     | Label as mechanics demonstrations, not Toolshop business coverage                           |

The upstream guide describes Angular, Laravel, MariaDB and a Docker-based environment, including a buggy sprint variant. See [stack and versions](https://github.com/testsmith-io/practice-software-testing/blob/main/docs/README.md).

The current [license](https://github.com/testsmith-io/practice-software-testing/blob/main/LICENSE) permits private, internal, noncommercial copying/running and restricts public distribution/hosting and commercial uses. Keep the application checkout private; public hosting or redistribution is outside this learning plan.

## Day 2 setup assignment

Do this in a separate application checkout, not by copying application source into the automation framework.

1. Inspect machine runtime, Docker availability, disk/memory capacity and occupied ports. Record real observations; do not guess compatibility from the laptop model.
2. Select a revision and sprint; record commit SHA, image identifiers, Compose configuration, dependency versions and chosen port mapping. Inspect the pinned README/Compose files before running their commands.
3. Establish the UI and its matching API together. Confirm health by a real page load and a documented API read; a running container alone is insufficient.
4. Record migration/seed procedure for your disposable database. A reset must be guarded by an explicit local-target check and must never run while another suite uses that database.
5. Enable the documented local mail service/background processing needed for later exercises. Confirm an actual observable message/job outcome when that exercise begins.
6. Collect a sanitized backend log entry for one request. Record the API/documentation/UI/mail locations in your run manifest.
7. Stop and restart without destroying unrelated data. Prove the setup can be reproduced from the recorded inputs.

Upstream documents local service endpoints and operational commands for mail capture, seeding, logs and invoice generation. Use the [setup guide](https://github.com/testsmith-io/practice-software-testing#using-the-docker-containers) for the selected revision; this plan intentionally does not prescribe a stale container name or blindly execute database reset commands.

**Acceptance:** working frontend + matching API, known revision, disposable owned data, logs visible, documented lifecycle. If setup exceeds two hours, request targeted infrastructure help, continue design/contract reading, and leave the environment gate unverified until it actually works.

## Day 3 integration assignment

Proposed paths below **do not exist yet**. They define a small starting seam, not mandatory new abstraction layers:

```text
playwright.toolshop.config.ts    # independent test selection and artifacts
 tests/toolshop/
   api/                         # Toolshop service contracts and business behavior
   ui/                          # a few complete customer journeys
   setup/                       # target-specific authentication if needed
 fixtures/toolshop.fixture.ts    # typed Toolshop dependencies and owned resources
 pages/toolshop/                # product/catalog/cart objects as scenarios need them
 schemas/toolshop.schemas.ts     # request/response contracts from this target
```

Start with API and guest-Chromium projects. Add authenticated setup, browser matrix and mock projects only when a concrete exercise needs them. The existing 11 projects stay unchanged until an intentional migration is reviewed.

### Decisions the learner must make

- How do config loading and credentials avoid dependence on Sauce Demo settings?
- Which HTTP transport/helper is genuinely reusable, and which paths/types are domain-specific?
- How are target, run and worker reflected in auth files, created resources and artifact directories?
- How do tests avoid hard-coded global product IDs and catalog counts?
- What is the smallest page/component interface that describes the user's intention?
- What is the cleanup policy when a test, fixture or process fails?

Do not reuse JSONPlaceholder's integer-ID branded types for Toolshop without checking its ID contract. Do not use the existing Sauce Demo `storageState` or page objects. Do not change global URLs and assume the reference specs will work.

### First vertical slice

1. One read-only product API test: correct status, meaningful schema and business field.
2. One guest UI test for a product read from known seed data; assert identity and expected price.
3. Test discovery shows Toolshop tests only in the intended projects, with no accidental reference-suite execution.
4. Intentionally corrupt an expected field locally; demonstrate a clear failure, then restore it.
5. Run framework validation and the two targeted tests; record prerequisites and evidence.

Only after implementing and verifying this proposed config will commands such as the following be usable:

```bash
# Future command: requires the day-3 config and tests to exist
npx playwright test --config=playwright.toolshop.config.ts --list
```

## Data and account ownership contract

Use a test-run namespace and distinguish stable scenario inputs from unique record names. A created-resource fixture should arrange data, expose typed identifiers, and clean up its owned resources even when the test body fails. Log identifiers needed for diagnosis without logging credentials or tokens.

Prefer API setup for most journeys. Keep a separate registration/login UI test for the authentication feature itself. Allocate local customers per worker/test according to mutation risk; sharing a read-only seeded catalog is different from sharing a customer whose cart or profile changes.

Read-only SQL is a targeted diagnostic/integration tool. Do not duplicate the implementation's SQL in every test or bypass API business rules to manufacture impossible states. For crash leftovers, plan a bounded namespace-specific cleanup task; do not reset the entire database while parallel runs are active.

## Test oracle and version policy

For each scenario record: pinned source/API version, accepted requirement, seed inputs, expected outcome and observed result. If specification, UI copy and implementation disagree, file a question/defect with evidence. Do not silently make the test expectation match a bug.

OpenAPI assertions should include status and semantics, not only JSON shape. A generated TypeScript type is not runtime validation. Backend unit/component tests require the application's own toolchain; this Playwright repository's unit suite tests framework code.

## CI model to practice

- Fast PR: framework checks, deterministic API/contracts, selected local Toolshop smoke.
- Scheduled: wider business regression and supported-browser matrix.
- Separate diagnostic jobs: buggy variant, quarantine, performance and disruptive experiments.
- Services must pass health checks before tests; unavailable infrastructure cannot count as tested.
- Every runner/shard needs intentional data isolation and distinct artifact names. Verify merged coverage, not merely successful report creation.
- Keep hosted comparison runs informational until their instability and data ownership are understood.

Do not change remote branch protection, publish reports or trigger hosted CI as a side effect of writing this plan. Those are future implementation/verification actions.

## Deliverable manifest

```markdown
Application revision / sprint:
Automation revision:
UI / API target (sanitized):
Container/image/runtime versions:
Seed version / run namespace:
Account ownership:
Health checks and outcomes:
Selected tests / project / worker / shard:
Passed / failed / flaky / skipped / not run:
Artifact locations and retention:
Cleanup outcome:
Unverified prerequisites / limitations:
```
