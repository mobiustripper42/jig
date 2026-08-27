# jig — SPEC

Placeholder. jig has no spec content yet; `docs/ANALYSIS.md` is where the thinking lives
while the shape is still being decided.

This file exists so the DEC→SPEC leg has somewhere to point. `check-decisions.mjs` treats a
missing SPEC as "no spec amendments possible" and stays green, which is the wrong kind of
green — the leg would be silently unavailable rather than empty. A record claiming
`amends_spec: §1.1` fails today with "not a numbered section" instead of passing unnoticed.

## 1. What jig is

A fixture. The constraint is physical, not remembered — a rule that only works when someone
recalls it at the right moment is a rule this repo does not keep.

jig replaces `seeds`, which failed by growing prose faster than anyone could read it. The
filter every mechanism here has to pass: **does it work when nobody remembers it's there?**

## 1.1 What replaces this file

Sections get written when there is a mechanism to describe, not before. An empty numbered
heading added in advance is the same defect as a decision record nobody opens.
