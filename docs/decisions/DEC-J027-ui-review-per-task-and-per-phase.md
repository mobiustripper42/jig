---
schema: 1
id: DEC-J027
title: "@ui-reviewer runs per task on touched screens, and on every screen at phase end"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-02"
ruling: "Where .claude/ui-context.md exists, /kill-this runs @ui-reviewer on the routes a task's screen files reach, and /retro runs it over every route; each finding is fixed before close or filed."
claims:
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "Step 3.4"
  - kind: "file"
    target: ".claude/skills/retro/SKILL.md"
    note: "Step 1.5"
  - kind: "file"
    target: "scaffold/claude/ui-context.md"
revisit_if: "Retro reviews keep filing findings a per-task review should have caught, or not reached routes become routine."
---

## DEC-J027: @ui-reviewer runs per task on touched screens, and on every screen at phase end

`@ui-reviewer` ran when someone remembered to run it, against a context file that went stale, and
in Muster that did not hold. Haul tied it to the two moments that already happen: `/kill-this`
reviews the routes a task touched, and `/retro` reviews every route at phase end.
`.claude/ui-context.md` holds the rules and pointers it reviews against (sources, components,
viewports, languages, routes, how to reach a screen), and a route it cannot reach is reported as
not reached, never reviewed from source and called clean.

Haul prototyped it in task 0.15 (its pull request 41). Its Phase 0 retro ran it: 9 findings, all
filed for Phase 1. A project with no screens has no `ui-context.md`, and both skills skip the
review. The scaffold now ships a starter.
