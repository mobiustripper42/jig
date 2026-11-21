# Review findings that cite a source file, by length band

## centerline

- merged pull requests into main fetched: 116; with a review section: 99
- finding units in review sections: 407; citing at least one source file: 47
- excluded as being about length or splitting: 2 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 14

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | finding citations | per 100 file-touches | per 1,000 lines changed |
|---|---|---|---|---|---|---|
| on | <200 | 227 | 8119 | 18 | 7.9 | 2.2 |
| on | 200-400 | 33 | 2851 | 7 | 21.2 | 2.5 |
| on | >400 | 0 | 0 | 0 | 0.0 | 0.0 |
| off | <200 | 167 | 5266 | 19 | 11.4 | 3.6 |
| off | 200-400 | 39 | 2286 | 7 | 17.9 | 3.1 |
| off | >400 | 20 | 1966 | 4 | 20.0 | 2.0 |

Excluded (length or splitting), pull request number and text start:

- pull request 70: 4. **Left.** `streets-map.tsx` is about 360 lines, over the ~300 convention; it was 349 before this task. A split into hooks is worth its own task.
- pull request 64: 3. **`streets-map.tsx` passed 380 lines** — the halo and framing moved to `app/map/chosen-halo.ts`; 349 lines now, the rest its existing concerns.

## soundings

- merged pull requests into main fetched: 62; with a review section: 42
- finding units in review sections: 149; citing at least one source file: 9
- excluded as being about length or splitting: 0 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 10

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | finding citations | per 100 file-touches | per 1,000 lines changed |
|---|---|---|---|---|---|---|
| off | <200 | 118 | 6417 | 11 | 9.3 | 1.7 |
| off | 200-400 | 13 | 1556 | 2 | 15.4 | 1.3 |
| off | >400 | 1 | 435 | 0 | 0.0 | 0.0 |

## muster

- merged pull requests into main fetched: 672; with a review section: 454
- finding units in review sections: 1595; citing at least one source file: 256
- excluded as being about length or splitting: 3 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 131

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | finding citations | per 100 file-touches | per 1,000 lines changed |
|---|---|---|---|---|---|---|
| on | <200 | 429 | 18238 | 13 | 3.0 | 0.7 |
| on | 200-400 | 194 | 9927 | 3 | 1.5 | 0.3 |
| on | >400 | 163 | 6412 | 0 | 0.0 | 0.0 |
| ~800 | <200 | 898 | 22848 | 145 | 16.1 | 6.3 |
| ~800 | 200-400 | 526 | 18064 | 74 | 14.1 | 4.1 |
| ~800 | >400 | 587 | 22254 | 121 | 20.6 | 5.4 |

Excluded (length or splitting), pull request number and text start:

- pull request 1108: - **Not changed:** `reservation-detail-pane.tsx` is 1,035 lines. Splitting out `PaneActions` is a refactor with nothing to do with this change.
- pull request 786: It named one piece of standing debt without raising it as a finding: `calendar-view.tsx` was already 855 lines and mixes filtering, geometry and three card-render branches. This adds ~30 net lines to it rather than split
- pull request 375: - **Nit (non-blocking):** `shift-row.tsx` is 218 lines, 18 over the ceiling — mostly doc comments carried over verbatim. If it grows, split the split/merge action forms out of the render body.

## haul

- merged pull requests into main fetched: 117; with a review section: 82
- finding units in review sections: 457; citing at least one source file: 86
- excluded as being about length or splitting: 11 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 66

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | finding citations | per 100 file-touches | per 1,000 lines changed |
|---|---|---|---|---|---|---|
| on | <200 | 549 | 14573 | 63 | 11.5 | 4.3 |
| on | 200-400 | 56 | 3862 | 21 | 37.5 | 5.4 |
| on | >400 | 78 | 4156 | 8 | 10.3 | 1.9 |

Excluded (length or splitting), pull request number and text start:

- pull request 228: - **Open, cleanup:** `app/account/page.tsx` is 215 lines. Split out `SupperClubCard` / `DetailsCard` in a follow-up.
- pull request 227: - **Left — `card-entry.tsx` is 271 lines**, past the ~200 guideline; the spec put the seams there. Split into `card-attachment.ts` if it grows.
- pull request 180: - `src/menu-run.ts` is 208 lines; the reminder step could split out.
- pull request 176: - Three files over 200 lines (`postgres-repository.ts`, `in-memory-repository.ts`, `charge-run-contract.ts`): pre-existing pattern, not for this PR.
- pull request 87: - **Left:** `app/supper-club/page.tsx` is at 200 lines. If it grows, move the stranded "Try again" card out the way `SoldOutCard` was moved out.
- pull request 83: - **Left:** `src/signup.ts` is a little over the 200-line guide, and `postgres-repository.ts` is 570 lines. Split when Phase 2 adds ledger queries.
- pull request 76: - **Left:** `src/adapters/postgres-repository.ts` at 389 lines, `repository-contract.ts` at 440, both over the 200-line flag; moving product reading out is a refactor for its own task.
- pull request 72: 4. **Cleanup.** `square-payments.ts` is 241 lines and could split its wire parsing out. **Left as is.**
- pull request 72: 5. **Cleanup.** `payments-contract.ts` is 271 lines and could split AC10's input table out. **Left as is**: it's a locked test file.
- pull request 36: 2. **`src/adapters/postgres-repository.ts` is past 200 lines (227):** left. Splitting the sign-in SQL into its own store is a mechanical change outside this spec. Better done in the next commit that touches the file.
- pull request 23: - **Left:** `src/sign-in/store-contract.ts` is over 300 lines. It is a locked test file in this run; split it when next touched.

## sailbook

- merged pull requests into main fetched: 115; with a review section: 39
- finding units in review sections: 153; citing at least one source file: 25
- excluded as being about length or splitting: 2 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 12

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | finding citations | per 100 file-touches | per 1,000 lines changed |
|---|---|---|---|---|---|---|
| on | <200 | 117 | 3881 | 20 | 17.1 | 5.2 |
| on | 200-400 | 34 | 1154 | 10 | 29.4 | 8.7 |
| on | >400 | 6 | 554 | 0 | 0.0 | 0.0 |

Excluded (length or splitting), pull request number and text start:

- pull request 29: - **SortableHead duplication**: extracted to `sortable-head.tsx`; all 3 list components now import from there. `course-types-list.tsx` drops from 204 to 173 lines.
- pull request 7: **(cleanup)** `sessions-calendar.tsx` at 170 lines — within the 200-line limit but worth watching.

