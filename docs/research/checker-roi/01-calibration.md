# Calibration: "a prose rule broken 11 times, a deny obeyed 7 of 7"

Recounted 2026-11-03. `CLAUDE.md` § Scope Discipline quotes this result. Issue #104 makes it the calibration case, because it is the only count in the pilot whose answer is already on record.

**Verdict:** the deny half reproduces, with corrections. The prose half ("11 times, 4 after") does not reproduce, and nothing on disk records where it came from. The same ledger row the 7 of 7 comes from holds a checkable pair instead: the prose rule against `sed -n` was broken 58 times in one week, and the deny that replaced it was obeyed 7 of 7.

## Where the claim came from

- jig `CLAUDE.md` § Scope Discipline, introduced by jig `0b5ced2` (2026-08-27). It names neither the rule nor the deny.
- First written in jig `625399c` (2026-08-26), `docs/ANALYSIS.md:13-15`, under "Evidence from one afternoon, 2026-08-25". It says the deny "fired 7 times across 4 repos and was obeyed every time", and that the DEC-S036 prose rule ("no new decision amends an old one") "was broken 11 times, 4 of them after it was written". jig `0b958cb` repeats it.
- **The 7 of 7** traces to seeds `observations` branch, `observations/LEDGER.md:36` (row W4, commit `70f3814`, 2026-08-25): "Seven denials across four repos this batch (seeds ×4, soundings ×2, muster ×1)". That breakdown adds up to three repos, not four.
- **The 11 / 4 traces to nothing.** It is not in the ledger, any observation file, any seeds or jig session file, or `~/.claude/history.jsonl`.

## The rule and the deny

- **Prose rule:** "There is no new decision that amends an old one." seeds `dev/claude/CLAUDE.md:84`, written in `7a2472b` (2026-08-16). It reached muster in `2822715e` (2026-08-17), soundings in `8101207` (2026-08-19), and seeds' own loaded shell only in `d5f2831` (2026-08-22).
- **Deny:** `Bash(sed -n *)`, seeds `dev/claude/settings.json:76`, added in `c864ce7` (2026-08-17).

## Why the transcripts can't settle it

The five source sessions (9f5e4ddb, 5a35264a, 38d6b9c2, 85e2f5db, 2c08003d) are on no file anywhere on this machine. One observation cites a path on a different machine (`/home/estoffer`). The recount below uses the observation files written from those transcripts, and the git history of the decision records.

## Deny recount

| # | Repo | Session | Date | Shape | Next call |
|---|---|---|---|---|---|
| 1 | seeds | 9f5e4ddb | 08-19 | pipe into `sed -n` | disputed: `tail` or Read |
| 2 | seeds | 9f5e4ddb | 08-20 | file range | Read |
| 3 | seeds | 5a35264a | 08-22 | file range | `grep`; the check it was making was dropped |
| 4 | seeds | 5a35264a | 08-23 | file range | `grep`; the check it was making was dropped |
| 5 | soundings | 38d6b9c2 | ~08-21 | file range | Read |
| 6 | soundings | 85e2f5db | ~08-24 | file range | Read |
| 7 | muster | 2c08003d | 08-22/23 | pipe into `sed -n` | same `grep` without the pipe, then Read |

Each row is cited to an observation file and transcript line in `evidence/calibration.md`. 0 of 7 retried the command in a new shape, so "obeyed 7 of 7" holds when *obeyed* means "did not route around it". The corrections:
- 3 repos, not 4;
- five days (08-19 to 08-24), not one afternoon;
- 2 of the 7 were pipe truncations the pattern caught by accident, not the file-range read it targets;
- 2 of the 7 obeyed and dropped the check they were making, which LEDGER row W9 records as "a dropped goal".

## The like-for-like pair on the same ledger row

seeds `observations/LEDGER.md:36` (row W4) gives both halves of one rule, counted in the same unit, tool calls:
- **Prose:** before the deny, the rule "use Read, not `sed -n`" was broken in "58 calls / 3 sessions", "58 times in one week with zero operator corrections".
- **Mechanical:** after the deny, 7 denials and 0 re-shapes, the table above.

Row W9 (`LEDGER.md:41`) adds a caution: before this deny, denied commands were re-shaped and retried "7 retries / 2 sessions" (muster, bushel-mobile, 2026-08-12 to 08-14). So "a deny is always obeyed" was not true before W9's rule was written, and the 7 of 7 comes after it.

W4 cites its own source observation files. The source transcripts are gone like the rest, so the 58 can be checked against those files, not recounted from tool calls.

## Prose recount

The counting rule: a new decision file that declares an amend-type relation to an existing one, in frontmatter or a "Refines / Extends / Revises DEC-x" line. A "see also" doesn't count, because the rule allows it.

| Window | Total | After the rule |
|---|---|---|
| seeds only, from DEC-S039 | 11 | 3 |
| seeds only, from DEC-S038 | 12 | 3 |
| muster only, from DEC-148 | 8–9 | 1–2 |
| muster from DEC-148, plus seeds' post-rule files only | **11** | **4** |
| post-rule, only where the rule was in that repo's loaded shell | — | 2 (3–4 counting S049 and DEC-158) |

Only the fourth row reproduces 11 / 4. It takes muster's files from 08-06 onward and leaves out seeds' eight files from the same dates. A window chosen to fit is not a count.

## What this means for the pilot

- The quoted result was never like for like: the deny counts tool calls stopped, the "11" counts decision files written. The W4 pair (58 against 7 of 7) is like for like, and it is the one the full report should cite.
- Files written before 2026-08-16 followed what the instructions said at the time, so counting them as violations inflates the "11".
- **The shell quotes a number nobody can check.** That is a finding against `CLAUDE.md` § Scope Discipline, not a reason to stop the pilot. Fixing that text is outside this task.
- **The method is limited by its sources, not broken.** Before-counts have to come from commits, session files and observation files. `02-decision-gate.md` builds its before-count from exactly those.
