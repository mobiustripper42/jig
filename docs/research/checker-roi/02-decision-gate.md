# The decision-record gate (`scripts/check-decisions.mjs`)

Gathered 2026-11-03 to 2026-11-04. The pre-pilot checker for issue #104.

**Verdict against the issue's bar:**
- **Counts trace to cited records: met.**
- **Cost totals from labels and git history alone: met in part.** No `points:N` labels exist on this work, so build points come from session `## Task` blocks.
- **Saving stated as a range with its assumptions: met.**

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
| Before | muster, 2026-06-03 to 07-27 | 241 (90) | **7**, found at once by an audit and the gate's first run |
| After | muster, 07-27 to 10-31 | 315 (81) | 1 reached `main`, caught there by the gate |
| After | jig, 08-25 to 10-30 | 75 (22) | 0 |
| After | centerline, 09-18 to 11-01 | 112 (30) | 0 |
| After | haul, 10-24 to 11-02 | 30 (16) | 0 |

**The seven before:**
1. DEC-138, 134 and 135 named different decisions on `main` and on a feature branch (muster `47661800`; fixed in `704163a9` and `41744b18`).
2. Four of the last nine records had no index row (muster `docs/audit/2026-07-25/README.md:246-248`).
3. The index footer said "124 of 124" against 137 rows (`ad3c04ab`).
4. DEC-114 cited a renumbered DEC-100 (`ad3c04ab`).
5. A test cited `DECISIONS.md:2159` by line, and the line had drifted (`ad3c04ab`).
6. 28 supersede links were written on one side only (audit README `:238-241`).
7. 17 of 41 declared spec amendments had never landed (audit README `:254-255`; `ec7fb996`).

Eight more id collisions in that window were caught by git merge conflicts and never reached `main` (for example `7e24a024`, `4f4f2ebb`, `d9315fbd`, `9f1238d3`).

**The one after:** six pull requests merged and left the footer count stale. CI went red on muster `main` (runs 30600418101, 30624422956 and 30624445280, 2026-07-31) and stayed red for about 8 hours (muster `sessions/2026-07-30-0307-eric-586-admin-nav.md:360-362`). It was fixed in `41498b98`, and `9e4edfba` removed the footer count so it can't recur.

**Caveat:** the before figure is a backlog found at once, not a rate per session. No transcripts cover that window, so it can't be one.

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

139 red outputs in transcripts, grouped into 70 episodes. A run of retries on the same record in one session counts once.

| Kind | Episodes |
|---|---|
| Record over 2,000 bytes | 43 |
| Field over its length limit | 24 |
| Bold lead-in | 10 |
| Integrity (pairs, dangling, stale index, topic, spec section, key) | about 23 |

An episode can carry several kinds, so these don't add up to 70.

**Most red runs are the gate's own size rules.** Those episodes are trim-and-retry loops while a record is being written, not defects heading for `main`. No recorded incident prices what an oversized record would have cost. So they count as running cost, not saving.

**Integrity catches:** about 23 episodes. Of these, 3 were deliberate probes and 3 came from migrating sheepdog onto the gate. That leaves about 17 real mistakes fixed in the record:
- supersession pairs ×7;
- unknown topic ×2;
- missing spec section ×2;
- stale index ×2;
- one each: a missing key, a stray README, and a branch switched under the session.

One catch was a bug in the generator (`gen:decisions`): it was dropping a flow-style `supersedes`, which became jig pull request 96. Each catch is cited to a transcript line in `evidence/decision-gate.md` § 6, and every episode is listed in `evidence/decision-gate-episodes.txt`.

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
| Stale footer on `main` | about 8 h of red `main`, plus pull request 629 |
| Flow-style `supersedes` dropped while the gate passed | 2 points (jig pull request 96) |

**The range.** Assume each integrity catch would otherwise have reached `main`, and that each such escape costs what the incidents above did: 0.5 to 2 points apiece.
- **Saving:** about 17 catches × 0.5–2 points = **8 to 34 points.**
- **Cost:** 2 points to build the gate, plus up to 42 points of extensions (17 in muster, 25 in jig), plus the size-rule fix cycles. Some extension points are shared with other work, so 42 is an upper bound.

**Assumptions written beside it:**
- **Not every catch would have escaped.** Before the gate, git conflicts caught eight collisions at merge. That pushes the low end down.
- **Prevention is invisible.** A record written correctly because the gate exists leaves no trace. That pushes the high end up.
- **The size-rule loops are unpriced.** They are 43 + 24 + 10 episode-kinds of cost against no recorded incident.
- **One window only.** Catches are counted only from 2026-08-30, the date the transcripts start.

## What this means for the second loop

- The method works when before-counts come from commits, session files and audits.
- The comparison that holds is the backlog: seven defects on `main` before the gate, against one in four repos after.
- The open question is whether the size rules belong in the checker's cost or are a separate rule riding on the same gate. The full report should report them on a row of their own.
