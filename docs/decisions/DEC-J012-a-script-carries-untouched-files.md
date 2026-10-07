---
schema: 1
id: DEC-J012
title: "A script carries untouched jig files into a project; a person still merges"
topic: "Template storage & distribution"
status: "active"
date: "2026-10-07"
ruling: "scripts/sync.mjs may replace or remove a project's file only when its bytes match a version jig once shipped at that path. Anything else is held for a session."
claims:
  - kind: "script"
    target: "scripts/sync.mjs"
    note: "the dry run; issue #72 adds the write half"
  - kind: "file"
    target: ".claude/CLAUDE-context.md"
    note: "the sync checklist and the median-gap row"
revisit_if: "A sync carries a file that should have been held, or held files are most of a typical sync."
---

## DEC-J012: A script carries untouched jig files; a person still merges

The context file said there would never be a sync script. Seeds built one three times and retired
each (seeds' DEC-S038 and DEC-S040): an unattended classifier could not tell an improvement from a
stale project, and every fix narrowed its scope until only trivially copyable files were left.

Those files are the whole scope here, and the test for them is a lookup, not a judgment. A project
copy that matches a version in jig's history is one nobody edited. There is no hunk merging. The
generation gate holds one file, never a whole repo, which was the gate that blocked two unrelated
`cp`s in seeds. A pull request stays the checkpoint, and the write half opens one only after the
target's own gates pass.

`drift.mjs` stays an enumerator. See also DEC-J001.
