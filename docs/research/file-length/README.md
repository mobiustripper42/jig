# File length against cost: the worksheets

## Verdict: the ~200-line rule should go

**Where the rule was off, files of 200 to 400 lines drew no bigger share of fixes than shorter ones, and no length past 400 showed a cost that held across repos.** By the rule issue 134 set, that removes the rule. No measured length earns a replacement.

The rule is `.claude/agents/code-review.md:22` in jig: "any file / module / component over ~200 lines should be flagged with a split suggestion". The question was whether a file's length predicts what it costs. Cost was measured two ways: the share of a file's commits that are fixes, and review findings that cite the file.

### The key table

Fix share is fix commits over commits that modified the file. That denominator leaves out the commit that added it, which is rarely a fix and would otherwise pull short files down. Review citations are counted per 1,000 lines changed in reviewed pull requests. Windows with the rule off:

| Window | Band | Files | Fix share | Review citations per 1,000 lines |
|---|---|---|---|---|
| centerline after 91c7378 | under 200 | 143 | 0.19 | 3.6 |
| | 200–400 | 12 | 0.17 | 3.1 |
| | over 400 | 3 | 0.29 | 2.0 |
| soundings after 2e8f2d4 | under 200 | 69 | 0.37 | 1.7 |
| | 200–400 | 9 | 0.29 | 1.3 |
| | over 400 | 1 | no modifying commits | 0.0 |
| muster after 692ebf75 | under 200 | 334 | 0.15 | 6.3 |
| | 200–400 | 83 | 0.15 | 4.1 |
| | over 400 | 37 | 0.20 | 5.4 |

Sources: `evidence/fix-share-modify-only.md` for the shares and `evidence/review-findings.md` for the citations. Muster's citations are for pull requests merged after 692ebf75, banded at each merge commit. The shares are banded at origin/main.

With the rule on, over 400 is the lower band:
- haul: 0.17 against 0.28 under 200.
- muster before 692ebf75: 0.20 against 0.29.
- sailbook: 0.50, from 3 files.

The full rule-on table is in `02-fix-share-by-length.md`.

### Why the verdict reads this way

- **200 is not where anything changes.** From under 200 to 200–400, the fix share is the same or lower in all three rule-off windows. The largest sample is muster's, at 0.15 against 0.15 from 83 and 334 files. Review citations per line changed are lower too (`02`, `03`).
- **Over 400 is mixed, and the one real climb is confounded.**
  - Muster's ~800 period reads 0.20 against 0.15, outside the noise. But the gap sits in files with 20 or more commits: the repository adapters, the contract suite and the payment webhook, which every data-model change passes through (`evidence/fix-share-strata.md`). They may draw fixes for being central, not long.
  - Centerline's 0.29 comes from 3 files.
  - The same comparison runs the other way in haul and in muster's own earlier period. A climb that reverses inside one repo is not a rule.
- **The rule does not hold files under 200 where it is on.** Haul went from 1 file over 200 to 24, and from none over 400 to 10, in three weeks with the rule installed. Its longest file is 1,732 lines. The share of files over 200 is 9 to 13% in four repos with the rule on or off (`01-length-over-time.md`).
- **What the rule produces is "Left".** 18 review findings were about length. 11 are in haul, and most of those are marked "Left", as in "Left — `card-entry.tsx` is 271 lines" (haul pull request 227) (`03`). The flag is raised and declined.
- **The fix count is right as often on long files as short.** A hand check of 123 pairs found the fix in the counted file 0.86, 0.82 and 0.86 of the time across the three bands (`04-hand-check.md`). The regex errors do not lean toward long files.

### What this did not measure

- **Reading cost.** Centerline replaced the rule with "split on responsibility, so a task reads only the part it changes" (`evidence/rule-history.md`). The cost that sentence names is the context a session spends reading a file. Nothing here measures it; session token counts were not used.
- **Bugs as such.** About half of what the regex counts are defects, and the rest are review cleanups and comment corrections (`04`). The fix share is "changes that correct something".
- **Time or points.** No per-file cost in points exists to join against.
- **Long histories.** The rule-off windows cover 5 weeks (centerline), 4 months (soundings, from 2e8f2d4 to origin/main on 2026-10-08) and 4 months (muster). Soundings has 1 file over 400, and centerline 3.

### What would make the next measurement stronger

These are proposals, not built:
- **Tag the file a fix corrects,** for example in the review section's "Fixed" line. Today it can be read only from the diff.
- **Measure a session's reading cost per file** from the transcripts while they last, the cost the responsibility rule names.

## The worksheets

Working files for issue 134. Each worksheet cites its numbers to a file in `evidence/`, a commit (`repo sha`) or a pull request number. They are records as of 2026-11-21 and cite paths in other repos, as `../checker-roi/` does.

| File | What it measures |
|---|---|
| `01-length-over-time.md` | Length distribution at dated commits, which repos had the rule and when, centerline's growth after 91c7378 |
| `02-fix-share-by-length.md` | Fix share per length band, on two denominators, with the rule on and off |
| `03-review-findings.md` | `@code-review` findings in merged pull request bodies that cite a file, by length band |
| `04-hand-check.md` | 123 fix pairs read by hand: was the fix in the file it is counted against |

`evidence/` holds the raw output: the tables, one row per file (`evidence/per-file/`), one row per review citation (`evidence/review-citations.csv`), the hand-check pairs and verdicts, and the rule history as commands and output. The scripts ran from a scratchpad and were not kept. The counts can be rebuilt from the refs, the method in each worksheet and the rules below.

### What was measured

- **Repos and refs.** `origin/main` in centerline, soundings, muster, haul and sailbook, read-only on 2026-11-21 (`evidence/rule-history.md`). The local checkouts were on task branches with unmerged work.
- **Muster is not a rule-on repo.** It dropped the 200-line flag at 692ebf75 (2026-07-24) for "~800 lines *when it also mixes concerns*", so its history is read as two windows (`01`).
- **Source files.** `.ts .tsx .js .mjs .cjs .jsx` in all five repos, plus `.cpp .h .py` in soundings, where only `.cpp .h .py` exist outside jig's scripts. Excluded:
  - tests: `*.test.*`, `*.spec.*`, `test_*.py`, `*_test.*`, and any path under `__tests__/`, `e2e/`, `test/`, `tests/`, `fixtures/` or `__mocks__/`;
  - test support: file names with `fixture`, `fake`, `test-database`, `test-support`, `reset-test`, or starting `mock.`;
  - migrations (any path under `migrations/`);
  - files jig syncs in (any path also in jig's tree, and `scripts/check-*`, `gen-*`, `split-*` and `scripts/lib/`);
  - `docs/`, `.claude/` and `.github/`;
  - `*.config.*` files and `*.d.ts`;
  - `node_modules/`, `vendor/` and `third_party/`;
  - one vendored file (soundings `firmware/src/core/ed25519.cpp`, TweetNaCl) and one generated file (sailbook `src/lib/supabase/types.ts`, the Supabase type output).

  Lockfiles and `.sql` have no code extension. Counts by reason are in `evidence/length-over-time.md`.
- **Length** is lines in the file, comments and blank lines included.
- **Fix commit:** a non-merge commit whose subject matches `\b(fix(?!ture)|bug|review|revert)`, ignoring case, on plain path history with rename following off.
