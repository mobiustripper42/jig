# jig — Decisions

Decisions about the fixture itself, each with an id (`DEC-J###`). The prefix is not decoration:
ids are burned and never reused, and the `J` keeps jig's record from colliding with a consuming
project's own `DEC-###` when both are open in one session.

**The corpus started empty on 2026-08-27.** Seeds' 52 records were binned rather than carried.
Across a full afternoon in seeds, one decision file was opened — the one just written — while
257KB sat unread and its claims still reached us laundered through `CLAUDE.md` and code comments
citing records nobody had opened. jig carries the *mechanism*, not the corpus.

**Every record here is schema v1.** `schema: 1` in frontmatter is what opts a record into
validation; a record without it is skipped as grandfathered, and jig has no grandfathered
records, so an unvalidated one is a mistake rather than history. The frontmatter carries the
structure — `ruling` is the one line a person reads, `claims` are what the record asserts about
the tree, and the body is under 2000 bytes because a decision that will not fit is more than one
decision.

**`revisit_if` is required here and optional in muster.** Nothing in schema v1 retires a record,
which is how 78% of muster's reservations corpus went dead while still being cited. The field
names the condition that makes a record worth re-opening, written so a person can tell whether it
has fired.

**One decision, one file.** Each lives at `docs/decisions/DEC-J###-<slug>.md`; this file is the
generated index. To add or change one, edit its file and run `npm run gen:decisions`;
`npm run check:decisions` fails the build if this index is stale, which is the actual fix for a
hand-maintained index's decay rather than remembering to regenerate it.

**A change to a decision goes IN that decision's file**, appended as a dated
`## Amendment, YYYY-MM-DD (who)` section. It is not a new decision and gets no id. A new id is for
a subject the record has no decision about yet. Two decisions that merely relate name each other
in plain **see also** prose the generator neither writes nor strips.

A decision that changes the spec declares it in frontmatter — `amends_spec: [{section, scope}]` —
and the pointer under that spec section's heading is generated from the declaration, so a claim
that never reached the spec is a red build rather than prose nobody cross-read.

## Index

### Template storage & distribution
- DEC-J001 — One copy — `.claude/` is the template jig ships

_**This file is GENERATED** by `npm run gen:decisions` —
edit `docs/decisions/DEC-*.md`, not this file. `npm run check:decisions` fails on a stale index, a
duplicate id, an unknown topic, an unlanded SPEC amendment, or a reference to a decision
that does not exist._
