# Calibration case for jig issue 104: "11 / 4 / 7-of-7"

Recount done 2026-11-03, read-only.

## Origin

- jig `CLAUDE.md:175` (introduced by `0b5ced2`, 2026-08-27, "CLAUDE.md, cut in half"). Names neither the rule nor the deny.
- First written in jig `625399c` (2026-08-26 17:10, "Working notes for the seeds rebuild"), `docs/ANALYSIS.md:13-14`:
  - "The `sed -n` **permission deny** fired 7 times across 4 repos and was obeyed every time."
  - "The DEC-S036 **prose rule** ("no new decision amends an old one") was broken 11 times, 4 of them after it was written."
  - Header: "Evidence from one afternoon, 2026-08-25".
  - Repeated in `0b958cb` (2026-08-26 21:13): "mechanical deny obeyed 7/7, prose rule broken 11 times including 4 after it was written".
- The 7-of-7 traces to seeds `observations` branch, `observations/LEDGER.md:36` (row W4, update 2026-08-25, commit `70f3814` 2026-08-25 16:06): "Seven denials across four repos this batch (seeds ×4, soundings ×2, muster ×1), every one heeded on the next tool call with no re-shape". Note: the breakdown it gives is three repos, not four.
- The 11 / 4 traces to **nothing on disk**. It is not in LEDGER.md, any observation file, any seeds or jig session file, or `~/.claude/history.jsonl` (that file has only 2 prompts for 2026-08-25/26: `/usage` and `exit`).

## The rule and the deny

- **Prose rule:** seeds `dev/claude/CLAUDE.md:84` at `9984696` (PR #184 merge, 2026-08-16 20:39; authored `7a2472b` 2026-08-16 20:04):
  "**There is no new decision that amends an old one.** If it changes what an existing decision decided, it is that decision, later — not a new subject. ... Two decisions that merely relate carry a plain **see also**."
  It is also DEC-S036's 2026-08-16 amendment (`docs/decisions/DEC-S036-...md:33-62`).
  When each repo's loaded shell got it: seeds template 2026-08-16 20:04; muster `2822715e` 2026-08-17 00:13; soundings `8101207` 2026-08-19 12:30; seeds' own root shell `d5f2831` 2026-08-22 17:36 (the same commit that creates DEC-S049).
- **Deny:** `"Bash(sed -n *)"`, seeds `dev/claude/settings.json:76` at `c864ce7` (2026-08-17 12:21, "workout 2026-08-17: promote 11 patterns"); mirrored into seeds' own `.claude/` by `a376237` (2026-08-19).

## Transcripts: primary recount is impossible

- `~/.claude/projects/-home-eric-*/`: 13 dirs. Ones holding JSONL: centerline 33, haul 20, jig 12, muster 21, muster-lane-b 9, sheepdog 1. **seeds and soundings: 0.** Earliest timestamp in any of them: 2026-10-04T15:53Z.
- `~/.claude/tape/` (124 files): earliest 2026-08-30T14:18Z.
- `~/.claude/tape-queue/` does not exist. jig `0de60af` (2026-08-27) is titled "The tape is gone from this machine".
- The five source transcripts (session ids 9f5e4ddb, 5a35264a, 38d6b9c2, 85e2f5db, 2c08003d) appear nowhere on the filesystem (`find /`). One observation cites `/home/estoffer/...`, a different machine.
- So every count below comes from **secondary evidence**: the observation files written by `@tape-reader` (seeds `observations` branch) and git history of the decision records.

## Deny: 7 denials, de-duplicated across observation files

| # | repo | transcript (session id) | line | time (UTC) | command | next call | source |
|---|---|---|---|---|---|---|---|
| 1 | seeds | 9f5e4ddb | 915 (tape copy) / 1251 (live copy) | 2026-08-19T17:34 | `node .../drift.mjs ... \| sed -n '3,25p'` (a pipe, not the banned file-range shape) | `tail -25` per adopt-dec-s048 F4; "Read" per 22-seeds-main P13 (the two accounts disagree) | `2026-08-25-seeds-adopt-dec-s048.md:247-251`; `2026-08-22-seeds-main.md:286` |
| 2 | seeds | 9f5e4ddb | 1308 / 1838 | 2026-08-20T12:23 | `sed -n '155,175p' dev/claude/skills/its-alive/SKILL.md` | Read, offset/limit | `adopt-dec-s048.md:252-255`; `22-seeds-main.md:286-289` |
| 3 | seeds | 5a35264a | 273 | 2026-08-22T20:00:03 | `sed -n '120,124p' dev/claude/CLAUDE.md; ... sed -n '255,259p' ...` (one call, two seds) | **grep, and the verification was dropped** | `2026-08-25-seeds-main.md:227-238` |
| 4 | seeds | 5a35264a | 1034 | 2026-08-23T10:26:54 | `... sed -n '55,72p' dev/claude/scripts/drift.mjs` | **grep, and the verification was dropped** | same |
| 5 | soundings | 38d6b9c2 | turn 754 | ~2026-08-21/22 | `sed -n '1,40p'` | Read; model named the rule (turn 757) | `2026-08-25-soundings-promote-round-3.md:57`; `2026-08-21-soundings-main.md:89` (same transcript) |
| 6 | soundings | 85e2f5db | 692 | ~2026-08-24 | `sed -n '1,40p' firmware/src/core/packet.h` | Read, limit 40 (line 696) | `2026-08-24-soundings-sync-shell-and-its-alive.md:51` |
| 7 | muster | 2c08003d | 307 | 2026-08-22/23 (sessions 93–95) | `grep -n ... page.tsx \| sed -n '1,60p'` (a pipe) | same grep without the pipe (line 310), then Read (line 313) | `2026-08-25-muster-780-form-draft-six-more-surfaces.md:178-190` |

- 7 distinct denials, 5 transcripts, **3 repos** (seeds 4, soundings 2, muster 1). The "4 repos" in `ANALYSIS.md:13` is wrong; the ledger's own breakdown adds up to three.
- Re-shaped and retried: 0 of 7, so "obeyed 7 of 7" holds if obeyed means the model didn't route around it.
- Switched to the tool the rule points at (Read): 3 certain (#2, #5, #6), #7 eventually, #1 disputed. **#3 and #4 abandoned the check they were making** (LEDGER W9 calls this "a dropped goal").
- 2 of 7 (#1, #7) weren't the targeted shape: they were pipe truncations the glob catches by accident.
- Not counted, but relevant: `22-seeds-main.md:289-292` says "Three further `sed -n` uses succeeded in the `soundings` repo" in the same window. That repo's deny wasn't in force yet, so the deny was not fleet-wide in practice.
- These events span 2026-08-19 to 2026-08-24. They were tallied on the afternoon of 08-25; they did not happen then.

## Prose rule: every new decision file 2026-07-28 → 2026-08-26 that relates itself to an existing decision

The test: a new file declares an amend-class relation to an existing decision, either in frontmatter (`amends:` / `supersedes:`) or in a body line (`Refines` / `Extends` / `Revises DEC-x`). "See also" lines don't count; the rule allows them. Split-migration bulk commits are excluded (seeds `57a546f`, muster `f41a895a`, bushel `3885100`, soundings `e073a49`, chiplog `2d8d0cc`, sheepdog `652e8bc`). Dates are the creation commit on origin/main.

### Before the rule existed anywhere (before 2026-08-16 20:04)

| repo | file | created | relation |
|---|---|---|---|
| muster | DEC-144-completion-is-swept... | 2026-07-30 `2c65ac5b` | amends DEC-078 (corrects) |
| muster | DEC-148 | 2026-08-06 `e184999a` | amends DEC-091 (reverses) |
| muster | DEC-149 | 2026-08-06 `f036319e` | amends DEC-106 (retires) |
| muster | DEC-150 | 2026-08-07 `8f38687c` | amends DEC-030 (refines) |
| muster | DEC-151 | 2026-08-08 `cbcf2609` | amends DEC-107 (corrects), DEC-122 |
| muster | DEC-153 | 2026-08-10 `ba6600c2` | amends DEC-107 (revises) |
| muster | DEC-154 | 2026-08-14 `13f38295` | amends DEC-122 (reverses) |
| muster | DEC-155 | 2026-08-16 16:55 `156b0604` | amends DEC-107 (reverses) |
| seeds | DEC-S038 | 2026-08-04 `ed326d9` | amends S004, S010 |
| seeds | DEC-S039 | 2026-08-06 `1036414` | amends S018 |
| seeds | DEC-S040 | 2026-08-06 `481d4ab` | amends S038, S039 |
| seeds | DEC-S041 | 2026-08-06 `f82d2cc` | amends S039 |
| seeds | DEC-S042 | 2026-08-09 `79e54ac` | amends S019 |
| seeds | DEC-S043 | 2026-08-11 `b0d2526` | amends S023 |
| seeds | DEC-S044 | 2026-08-12 `eb9ee82` | amends S018, S023 |
| seeds | DEC-S045 | 2026-08-13 `7896a49` | amends S039, S023 |
| seeds | DEC-S046 | 2026-08-16 15:58 `ada460e` | amends S044 |
| soundings | DEC-008 | 2026-08-10 `18e433a` | amends DEC-005 (extends) |
| chiplog | DEC-011 | 2026-08-14 `c0d3345` | amends DEC-001 (reverses) |
| sheepdog | DEC-018 / 019 / 020 | 2026-08-04/05 | amends 004 / 005 / 019 |

That is 8 in muster, 9 in seeds and 5 in the small repos. Before the rule these weren't violations: the doctrine of the time told sessions to write them.

### After the rule was written

| repo | file | created | relation | rule in that repo's loaded shell yet? |
|---|---|---|---|---|
| muster | DEC-156 | 2026-08-16 22:53 `a564be29` | frontmatter `amends: DEC-133 revises` | **no**, muster got it 2026-08-17 00:13 |
| muster | DEC-158 | 2026-08-17 19:42 `09416744` | body: "**Relationship:** extends DEC-084" (it states itself to be "deliberately separate", and the same file says DEC-084 was amended in place) | yes, borderline |
| seeds | DEC-S049 | 2026-08-22 17:36 `d5f2831` | "Extends DEC-S019", "Refines DEC-S047" | same commit that brings the rule into seeds' own shell |
| seeds | DEC-S050 | 2026-08-22 22:06 `a505897` | "Refines DEC-S049", "Refines DEC-S032" | yes |
| seeds | DEC-S051 | 2026-08-23 06:43 `772a49c` | "Refines DEC-S023", "Refines DEC-S044", "Extends DEC-S040" | yes |

Compliant after the rule: muster DEC-157, 159 and 160 (see-also only); seeds DEC-S047 and S048 (see-also only); soundings DEC-009 to 012 (see-also, plus in-file amendments to DEC-010).

### Windows tried, and what each gives (total / after)

- seeds only, from S039: 8 before + 3 after = **11 / 3**
- seeds only, from S038: **12 / 3**
- muster only, from DEC-148: 7 + DEC-156 (+158) = **8–9 / 1–2**
- muster from DEC-148, plus seeds' post-rule files: 7 + {156, S049, S050, S051} = **11 / 4**. This is the only split that reproduces the claim, and it is an odd window: it leaves out seeds' 8 pre-rule files in the same dates.
- Post-rule only, timed against the template: {156, S049, S050, S051} = **4** (5 with 158)
- Post-rule only, where the rule was in the session's own loaded shell: {S050, S051} = **2**, or 3–4 with S049 and 158
- Counting relation edges rather than files, seeds post-rule: **7**

## Verdict

- **7 of 7:** reproduced at 7 denials with 0 re-shapes, from secondary sources. Corrections: the denials came from 3 repos, not 4; over 5 days, not one afternoon; 2 of the 7 weren't the targeted shape; and 2 complied with the deny while abandoning the task the Read was for.
- **11 / 4:** not reproducible. No working or source is recorded anywhere. A definition exists that yields 4 after the rule ({muster 156, seeds S049, S050, S051}), but 2 of those 4 predate the rule reaching that repo's shell. The total of 11 only comes out with a window chosen after the fact. Under any single consistent window the total is 11–12 with 3 after (seeds), or ~8–9 with 1–2 after (muster).
- **Comparability:** the comparison isn't like for like. The deny count is tool calls stopped. The prose count is decision files (or relation edges), a different unit, and the prose "violations" before 2026-08-16 obeyed the doctrine of the time.
