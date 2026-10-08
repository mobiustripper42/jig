---
schema: 1
id: DEC-J013
title: "The path gates take a gitignored citation on trust, and say so"
topic: "Template storage & distribution"
status: "active"
date: "2026-10-08"
ruling: "A cited path missing on disk resolves when a tracked `.gitignore` ignores it. Each gate names those paths on its ✓ line, because nothing verified them."
claims:
  - kind: "script"
    target: "scripts/check-context.mjs"
    note: "`resolves()`, which `check-docs` shares"
revisit_if: "A stale citation of an ignored path misleads a session, or the trust list on a ✓ line grows past what anyone reads."
---

## DEC-J013: The path gates take a gitignored citation on trust, and say so

soundings' first `sync.mjs --pr` went red on one line: its context file citing `gateway/.venv`, a
virtualenv present in every checkout anyone works in and in no fresh worktree. centerline cites
`public/maplibre/` the same way. The citations were right and the gates called them dead, so
every sync of either repo would hand off a red that is nobody's to fix.

The alternatives were worse. Linking each ignored thing into the worktree is a per-repo list that
someone has to remember. Rewording the docs to stop citing them throws away a pointer that is true.

The cost is real: an ignored path cannot be verified, so a stale one gets through. If soundings
moved its venv, `.venv/` would still match the old citation. That is why the ✓ line lists every
path taken on trust instead of passing them silently.

Only a tracked `.gitignore` counts, so a fresh worktree and a working checkout agree unless the
file has an uncommitted edit. A machine's global excludes file, an untracked `.gitignore` and
`.git/info/exclude` are refused. The last
is shared by every worktree of a clone, so a line an operator added locally would otherwise pass
a dead citation inside the sync's own worktree.

See also DEC-J012.
