---
session: 12
slug: drop-installs-trigger
branch: task/drop-installs-trigger
started: 2026-11-24T19:43:54Z
ended:
points:
pr_numbers: [142, 143, 144, 145, 146]
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

## Task 4: Trim the shell

**Completed:**
- `CLAUDE.md`: 4,757 words to 3,723, section by section with the operator's approval (issue 103).
- `docs/AGENTS.md § Output styles` takes the machine setup; `promote-production/SKILL.md` takes the adoption warning; `scaffold/docs/decisions-baseline.txt` comment reworded.
- `docs/decisions/_preamble.md`: the stale Amendment paragraph replaced (DEC-J020), approved separately.
- Not done: the "not listed" gate message in `check-decisions.mjs:493` does not name the baseline generator.

**Code review:** @code-review 13 findings, no hard rule lost. Fixed in `06b85ce`, not reviewed again: "written whole" clause, when to archive, adoption pointer, one-liner clause, the preamble's new-id line, DEC-J004 and DEC-J016 claims. Left, with reasons in the PR: the Key Docs advice, repetition in AGENTS.md, the gate message. /security-review not run (no trigger).
**PR:** [PR #145](https://github.com/mobiustripper42/jig/pull/145)
**Points:** 3
**Branch:** task/103-trim-shell
**Opened at:** 2026-11-25T17:24:37Z
**Sample:** none — no changed test or function in a JS/TS file

## Task 5: Allow sed -n; sed -i stays denied

**Completed:**
- `.claude/settings.json`: `Bash(sed -n *)` removed from the denies; `Bash(sed -i *)` stays.
- `CLAUDE.md`: reading with the Read tool is a preference (DEC-J037).
- Owed by hand, after merge: `node scripts/settings-policy.mjs --write /home/eric/.claude/settings.json` on each machine.

**Code review:** @code-review 5 findings: record's sourcing and the per-machine note fixed (not reviewed again); four "never a `sed`/`grep` one-liner" lines in skills and two dated accounts left. /security-review 0 at its bar; note that `sed -n -i` is not matched by the `sed -i` deny. @ui-reviewer not run (no ui-context.md).
**PR:** [PR #146](https://github.com/mobiustripper42/jig/pull/146)
**Points:** 2
**Branch:** task/allow-sed-n
**Opened at:** 2026-11-25T17:45:17Z
**Sample:** none — no changed test or function in a JS/TS file

**Next Steps:**

_Saved 2026-11-25T17:51:56Z by /save-this._

**Next task:** Not named — the operator: "nothing is next, just waiting for the haul browser runs"

**Open pull requests:** none — every pull request in `pr_numbers` is merged.

**Standing rules:**
- A /build-task spec that balloons can be cut back to a normal-loop task: "we always have the 'just build it' option" (operator, 2026-10-18, after issue 91's readback grew it to 18 criteria).
- Syncs go through `npm run sync -- ../<project> --pr`, never by hand in the project's checkout (`.claude/CLAUDE-context.md`, median-gap row). This session synced centerline PR 175 by hand, which was a miss.
- Before starting a project session after a sync: merge the sync pull request, check out `main`, pull, then launch Claude. Permissions are read at launch (operator, 2026-10-19).
- While a project prototypes a change to jig's workflow files, make no jig changes to those files until it's harvested (operator, 2026-10-30: "or try not to"). Prototypes are built in the project, then harvested into jig.
- No guards for problems that have not happened: "if this becomes a problem we'll fix it, but it's not happened yet" (operator, 2026-11-11, on the final-"yes" guard and `--no-track`).
- No uncommitted files kept around; nothing in the workflow keeps a file uncommitted on purpose (operator, 2026-11-11, dropping Haul's Step 0 rule).
- Specs are written on Fable while the subscription allows, otherwise on Opus. Opus is the `/build-task` Lead. The operator switches models by hand, out of habit, with no reminder and no decision record (operator, 2026-11-14: "too fluid" for a DEC).
- Harvests are done ad hoc and sometimes need a little adjustment; no harvest skill (operator, 2026-11-20).

**Parking lot:** nothing.

**Carry-over:**
- Haul browser run trial: three screen tasks, instruction pasted into the Haul session on 2026-11-24, no workflow file changed. At the third task's hand-back it lists three `Browser run:` lines with each task's cost; no defect found only there means drop it.
- Muster, Haul and centerline have not been synced since PRs 142 to 146. Until they are, their `/retro` still runs the UI review and has no context review.
- When the length analysis is re-run: Muster keeps its ~300 guideline and ~800 review flag on purpose, as a kind of control. The 8 dormant repos keep the 200 rule until each is rebooted (operator, 2026-11-23).

**Context:**
