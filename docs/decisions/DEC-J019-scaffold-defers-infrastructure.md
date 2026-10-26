---
schema: 1
id: DEC-J019
title: "The scaffold defers infrastructure to the phase that needs it"
topic: "Template storage & distribution"
status: "active"
date: "2026-10-26"
ruling: "A new project's Phase 0 is the test harness, the gate and the docs. Its database, host and framework are each chosen by the first phase whose feature needs it."
claims:
  - kind: "file"
    target: "scaffold/docs/PROJECT_PLAN.md"
    note: "Phase 0 rows and the infrastructure paragraph"
  - kind: "file"
    target: "scaffold/docs/SPEC.md"
    note: "## Stack and Phase 0"
revisit_if: "A project needs a layer chosen before its first feature phase can be planned at all."
---

## DEC-J019: The scaffold defers infrastructure to the phase that needs it

The scaffold opened with a `## Stack` section and a Phase 0 that stood up a local environment
and a data layer, so a fresh install asked for the stack before the plan existed. Muster did the
opposite on purpose (`muster/docs/decisions/DEC-013-stack-infrastructure-deferred-to-m4.md`): a
stack-agnostic domain core behind a repository port, with in-memory persistence, until the crew
app forced each choice. Its record 020 then chose the stack. The early rendering was thrown away,
a cost record 013 accepted up front.

Haul, the first project installed from this scaffold, chose its stack after the plan was written
and weighed alternatives against it (`haul/docs/decisions/DEC-001-stack-next-postgres-crunchy-vercel.md`).
The scaffold now asks for that order. Phase 0 still picks a language and test runner, because the
harness needs them. `## Stack` stays, filled in a layer at a time as each is chosen.
