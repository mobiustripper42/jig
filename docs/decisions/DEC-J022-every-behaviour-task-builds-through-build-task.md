---
schema: 1
id: DEC-J022
title: "Every behaviour task builds through /build-task"
topic: "Session workflow & skills"
status: "draft"
date: "2026-10-29"
ruling: "Any task that changes behaviour, whatever its points, is specced in its issue and built by /build-task, because code quality comes first. Points stay as the estimate and stop choosing the route."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 0 has no points gate; Testable is the line"
  - kind: "file"
    target: "CLAUDE.md"
    note: "Spec it"
supersedes:
  - DEC-J015
revisit_if: "Usage of the plan becomes a problem."
---

## DEC-J022: Every behaviour task builds through /build-task

DEC-J015 sent 3+ point tasks through `/build-task` and left 1–2 point tasks, bug fixes and
layout-only work on the normal loop. The cut-off was about usage and speed: a small task through
the skill costs more (Centerline's issue 166 through it, against 160 on the normal loop). The
operator's priority is maintainable, consistent code, so the cheaper route is no longer the
default for anything that changes behaviour, bug fixes included. Haul ran every task through it
first.

What still uses the normal loop is what the skill cannot test: a task with no criterion the
`Proof` slot can check (layout, styling, docs, configuration). Step 0's Testable gate draws that
line.

Everything else DEC-J015 decided stands: tests and code by separate agents, the issue as the spec,
tests locked before code, and running the skill approves the spec.

Draft until the first run under it (DEC-J020).
