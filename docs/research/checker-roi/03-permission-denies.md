# The permission denies (`permissions.deny` and `scripts/settings-policy.mjs`)

Gathered 2026-11-04. The second-loop checker for issue #104. Raw evidence, with a citation on every row: `evidence/permission-denies.md`.

**Verdict against the issue's bar:**
- **Counts trace to cited records: met in part.** The after side is transcript lines. The before side is seeds ledger rows written from transcripts that are now lost.
- **Cost totals from labels, git and session blocks: not met.** One `points:N` label exists (jig issue 91). Even counting session `## Task` blocks (README § Verdict), the first denies, the `sed -n` and `sed -i` denies and the jig import have no points recorded anywhere.
- **Saving stated as a range: not met.** No incident of this class has a price in points.

**The mistake it targets:** a command the operator has decided against, run anyway. Either it ran because nothing stopped it (before the deny, or where the pattern misses), or a denied command was re-shaped to route around the deny.

**Two things are measured here, not one.** The deny list stops commands. `settings-policy.mjs` stops nothing: it checks that the deny list is in force, and from 2026-08-23 it also grew into the machine-config checker (seeds `bba380f`, `5934e63`; jig's keep-tape hook followed on 09-12). On mill-dev the user-level `~/.claude/settings.json` carried the full list for the whole transcript window, so a stale project file let nothing through here (`evidence/permission-denies.md` § intro).

## Dates

| Event | Citation |
|---|---|
| First denies (10: destructive git, `rm -rf`) | seeds `2f294d4`, 2026-04-30 |
| Template, then default-allow with a long deny list | seeds `3b37b57`, `be65249`, 2026-06-04 |
| Runners, installers, the `.env*` blanket | seeds `d3512a6`, `4ddec2a`, `b0d2526`, 2026-08-11 |
| `sed -n`, then `sed -i` | seeds `c864ce7` 08-17, `1930680` 08-25 |
| Into jig with `settings-policy.mjs`; `AskUserQuestion` added | jig `5edf4fd`, `9a703df`, 2026-08-27 |
| The five `git -C` spellings | jig `c8b37f9`, 2026-10-07 |

Muster's first committed denies are `3d7bb7ea` (2026-08-11). The 2026-07-20 file (`6d211233`) held hooks only.

## Before and after

Three like-for-like pairs exist, each in one unit:

| Pattern | Before the deny | After | Source of the before |
|---|---|---|---|
| `sed -n` file-range read | 58 calls in 3 sessions in one week | 0 ran: every one of the 894 Bash calls matching the pattern was denied | seeds `LEDGER.md:36` (W4) |
| `AskUserQuestion` against the standing preference | 6 uses in 3 sessions | 0 uses, 0 attempts in 38,536 tool calls | seeds `LEDGER.md:42` (W10) |

The 894 is a count of Bash calls whose text matches the pattern. The 929 below is a count of denials, deduplicated, including `sed -n` inside compound commands. The two bases are not reconciled.
| `git -C <repo> branch -D` | 7 commands in 15 days | 0 in 28 days | transcripts (the one pair with both sides in transcripts) |

**Caveats:**
- The first two before-counts are secondary: ledger rows, not tool calls anyone can recount.
- The `AskUserQuestion` pair is confounded too. The same cycle also wrote the rule into `CLAUDE.md` § Communication (`LEDGER.md:42`). And zero attempts is consistent with a deny on a bare tool name removing the tool from the session, which is inferred, not verified.
- The third is confounded. The sync recipe moved into `sync.mjs` around the same time (jig `sessions/2026-10-04-1609-main.md:155-186`), which changed how branches get cleaned up.

**A similar shape got through.** `awk 'NR…' <file>` did a file-range read 168 times in 21 transcripts, and the deny names only `sed`. The prose rule already named the shape. There is no count from before the deny, so whether `awk` replaced `sed -n` is unknown. 9 of the 168 came within 5 calls of a `sed -n` denial, which is the only direct evidence of substitution (`evidence/permission-denies.md` § 3, first at `~/.claude/tape/907444e1-…jsonl:3191`).

## Compliance after a denial

1,290 denials in 549 transcripts, 2026-08-31 to 11-04:

| Pattern | Denials | Kind |
|---|---|---|
| `sed -n` | 929 | mistake-stop for 732 file reads; 133 were pipes of command output (false positives) and 64 were `cat`/`git show` piped |
| `npx` | 214 | about 207 are local tools already installed (policy); 4 were fetches of an uninstalled tool (mistake-stop) |
| `curl` | 59 | 45 to localhost (false positives); about 14 external |
| `sed -i` | 20 | mistake-stop; 20 of 20 switched to Edit |
| `.env*` reads | 35 | 19 secret reads (mistake-stop); 16 guesses at `.env.example` |
| `git branch -D` | 13 | mistake-stop |
| `rm -rf`, `docker run`, `npm install`, `> /dev/null`, one unclear | 20 | mostly false positives and policy |

**What followed a denial:**
- **2 of 1,290 were re-shaped within the next 3 calls** to reach the same thing another way (both `sed -n`).
- **59 retried the same denied command** and were denied again: 36 `sed -n` and 15 `npx`, among others.
- **20 had an operator message** before the next call.
- **One centerline session re-issued a denied `git branch -D` later, inside another compound command,** and was denied again (`evidence/permission-denies.md` § 3). The "2" doesn't count it.
- The rest complied, dropped the goal, or ended the turn.

**Beyond the next few calls:**
- the `awk 'NR…'` reads above;
- `npm exec --`, 21 calls in one muster session that had 8 `npx` denials. Most ran installed tools (vitest, eslint, playwright), which is a response to the `npx` false positive, not a leak. One was `npm exec -- prettier --check`, which fetched an uninstalled tool: the class of the original Prettier incident (`~/.claude/tape/524391e5-…jsonl:19596`).

**Patterns that missed (false negatives):**
- `git branch -q -D` (1);
- `git push origin -f v0.4.0`, which force-pushed a tag (1, centerline);
- `sed -i.bak` (3, each with an anchor check).

## Cost

**Build:** 23 points directly, from session `## Task` blocks. That includes 5 for `settings-policy.mjs` (seeds `sessions/2026-08-22-1236-eric-main.md:95`). The upper bound is 51, counting shared and non-deny work.

The first denies, the template, the `sed -n` and `sed -i` denies and the jig import have no points recorded anywhere: **not traceable**.

**Upkeep:**
- `settings-policy.mjs`: 14 commits across seeds and jig. Only 3 of them touch the permissions check itself (`82be2f8`, `c5410c1`, `d29df63`); the rest is the machine-config growth.
- Deny lists: in seeds, 7 new-pattern commits, 1 fix for a missed case and 2 removals. In jig, 1 new pattern and 1 fix. In the projects, syncs only.

**False positives that were removed or redesigned:**
- the self-protection `Edit` rules (seeds `33c3545`);
- 7 `Write` rules that never applied (`d60de45`);
- the `.env` template renamed to `env.example` so the blanket would not block it (`b0d2526`).

**False positives still in force:**
- `sed -n` on command output (133), accepted on purpose (`LEDGER.md:36`);
- `npx` on installed tools (about 207);
- `curl` to localhost (45). Twice the operator had to run the command by hand (`evidence/permission-denies.md` § 4).

**Running:**
- `settings-policy.mjs` takes about 35 ms and ran 103 times.
- It found 4 places where denies were not in force, and no false positives.
- A denial costs one wasted tool call: 1,290 of 38,536 calls (3.3%). The time gaps total about 117 minutes, but that is an estimate, because the gap includes the next turn.

## Price

| Incident | Recorded cost |
|---|---|
| `npx prettier --write`, muster 2026-08-10, before the deny | 231 lines reformatted and reverted; no points (muster `sessions/2026-08-10-0034-eric-main.md:156-157`) |
| A credential named outside `.env*` to avoid the deny, soundings 08-24 | published on `main`, password rotated; no points or hours (`LEDGER.md:57`, W25) |
| A deny blocking its own project's runbook, akaunting | about 38 minutes, a cost of the deny, not a saving (`LEDGER.md:65`) |

**No incident of this class has a price in points.** Avoiding the deny contributed to the largest recorded harm, W25. The ledger says the file was named outside `.env*` "partly to avoid" the deny, and the leak itself came from a commit made in a web UI that no guard covers.

## What this means

- **Compliance is the measurable part.** Denied commands are almost never re-shaped, and the before/after pairs that exist all go to zero, with the caveats above.
- **What the measure can't see is a different tool for the same job.** Whether `awk` replaced `sed -n` can't be told without a before count.
- **Mistake-stops, policy and false positives are separate rows.** Of 1,290 denials:
  - about 190 were false positives in the sense of a legitimate command denied: pipes into `sed -n`, `curl` to localhost, `rm -rf /tmp`, `> /dev/null`. That differs from issue 104's sense, a failure fixed by changing the checker; those are the removals listed under Cost.
  - about 215 were policy: `npx` of installed tools, `docker run`, `npm install`.
  - 64 piped `cat`/`git show` reads and 16 `.env.example` guesses are unclassified.
  - The rest stopped a mistake.
