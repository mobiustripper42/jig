---
session: 2
slug: gate-the-context-file-roster
branch: task/gate-the-context-file-roster
started: 2026-08-30T14:18:36Z
ended:
points:
pr_numbers: [18, 19, 20]
status: open
transcript: /home/eric/.claude/projects/-home-eric-jig/907444e1-3e5d-5014-89a2-b6693eebb5ae.jsonl
---

# Session 2 — gate-the-context-file-roster

<!-- Task blocks appended by /kill-this, one per task. -->

## Task 1: Report a jig-only file a project holds a copy of

**Completed:**
- `scripts/drift.mjs` — a second "present in the project, absent from the templates" check. The existing loop asks *the project has it, jig does not*; this asks the reverse. Walks jig's templates rather than the project, because `scripts/**` and `docs/**` are `jig-only` catch-alls and classifying project paths directly reports every script and doc a project wrote for itself. A `scaffolded` Set, derived through `toProject`, excludes the four paths where a scaffold installs over jig's own unrelated `jig-only` file
- `.claude/file-classes.yaml` — `docs/DECISIONS.md`, `docs/decisions-baseline.txt`, `docs/dictionary.yml`, `docs/DICTIONARY.md` moved `jig-only` → `context`. Read off disk: muster and soundings hold all four, so the old class asserted something false of every project that has run `gen:decisions` or registered a term
- `scripts/drift.test.mjs` — 6 cases, 21/21 in the file, 215/215 in `verify`
- **Issue #14 proposed replacing the three-directory loop.** It cannot be replaced: neither question subsumes the other, and doing so would drop the project-authored-skill case. Disclosed in the PR

**Step 4 the long way:** two of six cases went red immediately; the other four are guards that cannot fail before the feature exists. So the naive implementation shipped first and both false-positive classes were watched failing — the scaffold shadow and the four misclassified docs — before the fix took them green.

**Code review:** 3 findings, all addressed. An inert `scaffold/templates/` key in the `scaffolded` Set (kept and explained — filtering it would name the mapped prefixes in a second place, the exact drift the derivation avoids); a test passing for a narrower reason than its siblings, now saying so; and a registry comment asserting what two sibling repos hold without naming what was read. The third is the class `CLAUDE.md` warns bites hardest outside the checkout — it had been verified, but the comment did not say so.

**PR:** [PR #18](https://github.com/mobiustripper42/jig/pull/18)
**Points:** 3
**Branch:** task/drift-project-side-jig-only
**Opened at:** 2026-08-30T16:31:00Z

## Task 2: Require supersession to be a pair, not a one-sided claim

**Completed:**
- `scripts/check-decisions.mjs` — `supersessionProblems(rewritten, seenIds)` extracted and exported, plus two rules: a `superseded` record must name its `superseded_by` (`withdrawn` exempt — retired with nothing replacing it), and both halves of a pair must agree in both directions. Reported once, on the file that has to be edited
- `scripts/check-decisions.test.mjs` — 14 cases, 91/91 in the file, 229/229 in `verify`
- **Issue rule 3 was already built** and goes further than asked: `superseded_by` resolution already required the target to be `active`. **Rule 4 (byte ceiling on retired records) deliberately not built** — DEC-J005 retired amendments, so a superseded record cannot grow after retirement; the ceiling would only punish records long *before* someone honestly retired them
- **Frozen/legacy exempt structurally, not by list** — they never enter `rewritten`, so no rule here can demand an edit to a file the build forbids editing. That is the trap issue #16 is about, which is why this landed first

**Step 4, two stages:** the first red was `supersessionProblems is not a function`, which proves only that a symbol is missing. Extracted the pre-existing rules verbatim in their own commit, re-ran, and 6 of 10 failed on their own merits. Two spec'd expectations were wrong and were corrected *before* implementing — a three-way disagreement honestly produces two messages, and a self-pointer was emitting three.

**Code review:** 4 findings. Three were real and all the same class — one defect printing twice, in the gate whose stated goal is not to do that. A record claimed but never flipped printed `superseded_by undefined` *after* rule 1 had already named it, on the likeliest input there is; the self-pointer guard covered only the outgoing direction; a duplicated id in one `supersedes` list printed twice. All fixed with tests observed failing first. The reviewer also mutation-tested the self-pointer guard and found its source-side half inert — every case reaching it had no outgoing `supersedes` — now pinned by its own case. The fourth finding was the muster rollout, hoisted into the PR.

**Known downstream:** muster has exactly two superseded records, DEC-107 and DEC-124, both `schema: 1` and neither frozen. Both go red on sync. No baseline, by design — two records with a compliant action each, not a corpus.

**PR:** [PR #19](https://github.com/mobiustripper42/jig/pull/19)
**Points:** 3
**Branch:** task/supersession-must-be-a-pair
**Opened at:** 2026-08-31T11:50:00Z

## Task 3: Give a runbook somewhere to be declared, and report a gate nobody runs

**Completed:**
- `scripts/check-denied.mjs` — `runbooks` map in `.claude/doc-check.json` exempts a file whose commands are performed by a person. `runbookProblems()` fails an entry that does not exist, has a blank reason, is outside the gate's scope, or exempts nothing — so the list justifies itself on every run
- `scripts/drift.mjs` — reports a gate the project defines that `verify` never calls. In drift and not in a gate, because a check inside `verify` cannot detect that `verify` never runs it
- `.claude/CLAUDE-context.md` — one median-gap row: a sibling repo's state is `origin/main`, not its working tree
- 13 new cases, 242/242 in `verify`

**How this came up:** an unrelated muster session reported `check:denied` red on main. It turned out the gate shipped with jig v6 and muster never wired it into `verify` — installed, correct, documented, switched off for three days while drift reported the file byte-identical. It was. The bytes were never the question.

**Scope discipline, badly:** I escalated a one-line `package.json` omission into an architecture three separate times — a marker syntax, "a project's verify chain is invisible to every check jig has" (false; `check-docs.mjs:373` reads it), and "jig cannot run its gates against a sibling". Each was wrong about the size. The user cut it back to what the evidence supported and that is what got built: ~15 lines in each of two scripts. **Note for next time: the first framing that arrives after a surprising report is the one to distrust.**

**Code review:** 5 findings. Two real, both fixed. The exemption list had the exact hole it was built to close — an entry naming a file outside `scope()` exempted nothing and validated forever. And a test of mine could not fail: it asserted against an em dash the output never prints, confirmed by the reviewer mutating the code and watching it stay green. Three comment-level notes addressed.

**Also found, not fixed:** the Blast-Radius Triggers table's first row is titled "Anything a project installs" and lists three globs, but `check-*.mjs` is `logic` and installs everywhere. The table is narrower than its own title. Worth its own issue.

**Correction shipped:** PR #19's body claimed muster's DEC-107 and DEC-124 would go red on sync. Both are `withdrawn` on muster's `origin/main` and always were during this session — I read a 26-behind task branch. Correcting comment posted on that PR; the median-gap row above is the mechanism half.

**PR:** [PR #20](https://github.com/mobiustripper42/jig/pull/20)
**Points:** 5
**Branch:** task/runbook-exemption-and-unwired-gates
**Opened at:** 2026-09-01T14:05:00Z

**Next Steps:**

**Context:**
