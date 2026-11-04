# check:context: raw evidence (jig issue 104, second loop)

Gathered 2026-11-04. Read-only. Every row cites a commit (repo short-sha), a CI run id, a session file
path:line (on the repo's `origin/sessions` branch) or a JSONL transcript path:line.

Helper outputs in this scratchpad (regenerable):
- `emu.py` — re-implements the PATH half of today's `scripts/check-context.mjs` (PATHISH, isClaim with the
  tree's own top-level dirs as ROOTS, `<` placeholder skip, `:N` strip, brace expansion, `*`/`**`/`?`
  globs, brackets literal) and runs it against `git ls-tree` at every first-parent commit of `origin/main`.
  Doc set = today's DOCS (CLAUDE.md, .claude/CLAUDE-context.md, .claude/ui-context.md, .claude/skills/**.md,
  .claude/agents/**.md) whether or not the checker of that day read them. It does NOT model the `§` half,
  the gitignore-trust rule (rows it reports are hand-checked below), or files present on disk but untracked.
- `emu-<repo>.txt` (one line per dead span per commit), `life-<repo>.txt` (grouped into lifetimes)
- `denom.py` — first-parent commit / PR-merge counts, split at a cut sha, and how many touch the doc set
- `scan.py` → `runs.tsv` (every Bash command that runs the gate) and `reds.txt`; `scan2.py` → `reds2.txt`
  (every tool result carrying a failure line, any command). `ctx.py` prints a transcript window.
- `s/` — every session file from muster, jig, seeds, centerline, haul, sheepdog `origin/sessions`

Failure text (stable since muster 8e71451d:113): `✗ context docs — N dead reference(s):` then lines
`<doc>:<n> — cites \`<span>\`, which does not exist`, `… which has no such section` (the `§` half, from
seeds da3f567), or `<doc> — listed in check-context.mjs but does not exist`. `check:docs` imports the
same resolver (`resolves()`), prints `✗ docs —`, and also scans the context file, so one dead path in
`.claude/CLAUDE-context.md` often shows in both outputs.

## 0. The mistake class, and the founding incident

Class (issue 104): a context doc citing a path (file, dir, glob, script) that does not exist.

The founding incident is OUT of class. muster 8e71451d message and muster
sessions/2026-07-28-1859-eric-main.md:114-118: `.claude/CLAUDE-context.md` said "Twilio/SMS = later swap"
after `src/adapters/twilio-channel.ts` shipped; a session believed it and filed muster issue 593 claiming
a feature was blocked. That is a characterization with no path in it; the checker could not have caught
it and says so (`scripts/check-context.mjs:25-28`). jig `CLAUDE.md` § Workflow Notes "Before asserting
what is built or live…" quotes the same incident, and its "three sessions asserted a sibling repo's user
base…" sentence is also characterization. Neither is a dead-path incident.

The class grew twice after ship: `§ Section` references (seeds da3f567, 2026-08-17, from seeds issue 181)
and the scanned doc set (skills + agents: jig 411c3e1, 2026-08-27; ui-context.md: haul b62d126 and jig
bf2d426, 2026-11-02).

## 1. Dates

| Event | Citation |
|---|---|
| Written | muster 8e71451d, 2026-07-28 23:03 -0400 (review fix 567839b4 23:12) |
| On muster main | muster fe8b0396 (pull request 595), 2026-07-28 23:47 |
| Built in session | muster sessions/2026-07-28-1859-eric-main.md:103-141 (Task 3, 3 points) |
| Seeds backport | seeds 75775fb (pull request 150), 2026-07-28 23:14; seeds' own `verify` runs it only from seeds d5f2831, 2026-08-22 |
| sheepdog | sheepdog 652e8bc, on main via ce6684d (pull request 35), 2026-08-04 |
| soundings | soundings e073a49, 2026-08-09 |
| jig (import) | jig 4cb09ae, 2026-08-27 (merged via bb52ece, pull request 1) |
| centerline | centerline 59f05b5, 2026-09-19 |
| haul | haul 6786cf1, 2026-10-25 |
| Also carried (not counted) | bushel 3885100 and bushel-mobile ea6ada1 2026-08-04, chiplog 2d8d0cc 2026-08-13 |
| Scope: skills + agents | jig 411c3e1 2026-08-27; muster via 46275ac6 (jig v6, 2026-08-28) |
| Scope: ui-context.md | haul b62d126 2026-11-02 09:24; jig bf2d426 2026-11-02; muster via 69704194 2026-11-02 |
| Scope: `§` sections | seeds da3f567 2026-08-17; muster via 79364778 2026-08-19 |

A pair of stacked-branch copies, muster ebb02824 / 94b9fc0a (same content as 8e71451d / 567839b4), never
reached `main` first-parent and is not counted.

## 2. BEFORE (muster, 2026-06-03 .. fe8b0396 2026-07-28)

Denominators (`denom.py ~/muster fe8b0396`): 412 first-parent commits, 249 PR merges. Touching
CLAUDE.md or .claude/CLAUDE-context.md: 34 commits (28 PR merges). Touching any doc in today's set: 42 (35).
No transcripts exist for this window.

### 2a. Dead spans on main before ship (emu-muster.txt / life-muster.txt)

| Span | Doc | Lived | In scope of the checker that day? | Verdict |
|---|---|---|---|---|
| `components/[feature]/` | CLAUDE.md:69, then .claude/CLAUDE-context.md:106 | b276ef3b 06-10 .. fe8b0396 07-28 | yes | a placeholder written as a path; the ship commit rewrote it `components/<feature>/` (8e71451d diff). False match, not a dead file |
| `docs/DEPLOYMENT.md` | .claude/skills/promote-production/SKILL.md:25 | b8f7ebc9 07-05 .. d9cbde5b 08-28 | no (skills) | real dead path; cleared when the jig v6 sync replaced the skill (46275ac6) |
| 5 spans (`src/reservations/*payment*`, `booking-webhook.ts`, `stripe-payment.ts`, `app/api/webhooks/**`, `app/(public)/book/checkout/**`) | .claude/skills/kill-this/SKILL.md:67 | 88b5b1b6 07-24 .. 774cb0a3 07-27 | no | forward references to `feature/reservations`; resolved when that branch merged |

### 2b. The 2026-07-25 audit (muster docs/audit/2026-07-25/)

| Row | Finding | In class? | Could this checker catch it? |
|---|---|---|---|
| shard-F-workflow.md:31 (F15) | `CLAUDE.md:143` cites `dev/claude/templates/VersionTag.tsx`; `.claude/CLAUDE-context.md:179` cites `templates/VersionTag.tsx`; "Neither documented path exists" | **yes, 2 dead paths** | **no**: `dev/` and `templates/` are not top-level dirs of muster, so `isClaim` skips them (`check-context.mjs:84`, the deliberate narrowing). Fixed by hand in 8868fc54 (shard-F-workflow.md:97) |
| shard-F-workflow.md:22 (F6) | `dev/claude/scripts/throughput.py` does not exist; repeated in `.claude/skills/retro/SKILL.md:283` | yes | no (non-root path, and skills unscanned then) |
| shard-F-workflow.md:45 (F29) | `CLAUDE.md §Commands` cited from AGENTS.md and skills; the section is absent | adjacent (dead section) | not then; the later `§` half would, for the backticked skill form |
| shard-F-workflow.md:30 (F14), shard-G-brand-ui.md:22 (G3) | "VersionTag not wired"; "@ui-reviewer inert until ui-context.md exists" | no, characterizations | no |

### 2c. The checker's first run (8e71451d)

- "The first draft flagged 16 things, 15 of them noise" (8e71451d message; session :135). The 16th is not
  named. The diff's only path-side change is the `components/[feature]/` → `<feature>` rewrite, which the
  emulator also finds; consistent with it being the one, **not traceable** beyond that.
- The ship commit fixed "the two bad claims" (session :111): the channel line and the horizon numbers.
  Both are characterizations or env claims, not dead paths.
- "32 claims covered" (session :110).

**Before, in class and in the checker's reach: 0 real dead paths found.** Real dead paths existed, but in
docs the checker did not read (skills) or in a form it deliberately skips (non-root paths, audit F15).

## 3. AFTER

### muster, fe8b0396 .. 2026-11-03
Denominators: 355 first-parent commits, 311 PR merges; 60 PR merges touch CLAUDE.md/context; 82 touch any doc
in today's set. CI: 97 failed runs in the repo's history scanned with `gh run view --log-failed`; 4 show the
check, all `✓ context docs` (runs 36256116477, 36255656132, 33938072979, 33203243698). 0 CI reds.

| Span | Doc | Lived on main | In scope that day? | How it left |
|---|---|---|---|---|
| `src/admin/time-clock-report.ts`, `src/crew/time-clock.ts` | .claude/skills/kill-this/SKILL.md:68 | 52358b8d 07-31 .. f6cb7998 08-04 (7 commits) | no | forward reference; code arrived |
| `docs/SPECS/2026-08-workflow-learning-loop.md` | .claude/skills/read-the-tape/SKILL.md:40 | 218b8af8 08-06 .. d9cbde5b 08-28 (104 commits) | no | skill deleted by the jig v6 sync |
| `docs/DEPLOYMENT.md` (from before) | promote-production SKILL.md:25 | to 08-28 | no | skill replaced by the jig v6 sync |
| `app/reservations` | .claude/ui-context.md:9 | d52016bd 08-15 (pull request 744, route moved: muster sessions/2026-08-14-0411-eric-main.md:28) .. a4620d38 11-02 (276 commits, 79 days) | no, until 11-02 | **caught** the day the scope reached it: jig sync red (transcript `~/.claude/projects/-home-eric-jig/5f7e3290-…jsonl:2852`), fixed in muster 9fa1bb5d (pull request 1218) |

**In scope and escaped: 0.** Out of scope: 4 lifetimes, one caught on scope arrival.

Adjacent, outside reach (cited for the record): muster 22da9d4f (a cited line number drifted; "check:context
verifies that a cited PATH resolves, never a line number, so it shipped green"); muster 8dd6f5f2 and 2996f4bd
(bare `(8.3)` section refs dangling; "No gate sees a bare `(8.3)`").

### jig, 2026-08-25 .. 2026-11-02
86 first-parent commits (76 PR merges); 39 (37 PR) touch CLAUDE.md/context; 56 (54 PR) any scanned doc. No CI.
Emulator: 0 dead spans on any first-parent commit. Escapes found in commit messages: 0 in jig itself.
But jig's shipped files carried three dead citations that jig's own gate could not see (jig has the files):
`scripts/keep-tape.mjs` in its-dead (jig 5355c0e: "Jig's own gate could not catch it, because jig has the
file"), `docs/decisions/archive/` and `docs/decisions-baseline.txt` in the shell (scaffold lacked them until
jig 7e6932a, 2026-10-26). They surfaced downstream (section 7).

### centerline, 2026-09-18 .. 2026-11-02
170 first-parent (113 PR merges); 50 (49 PR) touch CLAUDE.md/context; 58 (57 PR) any scanned doc. No CI.
Emulator: 5 spans at install 59f05b5 (cleared in e748af5, pull request 5, 3 commits later; caught by the
gate, section 7 C4) and `public/maplibre/` at .claude/CLAUDE-context.md:147 since 925f422 — gitignored
(centerline .gitignore:16), so taken on trust since jig 28370b3; a false match for the emulator. **0 escapes.**

### haul, 2026-10-24 .. 2026-11-03
63 first-parent (31 PR merges); 16 (16 PR) / 24 (24 PR). CI: 71 runs, all success (`gh run list`).
Emulator: 0. **0 escapes.**

### sheepdog (before 2026-07-23 .. ce6684d 08-04; after to 2026-10-08)
Before: 23 first-parent, 4 PR merges, 1 PR touches CLAUDE.md/context. After: 23 first-parent, 20 PR merges, 8 touch.
Install stock at ce6684d: `CLAUDE.md:16` table row `docs/BRAND.md` (real: a shell row naming a doc this
project lacks; rewritten, and that rewrite is the origin of jig `CLAUDE.md` § Key Docs "The shell names only
docs every project has…") and `.claude/CLAUDE-context.md:91` "`docs/BRAND.md` is deliberately absent" (false
positive, worked around by un-backticking; sheepdog 652e8bc message). After: 4 dead spans in agents/skills
(`docs/BRAND.md` ×3, `docs/DEPLOYMENT.md`), out of scope, cleared by the jig v6 migration f4bdd19 (09-08).

### seeds
Seeds' own `verify` ran the checker only from d5f2831 (2026-08-22). First run: "found two dead references
in the shell — `docs/USER_STORIES.md` and `docs/DEV_REFERENCE.md`" (seeds sessions/2026-08-22-1236-eric-main.md:24),
fixed in the doc (pull request 206, 5 points shared with the context split). Emulator rows in seeds' agents
and skills name project-side files in template text; out of scope and not counted.

## 4. BUILD

| Pull request | What | Points | Citation |
|---|---|---|---|
| muster 595 + seeds 150 | the checker | **3** | muster sessions/2026-07-28-1859-eric-main.md:139 |
| seeds 159 (a40fae5) | brackets literal (Next dynamic segments) | not traceable (no seeds session file for 08-07) | — |
| seeds 57a546f | range-form line citations (inside DEC-S036 work) | not traceable | — |
| jig 1 (411c3e1, d69f9d6) | skills + agents scope; missing-doc fix | not traceable (no task block, as in the pre-pilot) | — |
| seeds 194 | `§` section references | 3 | seeds sessions/2026-08-17-1131-eric-main.md:96 |
| seeds 197 | subtitle false positive | 3 | seeds sessions/2026-08-18-1957-eric-main.md:54 |
| seeds 199 | table-cell false positive + a check-docs example (shared) | 3 | same file :102 |
| jig 76 | gitignored path taken on trust (false positive) | 3 | jig sessions/2026-10-04-1609-main.md:213 |
| haul 41 (Task 0.15) | ui-context.md scope (shared with @ui-reviewer per task) | 3 | haul sessions/2026-10-24-1502-main.md:292 |
| jig 101 | harvest of haul 41 (shared) | 3 | jig sessions/2026-10-19-0428-main.md:169 |

Total: 3 for the checker, plus up to 18 for extensions (6 of them in shared pull requests).
Not build, listed for the price section: jig 41 (2 points, fixing the bare keep-tape citation it shipped;
jig sessions/2026-09-19-0120-36-one-piece-lives-in-jig.md:63) and jig 48 (3 points, a separate jig-only
checker `check-shipped-citations.mjs`; jig sessions/2026-09-24-0054-main.md:54, "It fixes zero files").
GitHub `points:N` labels: none on muster 593/595, jig 41/48/75/76/101, seeds 150/181/194/197/199/206, haul 41.

## 5. UPKEEP (`git log --follow --numstat`)

### muster scripts/check-context.mjs (first ship 8e71451d +119)
| sha | date | +/- | type |
|---|---|---|---|
| 567839b4 | 07-28 | 41/13 | FN fix (the `ls <path>` pointers were invisible, including the worked example) + security (shell-out executed a doc payload); pre-merge review |
| e0eb026d | 07-30 | 23/7 | refactor (export `resolves()` for check-docs) |
| 0c099f09 | 08-03 | 26/20 | sync seeds |
| 82c4bb9a | 08-07 | 20/1 | sync of FP fix (brackets: "every Next dynamic segment was uncitable") |
| 79364778 | 08-19 | 181/2 | sync seeds (`§` feature + its FP fixes) |
| 46275ac6 | 08-28 | 20/1 | sync jig v6 (skills/agents scope + missing-doc FN fix) |
| ce076f8f | 10-08 | 72/2 | sync jig (gitignored trust, FP fix) |
| 69704194 | 11-02 | 8/1 | sync jig (ui-context scope) |
8 commits, +391/-47; native 2 (+64/-20). Test: 8e71451d +73, 567839b4 41/1, 82c4bb9a 11/1, 79364778 309/8,
then deleted in bae4f334 (0/424, "Remove jig's test suites").

### jig scripts/check-context.mjs (import 4cb09ae +367)
| sha | date | +/- | type |
|---|---|---|---|
| 411c3e1 | 08-27 | 15/1 | feature (skills + agents) |
| d69f9d6 | 08-27 | 19/14 | FN fix (a blanket `.filter(existsSync)` made a deleted context file pass) |
| 28370b3 | 10-07 | 41/2 | FP fix (gitignored citation in a fresh worktree) |
| 183e38a | 10-07 | 34/7 | FN fix in the same PR (info/exclude could pass a dead path), pre-merge review |
| 8621d23 | 10-07 | 7/3 | FN fix (NUL in a span), pre-merge security review |
| bf2d426 | 11-02 | 8/1 | feature (ui-context.md) |
6 commits, +124/-28. Test (import +424): 28370b3 124/0, 183e38a 47/4, 8621d23 9/2, bf2d426 16/2, 731c6d1 2/2 — 5 commits, +198/-10.

### seeds dev/claude/scripts/check-context.mjs (75775fb +153) — where most native upkeep happened
| sha | date | +/- | type |
|---|---|---|---|
| 57a546f | 08-03 | 23/7 | FP fix (range-form `:88-96` reported live files dead; found by check-docs over docs/) + export |
| a40fae5 | 08-07 | 20/1 | FP fix (brackets); abc8d99 is the same patch-id off-main, counted once |
| da3f567 | 08-17 | 112/2 | feature (`§` sections) |
| 183bf21 | 08-17 | 23/3 | FP fix (two citations on one line, a false failure), pre-merge review |
| 3fab5d3 | 08-19 | 32/2 | FP fix (subtitle heading; observed adopting into muster, seeds-2026-08-18-1957:41) |
| 1874dd6 | 08-19 | 30/14 | FN fix (the subtitle fix had loosened matching), pre-merge review |
| e5acc87 | 08-19 | 7/4 | FP fix (table cell; observed in soundings `docs/SPEC.md:422`) |
7 commits, +247/-33. Test: 9 commits (abc8d99 duplicate excluded), +341/-23.

### copies
centerline 59f05b5 +386, e8b1230 72/2, 2e645eb 8/1. haul 6786cf1 +456, b62d126 8/1. sheepdog 652e8bc +169,
ecaaf43 221/4, 20c7e88 72/2. soundings e073a49 +188, 8101207 181/2, a897460 20/1, d3d0eeb 72/2.

**False positives by origin:** brackets (latent, found writing a citation), range form (live, in docs/ via
check-docs), two-per-line (latent, review), subtitle (live, muster SPEC via check-docs), table cell (live,
soundings SPEC via check-docs), gitignored (live, soundings and centerline sync worktrees). Of the six, only
the gitignored one fired on a context doc; the other live ones fired through check-docs' corpus.

## 6. RUNNING

Timing, mill-dev, 2026-11-04, `npm run -s check:context`, 3 runs (ms): jig 151, 151, 162 (median 151);
muster 181, 186, 192 (186); centerline 171, 162, 161 (162); haul 169, 162, 173 (169); sheepdog 169, 161, 171 (169).

Transcript counts (`runs.tsv`): all .jsonl under ~/.claude/projects/-home-eric-* (incl. subagents) and
~/.claude/tape; 776 files; deduped on (uuid, sessionId); this research session excluded. A run = a Bash
command matching `check:context`, `check-context.mjs` or `npm … verify`. Repo = `cd`/`-C` target, else cwd.

| repo | commands | of which verify | output shows ✓ | output shows ✗ |
|---|---|---|---|---|
| muster | 384 | 261 | 127 | 1 |
| jig | 361 | 262 | 82 | 6 |
| centerline (+ sync worktree) | 293 + 7 | 205 + 1 | 100 + 1 | 2 |
| haul | 145 | 86 | 58 | 2 |
| sheepdog (+ sync) | 14 + 1 | 10 | 6 | 0 + 1 |
| soundings (+ sync) | 10 + 4 | 8 + 2 | 3 + 1 | 2 |
Total 1,219 commands, window 2026-08-30 .. 2026-11-04. Most commands filter output, so markers undercount.
Running time ≈ 1,219 × ~0.17 s ≈ 3.5 minutes.

## 7. CATCHES (red outputs, `reds2.txt`), grouped into episodes

31 tool results carry a failure line. Excluded as not check:context runs: tape/907444e1:4832 (a check-docs
probe on PROJECT_PLAN), centerline-2026-09-22-2140:32793 and haul 2acb7ce8:852 (check:docs on docs/),
jig-2026-09-24-0054:545, 2eefa54b subagents :26/:22, c39977a7 subagent :41 and 2eefa54b:604 (reading the
script source), agent-add94c52…:48 (a `gh pr view` body). That leaves 18 episodes.

| Ep | Date | Repo | What | Transcript | Class |
|---|---|---|---|---|---|
| C1 | 09-08 | sheepdog | `CLAUDE.md:28` cites `.claude/CLAUDE-context.md` § Workflow Mechanisms, missing | tape/907444e1-…:2622 | migration (seeds → jig) |
| C2 | 09-09 | jig | `CLAUDE.md:65` cites `docs/decisions/archive/` before it existed; dir created (.gitkeep); a second red was the test suite deleting the dir, test fixed | tape/907444e1-…:3545, :3549, :3570, :3590, :3594 | **real, fixed by making the path exist** (+ a test bug) |
| C3 | 09-19 | muster | its-dead `scripts/keep-tape.mjs` ×3 (shipped from jig) | tape/muster-2026-09-16-2006-main.jsonl:2896-2901 | **real, fixed in the doc** — upstream, jig 5355c0e (pull request 41) |
| C4 | 09-20 | centerline | install: baseline, archive/, keep-tape ×3 | tape/centerline-2026-09-18-1342-main.jsonl:767 | install stock; fixed by adding files (1f16c8b); the keep-tape copy was a workaround, deleted same day (52a6036, pull request 6) |
| C5 | 09-20 | centerline | `db/migrations/` cited before the dir existed; created | same file :844, :848 | real, repo made to match (in-branch) |
| C6 | 09-22 | soundings | archive/ after a sync | tape/jig-2026-09-19-0120-36-one-piece-lives-in-jig.jsonl:2861-2871; diagnosed a template defect :2881 | sync stock; sync abandoned |
| C7 | 09-23 | muster | `.claude/CLAUDE-context.md:117` cites `app/(crew)/crew/auth/` after the session deleted it (DEC-181); doc rewritten | tape/524391e5-…:1665 (shown in check:docs output), fix :1686, green :1687 | **real, fixed in the doc** |
| C8 | 09-25 | centerline | `data/basemap/` — gitignored runtime dir (centerline .gitignore:5); doc reworded | tape/centerline-2026-09-22-2140-main.jsonl:6958, :6963 | false positive, worked around |
| C9 | 09-26 | soundings, centerline sync worktrees | `gateway/.venv`, `public/maplibre/` (gitignored) + soundings archive/ | tape/jig-2026-09-24-0054-main.jsonl:2346, :2384 | false positive → jig issue 75 |
| C10 | 10-04 | soundings | first `sync.mjs --pr` red on `gateway/.venv` (operator run) | jig sessions/2026-10-04-1609-main.md:195-196 (sync-run catch, not in a transcript) | false positive → pull request 76 |
| C11 | 10-05 | centerline sync | `public/maplibre/` | projects/-home-eric-jig/c39977a7-…jsonl:975 | false positive (same) |
| C12 | 10-08 | jig | fixtures while building pull request 76 | projects/-home-eric-jig/2eefa54b-…jsonl:578, :730, :772 | probe |
| C13 | 10-08 | sheepdog sync | archive/ | same file :1157 | sync stock |
| C14 | 10-24 | haul | install in progress (DECISIONS.md not yet generated, baseline, archive) ×11 lines | projects/-home-eric-jig/5f7e3290-…jsonl:391 | install stock |
| C15 | 10-25 | haul | baseline + archive (generated/created :693); `docs/SPEC.md` § 2 "names one" — trailing prose read as the heading; citation reworded away (:695) | projects/-home-eric-haul/2acb7ce8-…jsonl:688 | install stock + false positive worked around |
| C16 | 10-26 | haul | `docs/SPEC.md` §7.3 + trailing prose; citation reworded away; "My `| cut` pipeline hid a failure, and that commit went out broken" (task branch) | same file :2473, :2478-2479 | false positive, worked around |
| C17 | 11-02 | haul | `HANDOFFX.md`, `membersX.ts` planted to prove ui-context is read | same file :12045 | probe |
| C18 | 11-02 | muster | `.claude/ui-context.md:9` `app/reservations` | projects/-home-eric-jig/5f7e3290-…jsonl:2852, :2896 | **real, fixed in the doc** (muster 9fa1bb5d) — sync-run catch |

Row by row:
| Episodes | Count | Counted as a catch? |
|---|---|---|
| C3, C7, C18 | 3 | **Yes**: a dead path in a context doc, fixed in the doc |
| C2, C5 | 2 | Partly: the doc was right about intent; the repo was made to match (a directory created) |
| C1, C4, C6, C13, C14, C15 (install half) | 6 | No: install / sync / migration stock. Three underlying jig template defects (archive/, baseline, keep-tape), plus the `§ Workflow Mechanisms` migration step |
| C9, C10, C11 | 3 | No: false positive, checker changed (jig 28370b3) |
| C8, C15 (§ half), C16 | 3 | No: false positive, worked around by rewording — and two of those removed a checkable citation |
| C12, C17 | 2 | No: probes |

Plus git-recorded catches outside transcripts: jig 411c3e1 (scope widening, 1 real: `docs/DEPLOYMENT.md`
in promote-production, fixed in the doc); seeds first run (2 real, seeds-2026-08-22-1236:24); sheepdog install
(1 real, 1 FP worked around; sheepdog 652e8bc). CI catches: 0 (muster 97 failed runs scanned; haul 71/71 green;
jig and centerline have no CI).

## 8. PRICE — incidents where a dead context path cost time

| Incident | In class? | Recorded cost | Citation |
|---|---|---|---|
| muster issue 593 (Twilio "later swap") | **no**, characterization | issue body corrected; 0 points on it; the 3-point build was the response | muster 8e71451d; sessions/2026-07-28-1859-eric-main.md:114-118 |
| seeds issue 181 (bushel shell cites a missing `§ Workflow Mechanisms`, "three dead pointers per task") | adjacent (dead section) | caught by a told-to-look code review before any session used it; 0 points recorded for the incident | seeds issue 181; seeds-2026-08-14-1726:96 |
| keep-tape bare citation shipped from jig | yes | centerline copied two files to go green (1f16c8b, +458 lines) and deleted them the same day (52a6036); a muster session misreported the sync as incomplete and proposed copying (muster sessions/2026-09-16-2006-main.md:78, task 1 point, mostly dictionary work); jig 41: 2 points to fix; jig 48: 3 points preventive | as cited |
| `app/reservations` in muster ui-context.md, 79 days on main | yes | loaded into @ui-reviewer prompts (e.g. projects/-home-eric-muster/fac18240-…/subagents/agent-a441312e9a5617cf4.jsonl:11); no wrong action found; **0 recorded** | — |
| audit F15 VersionTag (2 dead paths) | yes, outside reach | shard F's cost covers 53 rows; not separable | docs/audit/2026-07-25/README.md |

No in-class incident carries a recorded points cost for the mistake itself.

## 9. Against issue 104's "believable" bar

- **Before and after counts traced to cited commits or session lines: met, and the answer is 0 and 0.**
  muster has a before; in the checker's own scope and reach, it shows no real dead path either side. The
  dead paths that did exist sat in docs it did not read yet (skills, ui-context.md) or in forms it skips on
  purpose (non-root paths such as audit F15). So the count can be traced, but it measures scope, not the rate.
- **Cost from labels and git history alone: met in part.** No `points:N` labels; build points come from
  session `## Task` blocks (3 + up to 18), and three pieces are not traceable (seeds 159, seeds 57a546f, jig 1).
  Upkeep is fully traceable.
- **Saving as a range with assumptions: not met.** 3 doc-side catches (+2 repo-side), and no priced in-class
  incident to multiply them by. The one cost on record (keep-tape) is a defect the checker found downstream,
  not one it prevented.
