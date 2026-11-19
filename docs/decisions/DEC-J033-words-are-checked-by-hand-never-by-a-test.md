---
schema: 1
id: DEC-J033
title: "Words are approved in the spec and checked by hand, never asserted by a test"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-19"
ruling: "A test never asserts fixed user-facing text, typed or read from the catalog. The spec's Wording section approves the words, the implementer copies them, and a /kill-this hand step reads them where they appear."
claims:
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "What a test asserts; the allowed exceptions"
  - kind: "file"
    target: ".claude/skills/build-task/task-spec.md"
    note: "The Wording section"
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "Step 4.2: the words hand step"
supersedes:
  - DEC-J028
revisit_if: "A wrong or missing word reaches main that the hand step was given and missed, twice."
---

## DEC-J033: Words are approved in the spec and checked by hand, never asserted by a test

Harvested from Haul `f62e8d3`, `02bfa33`, `1f8bd5f` and `dc110fe` (Haul issues 206 and 211).
DEC-J028 had `@test-writer` read existing copy from the catalog instead of typing it. That kept
tests from breaking on a rewording, but each still restated the line that renders it and caught
nothing: Haul had 545 word assertions in 62 of 181 test files (DEC-J032). Haul swept them out.

What a test may still check: which line was chosen (`t(key)`), an accessible name used only to
find a control, a value reaching the page, an email against the project's renderer, and a
text-composing function's whole output in its own unit test. J028's other two rules, behaviour
over structure and one rule at one layer, carry over unchanged in `test-writer.md`.

Verified before the harvest: a fresh reader found no word assertions in Haul's three
`/build-task` runs since `dc110fe` (Haul pull requests 216, 218, 223), counting two composed data
strings in pull request 216 as values. Supersedes DEC-J028; see also DEC-J026.
