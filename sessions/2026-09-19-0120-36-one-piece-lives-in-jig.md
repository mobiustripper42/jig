---
session: 6
slug: 36-one-piece-lives-in-jig
branch: task/36-one-piece-lives-in-jig
started: 2026-09-19T01:20:19Z
ended:
points:
pr_numbers: [39, 40, 41]
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

## Task 2: Write down that templates cross by a jig session's hand

**Completed:**

- **The rule, in `.claude/CLAUDE-context.md` under What We're Building.** Jig holds scaffolds and templates; drift in a project reports and does nothing; when the operator asks, a session in jig does the copy in either direction, commits on a branch in the target repo, opens the pull request there. No sync script. Jig → project is a copy of reviewed bytes; a harvest is new code and goes through `/kill-this` here.
- **A Median gaps row** for the short form, with the precondition: target tree clean and on `main` or a branch the operator names.
- **Three lines corrected** that said or implied nobody copies — `CLAUDE.md:83` (now imperative for a project session), `its-alive` Step 7.5 (now says whose job the copy is and why), and the `file-classes.yaml` header.
- Context file rather than a decision record, at the operator's call: this is how jig works, not a choice, and a record is found by searching while the context file is always loaded.

**Code review:** 4 findings from `@code-review` and 1 from `/security-review`, all addressed. The security one mattered: "copy, not new code" was written for one direction and applied to both, which would have told a jig session a harvest needs no review. `/security-review` ran because `CLAUDE.md` and `.claude/skills/**` are blast-radius triggers.

**PR:** [PR #40](https://github.com/mobiustripper42/jig/pull/40)
**Points:** 2
**Branch:** task/templates-cross-by-a-jig-session
**Opened at:** 2026-09-19T02:35:00Z

## Task 3: its-dead cited a jig-only script bare

**Completed:**

- **Three citations in `.claude/skills/its-dead/SKILL.md`** changed from `scripts/keep-tape.mjs` to `<jig>/scripts/keep-tape.mjs`, plus ten words at first use saying what `<jig>` is. The script is `jig-only`; the skill ships everywhere; `check-context.mjs:84` resolves any cited path without a `<`. Muster's context check went red the moment it received the skill.
- **Found by the muster session**, not by jig, because jig has the file and its own gate cannot see the defect. The convention `<jig>/` already existed in `its-alive`.
- **Also this task, outside jig:** synced muster. Cut `task/sync-jig-templates-2026-09-19` from `origin/main` in `../muster` (its `main` is held by the `muster-s91` worktree), copied five drift files, deleted its style copy, opened [muster PR #1038](https://github.com/mobiustripper42/muster/pull/1038). Left it red on `check:dictionary` — fifteen findings in muster's own context file, which the operator chose to have a muster session fix. That session did, and found this bug.

**Code review:** clean, one cleanup taken. The reviewer confirmed by execution that `isClaim` skips the new form, and that these were the only three bare citations of a jig-only path in any shipped file. `/security-review` ran for `.claude/skills/**` and confirmed the executable block is byte-identical to `main`.

**PR:** [PR #41](https://github.com/mobiustripper42/jig/pull/41)
**Points:** 2
**Branch:** task/its-dead-cites-jig-only-script
**Opened at:** 2026-09-19T03:05:00Z

**Gap found, not filed:** a `logic`/`hybrid` file citing a `jig-only` path bare is checkable from the registry and nothing checks it. Same shape as the symlink check from Task 1. Both are `settings-policy`/`check-context` mechanisms a future task could add.

**Next Steps:**

**Context:**
