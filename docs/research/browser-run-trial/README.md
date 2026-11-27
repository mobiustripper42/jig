# Browser-run trial in haul: report for jig

**Outcome:** dropped as a standing step. Eric, 2026-11-27: "So, we can quit the browser-run … We can stop the browser runs." A browser run is still available when asked for by name.

**Sources.** Every number below comes from one of two places in `mobiustripper42/haul`:

- the standing rule "Browser run trial" in the session file `sessions/2026-11-23-1157-main.md` (orphan `sessions` branch), which holds each task's session-file line and the task's cost from its receipt;
- the `#### Browser run` section of each task's pull request body: PRs #259, #261, #265, #268, #270, #274.

## What the trial was

Eric's instruction (2026-11-24, copied into the standing rule): for the next tasks that add or change a screen, use the finished feature in a real browser before shipping it. No skill, agent or workflow file was to be edited for it. It ran after the proof passed and before `/kill-this`; inside `/build-task`, between Step 4 and Step 5.

- **Setup:** the review server on port 4100 against the e2e database (`.claude/ui-context.md` § Reaching a screen), the repo's own Playwright, scripts kept in the scratchpad.
- **Part 1, the hand steps:** do each "Verify by hand" step in the browser, as member and admin where both apply, at 375px and 1440px, clicking and typing only what a person could. No SQL or seed for the thing under test.
- **Part 2, off the script:** Cancel partway, Back, refresh, double-press, two tabs, the wrong person on a direct URL, empty, very long and odd values, every control at 375px.
- **Payments:** not run. Square's token is blank on the review server.
- **Defects:** written down, not fixed until `@ui-reviewer` had reported in `/kill-this`, then fixed with the review's findings in one round. This was so the report could say truthfully whether the reviewer also caught it (Eric's change, 2026-11-24).
- **Cost:** measured with `node .claude/skills/build-task/cost.mjs --since <run start>`, without `--receipt` (Eric's change, 2026-11-24).
- **Length:** three tasks, then extended by three (Eric, 2026-11-25: "cost seems low, 3 more tasks"). Six tasks in all.

## The six runs

| # | Task | PR | Steps | Defects found only here | Not run | Run cost | Task cost (receipt) |
|---|---|---|---|---|---|---|---|
| 1 | issue 238, account card follow-ups | #259 | 22 | 0 | 4 | 11.7k out, 5 min | 110k out, 26 min |
| 2 | issues 243 + 244, Upcoming weeks and History | #261 | 24 | 1 | 2 | 12.0k out, 4 min | 216k out, 84 min |
| 3 | issue 260, signed-in member without a subscription | #265 | 24 | 0 | 2 | 5.7k out, 4 min | 181k out, 49 min |
| 4 | issue 266, Admin and Member interfaces | #268 | 17 | 0 | 0 | 16.9k out, 5 min | 160k out, 33 min |
| 5 | issues 235 + 256, week dropdown and Save | #270 | 49 | 0 | 1 | 11.1k out, 4 min | 228k out, 59 min |
| 6 | issues 272 + 257, Weekly lists and dates | #274 | 38 | 0 | 4 | 21.9k out, 11 min | 167k out, 41 min |
| | **Total** | | **174** | **1** | **13** | **79.3k out, 33 min** | **1,062k out, 292 min** |

"out" is output tokens and "min" is active minutes, both as `cost.mjs` prints them. Across the six tasks, the run took 7.5% of the output tokens and 11.3% of the active minutes.

## What it found

The one defect found only by the run came from Part 2, not Part 1. In PR #261, an admin entered a menu name with 100 characters and no spaces, and a 260-character dish with no spaces. The page then scrolled sideways: 1721px wide at 375px, 808px at 1440px. No test and not `@ui-reviewer` had caught it. It was fixed and the step was repeated.

Part 1, the hand steps, found nothing in six tasks.

## What it missed, and who caught it

- **PR #261:** the second tap on the History link did not scroll. `@ui-reviewer` caught it; the run had not.
- **PR #270:** Eric's own review on a throttled connection found two bugs. Show week flashed on a slow load, and a pick made before the page's script had started was lost. The run never throttled the network. `@ui-reviewer`'s two contrast findings were also not seen: the run read the text, not its contrast. The PR body says so.
- **PR #274:** the run's own 375px screenshot showed a moved week's label clipped in the closed select ("Saturday, December 5 and Sunday, D"). The run's checks did not flag it, because they measured only dates breaking across lines. `@ui-reviewer` reported it.

## What the run cost beyond its steps

The script's own mistakes recurred and were paid for in reruns:

- **PR #265:** nine of the first script's 88 checks failed, all the script's own (links measured inside a closed menu, a page read before it changed).
- **PR #268:** nine checks failed on the first pass, all the script's own (unawaited navigations, sign-in's 20-an-hour request limit, a drawer closed by navigation). Rerun after `db:reset:dev`.
- **PR #274:** three reruns, each after a database reset (a page read before sign-in landed, a pick in the language select while hunting for the week select, a wait on the wrong element).

Every payment step, 13 in all across the six "Not run" lists, was out of reach because the review server has no Square token.

## Read of the evidence

These are observations from the six runs above. Anything marked **proposed** is not in jig or haul.

1. **The checks are the run.** A Playwright run judges only what its assertions measure. PR #274 had the defect in its own screenshot and still passed. Looking was never part of it.
2. **Part 1 found nothing.** The hand steps are written from the spec, which the task's tests are also written from; whether every step was already tested was not checked. The only find came from hostile input the spec didn't name.
3. **The environment set a ceiling.** No throttled network and no payments. The bugs Eric found after it were timing bugs on a slow connection, the class the run's setup couldn't see.
4. **`@ui-reviewer` overlapped it and caught more.** The reviewer found what the run missed in three PRs (#261, #270, #274); the run found one defect the reviewer missed (#261).
5. **The ordering rule worked.** Holding the run's defects until `@ui-reviewer` had reported is what made "found only here" a count that could be trusted. If browser runs come back in any form, keep it.

**Proposed, for jig to weigh, not adopted anywhere:**

- If a browser run is asked for by name, drop Part 1 and run only Part 2, with the network throttled as one of its cases.
- A cheap standing check for the one class it found: an e2e assertion that no page scrolls sideways at 375px with a long unbroken value in each text field the task adds.
