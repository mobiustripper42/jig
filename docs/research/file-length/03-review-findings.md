# 03: Review findings by the length of the file they cite

Written 2026-11-21, revised the same day after review. The tables, the dropped non-findings and the excluded length findings are in `evidence/review-findings.md`. Every counted citation is in `evidence/review-citations.csv`, with its pull request, merge commit, file, length, whether the pull request changed that file (`changed_in_pr`) and the start of the finding's text.

## Method

- **Source:** merged pull requests into `main`, fetched on 2026-11-21 with `gh pr list --state merged --limit 1000 --json number,body,mergeCommit,mergedAt,files,baseRefName` from each repo. The limit was raised from 300 because muster has 672.
- **Review text:** the sections whose heading names code review or `@code-review`. Subsections about `@ui-reviewer`, the security review, `@architect` or `@test-writer` are cut out.
- **A finding:** one bullet or paragraph of that text. Summary lines ("Review passes", the ✓ and ⊘ rows) and code blocks are dropped. So are lines that are a pass verdict or a not-run note rather than a finding, matched by the pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`: 14 dropped, each listed in the evidence (centerline 3, muster 9, haul 1, sailbook 1).
- **Citing a file:** the finding names a path that is a source file at the pull request's merge commit, in full or by a file name that only one source file has.
- **Length:** the cited file's length at the merge commit, the code as it was when reviewed.
- **Denominators:** both count only pull requests that have a review section.
  - *File-touches:* the source files the pull request changed.
  - *Lines changed:* the additions and deletions to those files, from the same `files` field.
- **Citations, primary:** citations of a file the pull request changed. This matches the denominator, which counts only changed files.
- **Citations, all:** every citation, including the 205 (of 524) of a file the pull request did not change, such as a caller or a sibling adapter. Shown alongside and labelled. A finding that names two files counts once for each.
- **Rule on or off:** set by whether the merge commit descends from the commit that dropped the rule (91c7378 in centerline, 692ebf75 in muster).
- **Session files were not read.** The pull request bodies already carry the review sections.

## Excluded: findings about length

A finding counted only if it was not about length or splitting. Counting those would be the rule measuring itself.

A pattern over the finding's text (line counts, "oversized", "too long", a split of a file, component or module) caught 21 findings. On reading, 3 are not about length: centerline pull request 117, muster 865 ("100 lines below") and sailbook 151 ("split correctly gated"). All 3 are also pass verdicts, so they are among the 14 non-findings dropped above.

**18 length findings were excluded:** centerline 2, soundings 0, muster 3, haul 11, sailbook 2. Haul has the most: 11 of its 86 findings that cite a file. Most of haul's are marked "Left", as in "Left: `app/supper-club/page.tsx` is at 200 lines" (pull request 87) and "Left — `card-entry.tsx` is 271 lines" (pull request 227).

## Counts

| Repo | Rule | Band | File-touches | Lines changed | Citations of a changed file | Per 1,000 lines changed (primary) | All citations | Per 100 file-touches (all) | Per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|---|
| centerline | on | <200 | 227 | 8,119 | 11 | 1.35 | 16 | 7.0 | 1.97 |
| | on | 200–400 | 33 | 2,851 | 6 | 2.10 | 6 | 18.2 | 2.10 |
| | off | <200 | 167 | 5,266 | 12 | 2.28 | 18 | 10.8 | 3.42 |
| | off | 200–400 | 39 | 2,286 | 5 | 2.19 | 7 | 17.9 | 3.06 |
| | off | >400 | 20 | 1,966 | 3 | 1.53 | 3 | 15.0 | 1.53 |
| soundings | off | <200 | 118 | 6,417 | 8 | 1.25 | 11 | 9.3 | 1.71 |
| | off | 200–400 | 13 | 1,556 | 2 | 1.29 | 2 | 15.4 | 1.29 |
| | off | >400 | 1 | 435 | 0 | 0.00 | 0 | 0.0 | 0.00 |
| muster | on | <200 | 429 | 18,238 | 7 | 0.38 | 12 | 2.8 | 0.66 |
| | on | 200–400 | 194 | 9,927 | 0 | 0.00 | 2 | 1.0 | 0.20 |
| | on | >400 | 163 | 6,412 | 0 | 0.00 | 0 | 0.0 | 0.00 |
| | ~800 | <200 | 898 | 22,848 | 54 | 2.36 | 138 | 15.4 | 6.04 |
| | ~800 | 200–400 | 526 | 18,064 | 43 | 2.38 | 72 | 13.7 | 3.99 |
| | ~800 | >400 | 587 | 22,254 | 72 | 3.24 | 118 | 20.1 | 5.30 |
| haul | on | <200 | 549 | 14,573 | 50 | 3.43 | 62 | 11.3 | 4.25 |
| | on | 200–400 | 56 | 3,862 | 19 | 4.92 | 20 | 35.7 | 5.18 |
| | on | >400 | 78 | 4,156 | 7 | 1.68 | 8 | 10.3 | 1.92 |
| sailbook | on | <200 | 117 | 3,881 | 14 | 3.61 | 20 | 17.1 | 5.15 |
| | on | 200–400 | 34 | 1,154 | 6 | 5.20 | 9 | 26.5 | 7.80 |
| | on | >400 | 6 | 554 | 0 | 0.00 | 0 | 0.0 | 0.00 |

## What it shows

**Per line changed, 200–400 draws no more findings than under 200 with the rule off.** On the primary measure, centerline reads 2.19 against 2.28, soundings 1.29 against 1.25, and muster's ~800 period 2.38 against 2.36. With the rule on, 200–400 is higher in haul (4.92 against 3.43) and sailbook (5.20 against 3.61, from 6 citations).

**Over 400 the measure points both ways.** Muster's ~800 period has the only large sample: 3.24 against 2.36, from 72 and 54 citations. Centerline's rule-off window reads 1.53 against 2.28, from 3 citations. Haul reads 1.68 against 3.43. These are counts with no interval. Haul's over-400 files are all adapters, contract suites, the repository port and message catalogs (`evidence/per-file/per-file-haul-on-modify.csv`), so a file's type moves with its length.

**Per file-touch, a longer file draws more findings in most windows.** On all citations, the 200–400 band is above the band under 200 in every window but muster's two. A change to a longer file is a bigger change. In centerline with the rule off, a touch of a file under 200 changed 32 lines on average (5,266 over 167), and a touch of a 200–400 file changed 59 (2,286 over 39). Per line changed, that gap goes away.

**Muster's two periods cannot be compared.** Its citations jump at 692ebf75 because the review write-up changed shape, not because files did (`evidence/review-template-muster.md`). Before 692ebf75, no merged pull request has a "Review passes" block or a `### @code-review` heading, and the median review section is 465 characters. After it, 246 have the block, 160 have the heading, and the median is 1,304 characters. The first "Review passes" block is pull request 706, merged 2026-08-08.

**Too thin elsewhere.** Soundings has 10 primary citations, and one touch of a file over 400. Centerline's rule-off window has 3 primary citations of files over 400. Muster before 692ebf75 has 7.

## Limits

- **A finding is not a cost.** It records that the reviewer said something about a file. It does not record whether the remark was right, mattered, or was acted on. The excluded length findings show the gap: most were marked "Left".
- **Not every finding names its file.** Many name a function or a component (`listedWeekTitle`, `RowActions`) and are not counted. 233 path-like tokens matched no source file: tests, docs, or a file name shared by several files.
- **The non-finding pattern is a short list.** It caught the shapes seen on reading, not every pass verdict. Some praise or "verified" lines that name a file may still be counted.
- **Pull request bodies vary in shape.** Sailbook has 39 review sections in 115 merged pull requests. Its early bodies summarise the review in a sentence.
