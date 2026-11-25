---
session: 12
slug: drop-installs-trigger
branch: task/drop-installs-trigger
started: 2026-11-24T19:43:54Z
ended:
points:
pr_numbers: [142, 143, 144]
status: open
transcript: /home/eric/.claude/projects/-home-eric-jig/aa823fcc-9b0d-52be-a818-975758c4d468.jsonl
---

# Session 12 — drop-installs-trigger

<!-- Task blocks appended by /kill-this, one per task. -->

## Task 1: Drop jig's installs blast-radius trigger

**Completed:**
- `.claude/CLAUDE-context.md`: deleted the "Anything a project installs" row from Blast-Radius Triggers. "The permission policy" and "Anything that writes" stay.
- Gate scripts (`scripts/check-*.mjs`, `scripts/gen-*.mjs`, `scripts/lib/records.mjs`) and the decision schema lose the `/security-review` pass with it.
- The edit was made and verified before this session file was opened; `/its-alive` ran between the edit and the commit.

**Code review:** @code-review 3 findings: the commit message omits the gate scripts and overstates "no findings" (both corrected in the PR body, the pushed commit not rewritten); `kill-this/SKILL.md:119` wording, pre-existing, left. It caught that PR #40's security finding ran on the deleted row, which the Lead had told the operator was untraced. /security-review not run (no trigger).
**PR:** [PR #142](https://github.com/mobiustripper42/jig/pull/142)
**Points:** 0 (unpointed)
**Branch:** task/drop-installs-trigger
**Opened at:** 2026-11-24T19:45:22Z
**Sample:** none — no changed test or function in a JS/TS file

## Task 2: Retro drops the full UI review

**Completed:**
- `.claude/skills/retro/SKILL.md`: Step 1.5 and the UI review line deleted.
- `kill-this/SKILL.md`, `CLAUDE.md`, `docs/AGENTS.md`, `ui-reviewer.md`, `scaffold/claude/ui-context.md`, `scaffold/docs/PROJECT_PLAN.md`: no longer say `/retro` runs the review. The starter's Strings file slot is gone.
- DEC-J035, superseding DEC-J027. The operator and an earlier session had discussed this; no written record was found, so it was settled again on 2026-11-25.

**Code review:** @code-review 2 findings: `scaffold/docs/PROJECT_PLAN.md:37` still named `/retro` (fixed in `fb79c31`, not reviewed again); dead Strings file line in existing copies (in the PR body). /security-review not run (no trigger).
**PR:** [PR #143](https://github.com/mobiustripper42/jig/pull/143)
**Points:** 0 (unpointed)
**Branch:** task/retro-drops-ui-review
**Opened at:** 2026-11-25T15:13:32Z
**Sample:** none — no changed test or function in a JS/TS file

## Task 3: Retro checks the context files against the code in the background

**Completed:**
- `.claude/skills/retro/SKILL.md`: Step 0.5 starts one background agent on the trunk; Step 10 files its report as one issue for the next phase.
- `docs/AGENTS.md` row; DEC-J036.
- Issue 103 rewritten as the shell trim, its figures corrected to each repo's `origin/main`. Issues 102 and 131 closed.
- The agent's instructions have not been run against a project.

**Code review:** @code-review 9 findings. Fixed in `786dc59`, not reviewed again: late report, wrong-branch start, failure undefined, absent trigger table, Haul's figures. Left, with reasons in the PR: duplicate issue on a re-run, agent can edit, `CLAUDE.md` and CHEATSHEET rows, `points:1`. /security-review not run (no trigger).
**PR:** [PR #144](https://github.com/mobiustripper42/jig/pull/144)
**Points:** 2
**Branch:** task/retro-context-review
**Opened at:** 2026-11-25T16:05:55Z
**Sample:** none — no changed test or function in a JS/TS file

**Next Steps:**

**Context:**
