# Checker cost against saving: the worksheets

## Verdict: the pilot holds up, weakly

Issue #104 set its bar as two of three checkers meeting three conditions. The decision gate and `check:context` meet all three. **The full report is a Claude Doc: [What three checkers cost, and what they saved](https://claude.ai/artifact/WWBkMz5u2dthGwJSRL9YeF)** (2026-11-04). It is private to the operator until shared, and every number in it comes from the worksheets here.

The cost condition asks for points from labels and git history. Only one `points:N` label exists on this work, so the operator ruled on 2026-11-04 that session `## Task` blocks count as a cost source. All 29 session-block points cited in the worksheets were checked against their files. Each line holds the stated value, under the header of the task named.

| Checker | Counts trace to records | Cost from labels, git and session blocks | Saving as a range |
|---|---|---|---|
| Decision gate | met, muster only | met; jig's import is not traceable | weakly met: one priced escape |
| Permission denies | in part | not met: the first denies, `sed -n`, `sed -i` and the jig import have no points anywhere | not met: no priced escape |
| `check:context` | met; 0 before, 0 after | met; three small extensions are not traceable | weakly met: one priced escape |

**Weakly, because each saving rests on one priced escape.** Every saving range is an assumed band around a single anchor, and the full report has to lead with that.

**The rule for a priced escape**, applied the same way to every checker: a mistake of the checker's class reached a `main` where nothing caught it, and the task that fixed it recorded points. The decision gate has one: muster pull request 528 (1 point), before the gate existed. `check:context` has one: keep-tape, a dead citation jig's own gate couldn't see, fixed in jig pull request 41 (2 points). The denies have none.

### The method's limits

These limits carry into the full report.

1. **The price of an escape.** Each checker has at most one priced escape (above). The other incidents record lines reverted, hours of red `main`, or nothing. One anchor is not a price, so every saving range rests on an assumed band around it.
2. **A before rate.** No transcripts survive from before 2026-08-30, and every checker except the `git -C` denies (2026-10-07) shipped before that. Before-counts come from commits, session files, an audit or the seeds ledger. Those sources record defects that were found, not attempts, so a before and an after are rarely in the same unit (`01-calibration.md`).
3. **Build cost from labels.** One `points:N` label exists on all of this work (jig issue 91). Session `## Task` blocks carry the points instead, and work done before a repo had session files has none.

### What would make the next measurement stronger

These are proposals, not built:
- **When a mistake reaches `main`, record what fixing it cost.** For example, a field on the `## Task` block of the fix: what escaped, and the points. That is the missing price.
- **Keep transcripts past the month they last today,** or at least the denial and gate-failure lines from them. Without that, no checker shipped from now on will have a before.

### What the pilot found anyway

- **The `CLAUDE.md` § Scope Discipline quote couldn't be checked.** "Broken 11 times, 4 after" has no recorded source; the quote was replaced on 2026-11-04. The checkable pair on the same ledger row is 58 prose-rule breaks against a deny obeyed 7 of 7 (`01-calibration.md`).
- **Denies are rarely re-shaped, but similar tools get through.**
  - 2 of 1,290 denials were re-shaped within the next 3 calls to reach the same thing another way.
  - 59 retried the same denied command and were denied again.
  - `awk 'NR…'` did a file-range read 168 times. There is no count from before the deny, so whether it replaced `sed -n` is unknown.
  - `npm exec` ran 21 times in one session after `npx` denials. Most were installed tools, which the `npx` deny blocks as a false positive; 1 fetched an uninstalled tool (`03-permission-denies.md`).
- **Many red runs are not catches.**
  - Most of the decision gate's red runs are its own size rules (`02-decision-gate.md`).
  - About 190 of the 1,290 denials were false positives in the sense of a legitimate command denied, and about 215 were policy.
  - Of `check:context`'s 18 red episodes, 3 are catches (`04-check-context.md`).
- **`check:context` grew to where the dead paths were.** Inside its scope of the day it found 3 real dead paths in transcripts. The incident it was built for, a wrong description, is still out of its reach.

## The worksheets

Working files for issue #104: what a checker cost against what it saved. Each worksheet covers one checker and cites every number to a commit (`repo sha`), a CI run, a session-file line (on that repo's `origin/sessions` branch) or a transcript line. A number with no source says **not traceable**.

This directory is a record of findings as of the date on each file. It cites paths in other repos and in transcripts on the operator's machine, so `check:docs` does not scan it (`scripts/check-docs.mjs`, the `topLevel` rule).

### Order

The work ran in two loops. The first was a pre-pilot: the decision gate on its own, plus the calibration recount, to test whether the method produced numbers that hold up. The second added the permission denies and `check:context`, and decided the issue's "believable" bar. A third task wrote the full report from them.

| File | Checker | Loop |
|---|---|---|
| `01-calibration.md` | The `CLAUDE.md` § Scope Discipline result (prose rule against deny) | pre-pilot |
| `02-decision-gate.md` | `scripts/check-decisions.mjs` | pre-pilot |
| `03-permission-denies.md` | `permissions.deny` and `scripts/settings-policy.mjs` | second |
| `04-check-context.md` | `scripts/check-context.mjs` | second |

`evidence/` holds the raw evidence each worksheet summarizes, with a citation on every row. The evidence files mention helper outputs and scripts in a scratchpad; those were not kept. The counts can be rebuilt from the cited commits and files, but the grouping rules are described only in prose (for example, an episode is "same session, same record, under 1h apart").

### What limits every worksheet

- **No transcripts before 2026-08-30.** The oldest file in `~/.claude/tape` starts 2026-08-30, and the oldest in `~/.claude/projects/` starts 2026-10-04. seeds and soundings have none. So every "before" count comes from commits, session files, audits and observation files, never from tool calls. The calibration recount (`01-calibration.md`) is where this was found.
- **No `points:N` labels on any of the build work.** Build cost comes from the session `## Task` blocks' `**Points:**` lines instead.
- **Months, not years.** The gate has about three months of history after it shipped.
- **Transcript citations are not durable.** `~/.claude/tape/…:N` and `~/.claude/projects/…:N` are files on one machine, and older ones have already been lost (jig `0de60af`, "The tape is gone from this machine"). A catch cited only to a transcript line is checkable today, not necessarily later.
- **Prevention leaves no trace.** A mistake the gate stopped while a record was being written shows up only as a red run in a transcript, and only for the window transcripts cover.

### Who gathered it

Research agents gathered the evidence read-only on 2026-11-03 and 2026-11-04. The lead session spot-checked these citations against the repos: jig `625399c:docs/ANALYSIS.md:13-15`, seeds `70f3814:observations/LEDGER.md:36`, muster `ad3c04ab` and `41498b98`, muster `sessions/2026-07-27-1548-eric-main.md:56` and `sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362`. For the second loop: muster `fe8b0396` and `sessions/2026-07-28-1859-eric-main.md:139`; jig `28370b3`, `5355c0e` and `c8b37f9`; seeds `2f294d4`; seeds `LEDGER.md:42` (W10) and `:57` (W25).
