# 04: Hand check of the fix regex

Written 2026-11-21. The selection, the tally and the joins are in `evidence/hand-check-tally.md`. Each picked pair, with its commit, file, length and subject, is in `evidence/hand-check/<repo>-pairs.tsv`. Each verdict, with a one-line reason, is in `evidence/hand-check/<repo>-judged.tsv`.

## What was checked

`02-fix-share-by-length.md` counts a fix commit against every source file it touches. The check asks, for one commit and one file at a time: **was the fix actually in this file?**

- **Hit:** the commit corrects something (a defect, a review finding acted on, or a revert), and this file's change is part of the correction. Hits are split two ways: a defect or revert, and a cleanup or comment (a review finding that was duplication, naming, or a wrong comment).
- **Miss, not a fix:** the regex matched a commit that corrects nothing. Muster's "Builder 'changed since reviewed' nudge" matched on "reviewed".
- **Miss, incidental:** the commit is a fix, but this file's change is not part of it, such as a version bump, a moved function, or a feature riding along.

## How the pairs were chosen

The windows are the ones `02` reads with the rule off where a repo has one (centerline after 91c7378, soundings after 2e8f2d4) and whole histories otherwise (muster, haul, sailbook).

1. List every (fix commit, source file) pair in the window.
2. Sort by commit date, then commit, then path.
3. Take the 20 evenly spaced pairs at index floor((i + 0.5) × count / 20), for i from 0 to 19.
4. Add a supplement of 5 more from files of 200 lines or longer, spaced the same way among those not already picked. Soundings has only 3 such pairs left.

The supplement exists because the even spacing picks mostly short files, and the question is whether long files are miscounted.

Five research agents read one repo's diffs each, from a file holding each commit's message, its file list and the diff of the one file, with the rule above as their brief. The lead read all 123 verdicts against the commit subjects and kept them as written. Two calls are borderline: centerline pair 1 matched "fix" in its GPS sense, and haul pairs 9, 10 and 22 come from a "Screen fixes" commit that mixes small features with corrections. All four were counted as hits.

## Hit rates, the 20 evenly spaced pairs

| Repo | Pairs | Hit: defect or revert | Hit: cleanup or comment | Miss: not a fix | Miss: incidental | Hit rate | Defect-only rate |
|---|---|---|---|---|---|---|---|
| centerline | 20 | 11 | 7 | 0 | 2 | 0.90 | 0.55 |
| soundings | 20 | 7 | 11 | 0 | 2 | 0.90 | 0.35 |
| muster | 20 | 13 | 5 | 1 | 1 | 0.90 | 0.65 |
| haul | 20 | 11 | 7 | 0 | 2 | 0.90 | 0.55 |
| sailbook | 20 | 10 | 2 | 2 | 6 | 0.60 | 0.50 |

## Hit rate by band, all 123 pairs

| Band | Pairs | Hits | Hit rate | Defect-only hits | Defect-only rate |
|---|---|---|---|---|---|
| <200 | 56 | 48 | 0.86 | 30 | 0.54 |
| 200–400 | 39 | 32 | 0.82 | 22 | 0.56 |
| >400 | 28 | 24 | 0.86 | 16 | 0.57 |

## What it shows

**The regex lands in the right file 9 times in 10 in four repos, and 6 in 10 in sailbook.** Sailbook's commits bundle feature work with fixes under one subject, such as "Phase 2.8 — admin refund & cancel: payment column, partial refund dialog, WITH CHECK security fix" (pair 10, where the file counted is the feature's page). 6 of its 20 evenly spaced pairs were feature files riding in a fix commit.

**About half of what it counts are defects.** The rest are cleanups and comment corrections asked for by a review. So the fix share in `02` measures "changes that correct something", not "bugs". Soundings is the far end: 11 of its 18 hits are cleanups or comments.

**The accuracy does not depend on length.** The hit rate is 0.86, 0.82 and 0.86 across the three bands, and the defect-only rate 0.54, 0.56 and 0.57. If the regex were blaming long files for fixes that happened elsewhere in the same commit, the over-400 band would score lower. It does not.

## Limits

- **20 pairs per repo is a spot check.** One verdict moves a repo's rate by 0.05.
- **One reader per repo.** No pair was judged twice independently.
