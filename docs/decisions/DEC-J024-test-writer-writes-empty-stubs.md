---
schema: 1
id: DEC-J024
title: "@test-writer writes empty stubs so each test fails on its own assertion"
topic: "Session workflow & skills"
status: "active"
date: "2026-10-30"
ruling: "@test-writer writes an empty stub for every unimplemented Interfaces signature and runs the tests against them; each must fail on its own assertion. Stubs are not locked, and a stub never forces a test to bend."
claims:
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "write mode, items 4 to 6"
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 2, Why stubs"
revisit_if: "Stubs keep forcing stop-and-report, or tests start passing against stubs with no failing partner."
---

## DEC-J024: @test-writer writes empty stubs so each test fails on its own assertion

A red test proves something only when it fails on its own assertion. Without stubs, every test
failed because the module did not exist, which a test asserting nothing does too. Haul showed both
sides (its session file `sessions/2026-10-24-1502-main.md`, on its `sessions` branch): in task 0.10
every test failed on "Cannot find module", and in 0.6 24 tests passed before any code existed.

Haul prototyped the step (its pull request 25) and ran it once, on task 0.7: all 35 tests failed
on their own assertions before any code existed. The friction was where stubs met the test lock: a
test read a column through a form that survived it not existing yet, and an unrelated test was
edited to typecheck against a stubbed field. Both got locked. So a stub may not force either:
@test-writer stops and reports, and the Lead brings it to the operator. A column or table the task
creates fails on "does not exist" instead, honestly. Neither rule has run yet.

Stubs stay out of the lock: they are production files @implementer replaces. Harvested from Haul
onto jig's later changes. See also DEC-J022, DEC-J023.
