---
session: 6
slug: 36-one-piece-lives-in-jig
branch: task/36-one-piece-lives-in-jig
started: 2026-09-19T01:20:19Z
ended:
points:
pr_numbers: [39, 40, 41, 42, 44, 45]
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

## Task 4: A sync is a six-step checklist, done when the target is green

**Completed:**

- **A numbered checklist in `.claude/CLAUDE-context.md`** after the sync paragraph. It makes the copy step three of six; step four is "run every gate the target runs," the step skipped in both of this session's syncs; step five sorts red into target-content versus template-defect, by whether the checker's complaint is right.
- **Context file, not a skill**, at the operator's call: a skill is one more thing to keep in sync.
- **`@code-review` found the checklist repeating its own lesson.** The worklist omitted drift's `NOT RUN` section, which exists because `check-denied` shipped to muster and sat unwired for three days — so a sync copying a new gate and never wiring it would have passed all six steps green. Fixed, plus four more: the "nothing differs" proof was weaker than it read, step five's sort, and two `git fetch` cleanups.

**Code review:** 5 findings and 1 escalation, all addressed. `/security-review` not run — this file is jig's own context, not a shipped template or a blast-radius trigger.

**PR:** [PR #42](https://github.com/mobiustripper42/jig/pull/42)
**Points:** 2
**Branch:** task/sync-is-a-checklist
**Opened at:** 2026-09-19T03:40:00Z

## Task 5: Poker one task per turn, not the whole phase as a table

**Completed:**

- **`docs/VELOCITY_AND_POKER_GUIDE.md` "How to poker" Setup** rewritten to one task per turn: Claude states one task with its reason and stops, the user answers a number or "fine", the plan updates once after the phase is scored. A "Why one at a time" line carries the operator's reason. Observed in centerline Phase 0-4 poker.
- **`@code-review` caught the example contradicting the new Setup** — Claude opened with no reason while the user's "It's not just UI" answered a UI claim never made. Added the reason to Claude's opening line, which fixed both. Also trimmed an over-written why line and a batch straggler in "When to re-estimate".

**Code review:** 3 findings, all addressed. `/security-review` not run — a `logic` doc about estimation, no blast radius past the dev environment.

**PR:** [PR #44](https://github.com/mobiustripper42/jig/pull/44)
**Points:** 1
**Branch:** task/poker-one-task-per-turn
**Opened at:** 2026-09-20T14:30:00Z

## Task 6: doc-check.json is presence, with a scaffold

**Completed:**

- **`.claude/doc-check.json` reclassed `context` → `presence`** in `.claude/file-classes.yaml`. `check-docs.mjs` throws without it, so a gate's required file can't be class-hidden from drift. Found from a centerline session.
- **`scaffold/claude/doc-check.json`** added as the install-time starter; `check-docs.mjs`'s throw now names it.
- **Corrected a false comment** claiming the file is "byte-identical across projects" — its contents are project-specific.
- **Two drift tests:** an absent one is MISSING (watched red under `context`), a present-but-different one is not drift.

**Code review:** 0 findings. The reviewer reverted the class and reran the suite to confirm the test is non-vacuous, and ran `check:docs` against jig's tree to confirm the scaffold's roster claim resolves. `/security-review` not run — dev tooling and a config scaffold.

**PR:** [PR #45](https://github.com/mobiustripper42/jig/pull/45)
**Points:** 3
**Branch:** task/doc-check-is-presence-with-a-scaffold
**Opened at:** 2026-09-20T15:10:00Z

**Waiting on this merge:** the centerline sync. Two reports came from centerline — this one (report 1, a real jig bug, fixed here) and report 2 (its-dead cited keep-tape bare, already fixed in PR #41). Once #45 merges, centerline gets a sync bringing the #41 its-dead and this doc-check change, plus deletion of centerline's two jig-only keep-tape copies that drift flags NOT YOURS.

**Next task, from the review's escalation:** `drift.mjs` could refuse to print `nothing differs.` while `notRun` or `notYours` is nonzero, turning the checklist's step three from a remembered check into an enforced one. That is a change to drift's output contract with its own tests. This is the third mechanism gap this session surfaced and deferred, alongside the symlink check (Task 1) and the bare-jig-only-citation check (Task 3) — all three are jig turning a prose rule that was broken into a gate that can't be.

**Gap found, not filed:** a `logic`/`hybrid` file citing a `jig-only` path bare is checkable from the registry and nothing checks it. Same shape as the symlink check from Task 1. Both are `settings-policy`/`check-context` mechanisms a future task could add.

**Next Steps:**

**Context:**
