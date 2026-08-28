---
schema: 1
id: DEC-J002
title: "A skill invocation approves the pushes inside its own ritual"
topic: "Session workflow & skills"
status: "active"
date: "2026-08-27"
ruling: "Invoking a skill approves the environment-changing commands that skill exists to run. Anything outside a skill's own ritual still needs approval."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "the amended `Environment-changing commands` bullet"
  - kind: "file"
    target: ".claude/skills/its-alive/"
    note: "Step 0.6 sub-case (b) pushes two branches"
revisit_if: "A skill grows a push that is not obviously part of the ritual its name describes, or a session pushes something unwanted and cites skill cover."
---

## DEC-J002: A skill invocation approves the pushes inside its own ritual

Two shell rules contradicted each other and the unconditional one won. `## Workflow Notes`
said pushes get printed for the user to run; `/its-alive` Step 0.6 says bootstrap a missing
`sessions` branch, which pushes two. On jig's first `/its-alive`, a session asked permission
to run the ritual it had just been asked to run.

The live alternative — every push approved individually, whoever asked — is real: a push is
remote, and an exemption keyed on "a ritual wanted it" invites abuse. It loses on what a skill
is. `/kill-this` is not a suggestion to commit, push and open a pull request; it is the name
for doing those three things. Withhold the push and the skill cannot finish, while the shell
already forbids the same end state by hand — so the task cannot ship at all.

Muster reached this first but wrote it in a project file, scoped to `/kill-this` alone. jig
hit the same wall from `/its-alive` a day later. The contradiction lives in a file every
project installs, so the fix belongs there.

It does not license pushing a branch the skill did not create. The test is whether a user
reading the skill's description would expect it. Nothing enforces this.
