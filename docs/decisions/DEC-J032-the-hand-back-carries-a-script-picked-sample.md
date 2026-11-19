---
schema: 1
id: DEC-J032
title: "The hand-back carries a script-picked sample, answered through /sample"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-18"
ruling: "A script, not the builder, picks 2 tests and 1 function from the changed lines, and /kill-this prints them last. /sample records the answers in the session file. Answering never gates a merge."
claims:
  - kind: "file"
    target: ".claude/skills/sample/sample.mjs"
    note: "The picker, line shape, marks, questions"
  - kind: "file"
    target: ".claude/skills/sample/SKILL.md"
    note: "The answering skill"
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "Steps 5 and 6: block and hand-back"
revisit_if: "About 20 samples are answered and the counts or the discussion's cost need changing, or answering has become a gate."
---

## DEC-J032: The hand-back carries a script-picked sample, answered through /sample

Haul's word-on-screen tests lasted for weeks: 545 assertions in 62 of 181 test files. No check
flagged them and no reader saw them: a task's diff is thousands of lines where nothing stands out.
A quiz of ten random tests (jig session 11) flagged all five word tests and two of five untouched
ones, and discussion upheld each mark. A sample the builder did not choose surfaces a pattern
within a few pull requests.

A script picks 2 tests and 1 function, seeded from the commit sha, printed as `path:line`. Answering
is strongly suggested, never required: no merge gate, since a guard for a problem that has not
happened is what the standing rule leans against. Marks and discussion live in the session file,
written by the script so the line format stays greppable. Tests and functions are found by line
patterns, not a parser, so it misses oddly-shaped code and other languages, and says so.

Honours DEC-J002 (`/sample`'s push is its own), DEC-J008 and DEC-J014 (merging stays the gate).
Searched sample and hand-back: nothing.
