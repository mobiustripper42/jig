---
schema: 1
id: DEC-J031
title: "A supersede chain is allowed if it ends at a live record"
topic: "Decision record & dictionary discipline"
status: "active"
date: "2026-11-12"
ruling: "A record's `superseded_by` may name a record that is itself superseded, provided following the links ends at an `active` or `draft` record. A chain that ends at a `withdrawn` record, or loops, fails."
claims:
  - kind: "script"
    target: "scripts/check-decisions.mjs"
    note: "`supersessionProblems` checks each link, and walks `superseded_by` for loops"
revisit_if: "A chain grows past three or four links and reading a subject across it is the cost people name, or a project rewrites an old link to skip a step."
---

## DEC-J031: A supersede chain is allowed if it ends at a live record

The gate rejected a `superseded_by` that named a retired record, so a project with a two-step
history had to rewrite the older record's link to name the newest. Haul hit it: DEC-005 was
superseded by DEC-032, which was superseded by DEC-033, and the gate would only pass DEC-005
naming DEC-033, a replacement that never happened.

DEC-J020 makes chains: a built decision is superseded, not edited, so the next change of mind
supersedes a record that already superseded one. DEC-J005, itself superseded by DEC-J020, is where
reading a subject across a short chain was first accepted.

The rule stays per link. Each record's own link is checked when the gate reaches it, reciprocity
included, so a failure is reported once, on the file that needs editing. `withdrawn` means nothing
replaced it, so a chain ending there lands a reader nowhere and fails, as a single link to one did.
A loop fails once, on its lowest id. Length is not capped; `revisit_if` watches for long chains.

See also DEC-J020, which produces chains, and DEC-J005, which first accepted them.
