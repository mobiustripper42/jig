---
schema: 1
id: DEC-J020
title: "A draft is rewritten in place; a built decision is superseded"
topic: "Decision record & dictionary discipline"
status: "active"
date: "2026-10-26"
ruling: "A record is `draft` until something is built on it, and a draft is rewritten in place. From the pull request that first builds on it, it is `active`, and a change of mind is a new record that supersedes it."
claims:
  - kind: "script"
    target: "scripts/check-decisions.mjs"
    note: "`supersessionProblems` rejects superseding a draft"
  - kind: "file"
    target: "docs/decisions/decision-record.schema.json"
    note: "`draft` in the `status` enum"
  - kind: "file"
    target: "CLAUDE.md"
supersedes:
  - DEC-J005
revisit_if: "Records are found edited in place after code was built on them, or drafts are left unflipped long after they ship."
---

## DEC-J020: A draft is rewritten in place; a built decision is superseded

DEC-J005 made every change of mind a new record. That is right once code depends on a decision,
because the chain says what the code was built against. Over a decision nothing implements, it is
noise. In Haul, the farm changed a refund rule (Haul's DEC-005) the day after it was written. The
session superseded it, and the operator reversed that, because nothing had been built on it yet.

A rewrite replaces the ruling, body and `revisit_if`. It never appends: DEC-J005's real target
was the dated `## Amendment` section, which grew records past the 2,000-byte cap, and that stays
retired. DEC-J004's freeze is unaffected, since a frozen pre-schema record is never a draft.

The gate can see a draft being superseded. It cannot see the flip to `active` being skipped, or an
active record edited in place. Those stay rules a session follows.
