---
schema: 1
id: DEC-J018
title: "Skills carry no `tools:` key"
topic: "Session workflow & skills"
status: "active"
date: "2026-10-18"
ruling: "No skill's frontmatter carries `tools:`. It is an agent key that a skill ignores. `check:docs` fails on one."
claims:
  - kind: "file"
    target: "scripts/check-docs.mjs"
    note: "checkSkillKeys"
revisit_if: "Claude Code starts reading `tools:` in a skill's frontmatter."
---

## DEC-J018: Skills carry no `tools:` key

All nine jig skills carried a `tools:` line. An agent reads that key to restrict its tools; a
skill does not read it at all, which session 9 confirmed while building `/build-task`. So each
line looked like a restriction and restricted nothing.

Renaming it to `allowed-tools:`, the key a skill does read, would have made it worse: that key
pre-approves the tools it lists, so the rename would have handed every skill unprompted Bash
against the permission policy. The line was deleted instead, and the gate stops it being copied
back in from an older skill.
