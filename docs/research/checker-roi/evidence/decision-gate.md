# Decision-record gate: raw evidence (jig issue 104 pre-pilot)

Gathered 2026-11-03/04. Read-only. Every row cites a commit (repo short-sha), a CI run id, a session file path:line
(on the repo's `origin/sessions` branch) or a JSONL transcript path:line.

Helper outputs in this scratchpad (regenerable):
- `*-fp.txt` — first-parent history of `main` per repo: `sha|date|parents|#files under docs/DECISIONS.md or docs/decisions/|subject`
- `muster-before.txt` / `muster-after.txt` — muster split at 0e0b808d (the merge of pull request 569 that landed the gate)
- `*-tasks.txt` — every `## Task` block with a `**Points:**` line, from each repo's `origin/sessions`
- `reds.txt`, `reds.json`, `episodes.txt` — every red gate output in transcripts, grouped into episodes
- scripts: `fp.sh`, `scan.py`, `scan2.py`, `runs2.py`, `episodes.py`, `ctx.py`, `find.py`

## 0. Dates

| Event | Citation |
|---|---|
| Gate commit | muster ad3c04ab, 2026-07-27 12:29 -0400 |
| Gate reaches muster main | muster 0e0b808d (Merge pull request 569), 2026-07-27 12:57 -0400 |
| Gate built in session | muster sessions/2026-07-27-1548-eric-main.md:18 (Task 1) |
| jig import | jig 4cb09ae, 2026-08-27 (merged via jig bb52ece, pull request 1) |
| centerline install | centerline 59f05b5, 2026-09-19 |
| haul install | haul 6786cf1, 2026-10-25 |
| seeds copy (dev/claude/scripts) | seeds 57a546f 2026-08-03, fb31c09 2026-08-16, f636723 2026-08-17 |

## 1. BEFORE (muster, 2026-06-03 .. 2026-07-27 12:57)

Denominators
- First-parent commits on main before 0e0b808d: 404 (241 PR merges, 162 direct, 1 root) — muster-before.txt
- Of those touching docs/DECISIONS.md: 108 (90 PR merges) — muster-before.txt col 4
- Session files dated before 2026-07-27-1548: 71 — `git -C ~/muster ls-tree origin/sessions sessions/`
- `## Task` blocks with Points in those sessions: 211 — muster-tasks.txt
- Transcripts: none for this window (earliest transcript tool result 2026-08-30; tape starts 2026-09-12 with back-copies)

In-class defects that were on main (found by the 2026-07-25 audit's shard Z and by the gate's first run)

| # | Defect | Class | Found by | Citation |
|---|---|---|---|---|
| B1 | DEC-138 (and 134/135) named different decisions on main vs feature/reservations; ambiguity leaked onto main (USER_STORIES.md:93) | duplicate id | audit shard Z | muster 47661800; issue 562; fixed 704163a9, 41744b18 |
| B2 | 4 of the last 9 DECs had no index row (first casualty DEC-127, the rule mandating rows) | stale index | audit shard Z | muster 47661800; docs/audit/2026-07-25/README.md:246-248; repaired 704163a9 |
| B3 | Footer tally "Indexed 124 of 124" vs 137 rows / 138 bodies | stale index | gate first run | muster ad3c04ab message; sessions/2026-07-27-1548-eric-main.md:28 |
| B4 | DEC-114 cited "DEC-100 submit spinner" after DEC-100 was renumbered; same miscite copied into components/admin/reveal-selected-row.tsx | dangling/renumber fallout | gate first run | muster ad3c04ab |
| B5 | src/builder/form-shifts.test.ts cited DECISIONS.md:2159 by line and had drifted | dangling reference (line) | gate first run | muster ad3c04ab |
| B6 | 28 one-way supersede edges, 20 unmitigated | supersession pair | audit shard Z | muster 47661800; README.md:238-241 |
| B7 | 41 "amends SPEC" claims, 17 never landed | declared spec amendment never landed | audit shard Z3 | README.md:254-255; muster ec7fb996 |

Out-of-class, same audit (gate cannot see): SPEC §1.3 credited the wrong DEC twice ("it never dangled, because DEC-138 is real") — muster ec7fb996.

Collisions in the window that were resolved at merge (git text conflict, did not reach main as a duplicate)

| Date | What | Citation |
|---|---|---|
| 2026-06-29 | DEC-080 taken by muster pull request 188; crew code-login renumbered to 081 | muster 7e24a024, 37f89d3b; sessions/2026-06-29-1702-eric-main.md:82 |
| 2026-07-11 | reservation DECs 098–104 → 105–111 | muster 4f4f2ebb; sessions/2026-07-11-1755-eric-reservations.md:101 |
| 2026-07-12 | DEC 112→114 | muster d9315fbd; sessions/2026-07-11-1801-eric-268-scrollbar-gutter.md:154 |
| 2026-07-12 | DEC 113→115 | muster 9f1238d3; same session :154 |
| 2026-07-13 | DEC-118 claimed elsewhere; renumbered to 119 | sessions/2026-07-13-0428-eric-11.4-booking-link-confirm.md:96 |
| 2026-07-20 | DEC-128 renumbered from 127 (taken on main) | sessions/2026-07-20-1408-eric-bug-483-inline-asks.md:24 |
| 2026-07-22 | orphan branch's DEC-131/132 collide with main's | sessions/2026-07-22-1849-eric-main.md:67 |
| 2026-07-25 | muster pull request 528: same two DECs double-allocated three times (126/127 → 131/132 → 138/139), plus missing index entries and a pointer at a DEC that never landed | sessions/2026-07-25-0358-eric-chore-forward-merge-main-2.md:18-35; muster 5a2790e3 |

## 2. AFTER

### muster, 0e0b808d .. 2026-10-31
Denominators: 359 first-parent commits (315 PR merges, 44 direct); 84 touch decisions (81 PR merges) — muster-after.txt.
47 session files after the build session + the build session; 282 task blocks from 2026-07-27-1548 on — muster-tasks.txt.
CI: 362 runs on main since 2026-07-27; all 97 failed runs in the repo's history (earliest 2026-06-25) scanned with `gh run view --log-failed`.

| # | Event | Reached main? | Gate's role | Citation |
|---|---|---|---|---|
| A1 | Footer count stale after six DEC-adding PRs merged; main red ~8h | yes | caught, but post-merge on main CI | CI runs 30600418101 (1ccaf3ce), 30624422956 (41ccfd84), 30624445280 (a641307a) on 2026-07-31; fix muster 41498b98 + 9e4edfba (pull request 629); sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362 |
| A2 | DEC-173 record never reached main (pushed after pull request 1022 merged) | yes (absence) | gate green — nothing cited it; adjacent to class | muster 81962479 |
| A3 | `supersedes: [DEC-057]` flow list silently dropped by gen:decisions; "every gate still passes" | no (caught by grep in-branch) | false negative | /home/eric/.claude/tape/b300916f-c7a6-5e1a-b0f5-8264782bb87a.jsonl:2685 (2026-09-15T18:00) |
| A4 | DEC-175 `amends_spec` inline list dropped; "the gate passed clean by not looking" | no (@code-review) | false negative | muster fc2bd70d |
| A5 | DEC-107 and DEC-124 marked superseded with no successor (latent on main since before the rule) | yes, latent | caught when jig's pair rule arrived | muster d4a3c70d (pull request 873, 1 pt: sessions/2026-08-31-1309-spec-2.8-2.10-conformance-audit.md:103) |
| A6 | DEC-178 duplicate id (two lanes) | no | caught in PR CI | CI run 35508089967 (task/15.14-dec-webhook-synchronous, 2026-09-20T11:32Z, "id DEC-178 is already used by …"); muster 20bc5eb1; /home/eric/.claude/tape/muster-s91-2026-09-12-2220-main.jsonl:7598 |
| A7 | DEC-144 three-way collision | no | noticed before merge (not a gate run in evidence) | muster 40c9df9c, f125e99f |
| A8 | DEC-182 / DEC-185 collisions | no | resolved at merge-in of main | muster 811398af, 061e62d5 |

Out-of-class after (semantic miscitations the gate cannot see): muster 299ce252 (FUTURE_IDEAS cited DEC-107 for a claim it never held), 2405b3d1, b5845dea, a7b7e576, 246ad137, 630cd137.

### jig, 2026-08-25 .. 2026-10-30
85 first-parent commits (75 PR merges); 24 touch decisions (22 PR merges) — jig-fp.txt. 11 session files, 72 task blocks — jig-tasks.txt. No CI workflow (`.github/workflows` absent).
In-class defects reaching main: none found in commit messages.
Out-of-class: jig fa0c596 — CLAUDE.md:61 cited DEC-J004 for DEC-J005's holding (pre-existing on main, caught by review).

### centerline, 2026-09-18 .. 2026-11-01
169 first-parent (112 PR merges); 31 touch decisions (30 PR merges). 7 session files, 103 task blocks. No CI workflow.
In-class defects reaching main: none found (grep of all commit messages).

### haul, 2026-10-24 .. 2026-11-02
62 first-parent (30 PR merges); 16 touch decisions (16 PR merges). 1 session file, 26 task blocks. CI: 33 runs on main, all success.
In-class defects reaching main: none found.

## 3. BUILD

| Pull request | What | Points | Citation |
|---|---|---|---|
| muster pull request 569 | the validator (564a) | 2 | muster sessions/2026-07-27-1548-eric-main.md:56 |
| muster pull request 573 | split into files + generator + checker rewrite (564b) | 5 (shared with the split) | same file :100 |
| muster pull request 591 | amendment guard for every id family | 2 | sessions/2026-07-28-1859-eric-main.md:56 |
| muster pull request 592 | amends_spec declared + checked | 5 | sessions/2026-07-28-1859-eric-main.md:99 |
| muster pull request 847 | schema v1 gate | 5 | sessions/2026-08-26-2129-eric-816-schema-v1.md:41 |
| jig pull request 1 | import from muster (jig 4cb09ae) | not traceable (no task block; first jig session is 2026-08-27-2146) | — |
| jig pull request 5 | schema gate adoptable (baseline) | 5 | jig sessions/2026-08-27-2146-main.md:30 |
| jig pull request 6 | ship schema to projects | 2 | same :44 |
| jig pull request 19 | supersession pair rule | 3 | sessions/2026-08-30-1418-gate-the-context-file-roster.md:49 |
| jig pull request 23 | frozen means frozen (mostly check-dictionary) | 5 | same :140 |
| jig pull request 27 | archive keeps references resolving | 3 | same :188 |
| jig pull request 28 | lint fix | 1 | same :207 |
| jig pull request 29 | check-docs resolves archive (other gate) | 2 | same :228 |
| jig pull request 95 | draft status | 2 | sessions/2026-10-19-0428-main.md:47 |
| jig pull request 96 | gen:decisions reads flow supersedes | 2 | same :63 |
GitHub `points:N` labels: none on muster issues 564/589/590/816 or PRs 569/573/591/592/847 (gh issue/pr view); jig has only issue 91 labelled.

## 4. UPKEEP (numstat, `git log --follow`)

### muster scripts/check-decisions.mjs (first ship ad3c04ab +158/-0)
| sha | date | +/- | type |
|---|---|---|---|
| e59926f1 | 07-27 | 25/5 | FP fix, latent, pre-merge in build pull request 569 (preamble example row would fail the build) |
| f41a895a | 07-27 | 77/144 | refactor (split) |
| 725cf9f7 | 07-27 | 12/0 | FP fix latent (generator non-fixed-point -> stale on a correct file, "masked today") + FN fix (load() blind to mis-named files); pre-merge pull request 573 |
| b35ea7ce | 07-28 | 30/8 | FN fix (guard never ran for non-numeric ids) |
| ec7fb996 | 07-28 | 47/3 | feature (amends_spec) |
| 246ad137 | 07-28 | 1/1 | FN fix (whitespace scope) |
| e0eb026d | 07-30 | 5/1 | feature/refactor (share with check-docs) |
| 0c099f09 | 08-03 | 47/41 | refactor (config-driven, seeds-identical) |
| 2822715e | 08-17 | 8/50 | feature removal (amends: retired) |
| 881407f5 | 08-26 | 191/2 | feature (schema v1) |
| bf6a7a49 | 08-26 | 27/6 | FN fix (opt-in stricter than YAML -> zero enforcement) |
| 46275ac6 | 08-28 | 181/18 | sync jig v6 |
| 3e42f6b4 | 09-01 | 104/17 | sync (jig supersession pair) |
| d8630d48 | 09-03 | 40/63 | sync refactor (records lib) |
| 63dafbf6 | 09-04 | 4/1 | lint |
| dd65d468 | 09-09 | 43/5 | sync of FP fix (archive: correct historical citations failed as dangling) |
| eaed8b30 | 09-09 | 15/8 | sync, supports the same FP fix in check-docs |
| 2cb644de | 10-30 | 12/1 | sync (draft status) |
Total after first ship: 18 commits, +869/-374. Muster-native (through bf6a7a49): 11 commits, +470/-261.

### muster scripts/check-decisions.test.mjs (first ship ad3c04ab +121)
e59926f1 24/2, f41a895a 128/101, 725cf9f7 13/0, b35ea7ce 65/1, ec7fb996 111/0, fdb9f58f 301/296 (seeds adopt), 2822715e 33/121, 79364778 15/3, 881407f5 84/1, bf6a7a49 46/0, 7d1fe93c 121/0, bae4f334 0/537 (deleted: "Remove jig's test suites"). 12 commits, +941/-1062.

### jig scripts/check-decisions.mjs (import 4cb09ae +367)
| sha | date | +/- | type |
|---|---|---|---|
| 2f987de | 08-27 | 44/2 | feature (dictionary integration) |
| d69f9d6 | 08-27 | 55/6 | FN fix (no schema: key skipped all rules) |
| 7ccda51 | 08-27 | 67/32 | FP-class adoption fix (every legacy record failed in jig) — pushed unreviewed |
| 95385f9 | 08-27 | 32/67 | revert of 7ccda51 |
| 4df3e37 | 08-27 | 67/32 | re-land of 7ccda51 via pull request 5 |
| 5a9fed6 | 08-27 | 33/3 | FP fix latent (archived legacy record not-listed; CRLF/BOM failed forever) — found by review pre-merge |
| 8821367 | 08-27 | 27/20 | FP fix latent (CRLF body) |
| b0367f4 | 08-31 | 90/17 | feature (supersession pair) |
| 9627617 | 08-31 | 15/1 | output fix (defect printed twice) |
| 81cac30 | 09-02 | 40/63 | refactor (records lib; FP fix was in check-dictionary) |
| a819ee7 | 09-08 | 29/1 | FP fix (archive: correct citations of a retired record failed as dangling; measured in muster) |
| fa0c596 | 09-08 | 14/4 | FN fix (citations inside archive unchecked) |
| cef8972 | 09-09 | 4/1 | lint |
| 9df510d | 09-09 | 15/8 | supports FP fix in check-docs |
| 1eb8504 | 10-26 | 12/1 | feature (draft status) |
15 commits after import, +544/-258 (13 net of the revert pair, +445/-159).

### jig scripts/check-decisions.test.mjs (import 4cb09ae +537)
5edf4fd 17/0, d69f9d6 52/7, 7ccda51 49/18, 95385f9 18/49, 4df3e37 49/18, 5a9fed6 45/1, 8821367 10/0, b0367f4 108/0, 9627617 37/0, a819ee7 50/0, fa0c596 24/1, 1eb8504 29/1, 45f79a0 2/3, e4372f9 26/0, b5a63f0 4/0. 15 commits, +520/-98.

### copies
centerline: 59f05b5 +642 (install), 1fd6d78 12/1 (sync). haul: 6786cf1 +642, 87d58dd 12/1 (sync). seeds dev/claude/scripts: 57a546f +199 (+363 test), fb31c09 8/50 (33/121 test), f636723 test 15/3.

## 5. RUNNING

Timing, this machine, 2026-11-04 (3 runs each, ms): jig `npm run -s check:decisions` 187, 193, 188 (median 188); `node scripts/check-decisions.mjs` 73, 74, 75 (median 74); muster (`npm --prefix`) 246, 234, 230 (median 234; 168 records); centerline 168, 164, 178 (median 168); haul 164, 171, 162 (median 164).

Transcript counts (all .jsonl under ~/.claude/projects/-home-eric-{jig,muster,muster-s91,muster-lane-b,centerline,haul} incl. subagents, plus ~/.claude/tape; 770 files; deduped on (uuid, sessionId); this research session 80ea2d06 excluded). Repo = `cd`/`-C` target in the command, else cwd; muster-* worktrees folded into muster. Window of executions: 2026-08-30 .. 2026-11-03.

| repo | Bash commands that run the gate (direct or via verify) | of which verify | executions with visible ✓/✗ | green | red |
|---|---|---|---|---|---|
| muster | 449 | 259 | 182 | 136 | 46 |
| jig | 278 | 231 | 110 | 86 | 24 (25 matched; one is `gh issue view 26` output, tape 907444e1:3828) |
| centerline | 346 | 203 | 147 | 100 | 47 |
| haul | 127 | 80 | 74 | 59 | 15 |
| sheepdog | 19 | 9 | 11 | 5 | 6 |
| soundings | 12 | 10 | 3 | 3 | 0 |
Executions undercount runs: many commands filter output (`grep`, `tail`) so neither marker shows.

## 6. CATCHES (red gate outputs in transcripts)

70 episodes grouped from 139 red outputs (same session, same record, under 1h apart) — full list `episodes.txt`, every red output with its problem lines `reds.txt`.
Kinds across episodes (an episode can have several): oversized bytes 43, field length over limit 24, bold lead-in 10, supersession pair 7, dangling reference 4, stale index/frontmatter 3, not baselined 2, frozen record edited 2, spec amendment section missing 2, unknown topic 2, malformed frontmatter 1, missing required key 1. E8 is a false match (not a gate run).

Integrity catches (not size/format), fixed in the record unless noted:
| Ep | Date | Repo | Caught | Transcript |
|---|---|---|---|---|
| E1 | 09-08 | sheepdog | malformed frontmatter during seeds->jig migration | tape/907444e1-…jsonl:2572 |
| E2 | 09-08 | sheepdog | records not baselined (migration order) | tape/907444e1-…:2871 |
| E3 | 09-08 | sheepdog | frozen record edited | tape/907444e1-…:2984 |
| E5 | 09-09 | jig | dangling ref after archiving DEC-J004 — deliberate probe | tape/907444e1-…:3305 |
| E6 | 09-09 | muster | 4 dangling refs after deleting DEC-038 — deliberate probe; led to the archive FP fix (a819ee7/dd65d468) | tape/907444e1-…:3402 |
| E7 | 09-09 | jig | stray archive/README.md read as a record; README removed, checker kept | tape/907444e1-…:3555 (decision at :3569) |
| E9 | 09-09 | jig | stale index in an archive probe | tape/907444e1-…:4365 |
| E14 | 09-15 | muster | stale index + frontmatter on DEC-173 | tape/b300916f-…:2596 |
| E17 | 09-17 | muster | amends_spec §2.7.1 not a SPEC section (DEC-176) | tape/muster-2026-09-16-2006-main.jsonl:468 |
| E27 | 09-24 | muster | unknown topic (DEC-183) | tape/524391e5-…:2449 |
| E28 | 09-24 | jig | unknown topic (DEC-J008) | tape/jig-2026-09-24-0054-main.jsonl:1347 |
| E30 | 09-30 | centerline | DEC-011 missing reciprocal supersedes (x2) | tape/centerline-2026-09-22-2140-main.jsonl:23247 |
| E31 | 09-30 | centerline | superseded_by points at a superseded record; halves disagree | same file :32351 |
| E36 | 10-13 | muster | stale index (forgot gen:decisions) | projects/-home-eric-muster-lane-b/53b405d6-…jsonl:504 |
| E37 | 10-15 | jig | superseded with no superseded_by (DEC-J009) | projects/-home-eric-jig/7e3c02a8-…jsonl:694 |
| E40 | 10-25 | haul | 4 "dangling" refs that were correct citations of muster's records; prose reworded to dodge the pattern — FP worked around, checker unchanged | projects/-home-eric-haul/2acb7ce8-…jsonl:660 (edits :665-669) |
| E42 | 10-26 | haul | missing required `claims` | projects/-home-eric-haul/2acb7ce8-…jsonl:1569 |
| E45 | 10-26 | jig | DEC-J020 pair broken because gen:decisions dropped a flow-style supersedes — a generator bug caught; became jig pull request 96 | projects/-home-eric-jig/5f7e3290-…jsonl:814 (fix :822) |
| E47 | 10-26 | centerline | DEC-026 cites DEC-025 not in tree — checkout had switched branches under the session | projects/-home-eric-centerline/1ea11e54-…jsonl:2389 (diagnosis :2417) |
| E59 | 10-31 | muster | amends_spec §2.8.12 not a SPEC section (DEC-198) | projects/-home-eric-muster/d7971e5d-…/subagents/agent-abbc43984d193c535.jsonl:201 |
| E63 | 11-01 | centerline | superseded_by -> superseded record; superseded with no successor | projects/-home-eric-centerline/d07653c0-…/subagents/agent-aae29d01c29204207.jsonl:45 |
| E66 | 11-02 | jig | superseded_by -> superseded record (DEC-J015) | projects/-home-eric-jig/5f7e3290-…jsonl:2579 |
| E70 | 11-03 | centerline | missing reciprocal; halves disagree (DEC-032/035/038) | projects/-home-eric-centerline/02ca21ce-…/subagents/agent-adb52c861953ece24.jsonl:109 |

CI catches: muster main runs 30600418101, 30624422956, 30624445280 (2026-07-31, stale index); muster PR-branch run 35508089967 (2026-09-20, duplicate DEC-178). None found in haul CI (33/33 green). jig and centerline have no CI.

False positives (checker changed because it failed good input): latent and pre-merge — muster e59926f1, 725cf9f7; jig 5a9fed6, 8821367, 7ccda51/4df3e37 (adoption). Observed live — archive citations (muster probe E6 -> jig a819ee7, muster dd65d468; plus check-docs half jig 9df510d / muster eaed8b30). Worked around without a checker change — haul E40.
False negatives found later: muster b35ea7ce, bf6a7a49, 246ad137, 725cf9f7 (part); jig d69f9d6, fa0c596; muster fc2bd70d (amends_spec inline), tape/b300916f-…:2685 (supersedes inline).

## 7. Incidents where the class was not caught (for a price per catch)

| Incident | Cost recorded | Citation |
|---|---|---|
| muster pull request 528 triple double-allocation + missing index rows + a pointer at a DEC that never landed | 1 point | muster sessions/2026-07-25-0358-eric-chore-forward-merge-main-2.md:19 |
| muster issue 562 DEC-138/134/135 collision, found by audit shard Z | shard Z: ~10 min wall, ~407k subagent tokens, covering 4 questions (index, cross-refs, amends, contradictions), not the collision alone; resolution merge touched 73 files; session points 0 ("/kill-this was never run") | docs/audit/2026-07-25/README.md:228-229; muster 47661800, 41744b18; sessions/2026-07-26-1357-eric-main.md:8,42 |
| Whole 2026-07-25 doc audit (B2, B6, B7 came from it) | per-shard token costs only, e.g. shard F 143k (README.md:284); total not stated | docs/audit/2026-07-25/README.md |
| Stale footer on main after six PRs (caught by gate, but post-merge) | main red ~8h; pull request 629 + generator change | sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362; muster 41498b98, 9e4edfba |
| DEC-173 missing from main | found ~1h after merge (16:35 merge, 17:33 fix) | muster 81962479 |
| Flow-style supersedes silently dropped (gate green) | later jig pull request 96, 2 points | tape/b300916f-…:2685; jig sessions/2026-10-19-0428-main.md:63 |
| DEC-175 amends_spec dropped (gate green) | caught by @code-review; points not separable | muster fc2bd70d |
