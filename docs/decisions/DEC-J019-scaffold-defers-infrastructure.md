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
opposite on purpose (its record 013): a stack-agnostic domain core behind a repository port, with
throwaway in-memory persistence, until the crew app forced each choice. Those choices were made
with the plan in hand, and nothing written before then had to be unwound.

Haul, the first project installed from this scaffold, settled it by hand: plan first, then
`@architect` checks the stack against the plan. The scaffold now asks for that order. `## Stack`
stays, filled in a layer at a time as each is chosen.
