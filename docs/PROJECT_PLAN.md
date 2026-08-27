# jig — Project Plan

Rebuilding the workflow system as a fixture. `docs/ANALYSIS.md` holds the reasoning and the
measurements; this file holds the work.

Phases here are units of migration, not release milestones. jig develops straight to `main` with
limited ceremony — it ships the task-branch/PR flow and does not use it on itself — so a phase
closes when its work is done and `/retro` runs, without PRs to merge.

## Estimation Method

Fibonacci points, 2/3/5/8/13, sized by review burden and risk rather than hours. Throughput is
points per calendar week, computed by `/retro` from GitHub issue dates and `points:N` labels.
Most solo phases close inside one week and record as `burst` instead of a rate — see
`docs/VELOCITY_AND_POKER_GUIDE.md`.

## Phase 1: Foundations — CLOSED 2026-08-27

The decision, the gates, and the always-loaded surface.

| # | Task | Points | Notes |
|---|---|---|---|
| 1.1 | DEC-J001 — one copy, `.claude/` is the template | 5 | Schema v1, `revisit_if` required |
| 1.2 | Decision + dictionary gates from muster | 3 | 11 scripts, two fixes on the way in |
| 1.3 | `settings-policy.mjs` + `drift.mjs` from seeds | 8 | Real adaptation, not a rename |
| 1.4 | `CLAUDE.md` — the four moves | 5 | 6,576 → 3,528 words |
| 1.5 | `CLAUDE-context.md`, both halves | 3 | Surface 13,053 → 4,795 |
| 1.6 | Remove the tape from this machine | 2 | Hook, script, 86 MB queue |
| 1.7 | `AskUserQuestion` becomes a deny | 2 | Prose rule that worked occasionally |

**Closed:** 24 pts.

## Phase 2: Skills and agents

The seven skills and four agents, byte-identical to what ships.

| # | Task | Points | Notes |
|---|---|---|---|
| 2.1 | `/its-alive` | 5 | Makes the policy check automatic rather than remembered |
| 2.2 | `/kill-this` | 5 | Blast-radius triggers, `@code-review` wiring |
| 2.3 | `/its-dead` | 3 | Strip per ANALYSIS.md |
| 2.4 | `/start-phase`, `/retro` | 5 | `/retro` needs the DEC-S026 throughput model, not the retired one |
| 2.5 | `/bump-major`, `/promote-production` | 3 | Both work; carry as-is |
| 2.6 | Four agents — architect, code-review, pm, ui-reviewer | 3 | Descriptions go project-agnostic so no substitution is needed |
| 2.7 | `docs/AGENTS.md` — the canonical spec | 2 | Written 2026-08-27, ahead of the files it describes |
| 2.8 | Rewrite `scaffold/docs/AGENTS.md` and `CHEATSHEET.md` | 3 | **Known wrong today.** Both still document `@doc-consistency`, `@tape-reader`, `/read-the-tape`, `/pause-this` and `/restart-this` — every project installing them gets a roster of things jig does not ship. Same defect class as the `npx` contradiction, found the same way |

## Phase 3: The dictionary and the ceiling

| # | Task | Points | Notes |
|---|---|---|---|
| 3.1 | `docs/dictionary.yml` — jig's own, no grandfathering | 5 | No baseline file; the gate runs at full strength |
| 3.2 | `.claude/doc-check.json` | 2 | Unblocks `check:docs`, which currently crashes on import |
| 3.3 | Repoint the muster-coupled tests at jig fixtures | 3 | 4 of 120 still red |
| 3.4 | The word ceiling | 5 | Fails the build. Enumerates the always-loaded set rather than hardcoding paths, or the escape is a third file |

## Phase 4: muster to v6

One pass, at a muster phase boundary, driven by `drift.mjs`. Muster is at seeds-version 5 and
carries seeds' `CLAUDE.md` byte-identical, plus four skills jig does not ship.

| # | Task | Points | Notes |
|---|---|---|---|
| 4.1 | Enumerate what muster owes | 2 | `node scripts/drift.mjs ../muster` |
| 4.2 | Shell, context, skills, agents | 5 | Remove read-the-tape, doc-consistency-check, pause-this, restart-this |
| 4.3 | Three script fixes muster is behind on | 2 | jig is upstream now |
| 4.4 | `.claude/jig-version` | 2 | Retire `.claude/seeds-version` |

## Not V1

- **A fleet ledger.** Designed and deliberately not built: it answers the state of a box you are
  not sitting at, and a hand-maintained record of last-known state is the artifact this repo has
  already watched rot. Each machine checks itself instead.
- **Reviving the Routine.** Scheduled sync is gone and its config with it.
- **A second template family.** Seeds carried `domain/` for four months holding one README.
- **Multi-dev support.** One developer, and no second one is coming.

## Throughput

Filled by `/retro` at each phase close. Points per calendar week, or `burst` for a phase that
opens and closes inside one week, reported beside the estimate-calibration tally — throughput
alone rots, because if points quietly shrink it rises while nothing got faster.

| Phase | Closed | Points | Span | Throughput | Re-estimated | Net drift |
|---|---|---|---|---|---|---|
| 1 | 2026-08-27 | 24 | burst (<1d) | burst — 24 pts in one session | — | — |
