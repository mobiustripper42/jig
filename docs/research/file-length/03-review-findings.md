# 03: Review findings by the length of the file they cite

Written 2026-11-21. The tables and the excluded findings are in `evidence/review-findings.md`. Every counted citation, with its pull request, merge commit, file, length and the start of the finding's text, is in `evidence/review-citations.csv`.

## Method

- **Source:** merged pull requests into `main`, fetched on 2026-11-21 with `gh pr list --state merged --limit 1000 --json number,body,mergeCommit,mergedAt,files,baseRefName` from each repo. The limit was raised from 300 because muster has 672.
- **Review text:** the sections whose heading names code review or `@code-review`. Subsections about `@ui-reviewer`, the security review, `@architect` or `@test-writer` are cut out.
- **A finding:** one bullet or paragraph of that text. Summary lines ("Review passes", the ✓ and ⊘ rows) and code blocks are dropped.
- **Citing a file:** the finding names a path that is a source file at the pull request's merge commit, in full or by a file name that only one source file has.
- **Length:** the cited file's length at the merge commit, the code as it was when reviewed. That is closer to what the reviewer read than the length at the latest commit.
- **Denominators:** both are counted only in pull requests that have a review section.
  - *File-touches:* source files the pull request changed.
  - *Lines changed:* the additions and deletions to those files, from the same `files` field.
- **Citations:** a finding that names two files counts once for each.
- **Rule on or off:** set by whether the merge commit descends from the commit that dropped the rule (91c7378 in centerline, 692ebf75 in muster).
- **Session files were not read.** The pull request bodies already carry the review sections, and muster's 454 alone are more than a by-hand pass could check.

## Excluded: findings about length

A finding counted only if it was not about length or splitting. That is the rule measuring itself.

A pattern over the finding's text (lines counts, "oversized", "too long", a split of a file, component or module) caught 21 findings. On reading, 3 of them are not about length: centerline pull request 117, muster 865 ("100 lines below") and sailbook 151 ("split correctly gated"). Those 3 were put back.

**18 findings were excluded:** centerline 2, soundings 0, muster 3, haul 11, sailbook 2. Each is listed in `evidence/review-findings.md`. Haul has the most: 11 of its 86 findings that cite a file are length findings. The length findings in haul's list are mostly marked "Left", as in "Left: `app/supper-club/page.tsx` is at 200 lines" (pull request 87) and "Left — `card-entry.tsx` is 271 lines" (pull request 227).

## Counts

| Repo | Rule | Band | File-touches | Lines changed | Citations | Per 100 file-touches | Per 1,000 lines changed |
|---|---|---|---|---|---|---|---|
| centerline | on | <200 | 227 | 8,119 | 18 | 7.9 | 2.2 |
| | on | 200–400 | 33 | 2,851 | 7 | 21.2 | 2.5 |
| | off | <200 | 167 | 5,266 | 19 | 11.4 | 3.6 |
| | off | 200–400 | 39 | 2,286 | 7 | 17.9 | 3.1 |
| | off | >400 | 20 | 1,966 | 4 | 20.0 | 2.0 |
| soundings | off | <200 | 118 | 6,417 | 11 | 9.3 | 1.7 |
| | off | 200–400 | 13 | 1,556 | 2 | 15.4 | 1.3 |
| | off | >400 | 1 | 435 | 0 | 0.0 | 0.0 |
| muster | on | <200 | 429 | 18,238 | 13 | 3.0 | 0.7 |
| | on | 200–400 | 194 | 9,927 | 3 | 1.5 | 0.3 |
| | on | >400 | 163 | 6,412 | 0 | 0.0 | 0.0 |
| | ~800 | <200 | 898 | 22,848 | 145 | 16.1 | 6.3 |
| | ~800 | 200–400 | 526 | 18,064 | 74 | 14.1 | 4.1 |
| | ~800 | >400 | 587 | 22,254 | 121 | 20.6 | 5.4 |
| haul | on | <200 | 549 | 14,573 | 63 | 11.5 | 4.3 |
| | on | 200–400 | 56 | 3,862 | 21 | 37.5 | 5.4 |
| | on | >400 | 78 | 4,156 | 8 | 10.3 | 1.9 |
| sailbook | on | <200 | 117 | 3,881 | 20 | 17.1 | 5.2 |
| | on | 200–400 | 34 | 1,154 | 10 | 29.4 | 8.7 |
| | on | >400 | 6 | 554 | 0 | 0.0 | 0.0 |

## What it shows

**Per file-touch, a longer file draws more findings in most windows.** The 200–400 band is above the band under 200 in every window but muster's two. The likely reason is that a change to a longer file is a bigger change. In centerline with the rule off, a touch of a file under 200 changed 32 lines on average (5,266 over 167) and a touch of a 200–400 file changed 59 (2,286 over 39).

**Per line changed, nothing climbs with length.** In the rule-off windows the over-400 band is at or below the under-200 band: 2.0 against 3.6 in centerline, and 5.4 against 6.3 in muster's ~800 period. The 200–400 band is below too: 3.1, 1.3 and 4.1 against 3.6, 1.7 and 6.3. With the rule on, 200–400 is a little higher in haul (5.4 against 4.3) and sailbook (8.7 against 5.2, from 10 findings), and over 400 is lower in haul.

**Too thin where it matters most.** Soundings has 13 citations, from 9 findings, and one touch of a file over 400. Centerline's rule-off window has 4 citations of files over 400. Muster before 692ebf75 has 16 citations in all, because its pull request bodies of that period rarely name files in the review section. Only muster's ~800 period has more than 100 citations in a band.

## Limits

- **A finding is not a cost.** It records that the reviewer said something about a file. It does not record whether the remark was right, mattered, or was acted on. The excluded length findings show the gap: most were marked "Left".
- **Not every finding names its file.** Many name a function or a component (`listedWeekTitle`, `RowActions`) and are not counted. 233 path-like tokens matched no source file: tests, docs, or a file name shared by several files.
- **Pull request bodies vary in shape.** Sailbook has 39 review sections in 115 merged pull requests. Its early bodies summarise the review in a sentence.
