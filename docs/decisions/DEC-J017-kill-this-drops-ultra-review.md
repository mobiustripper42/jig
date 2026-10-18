---
schema: 1
id: DEC-J017
title: "/kill-this no longer suggests /code-review ultra"
topic: "Session workflow & skills"
status: "active"
date: "2026-10-18"
ruling: "/kill-this's blast-radius step runs /security-review and stops there. It does not print a suggestion to run /code-review ultra, and its review receipt has no row for it."
claims:
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "Step 3.5 prints no ultra line; Step 3.6's receipt has no ultra row"
  - kind: "file"
    target: "scaffold/claude/CLAUDE-context.md"
    note: "Blast-Radius Triggers names /security-review only"
revisit_if: "A merged pull request on a money or auth path ships a defect that @code-review and /security-review both passed."
---

## DEC-J017: /kill-this no longer suggests /code-review ultra

Every pull request that hit a blast-radius trigger printed a line offering `/code-review ultra`,
and every receipt carried a row saying it had not run. The operator has never run it. A
suggestion that is always declined is a line read past on every pull request, and a receipt row
that always reads the same says nothing.

`/security-review` stays: it runs on a trigger without anyone choosing it, which is what the
trigger exists for. The operator can still run ultra by hand; nothing here forbids it.

The cost: on a novel money or auth path, nothing now prompts the deeper pass. The `revisit_if`
names the case that would show this was wrong.
