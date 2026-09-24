---
schema: 1
id: DEC-J008
title: "The surface-check step is retired"
topic: "Session workflow & skills"
status: "active"
date: "2026-09-24"
ruling: "The micro workflow's surface-check step and its `Surface check` slot are removed. Showing a person what the change looks like is part of handing back, and what a program prints is asserted by a test."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "step removed, the stop absorbs the show-it clause, steps renumbered"
  - kind: "file"
    target: "scaffold/claude/CLAUDE-context.md"
    note: "slot row and its worked example removed"
  - kind: "file"
    target: "docs/CHEATSHEET.md"
    note: "the stop block no longer cites a step number"
revisit_if: "A defect ships that only reading a program's output would have caught, and no test could have asserted it."
---

## DEC-J008: The surface-check step is retired

It read: *confirm the change is right where a person meets it, which a passing check does not tell
you.* Two instructions, no stateable outcome. The prove-it step says *watch it fail for the reason
you expect*; this said nothing about what to produce or how you would know you had.

So it was read three ways in one session: a fixture built and read, a planting command written
into a pull request for the reviewer, the function called directly. Each felt like compliance. It
was also the only step leaving no evidence — run-the-proof leaves a test count, this left a claim.

The vagueness was structural. `CLAUDE.md` ships everywhere, and one sentence covered both a repo
whose surface is what a gate prints and repos that are almost entirely rendered pages. The slot
exists to resolve that and did not: it named a medium, not a standard.

Both halves had homes. Showing a person a new surface belongs at the stop — earlier means human
review before `@code-review`, the same work twice. A gate printing a wrong number while its tests
pass is a missing assertion, which is a check rather than a reminder.
