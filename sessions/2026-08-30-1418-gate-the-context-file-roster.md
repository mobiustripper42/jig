---
session: 2
slug: gate-the-context-file-roster
branch: task/gate-the-context-file-roster
started: 2026-08-30T14:18:36Z
ended:
points:
pr_numbers: [18]
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

**Next Steps:**

**Context:**
