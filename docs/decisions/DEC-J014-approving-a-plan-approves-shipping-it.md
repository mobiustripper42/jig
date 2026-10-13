---
schema: 1
id: DEC-J014
title: "Approving a task's plan approves shipping it"
topic: "Session workflow & skills"
status: "active"
date: "2026-10-13"
ruling: "When a task's proof passes, the session runs `/kill-this` itself and stops with the pull request. The plan's approval covers the ship; the pull request is where the work is looked at."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "Micro Workflow: ship it, then stop with the pull request"
  - kind: "file"
    target: ".claude/skills/kill-this/SKILL.md"
    note: "the opening line names both callers"
revisit_if: "A session ships a task the operator would have stopped before the push, or a pull request opens that the operator had to close unreviewed."
---

## DEC-J014: Approving a task's plan approves shipping it

The workflow stopped twice per task: once for the plan, once after the build for the operator to
type `/kill-this`. The second stop's only stated reason was "this is where the work gets looked
at", and the same file said that look is never a gate on the push. A pull request is a better
place to look — the diff, both reviews and the test plan in one page — and merging is the gate
that matters. The stop cost a turn per task and decided nothing.

The rule that made the operator invoke it guarded something else: a hand-typed push and
`gh pr create` skip `@code-review`. That ban stays word for word. Who invokes the skill was never
what protected the review; the skill was.

The cost: a task the operator would have redirected after seeing the build now reaches a pull
request first. That is a closed pull request, not a merged mistake. A build that hits a decision
the plan did not settle still stops before shipping.

This is the first step toward a Lead Dev session that works through a phase or an issue batch
without stopping per task.

See also DEC-J002.
