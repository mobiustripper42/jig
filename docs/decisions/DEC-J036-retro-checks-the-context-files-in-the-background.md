---
schema: 1
id: DEC-J036
title: "/retro checks the context files against the code in the background"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-25"
ruling: "/retro starts one background agent that checks .claude/CLAUDE-context.md and ui-context.md against the code, and files what it finds as one issue for the next phase. It asks the operator nothing and no step waits for it."
claims:
  - kind: "file"
    target: ".claude/skills/retro/SKILL.md"
    note: "Step 0.5 and Step 10"
revisit_if: "Two of these issues in a row are closed with nothing fixed, or a false context line costs a session between two reviews."
---

## DEC-J036: /retro checks the context files against the code in the background

`check:context` proves that a cited path resolves; it cannot judge whether a sentence is true. A
hand review of muster's context file after its Phase 19 retro (reported by the operator,
2026-11-25) found 10 places to fix. The one that mattered was an omission: the money row of the
trigger table missed files that start a payment, so a change to only those would not have run
`/security-review`. That is why the agent looks for what a table leaves out, and not only for lines
that are wrong.

A phase is the interval because the file moves with the project: Haul's went from 1,124 words to
1,951 between 2026-11-02 and 2026-11-25 (issue 103).

It runs in the background and ends in an issue because the operator is tired at the end of a phase
(DEC-J035). The finding is decided on a later day.
