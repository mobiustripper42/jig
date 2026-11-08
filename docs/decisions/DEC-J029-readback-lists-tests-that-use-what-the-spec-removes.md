---
schema: 1
id: DEC-J029
title: "Readback lists the tests that use what the spec removes"
topic: "Session workflow & skills"
status: "draft"
date: "2026-11-08"
ruling: "@test-writer's readback searches the tests for every export, key, route, page or file the spec removes or renames; each use goes on Interfaces' Removes line as a deletion or a retarget, and write mode edits only the tests that line lists."
claims:
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "Removal check section; write-mode item 8"
  - kind: "file"
    target: ".claude/skills/build-task/SKILL.md"
    note: "Step 1, sorting a test that uses something removed; Step 2 check 1"
  - kind: "file"
    target: ".claude/skills/build-task/task-spec.md"
    note: "Interfaces, the Removes line"
revisit_if: "A /build-task run still Stops on a locked test that uses something the spec removed, or Removes lines fill with tests the task never touched."
---

## DEC-J029: Readback lists the tests that use what the spec removes

Nothing in readback asked which existing tests a change would break. A test that uses a removed
key passes today, is locked in Step 2, and fails once `@implementer` removes the key, which it may
not edit around, so the run Stops. Haul issue 97 Stopped twice this way (jig issue 113, first
item); Haul issue 101's spec asked for the search by hand.

So readback gains a Removal check, unfiltered, and the spec a Removes line. Each test found is
deleted when its behaviour goes, retargeted when it survives under a replacement, and put to the
operator when the spec doesn't say. Write mode may edit an existing test on purpose, but only one
Removes lists.

See also DEC-J023, the Reuse check this sits beside. Draft until the first `/build-task` run that
uses it (DEC-J020).
