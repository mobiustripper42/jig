---
schema: 1
id: DEC-J026
title: "One shared home for anything a spec describes twice"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-02"
ruling: "A style, markup, rule or value the spec describes in more than one place is built once: Interfaces names its one home, and readback flags any such thing left without one."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/task-spec.md"
    note: "Interfaces comment"
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "reuse check, second kind of finding"
revisit_if: "@code-review keeps finding the same look or rule written twice inside one task."
---

## DEC-J026: One shared home for anything a spec describes twice

DEC-J023's reuse check finds code that already exists. It cannot find a copy that does not exist
yet. In Haul's task 0.9 the spec described one page-and-card layout for two sign-in screens and
named a shared class for the card but not the page, so `@implementer` wrote the page's styles
into each screen, every test passed, and `@code-review` caught it after.

So the template asks the Lead to name one home for anything described twice, and readback flags
what was missed. Choosing between two descriptions that differ changes behaviour and goes to the
operator. Haul prototyped it (its pull request 35) and ran it from task 0.11. See also DEC-J023.
