---
schema: 1
id: DEC-J028
title: "Tests assert behaviour, read copy from the catalog, and test a rule once"
topic: "Session workflow & skills"
status: "draft"
date: "2026-11-07"
ruling: "@test-writer asserts what a caller or user sees, not style classes or structure; reads expected copy from the project's message catalog; and tests a rule's edge cases once, where it lives, with one wiring test per layer that uses it."
claims:
  - kind: "file"
    target: ".claude/agents/test-writer.md"
    note: "What a test asserts; reuse check, test-side form"
  - kind: "file"
    target: "scaffold/claude/CLAUDE-context.md"
    note: "Conventions: User-facing text slot"
revisit_if: "A bug reaches main that a deleted class, copy or duplicate-layer assertion would have caught."
---

## DEC-J028: Tests assert behaviour, read copy from the catalog, and test a rule once

A review of Haul on 2026-11-07 put deliberate edits into a copy of its code. Five injected bugs each broke between 2 and 9 tests, so the behaviour tests earn their keep. But one button label change broke 35 tests in 5 files, and reordering a heading's style classes, with no visible change, broke 7. One cutoff rule was tested at three layers. Those tests cost writing time and catch nothing a user would notice.

The rule mirrors DEC-J026's for code: one home for a rule, and the places that use it point at it. Each of the three parts gives way when a criterion is about the thing itself. The catalog's path is project-specific, so it lives in each project's `## Conventions`. See also DEC-J026.
