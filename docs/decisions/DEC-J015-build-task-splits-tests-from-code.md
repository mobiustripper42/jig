---
schema: 1
id: DEC-J015
title: "3+ point tasks build through /build-task: tests and code by separate agents"
topic: "Session workflow & skills"
status: "active"
date: "2026-10-15"
ruling: "A 3+ point behaviour task is specced in its issue from task-spec.md and built by /build-task: @test-writer writes failing tests, @implementer passes them without editing them, the Lead verifies and ships. Running it approves the spec."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "the skill, with its spec template beside it"
  - kind: "file"
    target: "CLAUDE.md"
    note: "Spec it routes 3+ point tasks to the template and the skill"
revisit_if: "The receipts show readback or implementer rounds that cost more than the old loop's build, or tests passing on a change @code-review then finds broken."
---

## DEC-J015: 3+ point tasks build through /build-task

The session that specs a task also wrote its tests and its code, so nothing kept the code from
quietly weakening a test to get green, and every build filled the Lead's context. The split is by
job, not by domain: the agent that defines correct is not the one that has to meet it, and a
checksum on the test files proves the second never touched them.

The issue body is the spec because neither agent sees the conversation. A readback runs before
any test is written; an assumption the code settles is written in as a `[code]` line and the run
goes on, and only a judgment call or a real question stops it. A stop there is missing
information, not a checkpoint.

Sequential only — parallel work already happens across repos. 1–2 point tasks, bug fixes and
layout-only work stay on the normal loop. Designed outside this repo and landed from its handoff.

See also DEC-J014, DEC-J016.
