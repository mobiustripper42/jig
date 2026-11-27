---
schema: 1
id: DEC-J039
title: "A browser run is not a standing step"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-27"
ruling: "No skill runs the finished feature in a real browser before shipping. A session does it only when the operator asks for one by name."
claims:
  - kind: "file"
    target: "docs/research/browser-run-trial/README.md"
    note: "The six-task trial in Haul and its sources"
revisit_if: "A class of defect that only a running browser catches is found more than once, by the operator or after a merge."
---

## DEC-J039: A browser run is not a standing step

Haul trialled one on six screen tasks, 2026-11-24 to 2026-11-27, by instruction and with no workflow
file changed (`docs/research/browser-run-trial/README.md`). 174 steps found 1 defect no test or
`@ui-reviewer` caught: a long unbroken value that made a page scroll sideways. The steps from the
"Verify by hand" section found nothing. `@ui-reviewer` caught what the run missed in three pull
requests, and the slow-network bugs were found by the operator. A run judges only what its checks
measure: one passed with the defect in its own screenshot. It took 7.5% of the six tasks' output
tokens and 11.3% of their active minutes.

The operator, 2026-11-27: "We can stop the browser runs."

The report's two proposals, a run limited to off-script cases and an e2e check for long values,
are not taken. If a run is asked for, its defects wait for `@ui-reviewer`'s report before they are
fixed, so the run's own count can be trusted.
