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
- Across a full afternoon working in seeds, Claude opened **one** decision file — the one just
  written. Every useful citation came from `CLAUDE.md` or `git log`. The corpus was write-only:
  257KB produced and never read. Its false claims still reached us, laundered through
  `CLAUDE.md` and code comments citing records nobody opened.

## The filter

**Does it work when nobody remembers it's there?**

Keep if yes. Bin if it's a paragraph hoping to be recalled at the right moment.

## Decided

| | |
|---|---|
| Name | `jig` — a fixture that makes the wrong cut impossible. The constraint is physical, not remembered. |
| Repo | Fresh: `mobiustripper42/jig`. Not a fork of seeds. |
| Seeds' 52 decision records | **Binned.** Nobody read them. Not carried to jig. |
| Decision records as a mechanism | **Kept, gated.** Schema v1 + dictionary gate, both being built in muster. Jig carries the mechanism, not the corpus. `DEC-J` prefix; ids burned, never reused. |
| Agents | Keep, **except `@doc-consistency` and `@ideas`** — never invoked in a month of transcripts. Not coming to jig. |
| Update scripts | **Keep.** Cost a lot to build and they work. |
| Permission policy (`settings.json` + `settings-policy.mjs`) | **Keep, mostly as-is.** Master list plus the check that compares each machine against it. Caught the `sed -i` addition the day after it merged, with nobody remembering to look. |
| Dictionary | **New.** Every term used in any skill, agent or CLAUDE.md must be defined. One line per term. Eric approves each one. If it can't be defined in one line, use plain words instead. |
| "Don't re-do these" list | **No.** A list of warnings is prose hoping to be recalled — fails the filter. Items become checks or they don't come. The `Write()`/`Edit()` finding becomes a check in `settings-policy.mjs`. |
| Expiry | **Required.** 78% of muster's reservations corpus was dead because nothing retired anything. `revisit_if` is mandatory; the build fails when its condition fires. This is the gap schema v1 doesn't close. |
| Branch freshness | **New check.** Fails when the working branch's base isn't current `origin/main`. Cost: an afternoon of evidence gathered against a 24-commit-stale tree, 2026-08-26. |
| jig's own branching | **Straight to `main`.** Limited ceremony for notes and template edits. jig ships the task-branch/PR flow; it does not use it on itself. |

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

1. ~~Dictionary format~~ — **decided, in muster.** `docs/dictionary.yml`, three keys per entry
   (`term` / `says` ≤160 chars / `not:` forbidden alternates), generated `DICTIONARY.md`,
   `check-dictionary.mjs` in `verify`, scoped to SPEC + decisions + `CLAUDE.md` with a frozen
   grandfather baseline. Shipped 2026-08-26. This unblocks the `CLAUDE.md` rewrite.
2. ~~Does the `dev/claude/` ↔ `.claude/` mirror split earn its keep?~~ — **DEC-J001.** No.
   One copy: `.claude/` is the template. `check-mirrors.mjs` does not come over; `drift.mjs`
   and type-gating do, because jig↔project is a different question and survives intact.
3. What exactly gets stripped out of its-alive / its-dead / kill-this?

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

## The always-loaded surface — measured 2026-08-27

| file | words |
|---|---|
| `CLAUDE.md` | 6,576 |
| `.claude/CLAUDE-context.md` | 6,477 |
| **total loaded every session** | **13,053** |

The context file is the same size as the shell and we had not been counting it. Cutting
`CLAUDE.md` alone gets you halfway at best.

### Two tests, applied per paragraph

1. **Could a script produce this?** If yes, cut it and leave the command. Inventory rots;
   `ls` does not.
2. **Is this needed every session, or once?** Procedures — setting up a new project, moving
   files between repos — are needed once and loaded sixty times a session.

### CLAUDE.md — four moves

1. **Mechanism-backed prose collapses to one line.** `sed -n` (~200 words), `npx` (~250),
   `env.example` (~150), Decision Record (~900) all explain enforcement that already fires
   without being read. **~1,400 words out, relocated nowhere.** The deny works regardless,
   and `git log -S '<rule>' -- settings.json` returns the reasoning if anyone ever asks.
2. **Dead machinery goes with the skills** — read-the-tape, @workout, @doc-consistency,
   @ideas, @tape-reader, the dev handle, the "workflow fixes don't get made here" route,
   the SessionEnd narration. Several hundred words, free.
3. **Add the section that doesn't exist: where this repo differs from the median.** The only
   genuinely new content. Entry test: *would a competent default do the wrong thing here?*
   "Formatting is not chained to typecheck" passes. "Trust my statements the first time"
   fails — a preference, not a divergence, which is why it keeps losing. Starts nearly
   empty and grows one incident at a time.
4. **Upgrade the evidence rule** to: *an observation becomes a check, a deny, or a
   median-gap line — or it stays a note.*

**The ceiling makes move 4 stick.** A word limit that fails the build, covering the whole
always-loaded surface — not one file, or the escape is moving prose across the boundary and
going green. The check must **enumerate** what's loaded rather than hardcode two paths, or
the next escape is a third file. Set the number **after** the cut, at the landing point plus
~10%. Guessing it now permits regrowth.

What survives is the residue with no mechanism: Approval Before Action, the step-8 STOP,
cost phrasings, scope discipline, cite-facts-label-proposals. Keep them, keep them short,
and accept they are the part that gets broken.

### CLAUDE-context.md — seeds, same tests

| section | words | call |
|---|---|---|
| Setting Up a New Dev Project | 1,179 | cut — procedure, needed once |
| The Workflow System | 987 | cut — inventory of skills, `ls .claude/skills/` |
| The Learning Loop | 966 | cut — binned |
| Moving Files Between Seeds and a Project | 635 | cut — procedure |
| Repo Layout | 512 | cut — `ls` |
| Mirrors | 447 | cut — `check-mirrors.mjs` prints it |
| The Routine — OFF | 131 | cut — describes a thing that does not exist |
| Commands | 117 | cut — `package.json` |
| Seeds' Own Decision Record | 104 | cut — binned |

**5,078 words, 78%,** before touching anything judgment-shaped. Survivors: what the project
is, Stack, Workflow Mechanisms (the slots), Blast-Radius Triggers, Conventions, Workflow
Notes, Migration Protocol, Additional Docs. Lands ~1,200 from 6,477.

Seeds is the worst case because it is the repo *about* the workflow, so describing the
workflow feels like describing the project. It is not. `ls` describes the project.

## Loose ends — open at 2026-08-27

- `CLAUDE.md` + `CLAUDE-context.md` edits — jig **and** muster. Planned, not started.
- ~~Check scripts: muster is ahead~~ — **done for the doc gates.** decisions, dictionary,
  context and docs checks plus their tests are in `scripts/`, from muster's copies. Still
  owed: `settings-policy.mjs`, `drift.mjs`, `check-mirrors.mjs` (**not coming** — DEC-J001).
- Dev name: removed in jig by omission.
- ~~**`settings-policy.mjs --write` leaves timestamped `.bak` files**~~ — `.gitignore` covers
  `*.bak` from the first commit. The script itself is not carried over yet.
- **SessionEnd capture hook still installed** — already queued another session since the
  drain. Remove it or accept the queue keeps growing. Confirmed live 2026-08-27:
  `~/.claude/settings.json:95` → `tape-capture.sh`, queue at 4.
- ~~**Dictionary format undecided**~~ — **decided in muster 2026-08-26**, see Open questions 1.
  The CLAUDE.md rewrite is unblocked.
- **`pause-this` / `restart-this`** — still marked review, never resolved.
- **The test suites are coupled to muster's corpus — 8 failures of 119, 2026-08-27.** They
  came over with the scripts and assert against live muster data: `check-dictionary.test.mjs`
  looks up the term `MMC` in `loadDictionary()` and jig has no `docs/dictionary.yml` at all;
  `check-docs.test.mjs` hardcodes `mobiustripper42/muster` URLs. Inline fixtures naming
  `src/reservations/…` are harmless strings; the live-corpus reads are not. Either the tests
  get their own fixtures or jig gets the corpus they expect — decide before jig ships, because
  a suite that is red on arrival is a suite nobody will run.
- **`npm install` note.** Deps are installed except `js-yaml`: a verification symlink was
  occupying `node_modules/js-yaml` during the first install, so npm skipped it. Symlink is
  removed; the install needs one more run.

## Next, in order

1. **`CLAUDE.md`** — 6,576 words, loaded every request. Byte-identical across seeds, muster
   and soundings (same md5, 2026-08-25): a LoRa firmware project and a Next.js booking app
   load the same file. It is the largest prose artifact in a system that just proved prose
   doesn't hold — mechanical deny obeyed 7/7, prose rule broken 11 times including 4 after
   it was written.
2. **Finish the doc-check scripts in muster**, then bring them over. They're the best
   thing in the system and the muster copy will be ahead.
3. **Get the outside read from claude.ai chat** on seeds before jig sets its shape.

## Deep dive — cancelled

Usage counts, word counts and three incidents already gave the answer. Re-reading 20
observations is more analysis, not more evidence.
