# Context Map

Multi-context domain documentation for this repo. Each context has its own `CONTEXT.md` glossary and optional ADRs.

| Context     | Path                                      | Scope                                              |
| ----------- | ----------------------------------------- | -------------------------------------------------- |
| `framework` | `docs/contexts/framework/CONTEXT.md`      | Fixtures, page objects, utils, schemas, mocks      |
| `tests`     | `docs/contexts/tests/CONTEXT.md`          | Unit, API, and UI test suites                      |
| `ci`        | `docs/contexts/ci/CONTEXT.md`             | GitHub Actions, reporting, pipeline configuration  |

System-wide architectural decisions live in `docs/adr/`. Context-specific decisions live in `docs/contexts/<context>/docs/adr/`.

See `docs/agents/domain.md` for consumer rules.
