---
schema: 1
id: DEC-J009
title: "Model and effort settings for sessions and agents"
topic: "Model selection"
status: "active"
date: "2026-09-25"
ruling: "Sessions run opus; agents run sonnet, @architect opus. Aliases, never versions. Effort defaults to medium; agents pin high."
claims:
  - kind: "file"
    target: "CLAUDE.md"
    note: "Model Selection rewritten; the tier table and Fable are gone"
  - kind: "file"
    target: ".claude/settings.json"
    note: "effortLevel is medium"
  - kind: "file"
    target: ".claude/agents/code-review.md"
    note: "model sonnet, effort high, like pm and ui-reviewer"
  - kind: "file"
    target: ".claude/agents/architect.md"
    note: "model opus, effort high"
revisit_if: "An alias moves to a model that does its job worse, or the plan starts billing by model rather than effort."
---

## DEC-J009: Model and effort settings for sessions and agents

Replaces the guidance carried over from seeds, which named `claude-opus-5` and a Fable tier. The
model string went stale within two releases, and a stale default in a file loaded every session is
believed rather than checked. An alias follows releases on its own: per Claude Code's model docs,
`opus` is Opus 5.5 and `sonnet` is Sonnet 5 today.

Fable is not used. The old table priced models per million tokens, but the plan includes Sonnet
and Opus, so what spends the allowance is effort, not model choice.

`medium` is Claude Code's own default for Opus 5.5. An agent inherits the session's effort unless
it pins one, so each pins `high`: the reviewers earned their cost by re-running claims, which is
what effort buys.

Not managed: the machine's `model` key. mill-dev's `~/.claude/settings.json`, read 2026-09-25,
carried `claude-fable-5-1[1m]` unnoticed. With the key
unset, Claude Code's default applies, and that tracks too.
