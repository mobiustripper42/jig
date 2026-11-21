# Review findings that cite a source file, by length band

## centerline

- merged pull requests into main fetched: 116; with a review section: 99
- finding units in review sections: 407; citing at least one source file: 47
- dropped as not a finding (a pass verdict or a not-run line, pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`): 3 (each listed below)
- excluded as being about length or splitting: 2 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 14

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | citations of a changed file | per 1,000 lines changed (changed files only, primary) | all citations, including files the pull request did not change | per 100 file-touches (all) | per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|
| on | <200 | 227 | 8119 | 11 | 1.35 | 16 | 7.0 | 1.97 |
| on | 200-400 | 33 | 2851 | 6 | 2.10 | 6 | 18.2 | 2.10 |
| on | >400 | 0 | 0 | 0 | 0.00 | 0 | 0.0 | 0.00 |
| off | <200 | 167 | 5266 | 12 | 2.28 | 18 | 10.8 | 3.42 |
| off | 200-400 | 39 | 2286 | 5 | 2.19 | 7 | 17.9 | 3.06 |
| off | >400 | 20 | 1966 | 3 | 1.53 | 3 | 15.0 | 1.53 |

Dropped as not a finding, pull request number and text start:

- pull request 161: - **Checked clean:** the stale-answer guard in `useAreas.ts`, a `choose` racing a reload, the chip and sheet visibility in `App.tsx` (recording, full map, Start, unfinished), leftover references to the old paths, and the
- pull request 117: Both fixes are correct and complete, with no regressions. It confirmed the two call sites are the only ones in the repo, that a Kotlin throw from `Recorder.read` reaches JS as an exception (so the catch is needed), and t
- pull request 23: Checked clean: the flag thresholds and the short-and-slow double-flag guard, the client/server boundary (`local-day.ts` has no imports at all, and nothing client-side reaches `season-report.ts` any more), `order by start

Excluded (length or splitting), pull request number and text start:

- pull request 70: 4. **Left.** `streets-map.tsx` is about 360 lines, over the ~300 convention; it was 349 before this task. A split into hooks is worth its own task.
- pull request 64: 3. **`streets-map.tsx` passed 380 lines** — the halo and framing moved to `app/map/chosen-halo.ts`; 349 lines now, the rest its existing concerns.

## soundings

- merged pull requests into main fetched: 62; with a review section: 42
- finding units in review sections: 149; citing at least one source file: 9
- dropped as not a finding (a pass verdict or a not-run line, pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`): 0 (each listed below)
- excluded as being about length or splitting: 0 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 10

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | citations of a changed file | per 1,000 lines changed (changed files only, primary) | all citations, including files the pull request did not change | per 100 file-touches (all) | per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|
| off | <200 | 118 | 6417 | 8 | 1.25 | 11 | 9.3 | 1.71 |
| off | 200-400 | 13 | 1556 | 2 | 1.29 | 2 | 15.4 | 1.29 |
| off | >400 | 1 | 435 | 0 | 0.00 | 0 | 0.0 | 0.00 |

## muster

- merged pull requests into main fetched: 672; with a review section: 454
- finding units in review sections: 1595; citing at least one source file: 256
- dropped as not a finding (a pass verdict or a not-run line, pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`): 9 (each listed below)
- excluded as being about length or splitting: 3 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 131

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | citations of a changed file | per 1,000 lines changed (changed files only, primary) | all citations, including files the pull request did not change | per 100 file-touches (all) | per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|
| on | <200 | 429 | 18238 | 7 | 0.38 | 12 | 2.8 | 0.66 |
| on | 200-400 | 194 | 9927 | 0 | 0.00 | 2 | 1.0 | 0.20 |
| on | >400 | 163 | 6412 | 0 | 0.00 | 0 | 0.0 | 0.00 |
| ~800 | <200 | 898 | 22848 | 54 | 2.36 | 138 | 15.4 | 6.04 |
| ~800 | 200-400 | 526 | 18064 | 43 | 2.38 | 72 | 13.7 | 3.99 |
| ~800 | >400 | 587 | 22254 | 72 | 3.24 | 118 | 20.1 | 5.30 |

Dropped as not a finding, pull request number and text start:

- pull request 1188: No findings. Checked: `RADIUS_TOKEN` against `rounded-box`, `rounded-t-box`, `rounded-full`, `rounded-none`, `rounded-lg`, `rounded-t`, `rounded-[5px]`, bare `rounded`, `sm:rounded-xl` and mixed strings; every pre-existi
- pull request 1018: **No blast-radius trigger.** No path in the diff matches the money, auth or migration rows of the project's table. Applying the fallback question rather than stopping at the path list: `app/(admin)/admin/shifts/**` is on
- pull request 868: **No blast-radius trigger.** `app/(admin)/admin/at-risk/` is on no row of the project's table, and the fallback question — does a number this produces reach a paycheck or an invoice — is no: what this code produces is a 
- pull request 866: **No blast-radius trigger.** `app/layout.tsx` is on no path in the project's table, and the fallback question — does a number this produces reach a paycheck or an invoice — is no. Skipped rather than clean.
- pull request 865: **No blast-radius trigger.** None of the three files matches a row in the project's table, and the only importers are seed scripts (`db/seed-reservation-dev.ts`, `db/seed-concurrent-dev.ts`, `src/reservations/seed-xola.t
- pull request 852: **@code-review — clean bill of health.** Verified the captain-only row needs no code branch: `deriveSeats` (`src/builder/derive.ts:32-42`) already iterated `manning.flatMap` generically, and nothing in `src/` or `app/` h
- pull request 753: No blast-radius trigger matched by path — no migration, no auth surface, no payment module. `/security-review` was run anyway because `checkout/page.tsx` computes a fare, and it established the fare is display-only, so n
- pull request 734: **No blast-radius trigger.** Per `.claude/CLAUDE-context.md` § Blast-Radius Triggers, none of the four path sets match this diff — no `stripe-payment.ts`, no `payment-config.ts`, no payroll or time-clock export, no auth 
- pull request 375: Clean bill of health (@code-review, verified line-by-line): `Filter`/`ShiftRow`/`canonicalIdOf` are byte-identical moves (only `export` added + import paths adjusted); `Mode`/`Scope` have a single source of truth with no

Excluded (length or splitting), pull request number and text start:

- pull request 1108: - **Not changed:** `reservation-detail-pane.tsx` is 1,035 lines. Splitting out `PaneActions` is a refactor with nothing to do with this change.
- pull request 786: It named one piece of standing debt without raising it as a finding: `calendar-view.tsx` was already 855 lines and mixes filtering, geometry and three card-render branches. This adds ~30 net lines to it rather than split
- pull request 375: - **Nit (non-blocking):** `shift-row.tsx` is 218 lines, 18 over the ceiling — mostly doc comments carried over verbatim. If it grows, split the split/merge action forms out of the render body.

## haul

- merged pull requests into main fetched: 117; with a review section: 82
- finding units in review sections: 457; citing at least one source file: 86
- dropped as not a finding (a pass verdict or a not-run line, pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`): 1 (each listed below)
- excluded as being about length or splitting: 11 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 66

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | citations of a changed file | per 1,000 lines changed (changed files only, primary) | all citations, including files the pull request did not change | per 100 file-touches (all) | per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|
| on | <200 | 549 | 14573 | 50 | 3.43 | 62 | 11.3 | 4.25 |
| on | 200-400 | 56 | 3862 | 19 | 4.92 | 20 | 35.7 | 5.18 |
| on | >400 | 78 | 4156 | 7 | 1.68 | 8 | 10.3 | 1.92 |

Dropped as not a finding, pull request number and text start:

- pull request 226: No findings. The dialog's `listWeekDue` call (`app/admin/weeks/page.tsx:347`) takes the same product, week and cutoff as the close action (`app/admin/weeks/actions.ts:43`). The mark's value is defined once, and `landing(

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
- dropped as not a finding (a pass verdict or a not-run line, pattern `checked clean|no blast-radius trigger|both fixes are correct|clean bill|no findings|not run\b|nothing to (fix|flag)`): 1 (each listed below)
- excluded as being about length or splitting: 2 (each listed below)
- path-like tokens that matched no source file at the merge commit (tests, docs, ambiguous basenames): 12

| rule | band | file-touches (source files changed, pull requests with a review section) | lines changed in them | citations of a changed file | per 1,000 lines changed (changed files only, primary) | all citations, including files the pull request did not change | per 100 file-touches (all) | per 1,000 lines changed (all) |
|---|---|---|---|---|---|---|---|---|
| on | <200 | 117 | 3881 | 14 | 3.61 | 20 | 17.1 | 5.15 |
| on | 200-400 | 34 | 1154 | 6 | 5.20 | 9 | 26.5 | 7.80 |
| on | >400 | 6 | 554 | 0 | 0.00 | 0 | 0.0 | 0.00 |

Dropped as not a finding, pull request number and text start:

- pull request 151: @code-review — clean bill on correctness (no RLS/auth/logic bugs; required-vs-optional split correctly gated behind `has_student_fields`). Addressed before opening: added the `required` prop the refactor had dropped from

Excluded (length or splitting), pull request number and text start:

- pull request 29: - **SortableHead duplication**: extracted to `sortable-head.tsx`; all 3 list components now import from there. `course-types-list.tsx` drops from 204 to 173 lines.
- pull request 7: **(cleanup)** `sessions-calendar.tsx` at 170 lines — within the 200-line limit but worth watching.

