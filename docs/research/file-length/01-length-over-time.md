# 01: How long the files are, and whether they grew when the rule went

Written 2026-11-21. Every number here is in `evidence/length-over-time.md` unless another file is named. What counts as a source file is in the README, under "What was measured".

## Which repos had the rule, and when

The brief put muster with the repos that have the rule. It does not have it any more, and that changes how muster is read (`evidence/rule-history.md`):

| Repo | ~200-line flag in `@code-review` | What replaced it |
|---|---|---|
| centerline | 59f05b5 (2026-09-19) to 91c7378 (2026-10-04) | "split on responsibility; there is no line limit" |
| soundings | seeded 2026-04-22, dropped at 2e8f2d4 (2026-06-13), before any source file existed | nothing |
| muster | 36790007 (2026-06-03) to 692ebf75 (2026-07-24) | "~800 lines *when it also mixes concerns*", exempting adapters and contract suites; a context-file guideline of ~300 since 167c34c2 (2026-07-12) |
| haul | since 6786cf1 (2026-10-25) | still on |
| sailbook | since 092820b (2026-04-04), plus "keep components under 200 lines" in its context file | still on |

So the windows with the rule off are centerline after 91c7378, all of soundings, and muster after 692ebf75 (called muster's ~800 period below). The windows with it on are centerline before 91c7378, muster before 692ebf75, haul and sailbook.

## Length at the latest measured commit

| Repo | Rule now | Source files | Median | 90th percentile | Longest | Over 200 | Over 400 |
|---|---|---|---|---|---|---|---|
| centerline | off | 158 | 56.5 | 179 | 679 | 15 | 3 |
| soundings | off | 79 | 82 | 208 | 435 | 10 | 1 |
| muster | ~800 | 454 | 122.5 | 348 | 3,380 | 120 | 37 |
| haul | on | 220 | 51.5 | 208 | 1,732 | 24 | 10 |
| sailbook | on | 172 | 76.5 | 219 | 674 | 20 | 3 |

**The rule does not keep files under 200 where it is on.** Haul had the rule from its install and went from 1 file over 200 on 2026-10-31 to 24 on 2026-11-20, and from none over 400 to 10. Its longest file is 1,732 lines. Sailbook, with the rule in two places, has 20 files over 200. The share of files over 200 lines is 9% in centerline, 13% in soundings, 11% in haul and 12% in sailbook (each repo's "over 200" divided by its source files), with the rule on or off.

Muster is the exception in size: 26% of its files are over 200 (120 of 454). Its biggest files are the repository adapters and their contract suite, which its own replacement rule exempts.

## centerline: did files grow once the limit was gone?

At 91c7378, the commit that removed the limit, centerline had 108 source files, 9 over 200 and none over 400, the longest 362 lines. At origin/main (2026-11-08) it has 158, 15 over 200 and 3 over 400, the longest 679.

Of the 107 files present at both commits, 49 grew, 3 shrank and 55 did not change. 2 crossed above 200 and none fell back under it. 3 crossed above 400: `mobile/App.tsx` (337 to 679), `app/map/streets-map.tsx` (362 to 540) and `db/coverage.ts` (266 to 538). 5 files new since 91c7378 are over 200.

**So yes, a few files grew past 400 once the limit went.** The median barely moved, from 48 to 56.5, and the 90th percentile went from 167 to 179. Growth was in a handful of files, not across the repo.

The same thing happened in haul with the rule on, faster, so the growth is not evidence that the rule was holding files down. Before 91c7378, centerline was two weeks old and also had "roughly 300 lines" in its context file (`evidence/rule-history.md`, the 91c7378 message).

## Muster

Muster had 44 files over 200 when it dropped the flag at 692ebf75, and 120 at origin/main. The 3,380-line `src/adapters/repository-contract.ts` and the 3,261-line `src/adapters/postgres-repository.ts` are the two longest (`evidence/per-file/per-file-muster-800.csv`).

## Limits

- **Dated points use the first-parent commit on or before the date.** Sailbook has no first-parent commit between 2026-05-15 and 2026-06-15, so three rows show the same commit (88ce2a16).
- **Line counts include comments and blank lines.** Muster's context file counts lines of code without the doc comments. This count does not, so it reads muster's files as longer than muster's own guideline does.
- **Sailbook's history ends 2026-07-24.** Its `origin/main` was last updated then (`evidence/rule-history.md`), so its rows stop there while the others run into November.
- **The local checkouts were on task branches.** All counts are at `origin/main`. Soundings' origin/main has 180 commits since 2e8f2d4; its local HEAD has 156, the number in the brief (`evidence/rule-history.md`).
