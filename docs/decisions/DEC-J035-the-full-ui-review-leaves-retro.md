---
schema: 1
id: DEC-J035
title: "@ui-reviewer runs per task; every screen only when the operator asks"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-25"
ruling: "Where .claude/ui-context.md exists, /kill-this runs @ui-reviewer on the routes a task's screen files reach. No skill reviews every screen or suggests it: that is an audit the operator runs, or a plan row before a release."
claims:
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "Step 3.4"
  - kind: "file"
    target: ".claude/skills/retro/SKILL.md"
    note: "Has no screen review step and writes no line for one"
  - kind: "file"
    target: "scaffold/claude/ui-context.md"
supersedes:
  - DEC-J027
revisit_if: "A release ships with screens that disagree in a way that stopped or misled someone, and no full review was run before it."
---

## DEC-J035: @ui-reviewer runs per task; every screen only when the operator asks

The operator, 2026-11-25: "at retro it's too painful to do it there. I'm mentally done and
sometimes it's ready for release." Haul's Phase 0 retro ran the review and filed all 9 findings
for Phase 1 (DEC-J027), so it fed the next phase. Muster skipped it at its Phase 16 retro, at the
operator's call (`docs/RETROSPECTIVES.md` in muster).

The full review is the only one that sees two distant screens together, so it is kept as an audit.
Nothing suggests it: DEC-J017 retired a suggestion that was always declined. Muster's plan has it
as row 23.13, before its release (`docs/PROJECT_PLAN.md` in muster).

The cost: a task that changes only strings was left to the phase-end pass, and now gets no
screen review. Its words are still read by hand at the hand-back (DEC-J033). The starter's Strings file
slot existed for that pass and is gone.
