---
session: 6
slug: 36-one-piece-lives-in-jig
branch: task/36-one-piece-lives-in-jig
started: 2026-09-19T01:20:19Z
ended:
points:
pr_numbers: [39]
status: open
transcript: /home/eric/.claude/projects/-home-eric-jig/770810a2-c217-5022-b202-8c185f8cc5b8.jsonl
---

# Session 6 — 36-one-piece-lives-in-jig

<!-- Task blocks appended by /kill-this, one per task. -->

## Task 1: The output style lives in jig and is read through the machine

**Completed:**

- **`.claude/output-styles/one-piece.md` is muster's v6**, byte-identical, and stays in jig as the versioned copy. `~/.claude/output-styles/one-piece.md` is a symlink to it, created this session.
- **`.claude/file-classes.yaml`** reclasses the path `logic` → `jig-only`, so drift reports a project copy as `NOT YOURS` and the fix is deletion. The header now says `jig-only` covers two shapes.
- **`scripts/drift.test.mjs`** pins the new behaviour, watched red first.
- **`CLAUDE.md` and `docs/AGENTS.md`** name the setting and the file as two separate things, both on the machine, with the precedence order for each and the one-line bootstrap for a fresh machine.
- **`DEC-J007`** records it, with an `unverifiable` claim for the symlink.
- **Proved the mechanism before building on it.** A print-mode session in tinkle, which has no repo copy, loaded v6 from the machine directory. Then a print-mode session in soundings, which holds a stale v2, loaded v2 — so a repo copy beats the machine one, observed rather than inferred.
- Removed centerline's copy from its uncommitted install. Removed the `deferred` label from issue #36; this PR closes it.

**Code review:** 5 findings, all addressed. The one that matters: `docs/AGENTS.md` said "iterated in muster through six versions," a number I made from the frontmatter's `v6`. Muster's log shows four commits, v3 to v6 by its own numbering. Also: the symlink was stated as fact while nothing creates or checks it, now documented as a hand step with the bootstrap command and an `unverifiable` claim; a stale test comment; and the `jig-only` header. `/security-review` ran for `CLAUDE.md` and found nothing, noting that the symlink widens blast radius since a `git pull` in jig now changes every session's system prompt at next launch.

**PR:** [PR #39](https://github.com/mobiustripper42/jig/pull/39)
**Points:** 3
**Branch:** task/36-one-piece-lives-in-jig
**Opened at:** 2026-09-19T01:48:00Z

**Next Steps:**

**Context:**
