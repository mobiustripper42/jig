# `check:context` (`scripts/check-context.mjs`)

Gathered 2026-11-04. The second-loop checker for issue #104. Raw evidence, with a citation on every row: `evidence/check-context.md`.

**Verdict against the issue's bar:**
- **Counts trace to cited records: met, and both counts are 0.** That measures the checker's scope, not a rate.
- **Cost totals from labels and git history alone: met in part.** Build points come from session `## Task` blocks, and three pieces aren't traceable.
- **Saving stated as a range: not met.** No incident in this class has a recorded price.

**The mistake it targets:** a context doc citing a path that doesn't exist.

**The incident it was built for is out of class.** Muster's context file said "Twilio/SMS = later swap" after the adapter had shipped, and a session filed muster issue 593 on the strength of it (muster `8e71451d`; `sessions/2026-07-28-1859-eric-main.md:114-118`). That is a description with no path in it. The checker says it can't catch that kind of claim (`scripts/check-context.mjs:25-28`).

## Dates

| Event | Citation |
|---|---|
| Written; on muster `main` | muster `8e71451d`; `fe8b0396` (pull request 595), 2026-07-28 |
| Into jig | jig `4cb09ae`, 2026-08-27 |
| Scope widened to skills and agents | jig `411c3e1`, 2026-08-27 |
| Scope widened to `§ Section` references | seeds `da3f567`, 2026-08-17 |
| Scope widened to `ui-context.md` | haul `b62d126`, jig `bf2d426`, 2026-11-02 |
| centerline, haul | `59f05b5` 2026-09-19, `6786cf1` 2026-10-25 |

## Before and after

| | Window | Pull requests (touching context docs) | Real dead paths in the docs it read |
|---|---|---|---|
| Before | muster, 2026-06-03 to 07-28 | 249 (28) | 0 |
| After | muster, 07-28 to 11-03 | 311 (60) | 0 |
| Gate from the start | jig / centerline / haul | 76 / 113 / 31 | 0 / 0 / 0 |

The counts come from re-running today's path rule at every commit on `main` (`evidence/check-context.md` § 2-3).

**The dead paths were all in docs it didn't read yet:**
- skills, such as `docs/DEPLOYMENT.md` in promote-production;
- `ui-context.md`, where muster's `app/reservations` lived for 79 days and 276 commits until the scope reached it on 2026-11-02;
- non-root paths it skips on purpose: the 2026-07-25 audit found 2 dead `VersionTag` paths in muster's `CLAUDE.md` and context file that the checker can't reach (audit `shard-F-workflow.md:31`).

**jig's blind spot:** jig shipped 3 dead citations its own gate couldn't see, because jig has the files: `scripts/keep-tape.mjs` (jig `5355c0e`), `docs/decisions/archive/` and `docs/decisions-baseline.txt` (fixed in jig `7e6932a`).

## Cost

**Build:** 3 points for the checker (muster `sessions/2026-07-28-1859-eric-main.md:139`). Extensions add up to 18, 6 of them in shared pull requests. Three pieces are **not traceable**: seeds pull request 159, seeds `57a546f` and jig pull request 1.

**Upkeep:**
- muster: 8 commits, 2 native.
- jig: 6 commits; 1 false-positive fix, 3 fixes for missed cases.
- seeds: 7 commits, 5 of them false-positive fixes.
- Of the 6 false positives, only one (gitignored paths, jig `28370b3`) fired on a context doc. The rest came through `check:docs`, which shares the path resolver.

**Running:** about 0.17 s per run, 1,219 runs in transcripts, about 3.5 minutes in total.

## Catches

18 episodes after excluding 13 false matches. Classified row by row:

| Episodes | Count | Counted as a catch? |
|---|---|---|
| C3, C7, C18 | 3 | **Yes**: a dead path in a context doc, fixed in the doc |
| C2, C5 | 2 | Partly: the doc was right; a directory was created to match it |
| C1, C4, C6, C13, C14, C15 (install half) | 6 | No: install, sync or migration stock, from 3 jig template defects |
| C9, C10, C11 | 3 | No: false positive, checker changed |
| C8, C15 (§ half), C16 | 3 | No: false positive worked around. Two of them removed a citation the checker could have checked |
| C12, C17 | 2 | No: probes |

Outside transcripts: the scope widening found 1 real dead path (jig `411c3e1`), seeds' first run 2 (seeds `sessions/2026-08-22-1236-eric-main.md:24`), and sheepdog's install 1. CI catches: 0.

**Corrected wording:** the ship commit's "16 flagged, 15 noise" (muster `8e71451d`) describes the checker's first draft, not its first run against the docs.

## Price

- **No incident in this class has a cost recorded for the mistake itself.**
- **The one cost on record is keep-tape:**
  - centerline copied 458 lines to go green and deleted them the same day (`1f16c8b`, `52a6036`);
  - jig spent 2 points fixing it (pull request 41) and 3 points on a new checker (pull request 48).

  That defect was caught downstream, not prevented.
- **The 79-day `app/reservations` escape:** it was loaded into `@ui-reviewer` prompts, but no wrong action was found. Recorded cost: 0.

## What this means

- **The checker's history is mostly its scope growing to reach where dead paths actually were.** Inside the scope of the day, it found almost nothing to catch.
- **Its real catches happen while docs are being written, and at install and sync,** where it catches jig's own template defects in downstream projects.
- **The class it was built for, wrong descriptions, is still unchecked.** Muster `22da9d4f` and `8dd6f5f2` are later examples.
