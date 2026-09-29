---
schema: 1
id: DEC-J011
title: "@pm is logic class; the three reviewers stay context"
topic: "Template storage & distribution"
status: "active"
date: "2026-09-29"
ruling: ".claude/agents/pm.md is logic: identical in every project, compared by drift, copied at sync. architect, code-review and ui-reviewer stay context."
claims:
  - kind: "file"
    target: ".claude/file-classes.yaml"
    note: "pm.md moved out of the context block, with the reason"
  - kind: "file"
    target: "docs/AGENTS.md"
    note: "says which agents are which class"
revisit_if: "A project needs @pm to know something only that project knows, and a context file cannot carry it."
---

## DEC-J011: @pm is logic class; the three reviewers stay context

The registry makes agents `context` because they "reason about the project's substance," so a good
one is project-specific. Measured on 2026-09-29, that holds for the reviewers: muster's
`architect`, `code-review` and `ui-reviewer` each differ from jig's by 200–255 lines of muster's
own rules, and a sync that overwrote them would destroy real work.

It does not hold for `@pm`. Every fact it uses comes from the plan, the session files and the retro
log, so it is workflow machinery, like a skill. It was byte-identical in three of four projects
when measured.

As `context` it drifted without anything noticing. DEC-J010 took rates out of `/retro` while `@pm`
went on telling itself to track hours per point, until the operator asked why the skill and the
agent disagreed. As `logic`, `drift.mjs` reports a stale copy the next time any session opens.

See also DEC-J010, whose closing note about `pm.md` being `context` this replaces.
