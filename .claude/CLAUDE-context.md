# jig — Project Context

Everything specific to **this** project. `CLAUDE.md` reads this file at session start and treats it as authoritative for project-specific facts.

jig is an unusual consumer of its own templates — it is a workflow fixture, not an application — so several slots below read `N/A` with the reason stated. That is the design: the shell states the invariant, this file says how it is met here.

## What We're Building

A fixture. The name is the argument: a jig makes the wrong cut impossible rather than discouraged, and the constraint is physical instead of remembered.

jig replaces `seeds`, which failed by growing prose faster than anyone could read it. The evidence, from one afternoon in seeds: a mechanical `sed -n` deny fired 7 times across 4 repos and was obeyed every time, while a prose rule was broken 11 times, 4 of them after it was written. Across a full day, one decision file was opened — the one just written — while 257KB of record sat unread and its claims still reached us, laundered through `CLAUDE.md` and code comments citing records nobody had opened.

**The filter every mechanism here has to pass: does it work when nobody remembers it's there?** Keep it if yes. Bin it if it is a paragraph hoping to be recalled at the right moment.

**What jig physically does.** Broadly two kinds of file: `scaffold/` for a new project, copied once and then owned there; and templates for repos already installed — `.claude/skills/**`, `CLAUDE.md`, the gate scripts — where jig's copy is canonical and a project's is supposed to be identical. `.claude/file-classes.yaml` is the real taxonomy, five classes with the reasoning beside each, and it is what `drift.mjs` reads. Template changes are made in jig. The exception is a file that can only be evaluated by living in it, which gets prototyped in a repo with active development and harvested back — the output style did this in muster, three revisions, then pull request #39 brought it here.

**Templates cross when the operator asks, never on a schedule.** A session in a project runs `drift.mjs` at start and learns what is out of date; that session reports and does nothing. When the operator says to bring a project up to date, `scripts/sync.mjs` decides what crosses for every file where the answer is a lookup: a project copy matching a version jig once shipped at that path is one nobody edited, and jig's current version replaces it (DEC-J012). Every other file is held, and what happens to a held file is a person's call. Seeds automated the crossing with a classifier and retired it three times; this automates only the lookup. With `--pr`, the script also carries those files, and opens the pull request in the target repo once the target's own gates pass. A session *in jig* does the rest — the held files, a red run, the harvest direction. The two directions are not the same kind of change. Jig → project moves bytes jig already reviewed: a copy, not new code. A harvest is new code arriving in the file that ships to every repo, so it goes through the ordinary task flow here — `/kill-this`, `@code-review`, a pull request that says which repo and commit it came from — as pull request #39 did. The one file outside this is `.claude/settings.json`, classed `presence`: distributed by hand per machine and never compared, for the reasons in the registry. This was the design from the start and was not written down, and a jig session read "nothing syncs" as "do not copy" and refused a sync the operator asked for. Now it is written down, and the median-gap row below is the short form.

**Syncing jig → project is a checklist, and it is done when the target is green, not when the bytes match.** The two things that go wrong both hide past the copy: a synced gate script changes what the target checks, and a synced doc can cite a path only jig has. Both look like a clean copy and both fail in the target. So the copy is never the end. `npm run sync -- ../<repo> --pr` does every step that is mechanical — 2, 3, 4, 7 and 8 — and stops at the first that needs judgment. It pushes and opens a pull request, so it is environment-changing: the operator runs it, or a session does once the operator says go for that project.

1. **List.** `npm run fleet` from jig says which repos are behind; `npm run sync -- ../<repo>` says, file by file, what crosses into one of them. Both fetch and read `origin/main` on each side, so a target parked on a task branch and jig sitting on an unmerged one both drop out of the answer. The sync's `COPY`, `NEW` and `DELETE` blocks are what `--pr` carries. Each `HELD` block goes to the operator with its reason, never into the copy. `UNWIRED` is a gate `verify` never calls, whether the target already holds it or the sync is bringing it. `--pr` runs each one and reports the text that would wire it in, and never edits the target's `package.json`: wiring it in or deciding it does not apply is the target's call, and that gap is how `check-denied` sat dead in muster for three days. `absent` under presence is out of scope for a sync; it means the target never installed a file, which is an install, not a sync. **Only merged jig crosses**: when the sync needs a jig fix still in review, the target waits for the merge.
2. **A throwaway worktree, never the target's checkout — the script does this.** `--pr` cuts `../<repo>-jig-sync` on `jig-sync/<date>` from the target's `origin/main`, and refuses before writing anything if that path or branch already exists, locally or on the target's origin. Every sibling is somebody's parked session, often mid-task with untracked files, and a worktree leaves that checkout exactly as it was. The worktree starts without the gitignored things the real checkout has. The script hard-links in every `node_modules` the real checkout has beside a tracked `package.json`, root and nested alike, such as centerline's `mobile/` (`cp -al`, not a symlink — Next's Turbopack refuses one that points outside the tree), and lists them in `<repo>/.git/info/exclude`. It makes nothing else: a Python virtualenv, and anything a build generates, like centerline's MapLibre worker directory, which exists only after `next build`. Gates that need one go red for reasons that have nothing to do with the sync, and step 5 sorts them.
3. **Copy and delete — the script does this.** Each `COPY` and `NEW` file is written from jig's `origin/main`, never its working tree; each `DELETE` is a `git rm`; every held file is left exactly as the target has it. Only those paths are staged — never `git add -A` — and the commit message names the jig commit synced from.
4. **Run every gate the target runs — the script does this.** `npm run verify` in the worktree, then each `UNWIRED` gate as `node scripts/check-<name>.mjs`. Every gate runs even after one fails, so a red run names all of them. A target with no `verify` is red: nothing there can prove the sync. This is the step that was skipped, twice, when it was done by hand, and it is the point of the checklist.
5. **After a red run, sort the red by whether the complaint is right.** `--pr` exits 1 without pushing, prints each failing gate's output, and leaves the worktree, its commit and the exclude line in place. The run's log, whose path is the last line printed, holds every gate's full output, passing ones included: read it rather than a screenshot. A gate correctly flagging the target's own prose or config is the target's content, which the sync surfaced — the operator or a target session fixes it, and the sync pull request can carry it or wait. A gate red on a file the sync just copied, or a new false positive from a just-copied checker against prose the target's old copy passed, is a template defect: fix it in jig first, land that, and re-sync — never patch the copy in the target, which forks it. A red the setup explains is neither: a gitignored file the worktree lacks, or a local database behind the migrations on `origin/main`. Confirm the real checkout has the file, say so in the pull request, and never migrate somebody's database to get green. To carry a fix, or to finish past a setup red, work in the worktree the run named: rerun every gate there until green, then push `jig-sync/<date>` and `gh pr create --base main` by hand, the body saying what was red and why. Otherwise `--clean` and run `--pr` again once the fix has landed.
6. **Project-owned files are one repo at a time.** Drift never compares `context` class — the three reviewer agents, the context file; `@pm` is `logic` and syncs like a skill (DEC-J011) — so a template change there reaches a project only by a deliberate copy, and each project's copy has drifted on its own. Diff it against jig's version from before the change: identical, or different only in ways with no behaviour of their own (a project name in a description, a line wrap), and it can be replaced; anything else goes to the operator with the diff.
7. **Commit and open the pull request — the script does this, and only when every gate is green.** It pushes `jig-sync/<date>` and runs `gh pr create --base main`, never `production`. The body is the dry-run printout — the restart line, what crossed, what was held and why — then each gate with its result, the text to wire in each unwired one, and the jig commit synced from. When this session cannot push to the target — GitHub access scoped to jig alone — the operator runs `--pr`. If `gh` fails after the push, the script says so and prints the `gh pr create` command with the body file it kept.
8. **Clean up — the script does this.** After a green run it removes the worktree (`git worktree remove --force` drops the hard links without touching the real checkout's files), deletes the local branch, and takes its lines back out of `.git/info/exclude`: the branch lives on the target's origin now. After a red run, `npm run sync -- ../<repo> --clean` does the same once step 5 is settled. `npm run fleet` reading `nothing differs` for the repo after the merge is the confirmation.

Roles: one developer. Multi-dev support was carried for months, never used, and is not carried here — which is why session filenames are `YYYY-MM-DD-HHMM-<slug>.md` with no dev handle in the middle.

## Stack

- **Node** — modern module syntax, no build step, no framework. Scripts are `.mjs` and run straight from `scripts/`.
- **Vitest** for the test suites; **js-yaml** for the two `.yml` registries. That is the whole dependency list, and it should stay short enough to read.
- No database, no frontend, no deploy target. Nothing here runs in production because nothing here runs at all — it is source material copied into other repos.

## Core Data Model

N/A — no database. The nearest thing to a schema is `docs/decisions/decision-record.schema.json`, which validates decision frontmatter, and `.claude/file-classes.yaml`, which says how each template relates to a project's copy.

## Commands

```bash
npm run verify              # every gate, in fail-fast order
npm run check:decisions     # record shape, index freshness, dangling refs
npm run check:dictionary    # unregistered vocabulary
npm run check:context       # paths cited by the always-loaded files still resolve
npm run check:docs          # the rest of the doc set
npm run gen:decisions       # regenerate docs/DECISIONS.md — run after editing any record
npm run test                # vitest

node scripts/drift.mjs ../<project>          # what a project's copies differ from jig
npm run fleet                                # every repo beside jig: its origin/main vs jig's, one line each
npm run sync -- ../<project>                 # what a sync would carry, file by file; writes nothing
npm run sync -- ../<project> --pr            # carry it in a worktree; push and open the PR only if the gates pass
npm run sync -- ../<project> --clean         # remove what a red --pr left behind
                                             # --pr and --clean log to a private <tmp>/jig-sync-<repo>-XXXXXX/ per run; the last line printed is the path
node scripts/settings-policy.mjs             # is this machine's permission policy current
node scripts/settings-policy.mjs --all ../<project>
```

`npx` is denied fleet-wide; use `npm run <script>` or `./node_modules/.bin/<bin>`.

## Additional Docs

| File | Purpose |
|------|---------|
| `docs/ANALYSIS.md` | The rebuild's working notes — what was measured, what was binned, what is still open. Read this before proposing a change to the shape of jig |
| `docs/SPEC.md` | Placeholder. Sections get written when there is a mechanism to describe |

The three webapp-shaped docs jig *ships* — BRAND, USER_STORIES, DEV_REFERENCE — live in `scaffold/docs/` and are not installed here. jig has no brand and no users.

## Workflow Mechanisms

| Slot | This project |
|---|---|
| **Proof** | Vitest against the script under change, in `scripts/<name>.test.mjs`. For a gate, the proof is that it goes red on the defect and green after — a gate nobody watched fail is a gate that may assert nothing |
| **Proof command** | `npm run test -- scripts/<name>.test.mjs` |

**The gate** is `npm run verify`.

**What a gate prints is part of what it does, so assert it.** jig's entire human-facing surface is what a gate prints, and a check can pass while printing a misleading number — that has happened, when the tape-queue count reported 6 where there were 4. The answer is a test over the output string, not a step telling a session to go and look: three sessions read that step three ways, which is why it is gone (DEC-J008).

## Median gaps

Where a competent default does the wrong thing in this repo.

| Gap | Why the default is wrong here |
|---|---|
| `.claude/` is the shipped template, not a local config directory | Editing an agent or skill here is editing what every project installs. There is no separate template copy to change instead — DEC-J001 removed it deliberately |
| A red gate here usually means a missing file, not a broken check | jig is mid-migration, so a gate can be red because the corpus it reads does not exist yet. Run it and read the message. Never loosen a gate to get green — `npm run verify` says which, and `docs/PROJECT_PLAN.md` says when each one is due |
| `scripts/` is jig-only by default | The file-class registry inverts seeds' default: a script here is assumed *not* to reach a project unless it is named `check-*` or `gen-*` |
| A sibling repo's state is `origin/main`, not its working tree | Every sibling here is somebody's active session, parked on a task branch and behind. Reading `../muster/docs/…` satisfies "cite a file" and still reports the wrong repo state — muster was 26 commits behind when a merged pull request body described it. `git -C ../<repo> fetch` then `git show origin/main:<path>`, and say which you read |
| A held file is the operator's call, not the sync's leftovers | `scripts/sync.mjs` carries only files whose bytes match a version jig shipped (DEC-J012). Finishing the job by copying a `HELD` file over anyway overwrites a project's edit or skips a migration it owes — the exact cases the script exists to stop at. Before the script, one session read "nothing syncs" as a prohibition and refused a sync the operator asked for; the rule is under What We're Building. Every sibling is somebody's live session, so the copy is made in a throwaway worktree cut from the target's `origin/main`, never in its checkout |

## Blast-Radius Triggers

| Trigger | Paths |
|---|---|
| Anything a project installs | `.claude/agents/**`, `.claude/skills/**`, `CLAUDE.md` — one edit lands in every repo that copies it |
| The permission policy | `.claude/settings.json` — this is the master every machine is checked against, and a wrong deny here is a wrong deny everywhere |
| Anything that writes | `scripts/settings-policy.mjs`, aimed at the file carrying a machine's hooks; `scripts/sync.mjs`, whose `--pr` writes, commits and pushes in another repo beside somebody's parked session |

Money and migrations do not apply: no money, no database.

## Migration Protocol (project)

N/A — no database.

The word does mean something else here, and it is worth not confusing them: a *migration* in jig is a project moving from one `jig-version` to the next. A project records the generation it was installed at in `.claude/jig-version`; comparing it against jig's root `jig-version` says what is owed. `drift.mjs` enumerates the files.

## Conventions

- **Comments carry the incident, not the intent.** Nearly every non-obvious line here has a paragraph above it naming what went wrong, with the number attached. That is the house style and it is load-bearing: the reasoning is the only thing that stops the next person removing a guard that looks redundant.
- **A comment that describes the state of the code expires.** One in `check-decisions.mjs` declared a parser blocker and said "convert nothing until it is fixed"; the fix landed in the next commit and the instruction was still being obeyed weeks later. Prefer describing the failure over describing the current state.
- **Gates print numbers a person can act on.** "does not match schema" is a validator nobody can use; naming the key and the limit is.
- **No project-specific content in shipped files.** `CLAUDE.md`, agents and skills are byte-identical everywhere. Project facts go in a context file.
- **`revisit_if` is required on every decision record.** Nothing else retires a record, and 78% of muster's reservations corpus went dead while still being cited.

## Workflow Notes (project)

- **Test files run one at a time, on purpose.** `npm run test` passes `--no-file-parallelism` because two suites rename a real record into `docs/decisions/archive/` while any suite that runs a gate against the repo rather than a fixture reads the corpus off disk. In parallel that was a missing-file crash one run in three (issue #32). The pair has to be real, so the tests stay and the parallelism goes; it costs about a second and a half. `describe.sequential` would not have done it — that orders tests within a file, and the collision is across files.
- **`npm install` is worth watching.** A symlink left in `node_modules/` during an install makes npm skip that package silently and report "changed 1 package".
- **Seeds is archived, not deleted.** It is on disk and readable. `DEC-S###` ids appear in git history and in muster's records; jig's own record starts at `DEC-J001` with an empty corpus, and the two never mix.
