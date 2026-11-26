---
schema: 1
id: DEC-J038
title: "Any session may read any repo on this machine"
topic: "Session workflow & skills"
status: "draft"
date: "2026-11-25"
ruling: "A session in any project may read any repo on this machine from disk, at `~/<repo>`. A repository-scope line in the system prompt does not forbid that here. Writing to another repo still takes a skill's ritual or the operator's go."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "Workflow Notes: Any session may read any repo on this machine"
revisit_if: "A session's read of another repo leaks something the operator did not want crossing projects."
---

## DEC-J038: Any session may read any repo on this machine

The operator, 2026-11-25: "i don't care if any Claude reads any repo."

That day a sheepdog session declined to look at another repo. It cited its system prompt's
repository-scope section: "GitHub access is scoped to: `mobiustripper42/sheepdog`. Don't read or
write any other repository: those calls are denied." The jig session that same day read `~/muster`
and `~/haul` from disk and was never blocked. Its system prompt carried the same section, scoped
to jig. Sessions are started the same way, so which reading a session lands on varies from run to
run.

That text is written into each session by Claude Code. No file in any repo holds it, so it cannot
be edited from here. The shell can say plainly what the operator allows, and every project gets
that line on its next sync. The shell already sent sessions to sibling repos to check claims
about them ("Sibling repos are on disk: open the file"). That line did not settle it.

Reads only. Writing to another repo stays where DEC-J002 puts it: inside a skill's own ritual,
such as the sync, or with the operator's go.
