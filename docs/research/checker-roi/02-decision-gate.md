# The decision-record gate (`scripts/check-decisions.mjs`)

Gathered 2026-11-03 to 2026-11-04. The pre-pilot checker for issue #104.

**Verdict against the issue's bar:**
- **Counts trace to cited records: met for muster only.** Muster is the one repo with a before and an after. jig, centerline and haul had the gate from their first decision record.
- **Cost totals from labels and git history alone: met in part.** No `points:N` labels exist on this work, so build points come from session `## Task` blocks.
- **Saving stated as a range with its assumptions: met, but weakly.** The price per escape rests on one cited incident.

**The mistake it targets:** a malformed or dangling decision record. That covers a stale index, a duplicate id, an unknown topic, a dangling reference, an oversized record, a missing `revisit_if`, a declared spec amendment that never landed, and an edit to a frozen record.

## Dates

| Event | Citation |
|---|---|
| Written | muster `ad3c04ab`, 2026-07-27 |
| On muster `main` | muster `0e0b808d` (pull request 569), 2026-07-27 |
| Imported into jig | jig `4cb09ae`, 2026-08-27 |
| Installed in centerline | centerline `59f05b5`, 2026-09-19 |
| Installed in haul | haul `6786cf1`, 2026-10-25 |

## Before and after

| | Window | Merged pull requests (touching decisions) | Mistakes of this class on `main` |
|---|---|---|---|
| Before | muster, 2026-06-03 to 07-27 | 241 (90) | **7 kinds of defect**, found at once by an audit and the gate's first run |
| After | muster, 07-27 to 10-31 | 315 (81) | 2: one caught on `main` by the gate, one latent and caught when a new rule arrived |
| Gate from the start | jig, 08-25 to 10-30 | 75 (22) | 0 found in commit messages |
| Gate from the start | centerline, 09-18 to 11-01 | 112 (30) | 0 found in commit messages |
| Gate from the start | haul, 10-24 to 11-02 | 30 (16) | 0 found in commit messages |

**The seven before:**
1. DEC-138, 134 and 135 named different decisions on `main` and on a feature branch (muster `47661800`; fixed in `704163a9` and `41744b18`).
2. Four of the last nine records had no index row (muster `docs/audit/2026-07-25/README.md:246-248`).
3. The index footer said "124 of 124" against 137 rows (`ad3c04ab`).
4. DEC-114 cited a renumbered DEC-100 (`ad3c04ab`).
5. A test cited `DECISIONS.md:2159` by line, and the line had drifted (`ad3c04ab`).
6. 28 supersede links were written on one side only (audit README `:238-241`).
7. 17 of 41 declared spec amendments had never landed (audit README `:254-255`; `ec7fb996`).

Eight more id collisions in that window were caught by git merge conflicts and never reached `main` (for example `7e24a024`, `4f4f2ebb`, `d9315fbd`, `9f1238d3`).

**The two after:**
1. Six pull requests merged and left the footer count stale. CI went red on muster `main` (runs 30600418101, 30624422956 and 30624445280, 2026-07-31) and stayed red for about 8 hours (muster `sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362`). It was fixed in `41498b98`, and `9e4edfba` removed the footer count so it can't recur.
2. DEC-107 and DEC-124 had been marked superseded with no successor. The defect was latent on `main` from before the gate, and was caught when jig's pair rule reached muster (muster `d4a3c70d`, pull request 873).

**Duplicate-id collisions did not stop.** After the gate they were still caught the same way as before: by git at merge (DEC-144, DEC-182, DEC-185; muster `40c9df9c`, `811398af`, `061e62d5`), and once by the gate in pull request CI (DEC-178, run 35508089967). The gate moved where a collision is caught, not how often one is made.

**Why "7 against 2" is not a rate comparison:**
- **Different units.** The before side counts kinds of defect: B6 is 28 one-sided links and B7 is 17 unlanded amendments, each counted once. The after side counts incidents.
- **Different search effort.** The 7 came from one exhaustive audit (muster `docs/audit/2026-07-25/README.md`) plus the gate's first sweep. The after counts come from commit messages and CI. The after side was searched far less thoroughly.
- **The class grew.** B7 is a check the gate added a day after it shipped (`ec7fb996`).
- **One repo.** jig, centerline and haul have no before, so their zeros say only that nothing visible escaped.

What the before side does show is that muster's `main` carried a backlog of these defects that nobody had noticed, and that the audit and the gate's first run were what found it.

## Cost

**Build:** 2 points for the gate itself (muster `sessions/2026-07-27-1548-eric-main.md:56`). Extensions add 17 points in muster and 25 in jig, though some of those points are shared with other work:

| Repo | Pull request: points |
|---|---|
| muster | 573: 5 (shared with the file split), 591: 2, 592: 5, 847: 5 |
| jig | 5: 5, 6: 2, 19: 3, 23: 5 (mostly `check-dictionary`), 27: 3, 28: 1, 29: 2, 95: 2, 96: 2 |

jig pull request 1, the import, has no task block: **not traceable**.

**Upkeep** (`git log --follow --numstat`):

| File | Commits after first ship | Lines |
|---|---|---|
| muster checker | 18 (11 native) | +869 / −374 (native +470 / −261) |
| muster test | 12, then deleted in `bae4f334` | +941 / −1062 |
| jig checker | 15 (13 net of a revert pair) | +544 / −258 (+445 / −159) |
| jig test | 15 | +520 / −98 |

**False positives**, where the checker changed because it failed good input:
- Five were latent and caught in review before merge: muster `e59926f1` and `725cf9f7`; jig `5a9fed6`, `8821367`, and `7ccda51`/`4df3e37`.
- One was observed live: archiving a record failed its correct citations (jig `a819ee7`, muster `dd65d468`).
- One was worked around with no checker change: haul reworded correct citations of muster's records so the gate would stop flagging them (transcript `-home-eric-haul/2acb7ce8…jsonl:660`).

**Running:**
- About 0.2 s per run: jig 188 ms, muster 234 ms, centerline 168 ms, haul 164 ms, the median of 3 runs on mill-dev.
- 1,200 commands ran the gate in transcripts from 2026-08-30 to 11-03: muster 449, jig 278, centerline 346, haul 127.
- Running time totals about 4 minutes. The real running cost is the fix cycles below.

## Catches

138 red outputs in transcripts, grouped into 69 episodes, across muster, jig, centerline, haul and sheepdog. A run of retries on the same record in one session counts once. The evidence lists 70; E8 is a false match, not a gate run, and is left out here.

| Kind | Episodes |
|---|---|
| Record over 2,000 bytes | 43 |
| Field over its length limit | 24 |
| Bold lead-in | 10 |
| Integrity (pairs, dangling, stale index, topic, spec section, key) | about 23 |

An episode can carry several kinds, so these don't add up to 69.

**Most red runs are the gate's own size rules.** Those episodes are trim-and-retry loops while a record is being written, not defects heading for `main`. No recorded incident prices what an oversized record would have cost. So they count as running cost, not saving.

**Integrity catches:** 23 episodes, listed in `evidence/decision-gate.md` § 6. Taking them row by row:

| Episodes | Count | Counted as a catch? |
|---|---|---|
| E14, E17, E27, E28, E30, E31, E36, E37, E42, E59, E63, E66, E70 | 13 | **Yes**: a mistake in a record, fixed in the record |
| E45 | 1 | Separately: a bug in the generator (`gen:decisions`), which became jig pull request 96 |
| E1, E2, E3 | 3 | No: migrating sheepdog onto the gate |
| E5, E6, E9 | 3 | No: deliberate probes |
| E7 | 1 | No: the gate read a stray `archive/README.md` as a record |
| E40 | 1 | No: a false positive, worked around |
| E47 | 1 | No: the checkout switched branches under the session; the record was fine |

So the gate made **13 record catches** and found one generator bug. The 13 by kind: supersession pairs ×6, unknown topic ×2, spec section ×2, stale index ×2, missing key ×1. Every episode is listed in `evidence/decision-gate-episodes.txt`.

**CI catches:**
- 1 on a muster pull request branch: a duplicate DEC-178 (run 35508089967, 2026-09-20).
- The 3 red `main` runs above.

Haul's CI was green 33 of 33. jig and centerline have no CI.

**Missed (false negatives):** muster `b35ea7ce`, `bf6a7a49`, `246ad137`, `fc2bd70d`; jig `d69f9d6`, `fa0c596`; plus the dropped flow-style `supersedes` (`~/.claude/tape/b300916f…jsonl:2685`). The checker was changed after each one.

## Price per catch, and the saving

These are the incidents where a mistake of this class reached `main` and nothing caught it:

| Incident | Recorded cost |
|---|---|
| Muster pull request 528: a triple id collision, missing index rows, a pointer at a record that never landed | 1 point (muster `sessions/2026-07-25-0358-eric-chore-forward-merge-main-2.md:19`) |
| Muster issue 562: DEC-138 collision, found by audit | audit shard Z took about 10 min and about 407k subagent tokens, covering four questions; the fix merge touched 73 files; 0 points recorded (audit README `:228-229`) |
| Stale footer on `main` | about 8 h of red `main`, plus pull request 629; no points recorded |

**Only one incident carries a price in points: 1 point** (pull request 528). The other two have no recorded points. Jig pull request 96 is left out on purpose: its 2 points were the cost of fixing the checker, already counted under build, not the cost of a mistake that escaped.

**The range.** It rests on that one anchor. The band around it, 0.5 to 2 points per escape, is an assumption, not a citation.
- **Saving:** 13 catches × 0.5–2 points = **6.5 to 26 points.** At the anchor alone, 13 points.
- **Cost:** 2 points to build the gate, plus up to 42 points of extensions (17 in muster, 25 in jig), plus the size-rule fix cycles. Some extension points are shared with other work, so 42 is an upper bound.
- **Net:** saving 6.5–26 points against cost 2–44 points plus unpriced loops. The ranges overlap, so this worksheet claims no net figure.

**Assumptions written beside it:**
- **Not every catch would have escaped.** Before the gate, git conflicts caught eight collisions at merge. That pushes the low end down.
- **Prevention is invisible.** A record written correctly because the gate exists leaves no trace. That pushes the high end up.
- **The size-rule loops are unpriced.** They are 43 + 24 + 10 episode-kinds of cost against no recorded incident.
- **One window only.** Catches are counted only from 2026-08-30, the date the transcripts start.

## What this means for the second loop

- The method produces cited numbers when before-counts come from commits, session files and audits. It does not produce a rate comparison: no checker has transcripts on both sides of its ship date.
- The price per escape is the weakest number. The second loop should look for priced incidents first, before counting catches.
- The size rules should go on a row of their own in the full report. They are most of the gate's red runs and none of its priced saving.
