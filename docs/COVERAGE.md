# Automation coverage and remaining risks

Scope note: this file describes implemented Toolshop UI and JSONPlaceholder API reference tests. Cart, checkout, and negative-login specs were removed and must be rebuilt against Toolshop. The [Toolshop learning plan](HANDS-ON-MASTERY-PLAN.md) and [exercise briefs](TOOLSHOP-EXERCISE-BRIEFS.md) describe planned work, not current Toolshop coverage.

This repository tests a demo storefront and a separate demo API. Framework tests do not
measure application unit coverage, and JSONPlaceholder write responses do not prove persistence.
No claim of exhaustive business coverage is made.

| Risk / requirement                                              | Evidence                     | Layer                          | Execution tier               | Owner          |
| --------------------------------------------------------------- | ---------------------------- | ------------------------------ | ---------------------------- | -------------- |
| Guest reaches Contact via header                                | `header.spec.ts`             | Guest UI                       | PR smoke + nightly           | QA maintainers |
| Valid user can sign in                                          | `auth.setup.ts` only         | Setup project                  | Before authenticated UI      | QA maintainers |
| Invalid or locked user cannot sign in                           | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| Correct product, price, quantity reach cart                     | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| Customer completes checkout with correct totals                 | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| Missing checkout fields prevent progression                     | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| Cancel preserves cart; remove clears it                         | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| Guest cannot access account pages directly                      | **Uncovered** (spec removed) | —                              | —                            | QA maintainers |
| HTTP errors remain distinguishable from parse/contract failures | `api-response.spec.ts`       | Framework tests, loopback HTTP | Every PR                     | QA maintainers |
| Caller configuration wins over dotenv                           | `config-and-schemas.spec.ts` | Unit                           | Every PR                     | QA maintainers |
| API response schemas and expected fields                        | `tests/api/`                 | Live API and mocks             | PR / nightly; mocks every PR | QA maintainers |

## Architecture boundaries

- Browser contexts isolate client-side cart state. One demo account is reused. A real backend
  with shared mutable user state needs account allocation and resource creation/cleanup fixtures.
- Synthetic `page.setContent` tests demonstrate route interception only. Application failure
  recovery needs tests against an application with actual service calls; these examples do not
  establish that coverage for Sauce Demo.
- Page objects (`LoginPage`, `HomePage`) own screen interactions; assertions stay in specs.
- Both HTTP transports exercise the same error-contract scenarios against a disposable local
  server. These framework tests need loopback network access, but no external service.
- Test tags select gates. New business tests must carry `@smoke` and/or `@regression`.
  Quarantine requires an owner and issue, and is excluded from default runs.

## Remaining work, selected by product risk

1. Multi-item carts, sorting, and additional checkout state transitions.
2. Real backend CRUD persistence, invalid payloads, authorization, pagination, idempotency,
   and teardown; these require a stateful test target with an agreed contract.
3. Accessibility, keyboard/focus, responsive viewports, and selected visual baselines.
4. Service failure/recovery, asynchronous integrations, and performance/security checks
   where the application supports them.
5. Layer-specific configuration, shared HTTP response parsing, reproducible generated data,
   and automated tag/coverage policy checks as the framework grows.

Assign product-specific acceptance criteria and owners before treating these as release gates.
