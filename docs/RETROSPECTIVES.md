# jig — Phase Retrospectives

Written at each phase boundary by `/retro`. Format per entry: throughput + calibration, scope
changes, what worked, what didn't.

Throughput is points per calendar week, or `burst` for a phase that opens and closes inside one
week. It is never reported without the calibration tally beside it: if points quietly shrink,
throughput rises while nothing actually got faster.

---

## Phase 1 — Foundations
**Closed:** 2026-08-27
**Sessions:** 1

### Throughput

| Metric | Value |
|--------|-------|
| Points | 24 |
| Span | <1 day |
| Throughput | `burst` — 24 pts in one session |
| Re-estimated | 0 tasks |
| Net drift | 0 pts |

A sub-week denominator explodes into nonsense, so no per-week rate is quoted. The point total and
span are the honest record.

### Scope Changes

Two tasks were not in the plan and were added mid-phase, both because a check found something
rather than because anyone decided to look:

- **1.6** Remove the tape (2 pts) — the hook check was written first and reported a queue growing
  on a machine nobody was watching.
- **1.7** `AskUserQuestion` deny (2 pts) — raised as a prose rule that "works occasionally."

Original estimate 20 pts, final 24.

### What worked

**Writing the check before the removal.** The tape hook had been a note in ANALYSIS.md since
2026-08-26 and grew two more transcripts while being one. Converting it to a check produced a
report that argued for its own fix, and the removal followed within the hour. That is the repo's
own rule — *an observation becomes a check, a deny, or a median-gap line, or it stays a note* —
run end to end for the first time.

**Reading the decisions before proposing structure.** The one-copy design was argued first from
`check-mirrors.mjs`'s comments, which read as a log of four silent failures. The decision records
showed the opposite: the check *found* those failures, and each addition to it was a measured
sharpening. The conclusion survived; the argument for it was wrong and had to be rebuilt on
DEC-S049's reasoning instead. Cost: one round trip. Not reading them would have cost the design.

**Gates catching template defects the moment jig became a consumer.** `check:context` found six
dead references in its first run. That is DEC-S049's whole thesis — a library that does not
consume its own templates cannot see them fail — arriving on schedule.

### What didn't

**Counting things wrong, twice, in the same directory.** The tape queue was reported as 6 items
when it held 4, then `drained/` as 5 files when it held 24. Both came from reading a truncated
listing as if it were complete. The first number was quoted back as evidence the queue had grown
during the session, which was a claim about a real thing inflated by 50%, produced by the check
written to make the problem visible. Fixed in the check; the habit is the actual finding.

**A guard whose own comment named the assumption it then broke.** `prune()` sorted backups by name
"safe only because the names are fixed-width ISO-8601" — and a hand-made
`settings.json.pre-jig-hook-removal.bak`, created in the same session, sorted last and would have
held a keep-slot while a real backup was deleted. Writing the assumption down did not stop it being
violated eleven minutes later.

**Stale prose survives longer than anyone expects.** Three separate instances, all shipped and all
believed: a comment declaring a parser blocker fixed in the very next commit; the `/retro` row
describing a velocity model DEC-S026 retired; and a context template carrying eleven `npx`
invocations while the shell denied `npx` fleet-wide and named that exact trap. None announced
itself. This is the argument for jig restated as evidence.

### Forecast

Phase 2 is 26 pts across seven tasks with no unknowns — the skills exist and work; the job is
stripping and carrying. Phase 3's ceiling task (3.4) is the one with real design left in it.
