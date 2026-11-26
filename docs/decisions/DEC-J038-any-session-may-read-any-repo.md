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

The operator, 2026-11-25: "i don't care if any Claude reads any repo". That was said in the jig
session `aa823fcc-9b0d-52be-a818-975758c4d468` on mill-dev.

The operator pasted a sheepdog session's answer into that session. Sheepdog had declined to look
at another repo, quoting its system prompt: "Don't read or write any other repository: those
calls are denied." In that same transcript, jig read `~/muster` and `~/haul` from disk unblocked,
under the same section scoped to jig. Sessions start alike, so the reading varies by run.

Claude Code writes that text; no repo file holds it. Prose, not a settings rule: the scope line
looks like a model instruction, not a permission check. That is inferred, not tested. The old
shell line ("Sibling repos are on disk: open the file") did not settle it.

Reads go to `origin/main`, since a sibling's working tree is often a parked branch behind it.

Writing to another repo still needs the operator's go, or a ritual they started, such as
`scripts/sync.mjs --pr` (DEC-J012). See also DEC-J002.
