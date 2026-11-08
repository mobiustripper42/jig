---
schema: 1
id: DEC-J028
title: "Tests assert behaviour, read copy from the catalog, and test a rule once"
topic: "Session workflow & skills"
status: "draft"
date: "2026-11-07"
ruling: "On its own judgement, @test-writer asserts what a caller or user sees, not style classes or structure; reads existing copy from the message catalog; and tests a rule's edge cases once, where it lives."
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

A read-only review of Haul's `main` at `bf2e89f` (2026-11-07) put deliberate edits into a copy of its code. Five injected bugs each broke between 2 and 9 tests. One button label change broke 35 tests in 5 files, and reordering a heading's style classes broke 7, mostly in Haul's `app/screens-unchanged.test.ts`. One cutoff rule was tested at three layers: Haul's `src/pickup-week.test.ts:19`, `src/signup.test.ts:171` and `app/supper-club/page.test.ts:432`.

A criterion that asks for a test still gets it; the rules govern what the agent adds by itself. A layer that uses a rule gets one accepted and one rejected case through it, and its own logic is tested as usual. Copy a task adds is asserted literally once, since its catalog entry does not exist yet. It is the test-side counterpart of DEC-J026's one home in code; see also DEC-J026.
