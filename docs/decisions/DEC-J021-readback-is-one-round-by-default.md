---
schema: 1
id: DEC-J021
title: "Readback is one round by default"
topic: "Session workflow & skills"
status: "draft"
date: "2026-10-26"
ruling: "/build-task reads the spec back once. A second round runs only when round 1 changed what a criterion does, on those lines; a second behaviour change stops the run for rework."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 1"
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "Mode: readback, What to report"
revisit_if: "Write mode starts returning questions a second readback round would have caught, or a spec ships a gap round 2 or 3 found in Phase 10."
---

## DEC-J021: Readback is one round by default

Phase 10 of Centerline ran twelve readbacks under "re-read after every edit, stop at three". Round
1 found real gaps in every run. Later rounds mostly probed the wording written in the round before,
and re-raised assumptions the Lead had never written into the issue. Round 3 changed a criterion in
3 of the 7 runs that reached it: one real gap (issue 186), two refinements (168, 170).

An outside review argued for one round, because write mode can already stop and return a question.
The operator chose a hybrid: one round, a second only for a behaviour change, and a stop instead of
a third. Alongside it, `@test-writer` reports only what could fail a test, skips device checks, and
on a re-read sees only the changed lines; every accepted item is written into the issue; and the
Lead's own calls are `[Lead]` lines in the receipt. See also DEC-J015.

Draft until the first `/build-task` run under it (DEC-J020).
