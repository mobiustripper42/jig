# Fix share by length band

Plain path history at each window's end ref (no --follow, no renames, merges excluded).
Fix regex (Python, case-insensitive): `\b(fix(?!ture)|bug|review|revert)` on the commit subject.

## centerline-off: centerline, commits `91c7378..origin/main`, lengths at `origin/main`

Rule: off (no line limit since 91c7378, 2026-10-04). Non-merge commits in range: 119; matching the fix regex: 30. Source files at end ref: 158. Per-file data: `per-file-centerline-off.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 143 | 93 | 177 | 25 | 0.14 | 0.10-0.18 | 0.00 | 1 | 0.33 | 1.2 |
| 200-400 | 12 | 12 | 40 | 6 | 0.15 | 0.08-0.22 | 0.07 | 2 | 0.07 | 3.3 |
| >400 | 3 | 3 | 45 | 13 | 0.29 | 0.20-0.41 | 0.25 | 3 | 0.25 | 15.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 117 | 70 | 121 | 14 | 0.12 | 0.06-0.17 | 0.00 | 1 | 0.33 | 1.0 |
| 100-199 | 26 | 23 | 56 | 11 | 0.20 | 0.11-0.28 | 0.00 | 0 | n/a | 2.2 |
| 200-299 | 9 | 9 | 28 | 4 | 0.14 | 0.04-0.23 | 0.00 | 1 | 0.00 | 3.1 |
| 300-399 | 3 | 3 | 12 | 2 | 0.17 | 0.00-0.33 | 0.14 | 1 | 0.14 | 4.0 |
| 400-599 | 2 | 2 | 25 | 9 | 0.36 | 0.25-0.41 | 0.33 | 2 | 0.33 | 12.5 |
| 600+ | 1 | 1 | 20 | 4 | 0.20 | 0.20-0.20 | 0.20 | 1 | 0.20 | 20.0 |

## centerline-on: centerline, commits `91c7378`, lengths at `91c7378`

Rule: on (~200, install 59f05b5 2026-09-19 to 91c7378). Non-merge commits in range: 152; matching the fix regex: 39. Source files at end ref: 108. Per-file data: `per-file-centerline-on.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 99 | 99 | 246 | 39 | 0.16 | 0.12-0.20 | 0.00 | 13 | 0.14 | 2.5 |
| 200-400 | 9 | 9 | 63 | 20 | 0.32 | 0.26-0.38 | 0.31 | 7 | 0.31 | 7.0 |
| >400 | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 84 | 84 | 191 | 24 | 0.13 | 0.08-0.17 | 0.00 | 9 | 0.11 | 2.3 |
| 100-199 | 15 | 15 | 55 | 15 | 0.27 | 0.21-0.33 | 0.30 | 4 | 0.23 | 3.7 |
| 200-299 | 7 | 7 | 42 | 14 | 0.33 | 0.24-0.42 | 0.38 | 5 | 0.38 | 6.0 |
| 300-399 | 2 | 2 | 21 | 6 | 0.29 | 0.25-0.31 | 0.28 | 2 | 0.28 | 10.5 |
| 400-599 | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |
| 600+ | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

## soundings-off: soundings, commits `2e8f2d4..origin/main`, lengths at `origin/main`

Rule: off (dropped at 2e8f2d4, 2026-06-13). Non-merge commits in range: 119; matching the fix regex: 22. Source files at end ref: 79. Per-file data: `per-file-soundings-off.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 69 | 69 | 129 | 22 | 0.17 | 0.11-0.23 | 0.00 | 3 | 0.20 | 1.9 |
| 200-400 | 9 | 9 | 37 | 8 | 0.22 | 0.12-0.33 | 0.14 | 2 | 0.24 | 4.1 |
| >400 | 1 | 1 | 1 | 0 | 0.00 | 0.00-0.00 | 0.00 | 0 | n/a | 1.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 46 | 46 | 68 | 9 | 0.13 | 0.07-0.20 | 0.00 | 0 | n/a | 1.5 |
| 100-199 | 23 | 23 | 61 | 13 | 0.21 | 0.11-0.32 | 0.00 | 3 | 0.20 | 2.7 |
| 200-299 | 8 | 8 | 31 | 6 | 0.19 | 0.08-0.33 | 0.07 | 1 | 0.14 | 3.9 |
| 300-399 | 1 | 1 | 6 | 2 | 0.33 | 0.33-0.33 | 0.33 | 1 | 0.33 | 6.0 |
| 400-599 | 1 | 1 | 1 | 0 | 0.00 | 0.00-0.00 | 0.00 | 0 | n/a | 1.0 |
| 600+ | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

## muster-all: muster, commits `origin/main`, lengths at `origin/main`

Rule: on to 692ebf75 (2026-07-24), then ~800 and mixed concerns. Non-merge commits in range: 1543; matching the fix regex: 434. Source files at end ref: 454. Per-file data: `per-file-muster-all.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 334 | 334 | 1598 | 242 | 0.15 | 0.13-0.17 | 0.00 | 132 | 0.17 | 4.8 |
| 200-400 | 83 | 83 | 951 | 163 | 0.17 | 0.15-0.20 | 0.17 | 67 | 0.17 | 11.5 |
| >400 | 37 | 37 | 1454 | 292 | 0.20 | 0.18-0.22 | 0.20 | 36 | 0.20 | 39.3 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 181 | 181 | 670 | 90 | 0.13 | 0.10-0.17 | 0.00 | 47 | 0.12 | 3.7 |
| 100-199 | 153 | 153 | 928 | 152 | 0.16 | 0.14-0.18 | 0.12 | 85 | 0.17 | 6.1 |
| 200-299 | 50 | 50 | 557 | 95 | 0.17 | 0.14-0.20 | 0.16 | 41 | 0.17 | 11.1 |
| 300-399 | 33 | 33 | 394 | 68 | 0.17 | 0.13-0.22 | 0.20 | 26 | 0.18 | 11.9 |
| 400-599 | 22 | 22 | 556 | 104 | 0.19 | 0.16-0.22 | 0.18 | 21 | 0.18 | 25.3 |
| 600+ | 15 | 15 | 898 | 188 | 0.21 | 0.18-0.25 | 0.20 | 15 | 0.20 | 59.9 |

## muster-on: muster, commits `692ebf75`, lengths at `692ebf75`

Rule: on (~200 in code-review until 692ebf75). Non-merge commits in range: 641; matching the fix regex: 160. Source files at end ref: 235. Per-file data: `per-file-muster-on.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 190 | 190 | 611 | 128 | 0.21 | 0.18-0.24 | 0.00 | 40 | 0.20 | 3.2 |
| 200-400 | 32 | 32 | 326 | 81 | 0.25 | 0.22-0.28 | 0.23 | 26 | 0.23 | 10.2 |
| >400 | 13 | 13 | 351 | 66 | 0.19 | 0.15-0.23 | 0.19 | 13 | 0.19 | 27.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 128 | 128 | 336 | 67 | 0.20 | 0.16-0.24 | 0.00 | 18 | 0.20 | 2.6 |
| 100-199 | 62 | 62 | 275 | 61 | 0.22 | 0.17-0.27 | 0.20 | 22 | 0.23 | 4.4 |
| 200-299 | 17 | 17 | 151 | 35 | 0.23 | 0.19-0.28 | 0.22 | 13 | 0.22 | 8.9 |
| 300-399 | 15 | 15 | 175 | 46 | 0.26 | 0.23-0.31 | 0.25 | 13 | 0.23 | 11.7 |
| 400-599 | 7 | 7 | 155 | 32 | 0.21 | 0.14-0.28 | 0.25 | 7 | 0.25 | 22.1 |
| 600+ | 6 | 6 | 196 | 34 | 0.17 | 0.14-0.22 | 0.17 | 6 | 0.17 | 32.7 |

## muster-800: muster, commits `692ebf75..origin/main`, lengths at `origin/main`

Rule: ~800 and mixed concerns (since 692ebf75). Non-merge commits in range: 902; matching the fix regex: 274. Source files at end ref: 454. Per-file data: `per-file-muster-800.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 334 | 290 | 1097 | 140 | 0.13 | 0.11-0.15 | 0.00 | 94 | 0.14 | 3.3 |
| 200-400 | 83 | 82 | 659 | 93 | 0.14 | 0.11-0.17 | 0.12 | 53 | 0.12 | 7.9 |
| >400 | 37 | 37 | 1063 | 213 | 0.20 | 0.17-0.22 | 0.20 | 35 | 0.20 | 28.7 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 181 | 144 | 379 | 39 | 0.10 | 0.07-0.14 | 0.00 | 22 | 0.05 | 2.1 |
| 100-199 | 153 | 146 | 718 | 101 | 0.14 | 0.12-0.16 | 0.10 | 72 | 0.17 | 4.7 |
| 200-299 | 50 | 50 | 405 | 59 | 0.15 | 0.12-0.18 | 0.12 | 34 | 0.13 | 8.1 |
| 300-399 | 33 | 32 | 254 | 34 | 0.13 | 0.09-0.19 | 0.09 | 19 | 0.12 | 7.7 |
| 400-599 | 22 | 22 | 409 | 66 | 0.16 | 0.13-0.20 | 0.15 | 20 | 0.15 | 18.6 |
| 600+ | 15 | 15 | 654 | 147 | 0.22 | 0.19-0.26 | 0.22 | 15 | 0.22 | 43.6 |

## haul-on: haul, commits `origin/main`, lengths at `origin/main`

Rule: on (~200 since install 6786cf1, 2026-10-25). Non-merge commits in range: 271; matching the fix regex: 98. Source files at end ref: 220. Per-file data: `per-file-haul-on.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 196 | 196 | 634 | 126 | 0.20 | 0.17-0.23 | 0.00 | 46 | 0.20 | 3.2 |
| 200-400 | 14 | 14 | 94 | 20 | 0.21 | 0.16-0.27 | 0.19 | 9 | 0.21 | 6.7 |
| >400 | 10 | 10 | 248 | 40 | 0.16 | 0.11-0.20 | 0.13 | 9 | 0.14 | 24.8 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 163 | 163 | 475 | 94 | 0.20 | 0.16-0.23 | 0.00 | 32 | 0.20 | 2.9 |
| 100-199 | 33 | 33 | 159 | 32 | 0.20 | 0.14-0.26 | 0.14 | 14 | 0.20 | 4.8 |
| 200-299 | 9 | 9 | 60 | 12 | 0.20 | 0.13-0.28 | 0.17 | 7 | 0.17 | 6.7 |
| 300-399 | 5 | 5 | 34 | 8 | 0.24 | 0.15-0.30 | 0.25 | 2 | 0.27 | 6.8 |
| 400-599 | 4 | 4 | 141 | 23 | 0.16 | 0.11-0.21 | 0.18 | 4 | 0.18 | 35.2 |
| 600+ | 6 | 6 | 107 | 17 | 0.16 | 0.02-0.22 | 0.06 | 5 | 0.12 | 17.8 |

## sailbook-on: sailbook, commits `origin/main`, lengths at `origin/main`

Rule: on (200 since 092820b, 2026-04-04). Non-merge commits in range: 539; matching the fix regex: 126. Source files at end ref: 172. Per-file data: `per-file-sailbook-on.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 152 | 152 | 575 | 216 | 0.38 | 0.33-0.41 | 0.29 | 44 | 0.39 | 3.8 |
| 200-400 | 17 | 17 | 200 | 73 | 0.36 | 0.30-0.43 | 0.30 | 14 | 0.34 | 11.8 |
| >400 | 3 | 3 | 35 | 17 | 0.49 | 0.33-0.58 | 0.43 | 3 | 0.43 | 11.7 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 109 | 109 | 357 | 128 | 0.36 | 0.30-0.42 | 0.25 | 24 | 0.30 | 3.3 |
| 100-199 | 43 | 43 | 218 | 88 | 0.40 | 0.35-0.45 | 0.33 | 20 | 0.43 | 5.1 |
| 200-299 | 12 | 12 | 118 | 48 | 0.41 | 0.32-0.47 | 0.36 | 9 | 0.42 | 9.8 |
| 300-399 | 5 | 5 | 82 | 25 | 0.30 | 0.26-0.42 | 0.28 | 5 | 0.28 | 16.4 |
| 400-599 | 2 | 2 | 26 | 14 | 0.54 | 0.43-0.58 | 0.50 | 2 | 0.50 | 13.0 |
| 600+ | 1 | 1 | 9 | 3 | 0.33 | 0.33-0.33 | 0.33 | 1 | 0.33 | 9.0 |

