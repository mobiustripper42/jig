---
schema: 1
id: DEC-J030
title: "/build-task writes the walked spec into the issue"
topic: "Session workflow & skills"
status: "draft"
date: "2026-11-08"
ruling: "The spec is walked with the operator in the conversation, and /build-task's Step 0 writes it into the issue; running the skill approves the walk. A run with no walk uses the issue as it stands."
claims:
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 0, the Spec gate"
  - kind: "file"
    target: ".claude/skills/build-task/task-spec.md"
    note: "Header: who writes the issue body"
revisit_if: "An agent builds from an issue body that differs from what the operator walked, or the operator asks to read the issue before the run starts."
---

## DEC-J030: /build-task writes the walked spec into the issue

Step 0 aborted when the spec had been walked but not written into the issue, and that was the
normal state on reaching it: in 4 Haul runs out of 4 the Lead wrote it in by hand (jig issue 113,
second item). The operator asks for the write each time, and sometimes forgets to.

So the write moves into the skill. Running `/build-task` now approves the walk rather than a body
the operator could read first; the issue link is printed as Step 0 writes it. The issue's original
request is kept as a comment, out of the body the agents read. Invoking the skill approves the
write (DEC-J002).

See also DEC-J025, which sets the route. Draft until the first run under it (DEC-J020).
