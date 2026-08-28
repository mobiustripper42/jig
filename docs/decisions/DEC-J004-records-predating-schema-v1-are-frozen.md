---
schema: 1
id: DEC-J004
title: "Records predating schema v1 are frozen by a generated baseline"
topic: "Decision record & dictionary discipline"
status: "active"
date: "2026-08-27"
ruling: "A record with no `schema:` key is skipped only if it is listed, unchanged, in `docs/decisions-baseline.txt`. Not listed fails; edited fails. Changing a legacy record means converting it to v1."
claims:
  - kind: "script"
    target: "scripts/gen-decisions-baseline.mjs"
  - kind: "script"
    target: "scripts/check-decisions.mjs"
    note: "`legacyVerdict`"
  - kind: "file"
    target: "CLAUDE.md"
revisit_if: "Converting a record proves so costly that legacy files go unfixed rather than being split."
---

## DEC-J004: Records predating schema v1 are frozen by a generated baseline

Omitting `schema:` was how a record opted out of every rule at once — the schema, the byte cap,
the lead-in check. Muster skips such records because its 158 predate the gate; jig failed them
because it has none. Neither could tell old history from a record written yesterday that forgot
the line, and jig's version made the gate un-adoptable by any repo with existing records.

The baseline is that distinction: ids and fingerprints, generated once at adoption. Not listed →
fails. Listed and unchanged → skipped. Listed and edited → fails, and the fix is conversion.

Getting on the list takes a diff somebody reads. Getting off it takes an edit.

Freezing is the half that works over time. A legacy corpus nobody may edit shrinks whenever
someone needs to touch it; one editable forever never does. Needing to change a legacy record is
the signal to convert it — splitting it if it turns out to be several decisions.

jig's baseline is empty, so it grandfathers nothing. Its strictness is now a fact about its
corpus rather than a branch hardcoded to one repo's history.

See also DEC-J005, which retires the other way a record used to change.
