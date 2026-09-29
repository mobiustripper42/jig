---
schema: 1
id: DEC-J010
title: "A retro fits on one screen, and computes no rate"
topic: "Session workflow & skills"
status: "active"
date: "2026-09-28"
ruling: "/retro writes a numbers line, a 60-word account, the operator's take in one answer, and an @pm read capped at 120 words. It records points, days and drift and computes no rate."
claims:
  - kind: "file"
    target: ".claude/skills/retro/SKILL.md"
    note: "rewritten; throughput math and the three questions removed"
  - kind: "file"
    target: ".claude/agents/pm.md"
    note: "retro commentary is one paragraph, 120 words"
  - kind: "file"
    target: "scaffold/docs/PROJECT_PLAN.md"
    note: "phase table drops the throughput column"
revisit_if: "The operator starts forecasting a phase from past ones, or a retro's @pm read keeps hitting the cap with something worth saying."
---

## DEC-J010: A retro fits on one screen, and computes no rate

A centerline Phase 5 retro produced an @pm read of five long paragraphs. The one finding worth
keeping, that a vocabulary pass should precede the design mock, sat in the fourth. The operator
does not reread retros and works across several projects, so three separate questions asked from
memory got answers that were hard to give.

So the skill now writes its own short account of what happened first, as a reminder, then asks
one question, then caps the @pm read at a paragraph.

Throughput was the retro's headline and the reason it existed. The operator no longer wants a
velocity. Points, days and drift are still recorded, since they cost one line and cannot be
reconstructed later; any rate can be derived from them. Old retros stay as written.

`pm.md` is `context` class, so installed projects keep their own retro instructions until each is
edited by hand.
