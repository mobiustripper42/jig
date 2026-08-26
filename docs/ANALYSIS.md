# jig — working notes

Rebuild of `seeds`, started 2026-08-25. Notes as we go. Nothing here is final.

## Why

Seeds got unmaintainable. The specific failure: it kept growing prose — rules,
decision records, paragraphs in skills — and prose doesn't hold. Eric couldn't read
most of it, and Claude only read it when it felt like it.

Evidence from one afternoon, 2026-08-25:

- The `sed -n` **permission deny** fired 7 times across 4 repos and was obeyed every time.
- The DEC-S036 **prose rule** ("no new decision amends an old one") was broken 11 times,
  4 of them after it was written.
- Across a full afternoon working in seeds, Claude opened **one** decision file — the one
  that had just been written. Every useful citation came from `CLAUDE.md` or `git log`.

## The filter

**Does it work when nobody remembers it's there?**

Keep if yes. Bin if it's a paragraph hoping to be recalled at the right moment.

## Decided

| | |
|---|---|
| Name | `jig` — a fixture that makes the wrong cut impossible. The constraint is physical, not remembered. |
| Repo | Fresh: `mobiustripper42/jig`. Not a fork of seeds. |
| Decision records | **Binned.** All of them. Nobody read them. |
| Agents | Keep, **except `@doc-consistency` and `@ideas`** — never invoked in a month of transcripts. Not coming to jig. |
| Update scripts | **Keep.** Cost a lot to build and they work. |
| Dictionary | **New.** Every term used in any skill, agent or CLAUDE.md must be defined. One line per term. Eric approves each one. If it can't be defined in one line, use plain words instead. |

## Skills — first pass

| skill | call | note |
|---|---|---|
| `promote-production` | keep | works |
| `start-phase` | keep | works |
| `retro` | keep | works |
| `its-alive` | keep, strip down | Next Steps works and stays as-is |
| `its-dead` | keep, strip down | |
| `kill-this` | keep, strip down | |
| `pause-this` / `restart-this` | **review** | |
| `read-the-tape` | **review** | ~$2/session, produced little Eric could use |
| `workout` | **review** | its output was 20k characters nobody could read |

## Multi-dev support — remove

Added long ago, never used. One developer, and no second one is coming.

It isn't free. Seven files reference it, and the dev handle sitting in the middle of
session filenames (`YYYY-MM-DD-HHMM-<dev>-<slug>.md`) is what makes slug derivation
error-prone — `read-the-tape` Step 1.5 exists solely to explain "the slug is only the
part after the dev handle," written after it was got wrong on the first live run.

Drop it and: filenames become `YYYY-MM-DD-HHMM-<slug>.md`, the slug is everything after
the timestamp, Step 1.5 disappears, `~/.claude/devname` disappears, its-alive loses its
prompt-and-write branch, and `settings-policy.mjs` loses a check.

## Open questions

1. Dictionary format — decide after the deep dive, so it covers the terms jig actually needs.
2. Does the `dev/claude/` ↔ `.claude/` mirror split earn its keep?
3. What exactly gets stripped out of its-alive / its-dead / kill-this?
4. Is there a "don't re-do these" list worth carrying from the 52 binned decisions?
   Candidate: `Write()` permission rules do nothing — the harness ignores them and warns
   once per rule per session. `Edit()` covers all file-editing tools including Write.

## Carry over from elsewhere — don't lose these

- **Check-script updates being made in `muster` (2026-08-25/26).** Eric is improving check
  scripts there. Those need merging into jig's versions before jig ships. Don't let the
  muster copy become the only good one.

## Don't do surgery on seeds

Ripping tape/workout/dev-name out of seeds means editing ~35 files and amending a dozen
decisions to keep gates green — another afternoon on a system being replaced. In jig it
costs nothing: just don't carry them over.

Only action worth taking in seeds now: remove the `SessionEnd` hook from
`~/.claude/settings.json` so transcripts stop being copied to `~/.claude/tape-queue`.

## Size, measured 2026-08-26

Template is 52 files, 41,465 words.

| what | words |
|---|---|
| `CLAUDE.md` — loaded every session, every project | 6,576 |
| tape + workout | 8,084 |
| decision-record machinery | 6,199 |
| `check-context.mjs` + test — keep, works | 6,442 |
| the five keeper skills | 11,169 |

Binning tape, workout and decisions drops ~14,300 words — a third — before writing anything.

Still to question: `CLAUDE.md` at 6,576 words is the biggest single cost since it loads
every request.

`VELOCITY_AND_POKER_GUIDE.md` (1,951) — **keep.** Eric estimates when building specs and
project plans.

## What actually gets used — measured, not guessed

Invocations across 60 retained transcripts, 2026-07-26 → 2026-08-26:

```
/its-alive               60
/kill-this               47
/promote-production       3
/retro                    1
/doc-consistency-check    0
/ideas                    0
```

**`@doc-consistency` (1,450 words) and `@ideas` (1,138 words) have never been invoked** —
2,588 words shipped into every project for tools nobody has used in a month. Bin both
unless there's a reason to keep them.

`/retro` at 1 and `/promote-production` at 3 are low but plausible — they fire at phase
boundaries. Zero is the meaningful number, not "low."

**This test is mechanical and reusable:** count invocations in retained transcripts. It
beats judgment about what feels useful, and it works on jig later too.

## Next, in order

1. **Finish the doc-check scripts in muster**, then bring them over. They're the best
   thing in the system and the muster copy will be ahead.
2. **Look hard at `CLAUDE.md`** — 6,576 words, loaded every request in every project,
   and where all the prose rules that failed are living.
3. **Get the outside read from claude.ai chat** on seeds before jig sets its shape.

Not started until then.

## Deep dive — not started

One pass over evidence that already exists: 20 archived observations, today's transcript,
seeds' git history. Output is a two-column list — works / doesn't — with the incident behind
each row. A list, not a document. No new agent runs.
