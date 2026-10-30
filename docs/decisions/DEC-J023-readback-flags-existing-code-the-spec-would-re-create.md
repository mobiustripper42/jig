---
schema: 1
id: DEC-J023
title: "Readback flags existing code the spec would re-create"
topic: "Session workflow & skills"
status: "draft"
date: "2026-10-30"
ruling: "@test-writer's readback searches the code for anything that already does what the spec would build, and the Lead puts each match in Reuses before any test is written."
claims:
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "Reuse check section"
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 1, sorting a reuse match"
revisit_if: "Receipts fill with [Lead] lines rejecting reuse matches, or @code-review still finds copies of existing code the check missed."
---

## DEC-J023: Readback flags existing code the spec would re-create

The operator's priorities are maintainable and consistent code, and readback only asked whether a
spec could be tested. A copy of existing code passes every test, so nothing before the code looked
for one.

Haul's task 0.10 is the case: `db/seed.ts` re-declared the local-host rule from `pg-connect.ts`,
and the copy had already drifted. The spec's Reuses section missed it, readback said nothing, and
`@code-review` caught it after the code existed (Haul issue 21; the fix is Haul commit 6f264c7).

So readback gains a Reuse check, unfiltered like the Interface check, that covers functions,
constants, rules, components and the Screen section. A match becomes a Reuses line; one that
would change behaviour goes to the operator. Visual consistency is a separate question, left to
`@ui-reviewer` for now.

See also DEC-J021. Draft until the first run under it (DEC-J020).
