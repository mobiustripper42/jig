# Checker cost against saving: the worksheets

Working files for issue #104: what a checker cost against what it saved. Each worksheet covers one checker and cites every number to a commit (`repo sha`), a CI run, a session-file line (on that repo's `origin/sessions` branch) or a transcript line. A number with no source says **not traceable**.

This directory is a record of findings as of the date on each file. It cites paths in other repos and in transcripts on the operator's machine, so `check:docs` does not scan it (`scripts/check-docs.mjs`, the `topLevel` rule).

## Order

The work runs in two loops. The first is a pre-pilot: the decision gate on its own, plus the calibration recount, to test whether the method produces numbers that hold up. The second loop runs only if the first passes. It adds the permission denies and `check:context`, and decides the issue's "believable" bar.

| File | Checker | Loop |
|---|---|---|
| `01-calibration.md` | The `CLAUDE.md` § Scope Discipline result (prose rule against deny) | pre-pilot |
| `02-decision-gate.md` | `scripts/check-decisions.mjs` | pre-pilot |

`evidence/` holds the raw evidence each worksheet summarizes, with a citation on every row. The evidence files mention helper outputs and scripts in a scratchpad; those were not kept. Each can be regenerated from the commands the evidence files describe.

## What limits every worksheet

- **No transcripts before 2026-08-30.** The oldest file in `~/.claude/tape` starts 2026-08-30, and the oldest in `~/.claude/projects/` starts 2026-10-04. seeds and soundings have none. So every "before" count comes from commits, session files, audits and observation files, never from tool calls. The calibration recount (`01-calibration.md`) is where this was found.
- **No `points:N` labels on any of the build work.** Build cost comes from the session `## Task` blocks' `**Points:**` lines instead.
- **Months, not years.** The gate has about three months of history after it shipped.
- **Prevention leaves no trace.** A mistake the gate stopped while a record was being written shows up only as a red run in a transcript, and only for the window transcripts cover.

## Who gathered it

Research agents gathered the evidence read-only on 2026-11-03 and 2026-11-04. The lead session spot-checked these citations against the repos: jig `625399c:docs/ANALYSIS.md:13-14`, seeds `70f3814:observations/LEDGER.md:36`, muster `ad3c04ab` and `41498b98`, muster `sessions/2026-07-27-1548-eric-main.md:56` and `sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362`.
