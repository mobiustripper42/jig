---
schema: 1
id: DEC-J005
title: "Amending a record in place is retired"
topic: "Decision record & dictionary discipline"
status: "active"
date: "2026-08-27"
ruling: "A change of mind is a new record carrying `supersedes`, and the old one flips to `status: superseded`. Appending a dated `## Amendment` section to an existing record is retired."
claims:
  - kind: "script"
    target: "scripts/check-decisions.mjs"
    note: "`beforeAmendments` deleted; `sizeOf` measures the whole file"
  - kind: "file"
    target: "docs/decisions/decision-record.schema.json"
    note: "`status`, `supersedes`, `superseded_by` — the replacement, already enforced"
  - kind: "file"
    target: "CLAUDE.md"
revisit_if: "A superseded chain gets long enough that nobody walks it, or the first link is routinely missed."
---

## DEC-J005: Amending a record in place is retired

Amendments existed to keep a subject's history in one file. That is not what happened, and the
convention fought everything around it.

A record grows monotonically under amendment while the cap says 2,000 bytes. So `sizeOf` needed
a carve-out to subtract amendment sections; the carve-out needed a fence-aware scanner, because a
bare match truncated at the first such line anywhere; and a record that merely *quoted* the
convention still measured 21 bytes, escaping the cap and the lead-in rule both.

The replacement was already built and already enforced. `status`, `supersedes` and
`superseded_by` are in the schema, and the gate checks that a `superseded_by` points at a live
record. Amendments were a second way to do something the schema did properly.

Retiring them is also what lets DEC-J004 freeze legacy records: a convention requiring records to
be edited cannot coexist with one forbidding it.

The cost is that a subject is read across a short chain rather than one file. That is affordable
only because records stay small, which is the same reason the cap exists.
