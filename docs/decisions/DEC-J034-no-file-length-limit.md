---
schema: 1
id: DEC-J034
title: "@code-review has no file-length limit"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-21"
ruling: "@code-review no longer flags a file for its length. No number replaces the ~200 lines; the operator re-runs the length analysis when they choose."
claims:
  - kind: "file"
    target: ".claude/agents/code-review.md"
    note: "What to Check: the length item is gone"
  - kind: "file"
    target: "docs/research/file-length/README.md"
    note: "The evidence"
revisit_if: "A re-run of the length analysis finds a length past which cost climbs in more than one repo."
---

## DEC-J034: @code-review has no file-length limit

The ~200-line flag had no evidence behind it. The research in `docs/research/file-length/` (issue
134) found that where the rule was off — Centerline after 2026-10-04, Soundings after 2026-06-13,
and Muster's ~800 period — files of 200 to 400 lines drew no bigger share of fix commits among the
commits that modified them, and no more review citations per line changed, than shorter ones.
Counting every commit, 200 to 400 is slightly higher in all three windows; the gaps are small.
Above 400 the data cannot say. Two windows lean higher: Centerline (0.29 against 0.19 under 200) has
only 3 files there, and in Muster (0.20 against 0.15, 37 files) length cannot be separated from
file type. Haul and earlier Muster, with the rule on, lean the other way. So no other number earned
the place. With the rule on, Haul still grew from 1 file over 200 lines to 24 in three weeks.

No item in jig's list now looks for a long file or one that mixes concerns. A project's own
Conventions, which the list checks, may. `code-review.md` never syncs
(`.claude/file-classes.yaml`), so this reaches new installs only; an existing project drops the
rule by its own pull request. The operator re-runs the analysis on a month of their choosing.
Searched "oversized", "line limit" and "200 lines": nothing.
