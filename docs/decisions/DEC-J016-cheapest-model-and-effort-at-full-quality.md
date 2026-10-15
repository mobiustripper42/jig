---
schema: 1
id: DEC-J016
title: "Cheapest model and effort that does the job at full quality"
topic: "Model selection"
status: "active"
date: "2026-10-15"
ruling: "Quality first, then the cheapest model and effort that keeps it. Sessions run opus at medium. Agents fix model and effort in frontmatter: @architect and @test-writer opus, the rest sonnet, all high. Aliases, never versions."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "Model Selection states the rule and the six agents"
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "model opus, effort high"
  - kind: "file"
    target: ".claude/agents/implementer.md"
    note: "model sonnet, effort high"
supersedes:
  - DEC-J009
revisit_if: "An alias moves to a model that does its job worse, or receipts show an agent's rounds piling up on one kind of task."
---

## DEC-J016: Cheapest model and effort that does the job at full quality

DEC-J009's rulings stand; its reason did not. It said the plan includes Sonnet and Opus, so effort
rather than model choice is what spends the allowance. Nothing supported that, and it is wrong: the
plan meters usage per five-hour window and per week, and each step up in model, and in effort,
draws it down faster. So both are chosen, not defaulted upward.

Agents get a fixed model and effort, not one chosen per task from its points. Nothing shows that
points predict where effort helps, and a variable setting would confound the comparison
`/build-task`'s receipts exist to make. `@test-writer` is opus because its tests define correct
and `@implementer` cannot change them; `@implementer` is sonnet because the tests fence it. Two
failed implementer rounds stop the run, and a rerun at higher effort is then a choice made on a
real failure.

See also DEC-J015.
