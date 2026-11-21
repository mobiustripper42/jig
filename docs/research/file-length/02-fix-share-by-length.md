# 02: Fix share by file length

Written 2026-11-21. The tables are in `evidence/fix-share-all-commits.md`, `evidence/fix-share-modify-only.md` and `evidence/fix-share-strata.md`, and the per-file rows behind them are in `evidence/per-file/`.

## Method

- **Files:** the source files at each window's end commit, banded by their length there: under 200, 200 to 400, over 400.
- **History:** plain path history. Rename following was not used, and merge commits are left out. A file renamed in the window has only its history under the new name.
- **Fix commit:** a commit whose subject matches `\b(fix(?!ture)|bug|review|revert)` in Python, ignoring case. The pattern is anchored at the start of a word so "prefix" and "debug" do not match, and "fixture" is excluded.
- **Fix share:** fix commits divided by all commits touching the file. A commit touching five files counts once for each.
- **Pooled share:** a band's fix commits divided by its commits. The interval resamples files, not commits, so one file's commits stay together. It is not meaningful for a band of five files or fewer.
- **Two denominators:**
  - *All commits* counts every commit that touched the file, as the brief asks.
  - *Modify only* counts only commits that changed an existing file (`git log --diff-filter=M`). The commit that adds a file is rarely a fix, and a short file has few other commits, so counting it pulls a short file's share down.

**The confound normalising answers.** Longer files get more commits: 1.2 commits per file under 200 against 15.0 over 400 in centerline's rule-off window. Counting fixes alone would make long files look costly for being busy. Dividing by commits asks a different question: of the changes a file gets, what share are corrections?

## Windows with the rule off

| Window | Band | Files | Commits | Fix commits | Pooled share, all commits | Pooled share, modify only |
|---|---|---|---|---|---|---|
| centerline after 91c7378 | <200 | 143 | 177 | 25 | 0.14 | 0.19 |
| | 200–400 | 12 | 40 | 6 | 0.15 | 0.17 |
| | >400 | 3 | 45 | 13 | 0.29 | 0.29 |
| soundings after 2e8f2d4 | <200 | 69 | 129 | 22 | 0.17 | 0.37 |
| | 200–400 | 9 | 37 | 8 | 0.22 | 0.29 |
| | >400 | 1 | 1 | 0 | 0.00 | none |
| muster after 692ebf75 (~800) | <200 | 334 | 1,097 | 140 | 0.13 | 0.15 |
| | 200–400 | 83 | 659 | 93 | 0.14 | 0.15 |
| | >400 | 37 | 1,063 | 213 | 0.20 | 0.20 |

## Windows with the rule on

| Window | Band | Files | Commits | Fix commits | Pooled share, all commits | Pooled share, modify only |
|---|---|---|---|---|---|---|
| centerline to 91c7378 | <200 | 99 | 246 | 39 | 0.16 | 0.23 |
| | 200–400 | 9 | 63 | 20 | 0.32 | 0.35 |
| | >400 | 0 | | | | |
| muster to 692ebf75 | <200 | 190 | 611 | 128 | 0.21 | 0.29 |
| | 200–400 | 32 | 326 | 81 | 0.25 | 0.27 |
| | >400 | 13 | 351 | 66 | 0.19 | 0.20 |
| haul, whole history | <200 | 196 | 634 | 126 | 0.20 | 0.28 |
| | 200–400 | 14 | 94 | 20 | 0.21 | 0.25 |
| | >400 | 10 | 248 | 40 | 0.16 | 0.17 |
| sailbook, whole history | <200 | 152 | 575 | 216 | 0.38 | 0.44 |
| | 200–400 | 17 | 200 | 73 | 0.36 | 0.37 |
| | >400 | 3 | 35 | 17 | 0.49 | 0.50 |

Muster's whole history, banded at origin/main, reads 0.15, 0.17 and 0.20 on all commits, and 0.18, 0.18 and 0.21 on modify only.

## What it shows

**From under 200 to 200–400, the share does not climb with the rule off.** On all commits, the 200–400 band is within 0.05 of the band below it in all three rule-off windows. On modify only it is the same or lower: 0.17 against 0.19 in centerline, 0.29 against 0.37 in soundings, 0.15 against 0.15 in muster. Muster's ~800 period is the large sample: 83 files and 609 modifying commits at 0.15, against 334 files and 922 modifying commits at 0.15. With the rule on, 200–400 is clearly higher only in centerline's first two weeks (0.32 against 0.16, 9 files). In muster before 692ebf75, haul and sailbook it is within 0.07 of the band below, either way.

**Over 400, the share is mixed.** It is higher in two rule-off windows:
- muster's ~800 period: 0.20 against 0.15 on modify only. The intervals are 0.18–0.23 against 0.13–0.17.
- centerline: 0.29, but from 3 files, too few for an interval.

It is lower in two rule-on windows: haul (0.17 against 0.28, 10 files) and muster before 692ebf75 (0.20 against 0.29). Sailbook's 0.50 comes from 3 files.

**Muster's climb over 400 lives in its most-changed files.** Split by commits per file (`evidence/fix-share-strata.md`), files with 5 to 9 modifying commits read 0.15, 0.16 and 0.15 across the three bands. Files with 10 to 19 read 0.12, 0.15 and 0.17. The gap is in files with 20 or more: 0.21 for 19 files over 400 against 0.11 for 6 files of 200 to 400. Those 19 include the repository adapters, the contract suite and the payment webhook, the code every change to the data model passes through (`evidence/per-file/per-file-muster-800.csv`). They may draw fixes for being central rather than for being long; this method cannot tell the two apart.

**Fix share also climbs with commit count, whatever the length.** Files touched once are nearly never fixed: 1 fix in 51 such files in centerline, 0 in 38 in soundings, 2 in 78 in muster's ~800 period. Their one commit is usually the one that added them. Sailbook is the exception, at 12 in 50 (`evidence/fix-share-strata.md`, second table). Long files have more commits, which is the confound the modify-only denominator and the strata table exist to remove.

## Limits

- **The regex reads subjects, not diffs.** `04-hand-check.md` reads 123 pairs. The attribution is right about as often in every band: 0.86 under 200, 0.82 for 200 to 400, 0.86 over 400. So the regex's errors do not lean toward long files.
- **A file's commits are not independent.** One review-fix commit touching many files counts once in each. The file-resampled interval allows for files, not for commits shared between them.
- **Length is taken at the end of each window.** A file now 538 lines was shorter for most of the commits counted against it.
- **Sailbook's share is about double the others'.** Its commits bundle features with fixes under one subject, so its fix count is the least accurate (hit rate 0.60 in `04-hand-check.md`).
