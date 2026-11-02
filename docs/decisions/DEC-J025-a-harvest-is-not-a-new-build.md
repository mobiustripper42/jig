---
schema: 1
id: DEC-J025
title: "Every behaviour task builds through /build-task; a harvest does not"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-02"
ruling: "Any task that changes behaviour, whatever its points, is built by /build-task. Bringing back code a project already built, tested and reviewed is a harvest, not a new build: it takes the normal loop."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 0: no points gate; Testable is the line"
  - kind: "file"
    target: ".claude/CLAUDE-context.md"
    note: "a harvest takes the normal loop"
supersedes:
  - DEC-J022
  - DEC-J015
revisit_if: "A harvest ships a defect the project's own run had not caught, or usage of the plan becomes a problem."
---

## DEC-J025: Every behaviour task builds through /build-task; a harvest does not

DEC-J022 holds, with one exception it did not foresee. Haul prototypes workflow changes and jig
harvests them (DEC-J024's stubs, this harvest's interface review). Read literally, DEC-J022 sent the
harvest's one script change through `/build-task`: a spec derived again for code that already ran
in Haul, with its tests written, failed and passed there, and its review done.

So a harvest takes the normal loop. A script it carries still gets a check written first and seen
failing in jig, which is cheap and is the proof that the harvested code does what it says here.

What stands from DEC-J022 and DEC-J015: tests and code by separate agents, the issue as the spec,
tests locked before code, sequential runs only, running the skill approves the spec, code quality
before usage, and Step 0's Testable gate as the line to the normal loop.
