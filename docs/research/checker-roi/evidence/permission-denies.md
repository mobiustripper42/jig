# Permission denies + settings-policy.mjs: raw evidence (jig issue 104, second loop)

Gathered 2026-11-04. Read-only. Every row cites a commit (`repo sha`), a session-file `path:line` (on that
repo's `origin/sessions` branch), a seeds `origin/observations` file `:line`, or a JSONL transcript `path:line`
(`~/.claude/projects/...` or `~/.claude/tape/...`; not durable, see README). Uncitable → **not traceable**.

Helper outputs in this scratchpad (regenerable): `*-hist.txt` (deny list per commit per repo, from
`denyhist.py`), `denials.json` (every deduped denial with the 3 tool calls after it), `allcalls.json` (every
tool call in the transcripts), `LEDGER.md` (copy of seeds `origin/observations:observations/LEDGER.md` at
`70f3814`). Scripts: `denyhist.py`, `extract.py`, `classify.py`, `ctxnext.py`, `sedn3.py`, `npxcls.py`,
`heredoc.py`, `allcalls.py`, `fn.py`, `fn2.py`, `tasks.py`.

**The mistake class:** a command the operator has decided against, run anyway — (a) run because nothing
stopped it (before the deny, or where the pattern misses), or (b) a denied command re-shaped to route
around the deny.

**Two things this checker is not:**
- `settings-policy.mjs` stops no command. It checks that the deny list *is in force* (machine file and
  committed project file deep-equal jig's master) and repairs it with `--write`. Its catches are
  "deny not in force", one level removed from the mistake.
- Since 2026-09-12 it has grown into the machine-config checker (tape hook, output-style symlink, machine
  keys). Most of its upkeep is that, not denies (§6).

**Where the denies apply on this machine.** `~/.claude/settings.json` carries the full list (85 denies now;
backups show 87 → 78 → 79 → 80 → 85 from `settings.json.preakaunting` through today). Deny rules merge across
scopes, so on mill-dev every repo ran the user-level list for the whole transcript window, whatever its
committed project file said. A stale *project* file only matters on a machine or cloud container without the
user file (muster `3d7bb7ea` message).

## 1. Inventory: deny patterns over time

Source: `denyhist.py` over every commit touching each settings file (`git log --all`), diffing the parsed
`permissions.deny` set. n = deny count after the commit.

### seeds `dev/claude/settings.json` (the master until 2026-08-27) and `.claude/settings.json`

| Commit | Date | n | Change | Class |
|---|---|---|---|---|
| seeds `2f294d4` | 04-30 | 10 | first denies, seeds' own `.claude/`: `git reset --hard*`, `git push --force*`, `git push -f *`, `git push -f`, `git clean -f*`, `git branch -D *`, `rm -rf /`, `rm -rf /*`, `rm -rf ~*`, `rm -rf ..*` | new |
| seeds `3b37b57` | 06-04 | 24 | template created: + `curl *`, `sudo rm *`, 12 enumerated `Read(**/.env…)`, `.ssh`, key files (DEC-023) | new |
| seeds `be65249` | 06-04 | 33 | default-allow flip (`Bash(*)`): + `dd`, `mkfs`, `truncate`, `chmod 777`, `* > /dev/*`, `rm -rf .git*`, `sudo *`, `wget`, `nc`; − `sudo rm *` (subsumed) | new |
| seeds `d3512a6` | 08-11 | 40 | + 7 remote runners (`npx *`, `bunx *`, `uvx *`, `pnpm/yarn/bun dlx *`, `pipx run *`) after the muster Prettier incident | new (FN-driven) |
| seeds `5fac31e` | 08-11 | 43 | + `Edit(` the 3 settings files `)` (self-protection) | new |
| seeds `4ddec2a` | 08-11 | 87 | + 41 installers, `docker pull/run`, `sh`, `bash`, + `Write(` settings files `)` | new |
| seeds `b0d2526` | 08-11 | 87 | 9 enumerated `.env` Reads → blanket `Read/Write/Edit(**/.env*)`; `.ssh`/keys mirrored to 3 tools | FN fix (muster held `.env.local.backup`, `.env.xola.prod`, unmatched) |
| seeds `c864ce7` | 08-17 | 88 | + `sed -n *` (LEDGER W4) | new |
| seeds `d60de45` | 08-19 | 81 | − 7 `Write(...)` rules "the harness never applies" (a startup warning per rule, every session) | dead-rule removal |
| seeds `33c3545` | 08-19 | 78 | − 3 `Edit(` settings files `)` — "charged for it every time the policy legitimately changed" | FP removal |
| seeds `a376237` | 08-19 | 78 | seeds' own `.claude/` mirrored to the template (adds `sed -n *` there) | sync |
| seeds `1930680` | 08-25 | 79 | + `sed -i *` | new |
| seeds `ad73f4d` | 08-27 | 79 | `.claude/` copy gets `sed -i *` | sync |

### jig `.claude/settings.json` (the master from 2026-08-27)

| Commit | Date | n | Change | Class |
|---|---|---|---|---|
| jig `5edf4fd` | 08-27 | 79 | imported with `settings-policy.mjs` | import |
| jig `9a703df` | 08-27 | 80 | + `AskUserQuestion` (bare tool name) — prose rule (LEDGER W10) becomes a deny | new |
| jig `c8b37f9` | 10-07 | 85 | + `git -C * push --force*`, `git -C * push -f *`, `git -C * push -f`, `git -C * clean -f*`, `git -C * branch -D *`. Deliberately **not** `git -C * reset --hard*` (`/its-alive` runs it) | FN fix |

No deny has changed in jig since 10-07. Current list: 85 entries (`.claude/settings.json`).

### Projects (committed `.claude/settings.json`)

| Repo | Commits (date, n) | First deny |
|---|---|---|
| muster | `6d211233` 07-20 hooks only, **0 denies**; `a3ba21c0` 07-22 file deleted; `3d7bb7ea` 08-11 n=43; `0a7b2abb` 08-12 n=87; `79364778` 08-19 n=78; `fb86bf58` 08-28 n=80; `390d9a13` 10-18 n=85 (jig sync) | 08-11 committed. The "2026-07-20" date in the brief is the hook file, not a deny. `3d7bb7ea` says the user-global covered muster on this machine before that. |
| centerline | `59f05b5` 09-19 n=80 (install); `aa8c702` 10-18 n=85 (sync) | 09-19 |
| haul | `6786cf1` 10-25 n=85 (install) | 10-25 |
| soundings | `28ea6f3` 08-11 n=43; `7c9554d` 08-12 n=87; `2c4ee57` 08-19 n=78; `a897460` 08-27 n=80 | 08-11 |
| sheepdog | `80d3a90` 07-23 n=33; `ecaaf43` 09-08 n=80 | 07-23 |
| bushel | `51fbf27` 05-03 n=10; `15299ab` 08-14 n=87 | 05-03 |
| chiplog | `405b9c4` 06-08 n=33 | 06-08 |
| bushel-mobile | no committed file | — |

centerline and muster sat 5 `git -C` denies behind from 10-07 to 10-18 (jig `scripts/sync.mjs:456-457`;
settings-policy said so, §7).

## 2. BEFORE: the banned behaviour before its deny

No transcripts before 2026-08-30 (README). Every "before" count is secondary: seeds `observations` files
written by `@tape-reader` from transcripts now lost, and the ledger that tallies them. Unit noted per row.

| # | Pattern | Before the deny | Unit / denominator | Citation |
|---|---|---|---|---|
| B1 | `sed -n` range read in place of Read | **58 calls / 3 sessions**, 08-14 to 08-17, "zero operator corrections" (prose rule only) | tool calls / sessions | seeds `LEDGER.md:36` (W4); one session alone had 34: `observations/archive/2026-08/2026-08-14-muster-686-resend-and-copy-link.md:10` |
| B2 | `AskUserQuestion` against the standing preference | **6 uses / 3 sessions**, 08-11 to 08-16 (preference lived in one project's memory) | tool uses / sessions | `LEDGER.md:42` (W10) |
| B3 | `npx` fetching an unrequested tool | **1 incident**: `npx prettier --write` chained onto a typecheck, 231 lines reformatted, reverted. Rate of `npx` calls before: not traceable | incidents | muster `sessions/2026-08-10-0034-eric-main.md:156-157`; muster `3d7bb7ea` message; seeds `d3512a6`, `5fac31e` |
| B4 | Denied command re-shaped and retried | **7 retries / 2 sessions**, 08-12 to 08-14. Caveat: 5 of the 7 are retries against the *operator's* prompt denials of `git branch -D`, not a deny rule; the other 2 are `curl` to localhost (a deny-rule FP, §4) | retries / sessions | `LEDGER.md:41` (W9); `2026-08-14-muster-686-resend-and-copy-link.md:67-82` ("each denied by the operator via the permission prompt", :73); `2026-08-14-bushel-mobile-main.md:69-72` |
| B5 | Re-shape after deny rule (seeds) | `rm -rf /tmp/spprobe` 3 reshapes in 12 s | retries | `LEDGER.md:41`; `2026-08-25-seeds-main.md:211` |
| B6 | Deny obeyed after W9's rule | 7 denials of `sed -n`, 0 re-shapes, 08-19 to 08-24 (the calibration case) | tool calls | `LEDGER.md:36`; `docs/research/checker-roi/evidence/calibration.md` |
| B7 | Secret steered out of the `.env*` namespace *because of* the deny (design-level route-around) | 1, soundings 08-24; credential committed to `main`, password rotated | incidents | `LEDGER.md:57` (W25), source `2026-08-24-soundings-3.9c-ota-over-wifi.md` Candidate A |
| B8 | Bare `sed -i` with no anchor check (before the `sed -i` deny) | 1 violation / 2 sessions | sessions | `LEDGER.md:34` (W2) |
| B9 | `git -C <repo> branch -D` before `c8b37f9` (in transcripts — the one in-window before) | **7 commands**, 3 transcripts, 09-22 to 10-05 (several loop over repos). All deleted merged `task/jig-sync-*` branches; jig PR 70 body: "deleted two merged sync branches this way without meaning to get around anything" | Bash commands | `~/.claude/tape/jig-2026-09-19-0120-36-one-piece-lives-in-jig.jsonl:2882` (09-22); `~/.claude/tape/jig-2026-09-24-0054-main.jsonl:2484` (09-27), `:3127` (09-29), `:3709` (10-03), `:4237` (10-04); `~/.claude/projects/-home-eric-jig/c39977a7-de34-5221-85cd-a7668ec4bec1.jsonl:203` (10-04), `:1012` (10-05); PR body at `c39977a7…:1928` |

**Like-for-like pairs available:**
- **B9 → A, git -C branch -D, same unit (Bash commands), same source (transcripts):** 7 before (09-22→10-07,
  15 days) → 0 executed after (10-07→11-04, 28 days). Confound: jig's sync moved into `sync.mjs --pr`
  (jig session `2026-10-04-1609-main.md:155-186`, Task 11), which changed how branches get cleaned up.
  After 10-07 the only `-C … branch -D` denials are the operator's proof probe (`821debe6…:28`, excluded)
  and one bare-form retry (centerline `030223f9…:2311`).
- **B1 → A, sed -n, same unit (calls), different source** (ledger vs transcripts): 58 run in a week before;
  0 run after (§3, all 894 regex matches denied). But the banned *shape* moved to `awk 'NR…'` (§3 FN).
- **B2 → A, AskUserQuestion, same unit (uses):** 6 / 3 sessions before → **0 uses and 0 denials in 38,536
  tool calls** after. Zero denials means the model never attempted it, which is consistent with a
  bare-tool-name deny removing the tool from the session (inferred, not verified).

## 3. AFTER: every denial in the transcripts

**Harness wording** (sampled, `survey.py`): `Permission to use Bash with command <cmd> has been denied.`
for Bash; `<tool_use_error>File is in a directory that is denied by your permission settings.</tool_use_error>`
for Read. A user rejecting a prompt reads differently ("The user doesn't want to proceed…", 34 in total) and is
excluded. A background subagent's auto-denied prompt would read the same as a rule denial; every Bash denial
below was matched to a deny rule except the rows marked otherwise, and every repeated attempt checked was denied
again, so they are rule denials.

**Window and denominators.** 549 transcript files with tool calls (103 main, 446 subagent), 38,536 tool calls,
20,590 Bash calls (muster 8,758, centerline 6,498, haul 2,676, jig 2,562, sheepdog 95). Deduped on
(sessionId, tool_use_id); this research session excluded. First denial 2026-08-31, last 2026-11-04.

**1,290 denials** (centerline 484, muster 401, haul 275, jig 123, sheepdog 7; 696 in subagents).

| Pattern | Denials | in subagents | transcripts (main) | What it is |
|---|---|---|---|---|
| `sed -n *` | 929 | 542 | 419 (102) | mistake-stop: file range reads 732; pipe of command output 133 (FP by the rule's own text); `cat`/`git show` piped 64 |
| `npx *` (incl. 15 behind `timeout`) | 214 | 98 | 123 (45) | **style/policy** for ~208 calls of local devDependencies (vitest, eslint, tsc, tsx, playwright, next — all in `node_modules/.bin`) + 2 `npx --version`; **mistake-stop** for 4 (prettier ×3, tailwindcss ×1 — neither installed) |
| `curl *` (+2 via Monitor) | 59 | 10 | 42 (33) | FP for 45 to localhost/LAN hosts; mistake-stop or policy for ~14 external (cloudflare, geofabrik, protomaps, squareup…) |
| `sed -i *` | 20 | 8 | 18 (11) | mistake-stop (scripted edit without anchor check); all 20 switched to Edit |
| `Read(**/.env*)` via Bash (`grep DATABASE_URL .env.local`, etc.) | 19 | 3 | 18 (15) | mistake-stop (secret read) |
| `Read(**/.env*)` on `.env.example` (haul's file is `env.example`) | 16 | 8 | 9 (4) | harmless wrong-name guess |
| `git branch -D *` / `-C` / via `xargs` | 13 | 0 | 10 | mistake-stop |
| `rm -rf /*` matching `rm -rf /tmp/…` | 7 | 0 | 5 | FP (pattern matches every absolute path) |
| `rm -rf ~*` | 1 | 0 | 1 | mistake-stop (`rm -rf ~/.claude/tape`, `~/.claude/tape/907444e1…:5393`) |
| `docker run *` | 5 | 0 | 4 | policy (environment-changing → operator runs it) |
| `npm install*` | 3 | 0 | 3 | policy |
| `* > /dev/*` matching `> /dev/null` | 3 | 2 | 3 | FP |
| unclear (`tar` copy of the repo) | 1 | 1 | 1 | — |

### What the next call did

**sed -n (929)** (`sedn3.py`; "next" = the next 3 tool calls in the same transcript):

| Outcome | Count |
|---|---|
| Switched to Read | 759 |
| grep / other command on the same file | 20 |
| Edit / Write / Grep tool next | 11 |
| Pipe case → `head`/`tail`/`grep` on the same output (the intended alternative for a pipe) | 59 |
| Repeated `sed -n` (denied again) | 36 |
| Next Bash dropped the denied file (dropped goal, W9's variant) | 32 |
| Turn ended without the file (reviewers: "I already have what I need") | 6 |
| Operator spoke before the next call | 4 |
| **Re-shaped to read the same range another way** | **2** |

The 2: `~/.claude/projects/-home-eric-jig/cde649b4-…/subagents/agent-ab80874e823b55aaf.jsonl:40` (`sed -n '80,105p'` →
`cat … | head -100`), and `~/.claude/projects/-home-eric-haul/24aef25c-…/subagents/agent-af2e393336abc9aa4.jsonl:66`.

**npx (214):** 0 re-shaped next call to `npm exec`/`bunx`. Next call: `npm run` script 93, other Bash 60,
repeated `npx` 15 (each denied again), Read/Edit/Write 17, `node_modules/.bin/…` 4, turn ended 8, operator 3.
Of the 4 fetch-class denials, the next call complied every time: e.g. "No formatter runs in the gates, so I'm
fixing the indentation of the new block by hand" (`~/.claude/tape/centerline-2026-09-22-2140-main.jsonl:59057`).

**curl (59):** WebFetch 2, other tools/abandoned most; next-call re-shape to another HTTP client 0. Several
localhost checks were followed by a Playwright/Node screenshot script hitting the same server (e.g.
`~/.claude/projects/-home-eric-haul/1b834a02-…jsonl:656`); that reaches the same host by the project's normal
surface-check route and is not counted as a route-around. Stated outright: "`curl` to Cloudflare was denied, so
I won't fetch the ranges another way. I'll ask you to paste them" (`~/.claude/tape/524391e5-…jsonl:11015`).

**git branch -D (13):** 0 route-arounds. "Branch delete denied, which is fair. Leaving both branches alone"
(jig 09-17); "Denied — leaving the branch alone rather than re-issuing" (`~/.claude/tape/907444e1-…jsonl:2164`).
Two repeats: muster `~/.claude/tape/b300916f-…jsonl:1101` (retried once, then stopped), centerline
`030223f9-…jsonl:2278` → `:2311` (misread the denial as "a single command doing all those steps", re-issued the
delete later in another compound, denied again).

**.env secret reads (19):** 0 route-arounds. Next calls got the value from `docker-compose.yml`, a code default
(`DEFAULT_DATABASE_URL`) or `docker exec … psql` — none read the secret file another way.

**sed -i (20):** 20 of 20 switched to Edit (or Read then Edit). 0 re-shapes after a denial.

**Totals across all 1,290:** next call also denied 59; operator message before the next call 20; adjacent
re-shapes that reached the denied thing another way **2** (both sed -n). The session-level route-arounds are
below.

### Banned behaviour that got through (false negatives, and route-arounds not adjacent to a denial)

Scan of all 20,590 Bash calls for the banned shapes (`fn.py`), result not a denial:

| Shape | Ran | Verdict | Citation |
|---|---|---|---|
| `sed -n` anywhere | 0 of 894 | deny held every time | — |
| **`awk 'NR…' <file>` range read** (the W31 gap: rule names the shape, deny covers only `sed`) | **168 calls, 21 transcripts**, 09-08 → 11-03 (muster 142, centerline 16, jig 9, haul 1) | FN of the deny; prose-rule violation. 162 of 168 are in transcripts that had a `sed -n` denial earlier; 9 come within 5 calls of one (adjacent substitution) | first `~/.claude/tape/907444e1-…jsonl:3191`; e.g. `~/.claude/tape/muster-s91-2026-09-12-2220-main.jsonl:5389-5549` |
| **`npm exec -- <tool>`** (same capability as `npx`, not denied) | **21 calls, 1 session**: muster 2026-10-02, a session with 8 earlier `npx` denials (09-22 → 09-29, incl. `npx prettier --check` at `:2407`) | **route-around (b)**. One of the 21 is `npm exec -- prettier --check`: prettier is in no `node_modules` and not global on this machine, so npm fetched it — the exact Prettier-incident class, check-only. Followed by a hand reindent of 84 lines. | `~/.claude/tape/524391e5-035d-4039-90d6-96977d402969.jsonl:18059` (first), `:19596` and `:19601` (prettier), `:19606-19612`; `npx tsc` denied again in between at `:18254` |
| `git -C <repo> branch -D` | 7 before `c8b37f9`, 0 after | FN, fixed by `c8b37f9` | §2 B9 |
| `git branch -q -D` (flag before `-D`) | 1 | FN (pattern requires `-D` first) | `~/.claude/tape/muster-s91-2026-09-12-2220-main.jsonl:3668` (09-15) |
| `git push origin -f v0.4.0` (flag after the remote) | 1, ran: `+ 2b56273...96b40a5 v0.4.0 -> v0.4.0 (forced)` | FN; jig PR 70 names it "a separate gap" | `~/.claude/tape/centerline-2026-09-21-2137-main.jsonl:3149` (09-22) |
| `sed -i.bak` (no space after `-i`) | 3, all with a match-count assert | FN, not a route-around (no prior `sed -i` denial in that session) | `~/.claude/projects/-home-eric-jig/2eefa54b-4611-40fa-b938-ce6cb2cf98a9.jsonl:1013`, `:1934`, `:2076` |
| `git -C .sessions-worktree reset --hard` | 46 | sanctioned (`/its-alive`; `c8b37f9` omits it on purpose) — excluded | — |
| `git clean -f`, `push --force` (other) | 3 / 4 | text inside commit messages, PR bodies, test fixtures — excluded | — |
| `npx` / `curl` / `docker run` / `npm install` ran | 2 / 21 / 2 / 16 | all inside heredocs, PR bodies, docs text — excluded | — |

## 4. FALSE POSITIVES

| Pattern | Denials of legitimate work | Evidence | Status |
|---|---|---|---|
| `sed -n *` on command output (`npm test \| sed -n '/Failed/,…/p'`) | 133 | rule text bans extracting from a *file*; LEDGER W4: "legitimate pipe-extraction is now denied too … accepted deliberately" (`LEDGER.md:36`) | known, kept |
| `npx *` on installed devDependencies | 207 | the deny exists to stop a fetch (seeds `d3512a6`, `5fac31e`); a local binary fetches nothing. Next call was usually `npm run` (93). Operator had to run two scratch scripts by hand: `~/.claude/projects/-home-eric-centerline/1ea11e54-…jsonl:1762`, `~/.claude/projects/-home-eric-muster/7fabec35-…jsonl:2196` ("The permission policy refused to run my script (`npx tsx` …)") | kept; counted as a style row, not a mistake-stop |
| `curl *` on localhost / LAN dev servers | 45 (+2 Monitor) | operator had to run the cron tick by hand: `~/.claude/tape/muster-2026-09-16-2006-main.jsonl:2778-2789` (operator: "I can run it, I just need to give me the line to run"); operator asked why the sandbox blocked it: `~/.claude/projects/-home-eric-centerline/f091d55d-…jsonl:783`; pre-window, bushel-mobile Metro check (`2026-08-14-bushel-mobile-main.md:71`) | kept |
| `rm -rf /*` | 7 of 8 matches are `/tmp/…` scratch dirs | e.g. `~/.claude/projects/-home-eric-centerline/5fba4811-…jsonl:114`; `~/.claude/tape/9793c393-…jsonl:5453` | kept |
| `* > /dev/*` | 3, all `> /dev/null` | seeds `d3512a6` called the pattern "almost certainly inert"; it is not | kept |
| `docker run *` | 5, operator ran the tile build | `~/.claude/projects/-home-eric-centerline/5b325de7-…jsonl:430` ("`docker run` needs you" … "Done") | policy, kept |
| quoted pattern text inside a command | 1 (this research session: a `for p in '<pattern>' …` loop) | this session, not in `denials.json` | — |
| `Edit(` settings files `)` | **removed** | seeds `33c3545`: self-protection "charged for it every time the policy legitimately changed", a hand `cp` to three places "with a wrong-file mistake in the middle"; `a376237`: "Editing that path was denied by the very rules being removed" | removed 08-19 |
| 7 `Write(...)` rules | **removed** | seeds `d60de45`: never applied; a startup warning per rule every session | removed 08-19 |
| `.env` enumeration | **redesigned** | seeds `3b37b57` enumerated to keep `.env.example` readable; `b0d2526` renamed the template to `env.example` so the blanket would not block it | 08-11 |
| `git -C * reset --hard*` | **never added** | `c8b37f9`: `/its-alive` uses it every session start | by design |
| project-only `Write(**/.db_password)` (akaunting, not in the master) | 1 session, ~38 min blocked | `LEDGER.md:65` (W33) | project-scoped |

## 5. BUILD

`points:N` labels: one only — jig issue 91 `points:2` (`gh issue view 91`). jig PR 70 and every seeds PR
listed (`gh pr list` in seeds: 98, 174, 175, 188, 198, 200, 201, 208, 209, 210) carry no labels. Points below
come from session `## Task` blocks.

| Work | Points | Citation |
|---|---|---|
| seeds: installer denies + `.env*` blanket (`4ddec2a`, PR 175, applied by hand to muster and soundings) | 8 | seeds `sessions/2026-08-11-1207-eric-main.md:18,31` |
| seeds: drop 7 inert `Write` rules (PR 198) | 2 | seeds `sessions/2026-08-18-1957-eric-main.md:58,82` |
| seeds: deny list stops protecting itself (PR 200) | 2 | same `:124,138` |
| seeds: soundings adopts the policy | 1 | same `:142,153` |
| seeds: mirror into seeds' own `.claude/` (PR 201) | 1 | same `:157,166` |
| seeds: `settings-policy.mjs` created (PR 208, DEC-S051) | 5 | seeds `sessions/2026-08-22-1236-eric-main.md:69,95` |
| jig: `git -C` denies (PR 70) | 2 | jig `sessions/2026-10-04-1609-main.md:125,135` |
| jig: `sync.mjs` carries the permissions (issue 91) | 2 | jig `sessions/2026-10-13-1351-main.md:90,107`; label `points:2` |
| **Direct total** | **23** | |
| shared: seeds PRs 158–174, one of which (174) added the runner denies | 21 (whole batch) | seeds `sessions/2026-08-06-1258-eric-main.md:58,69,75` |
| shared: muster adopts seeds pull requests 190–201 (includes `sed -n`) | 2 | seeds `sessions/2026-08-18-1957-eric-main.md:170,185` |
| settings-policy extended to outputStyle / hook / devname (not denies) | 5 | seeds `sessions/2026-08-22-1236-eric-main.md:99,124` |
| **Upper bound** | **51** | |

Not traceable: seeds `2f294d4`, `3b37b57`, `be65249` (no seeds session files before 05-03, none on 06-04);
seeds `d3512a6`/`5fac31e` beyond the shared batch; seeds `c864ce7` (sed -n, a `/workout` run, PR 188) and
`1930680` (sed -i + the W27 guard, PR 210) — no task blocks; jig `5edf4fd` + `9a703df` (08-27, before jig's
first session file `2026-08-27-2146`); muster PRs 732/738 ("from other windows",
muster `sessions/2026-08-11-0127-eric-616-cancel-and-refund.md:186`).

Related checker, not counted here: jig `scripts/check-denied.mjs` (shipped docs must not instruct a denied
command), created jig `845676f` 2026-08-27, 6 commits.

## 6. UPKEEP

### settings-policy.mjs (`git log --follow --numstat`)

seeds `dev/claude/scripts/settings-policy.mjs` (created `772a49c` 08-23, +227):

| sha | date | +/− | class |
|---|---|---|---|
| `82be2f8` | 08-23 | 45/9 | defect fix (`--write` could reach the file it protects) — permissions path |
| `bba380f` | 08-23 | 73/4 | feature, not denies (outputStyle, capture hook, devname) |
| `08ef35f` | 08-24 | 23/7 | defect fix, hook path |
| `747ba3c` | 08-24 | 4/3 | defect fix, outputStyle verification |
| `5934e63` | 08-24 | 39/29 | feature, not denies (machine keys) |
| `c5410c1` | 08-25 | 22/0 | **FN fix** (W27: bare positional silently checked `~/.claude/settings.json`; 22 wrong verdicts in one session — `LEDGER.md:59`) |
6 commits, +206/−52. Test file: none in seeds.

jig `scripts/settings-policy.mjs` (import `5edf4fd` 08-27, +419):

| sha | date | +/− | class |
|---|---|---|---|
| `25486c9` | 08-27 | 18/4 | defect fix, tape-queue count (not denies) |
| `309ae3a` | 08-27 | 13/1 | defect fix, backup pruning |
| `d69f9d6` | 08-27 | 2/40 | review fixes |
| `e460ab2` | 09-12 | 72/19 | feature, not denies (keep-tape hook) |
| `b2b8f8c` | 09-12 | 7/1 | review fix, same |
| `dc1f946` | 09-24 | 92/10 | feature, not denies (output-style symlink) |
| `d29df63` | 09-24 | 67/7 | robustness (report when it cannot answer) |
| `be075ef` | 10-18 | 3/1 | review fix, sync's `--write` log (issue 91) |
8 commits, +274/−83. Test `scripts/settings-policy.test.mjs`: 4 commits (`e460ab2` 107/0, `b2b8f8c` 12/0,
`dc1f946` 96/2, `d29df63` 52/2), +267/−4. Of the 14 commits after creation across both repos, 3 touch the
permissions comparison itself (`82be2f8`, `c5410c1`, `d29df63`); the rest is the machine-config growth.

### Deny lists

| Repo | Commits after first deny | new pattern | FN fix | FP / dead-rule removal | sync / install |
|---|---|---|---|---|---|
| seeds (template + own) | 14 | 7 (`3b37b57`, `be65249`, `d3512a6`, `5fac31e`, `4ddec2a`, `c864ce7`, `1930680`) | 1 (`b0d2526`) | 2 (`d60de45`, `33c3545`) | 3 (`a376237`, `ad73f4d`, + `.claude/` copies inside `3b37b57`/`be65249`/`4ddec2a`/`b0d2526`) |
| jig | 2 after import | 1 (`9a703df`) | 1 (`c8b37f9`) | 0 | — |
| muster | 5 | — | — | — | 5 (`3d7bb7ea`, `0a7b2abb`, `79364778`, `fb86bf58`, `390d9a13`) |
| centerline / haul / soundings / sheepdog / bushel / chiplog | 2 / 1 / 4 / 2 / 2 / 1 | — | — | — | all |

## 7. RUNNING

- **settings-policy.mjs timing** (mill-dev, 2026-11-04, 3 runs each): `node scripts/settings-policy.mjs`
  62, 35, 32 ms (median **35 ms**); `--all .` 34, 36, 37 ms (median **36 ms**).
- **Invocations in transcripts:** 103 commands (jig 77, muster 14, centerline 9, haul 2, sheepdog 1), mostly
  `/its-alive` Step 7.6. Running time is about 4 s in total.
- **Its catches** (a `STALE` shared-project or machine file, i.e. denies not in force somewhere):
  - sheepdog committed file missing 56 denies incl. `npx *` (seeds v4 policy): `~/.claude/tape/907444e1-…jsonl:2795` (09-08), repaired during the migration (`ecaaf43`);
  - muster committed file stale: `~/.claude/tape/muster-2026-09-16-2006-main.jsonl:98` (09-16);
  - centerline and muster missing the 5 `git -C` denies: `~/.claude/projects/-home-eric-jig/7e3c02a8-…jsonl:199`, `~/.claude/projects/-home-eric-muster/920566a4-…jsonl:79` (10-13), centerline `9c30d88d-…:85` (10-16), `5e86342a-…:49` (10-17); fixed by sync `390d9a13` / `aa8c702` (10-18);
  - 1 machine-key finding, not denies (`effortLevel`, `ee547990-…:72`).
  On mill-dev these files were shadowed by a current user file, so none of the 4 deny findings let a command
  through here. False positives found: 0. FN found: W27 (seeds, pre-window).
- **Cost of a denial:** 1,290 denied tool calls = 3.3% of all 38,536 tool calls and 6.3% of Bash calls; each is
  one wasted round trip. Median gap from a denial to the next tool call 2.1 s (n = 1,206; p90 5.3 s) against
  6.1 s after an ordinary Bash call; summed gaps ≈ 117 min. **Estimate only:** the gap includes the model's next
  turn and parallel siblings. Operator involvement: 20 denials had an operator message before the next call;
  the citable FP costs are the cases where the operator ran the command by hand (§4).

## 8. PRICE: recorded incidents

| Incident | Class | Recorded cost | Citation |
|---|---|---|---|
| `npx prettier --write` in muster, 2026-08-10 | (a) before the deny | 231 lines of churn, reverted; a decision discussion the next day. **No points** (the session's 8 + 3 are for other tasks). | muster `sessions/2026-08-10-0034-eric-main.md:156-157`; `sessions/2026-08-11-0127-eric-616-cancel-and-refund.md:227-233`; muster `3d7bb7ea` |
| WiFi credential put outside `.env*` to avoid the deny, soundings 2026-08-24 | (b) route-around by design | credential published on `main`; password rotation ("a gigantic pain"). **No points or hours.** | `LEDGER.md:57` (W25) |
| `git branch -D` re-shaped 5 times against prompt denials, muster 2026-08-12 | (b) | 5 wasted calls; the operator told "denied twice". No points. | `2026-08-14-muster-686-resend-and-copy-link.md:67-82` |
| `npm exec -- prettier --check`, muster 2026-10-02 | (b) after 8 `npx` denials | a network fetch of a non-project tool; check-only, nothing written by prettier; 84 lines reindented by hand after. No points. | `~/.claude/tape/524391e5-…jsonl:19596-19612` |
| `git -C … branch -D` of merged sync branches | (a) FN | none: branches were merged | jig PR 70 body (`c39977a7-…:1928`) |
| forced re-tag `git push origin -f v0.4.0`, centerline | (a) FN | none recorded | `~/.claude/tape/centerline-2026-09-21-2137-main.jsonl:3149` |
| akaunting deny blocked its own runbook | FP (cost of the checker) | ~38 min blocked | `LEDGER.md:65` (W33) |
| `cp` of the master over `~/.claude/settings.json` killed the SessionEnd hook | distribution (why `--write` exists) | 4 days of lost capture | jig `scripts/settings-policy.mjs:17-21` |

**No incident of this class has a price in points.** The only priced units are lines (231), minutes (~38, an
FP cost) and days of lost capture (a distribution incident, not a run command).

## 9. Against issue 104's "believable" bar

- **Before/after traced to cited lines, not memory: met in part.** After: every denial and FN is a transcript
  line (checkable today, not durable). Before: ledger rows written from lost transcripts (W4, W9, W10) —
  cited, but secondary. One like-for-like in-transcript pair exists (`git -C … branch -D`, 7 → 0, confounded).
- **Cost from labels and git alone: not met.** One `points:2` label (issue 91). The other 21 direct points
  come from session blocks; the first deny, the baseline template, the `sed -n` and `sed -i` denies, and the
  jig import have no points anywhere. Upkeep in lines is fully from git.
- **Saving as a range with assumptions: not met in points.** No incident of this class carries points. A
  range can only be stated in other units (catches of the fetch class: 4, each priced by the one 231-line
  revert; secret reads stopped: 19, priced by nothing on record; W25 shows the cost of the deny's own
  route-around was the largest recorded).

## 10. Notes for the worksheet

- Separate rows: mistake-stops (`sed -n` file reads, `sed -i`, `.env` reads, destructive git, `rm -rf ~`,
  `npx` of an uninstalled tool, external `curl`) vs style/policy (`npx` of local tools, `docker run`, `npm
  install`) vs FPs (pipe `sed -n`, localhost `curl`, `/tmp` `rm -rf`, `> /dev/null`).
- Exclusions applied: this session; deliberate probes (`821debe6…:28`); sanctioned `-C … reset --hard`;
  commands where the banned text is inside a heredoc, commit message, PR body or test fixture.
- Adjacent compliance is near-total (2 re-shapes in 1,290). Route-arounds happen at session scale instead:
  `npm exec` (21 calls, 1 session) and `awk 'NR'` (168 calls, 21 sessions). A next-call measure does not see
  them.
