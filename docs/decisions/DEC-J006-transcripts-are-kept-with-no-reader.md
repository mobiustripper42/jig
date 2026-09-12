---
schema: 1
id: DEC-J006
title: "Transcripts are kept with no reader"
topic: "Session workflow & skills"
status: "active"
date: "2026-09-12"
ruling: "A SessionEnd hook copies the ending session's transcript to `~/.claude/tape/`, named from the session file. Nothing reads it — no skill, no agent, no drain. `settings-policy.mjs` reports it absent, since it is installed by hand per machine."
claims:
  - kind: "script"
    target: "scripts/keep-tape.mjs"
    note: "copies `transcript_path` from its own payload; never globs"
  - kind: "script"
    target: "scripts/settings-policy.mjs"
    note: "reports it absent; still reports the retired `tape-capture`"
  - kind: "file"
    target: ".claude/skills/its-dead/SKILL.md"
    note: "Step 4.8 declares the name; the hook does the copy"
  - kind: "file"
    target: ".claude/skills/its-alive/SKILL.md"
    note: "Step 4 reads `$CLAUDE_CODE_SESSION_ID`, not `result[0]` of a glob"
revisit_if: "The tape goes a year unopened, or grows past what the disk should hold for something nothing reads."
---

## DEC-J006: Transcripts are kept with no reader

Claude Code deletes transcripts on a rolling window, and the loss is silent — you find out by
going to look.

Seeds retired this for a reason that still holds: `tape-capture` filled a queue for
`read-the-tape` (~$2 a session) and `@workout`, and when those were binned the hook kept filling a
queue nothing drained — uninstalling a repo does not uninstall its hooks. So the reader stays
retired and the copy does not, which is why `settings-policy` reports the old hook as dead and the
new one as required.

The hook copies the path in its own payload and never searches. A version that took the newest
`.jsonl` would break the moment two lanes ran at once.

Naming is split because neither half knows both things. `/its-dead` knows the stem and the uuid but
runs *before* the end, so a copy there loses every turn after it; the hook fires at the right
moment and does not know the stem.
