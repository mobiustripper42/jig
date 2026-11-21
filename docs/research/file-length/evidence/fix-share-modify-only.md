# Fix share by length band

Plain path history at each window's end ref (no --follow, no renames, merges excluded).
Fix regex (Python, case-insensitive): `\b(fix(?!ture)|bug|review|revert)` on the commit subject.

**Denominator: commits that modify the file (git --diff-filter=M); the commit that adds it is not counted.**

## centerline-off: centerline, commits `91c7378..origin/main`, lengths at `origin/main`

Rule: off (no line limit since 91c7378, 2026-10-04). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 119 (`git rev-list --no-merges --count 91c7378..origin/main`: 119); matching the fix regex: 30. Source files at end ref: 158. Per-file data: `per-file-centerline-off-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 143 | 66 | 131 | 25 | 0.19 | 0.13-0.25 | 0.00 | 1 | 0.33 | 0.9 |
| 200-400 | 12 | 11 | 35 | 6 | 0.17 | 0.09-0.25 | 0.17 | 2 | 0.08 | 2.9 |
| >400 | 3 | 3 | 45 | 13 | 0.29 | 0.20-0.41 | 0.25 | 3 | 0.25 | 15.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 117 | 45 | 82 | 14 | 0.17 | 0.10-0.24 | 0.00 | 1 | 0.33 | 0.7 |
| 100-199 | 26 | 21 | 49 | 11 | 0.22 | 0.12-0.33 | 0.00 | 0 | n/a | 1.9 |
| 200-299 | 9 | 8 | 25 | 4 | 0.16 | 0.05-0.26 | 0.12 | 1 | 0.00 | 2.8 |
| 300-399 | 3 | 3 | 10 | 2 | 0.20 | 0.00-0.33 | 0.17 | 1 | 0.17 | 3.3 |
| 400-599 | 2 | 2 | 25 | 9 | 0.36 | 0.25-0.41 | 0.33 | 2 | 0.33 | 12.5 |
| 600+ | 1 | 1 | 20 | 4 | 0.20 | 0.20-0.20 | 0.20 | 1 | 0.20 | 20.0 |

## centerline-on: centerline, commits `91c7378`, lengths at `91c7378`

Rule: on (~200, install 59f05b5 2026-09-19 to 91c7378). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 149 (`git rev-list --no-merges --count 91c7378`: 152); matching the fix regex: 39. Source files at end ref: 108. Per-file data: `per-file-centerline-on-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 99 | 62 | 147 | 34 | 0.23 | 0.16-0.31 | 0.00 | 10 | 0.13 | 1.5 |
| 200-400 | 9 | 9 | 54 | 19 | 0.35 | 0.26-0.46 | 0.33 | 6 | 0.33 | 6.0 |
| >400 | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 84 | 49 | 107 | 20 | 0.19 | 0.11-0.27 | 0.00 | 7 | 0.12 | 1.3 |
| 100-199 | 15 | 13 | 40 | 14 | 0.35 | 0.24-0.52 | 0.50 | 3 | 0.17 | 2.7 |
| 200-299 | 7 | 7 | 35 | 13 | 0.37 | 0.21-0.53 | 0.43 | 4 | 0.38 | 5.0 |
| 300-399 | 2 | 2 | 19 | 6 | 0.32 | 0.29-0.33 | 0.31 | 2 | 0.31 | 9.5 |
| 400-599 | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |
| 600+ | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

## soundings-off: soundings, commits `2e8f2d4..origin/main`, lengths at `origin/main`

Rule: off (dropped at 2e8f2d4, 2026-06-13). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 114 (`git rev-list --no-merges --count 2e8f2d4..origin/main`: 119); matching the fix regex: 22. Source files at end ref: 79. Per-file data: `per-file-soundings-off-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 69 | 33 | 60 | 22 | 0.37 | 0.25-0.49 | 0.50 | 0 | n/a | 0.9 |
| 200-400 | 9 | 8 | 28 | 8 | 0.29 | 0.17-0.50 | 0.28 | 2 | 0.28 | 3.1 |
| >400 | 1 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 46 | 15 | 22 | 9 | 0.41 | 0.24-0.59 | 0.50 | 0 | n/a | 0.5 |
| 100-199 | 23 | 18 | 38 | 13 | 0.34 | 0.19-0.51 | 0.38 | 0 | n/a | 1.7 |
| 200-299 | 8 | 7 | 23 | 6 | 0.26 | 0.13-0.50 | 0.15 | 1 | 0.15 | 2.9 |
| 300-399 | 1 | 1 | 5 | 2 | 0.40 | 0.40-0.40 | 0.40 | 1 | 0.40 | 5.0 |
| 400-599 | 1 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |
| 600+ | 0 | 0 | 0 | 0 | n/a | n/a-n/a | n/a | 0 | n/a | 0.0 |

## muster-all: muster, commits `origin/main`, lengths at `origin/main`

Rule: on to 692ebf75 (2026-07-24), then ~800 and mixed concerns. Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 1505 (`git rev-list --no-merges --count origin/main`: 1543); matching the fix regex: 432. Source files at end ref: 454. Per-file data: `per-file-muster-all-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 334 | 265 | 1261 | 231 | 0.18 | 0.16-0.21 | 0.12 | 108 | 0.17 | 3.8 |
| 200-400 | 83 | 81 | 868 | 160 | 0.18 | 0.16-0.21 | 0.18 | 61 | 0.18 | 10.5 |
| >400 | 37 | 37 | 1417 | 291 | 0.21 | 0.18-0.23 | 0.20 | 36 | 0.20 | 38.3 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 181 | 121 | 487 | 82 | 0.17 | 0.13-0.21 | 0.00 | 39 | 0.14 | 2.7 |
| 100-199 | 153 | 144 | 774 | 149 | 0.19 | 0.17-0.22 | 0.15 | 69 | 0.18 | 5.1 |
| 200-299 | 50 | 48 | 507 | 94 | 0.19 | 0.16-0.22 | 0.17 | 37 | 0.18 | 10.1 |
| 300-399 | 33 | 33 | 361 | 66 | 0.18 | 0.14-0.24 | 0.20 | 24 | 0.18 | 10.9 |
| 400-599 | 22 | 22 | 534 | 103 | 0.19 | 0.16-0.22 | 0.19 | 21 | 0.19 | 24.3 |
| 600+ | 15 | 15 | 883 | 188 | 0.21 | 0.18-0.25 | 0.21 | 15 | 0.21 | 58.9 |

## muster-on: muster, commits `692ebf75`, lengths at `692ebf75`

Rule: on (~200 in code-review until 692ebf75). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 621 (`git rev-list --no-merges --count 692ebf75`: 641); matching the fix regex: 159. Source files at end ref: 235. Per-file data: `per-file-muster-on-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 190 | 127 | 419 | 120 | 0.29 | 0.24-0.33 | 0.33 | 21 | 0.29 | 2.2 |
| 200-400 | 32 | 31 | 294 | 80 | 0.27 | 0.24-0.31 | 0.25 | 25 | 0.25 | 9.2 |
| >400 | 13 | 13 | 338 | 66 | 0.20 | 0.16-0.24 | 0.20 | 12 | 0.19 | 26.0 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 128 | 74 | 206 | 60 | 0.29 | 0.23-0.35 | 0.31 | 7 | 0.29 | 1.6 |
| 100-199 | 62 | 53 | 213 | 60 | 0.28 | 0.21-0.36 | 0.33 | 14 | 0.29 | 3.4 |
| 200-299 | 17 | 16 | 134 | 35 | 0.26 | 0.21-0.32 | 0.25 | 12 | 0.25 | 7.9 |
| 300-399 | 15 | 15 | 160 | 45 | 0.28 | 0.24-0.34 | 0.25 | 13 | 0.25 | 10.7 |
| 400-599 | 7 | 7 | 148 | 32 | 0.22 | 0.15-0.30 | 0.27 | 6 | 0.23 | 21.1 |
| 600+ | 6 | 6 | 190 | 34 | 0.18 | 0.14-0.23 | 0.17 | 6 | 0.17 | 31.7 |

## muster-800: muster, commits `692ebf75..origin/main`, lengths at `origin/main`

Rule: ~800 and mixed concerns (since 692ebf75). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 884 (`git rev-list --no-merges --count 692ebf75..origin/main`: 902); matching the fix regex: 273. Source files at end ref: 454. Per-file data: `per-file-muster-800-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 334 | 248 | 922 | 136 | 0.15 | 0.13-0.17 | 0.00 | 80 | 0.14 | 2.8 |
| 200-400 | 83 | 80 | 609 | 91 | 0.15 | 0.12-0.18 | 0.13 | 48 | 0.14 | 7.3 |
| >400 | 37 | 37 | 1043 | 212 | 0.20 | 0.18-0.23 | 0.21 | 35 | 0.21 | 28.2 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 181 | 108 | 301 | 35 | 0.12 | 0.08-0.16 | 0.00 | 19 | 0.11 | 1.7 |
| 100-199 | 153 | 140 | 621 | 101 | 0.16 | 0.14-0.19 | 0.11 | 61 | 0.14 | 4.1 |
| 200-299 | 50 | 48 | 374 | 58 | 0.16 | 0.12-0.19 | 0.14 | 31 | 0.14 | 7.5 |
| 300-399 | 33 | 32 | 235 | 33 | 0.14 | 0.09-0.21 | 0.10 | 17 | 0.12 | 7.1 |
| 400-599 | 22 | 22 | 395 | 65 | 0.16 | 0.13-0.20 | 0.15 | 20 | 0.15 | 18.0 |
| 600+ | 15 | 15 | 648 | 147 | 0.23 | 0.20-0.26 | 0.22 | 15 | 0.22 | 43.2 |

## haul-on: haul, commits `origin/main`, lengths at `origin/main`

Rule: on (~200 since install 6786cf1, 2026-10-25). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 268 (`git rev-list --no-merges --count origin/main`: 271); matching the fix regex: 98. Source files at end ref: 220. Per-file data: `per-file-haul-on-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 196 | 131 | 438 | 124 | 0.28 | 0.24-0.32 | 0.25 | 27 | 0.28 | 2.2 |
| 200-400 | 14 | 14 | 80 | 20 | 0.25 | 0.19-0.32 | 0.22 | 9 | 0.23 | 5.7 |
| >400 | 10 | 10 | 238 | 40 | 0.17 | 0.12-0.21 | 0.14 | 9 | 0.14 | 23.8 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 163 | 104 | 312 | 92 | 0.29 | 0.24-0.35 | 0.26 | 18 | 0.26 | 1.9 |
| 100-199 | 33 | 27 | 126 | 32 | 0.25 | 0.19-0.32 | 0.25 | 9 | 0.33 | 3.8 |
| 200-299 | 9 | 9 | 51 | 12 | 0.24 | 0.16-0.33 | 0.20 | 7 | 0.20 | 5.7 |
| 300-399 | 5 | 5 | 29 | 8 | 0.28 | 0.18-0.36 | 0.33 | 2 | 0.30 | 5.8 |
| 400-599 | 4 | 4 | 137 | 23 | 0.17 | 0.12-0.22 | 0.19 | 4 | 0.19 | 34.2 |
| 600+ | 6 | 6 | 101 | 17 | 0.17 | 0.03-0.23 | 0.07 | 5 | 0.14 | 16.8 |

## sailbook-on: sailbook, commits `origin/main`, lengths at `origin/main`

Rule: on (200 since 092820b, 2026-04-04). Non-merge commits in range that modify at least one existing file (any file, `--diff-filter=M`): 516 (`git rev-list --no-merges --count origin/main`: 539); matching the fix regex: 126. Source files at end ref: 172. Per-file data: `per-file-sailbook-on-modify.csv`.

Bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| <200 | 152 | 103 | 423 | 185 | 0.44 | 0.39-0.49 | 0.42 | 33 | 0.42 | 2.8 |
| 200-400 | 17 | 16 | 183 | 68 | 0.37 | 0.31-0.44 | 0.38 | 14 | 0.38 | 10.8 |
| >400 | 3 | 3 | 32 | 16 | 0.50 | 0.38-0.56 | 0.50 | 3 | 0.50 | 10.7 |

Finer bands:

| band | files | files touched | commits (file-touches) | fix commits | pooled fix share | 95% interval (file bootstrap) | median per-file share | files with 5+ commits | median share, 5+ | commits per file |
|---|---|---|---|---|---|---|---|---|---|---|
| 0-99 | 109 | 68 | 248 | 104 | 0.42 | 0.35-0.49 | 0.33 | 16 | 0.37 | 2.3 |
| 100-199 | 43 | 35 | 175 | 81 | 0.46 | 0.40-0.53 | 0.50 | 17 | 0.43 | 4.1 |
| 200-299 | 12 | 11 | 106 | 45 | 0.42 | 0.34-0.48 | 0.45 | 9 | 0.45 | 8.8 |
| 300-399 | 5 | 5 | 77 | 23 | 0.30 | 0.24-0.39 | 0.29 | 5 | 0.29 | 15.4 |
| 400-599 | 2 | 2 | 24 | 13 | 0.54 | 0.50-0.56 | 0.53 | 2 | 0.53 | 12.0 |
| 600+ | 1 | 1 | 8 | 3 | 0.38 | 0.38-0.38 | 0.38 | 1 | 0.38 | 8.0 |

