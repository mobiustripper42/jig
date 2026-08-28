---
schema: 1
id: DEC-J003
title: "Scaffolds are linted against jig, not diffed against a copy"
topic: "Template storage & distribution"
status: "active"
date: "2026-08-27"
ruling: "A scaffold is compared to nothing, which is correct, but that does not mean it needs no mechanism. `scaffold/` is gated by the checks that read jig itself."
claims:
  - kind: "file"
    target: "scaffold/"
  - kind: "script"
    target: "scripts/check-denied.mjs"
    note: "new — asserts no shipped document spells a denied command"
  - kind: "script"
    target: "scripts/check-docs.mjs"
    note: "its roster check pointed at scaffold/docs"
revisit_if: "A scaffold needs to say something jig itself denies, and the exemption has nowhere to live."
---

## DEC-J003: Scaffolds are linted against jig, not diffed against a copy

DEC-J001 established that placeholders under `scaffold/` sync to nobody, and a supporting claim
rode along with it: being compared to nothing, they therefore need no mechanism. The first half
is true. The second does not follow, and reading it that way left `scaffold/` outside every gate
on the day it was created.

Three defects were found by hand in one afternoon, none of them drift between copies. Each was
the scaffold disagreeing with jig itself: eleven `npx` invocations while the shell denied
`Bash(npx *)` fleet-wide and named that exact trap; `Hrs/Pt` columns on a velocity model retired
for throughput; and two docs listing five skills and three agents jig does not ship.

Three finds in one session, all by someone happening to grep, is the write-only corpus this repo
exists to stop — relocated to a new directory.

So `scaffold/docs` joins `check-docs`, whose roster check already read disk both ways and had
never been pointed there. `check-denied.mjs` asserts that no shipped document spells a denied
command, which is where the `npx` case had no home.

The cost: a scaffold is no longer free to say anything, so retiring a skill is a change to the
scaffolds too.
