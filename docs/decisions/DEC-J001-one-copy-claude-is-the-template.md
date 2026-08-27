---
schema: 1
id: DEC-J001
title: "One copy — `.claude/` is the template jig ships"
topic: "Template storage & distribution"
status: "active"
date: "2026-08-27"
ruling: "jig keeps one copy of every file it ships: `.claude/` is both what jig runs and what a project installs. Two copies plus a watcher made drift detectable; one copy makes it impossible."
claims:
  - kind: "script"
    target: "scripts/check-mirrors.mjs"
    note: "not carried — its subject was jig-vs-jig"
  - kind: "script"
    target: "scripts/drift.mjs"
    note: "carried — jig-vs-project is another question"
  - kind: "file"
    target: ".claude/agents/"
  - kind: "file"
    target: "scaffold/"
revisit_if: "A second file joins ui-reviewer in being shipped by jig but unrunnable inside jig itself."
---

## DEC-J001: One copy — `.claude/` is the template jig ships

Seeds held every dogfooded file twice — `dev/claude/` to ship, `.claude/` to run — and that
was not redundancy. A library that does not consume its own templates cannot see them fail.

`check-mirrors.mjs` earned its place against that design: its first run found five files
where seeds ran different rules than it shipped, four of them unreported. What it could not
do is prevent the gap. A promotion that skips the mirror stays silent until the condition
the missing rule covers occurs, so detection after the fact was the ceiling. One copy
removes the gap rather than watching it, and continues DEC-S049, which deleted seeds'
exemption from its own shell because a template library plus one fork is not one.

The cost is real. Seeds could decline to hold a webapp-only agent, and `ui-reviewer.md` sat
exempt on that reasoning. jig must hold every agent it ships, including ones it cannot run.

Directories no longer separate files with opposite sync rules, so the split moves to what it
always meant: live files under `.claude/` and `scripts/`, byte-identical everywhere, and
placeholders under `scaffold/`, which sync to nobody.

## Amendment, 2026-08-27 (eric) — scaffolds need a linter, not a differ

**What this changes, and what still stands.** One copy stands, and so does every argument for it:
`check-mirrors.mjs` is still not carried, `drift.mjs` still answers jig-vs-project, and the live
files above are still shipped bytes rather than a mirror of them. What changes is one supporting
claim — that scaffolds, being compared to nothing, therefore need no mechanism. Being compared to
nothing is true. "Therefore no mechanism" does not follow, and reading it that way left
`scaffold/` outside every gate on the day it was created.

**Three defects found by hand the same afternoon, none of them drift between copies.** Each was
the scaffold disagreeing with jig itself: eleven `npx` invocations in the context template while
the shell denied `Bash(npx *)` fleet-wide and named that exact shape as the trap; `Hrs/Pt` columns
on a velocity model retired for throughput; and `AGENTS.md` plus `CHEATSHEET.md` documenting five
skills and three agents jig does not ship, including two retired before the rebuild began.

Three finds in one session, all by someone happening to grep, is the write-only corpus this repo
was built to stop — relocated to a new directory.

**So scaffold is linted against jig rather than diffed against a copy.** `scaffold/docs` joins
`check-docs`, whose roster check already compared skills and agents to disk in both directions and
had simply never been pointed there. `check-denied.mjs` is new and asserts that no shipped document
spells a command the permission policy denies — the `npx` case, which had no home.

**Cost, stated plainly:** a scaffold is no longer free to say anything. A placeholder that names a
skill jig retired now fails the build, which is the point, and it means retiring a skill is a
change to the scaffolds too.
