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
where seeds ran different rules than it shipped, four unreported. What it could not do is
prevent the gap — a promotion that skips the mirror stays silent until the condition the
missing rule covers occurs, so detection after the fact was the ceiling. One copy removes
the gap rather than watching it.

The cost is real. Seeds could decline to hold a webapp-only agent, and `ui-reviewer.md` sat
exempt on that reasoning. jig must hold every agent it ships, including ones it cannot run.

Directories no longer separate files with opposite sync rules, so the split moves to what it
always meant: live files under `.claude/` and `scripts/`, byte-identical everywhere, and
placeholders under `scaffold/`, which sync to nobody.

See also DEC-J003, which decides what governs `scaffold/` given it is compared to nothing.
