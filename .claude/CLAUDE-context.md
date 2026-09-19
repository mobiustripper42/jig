# jig — Project Context

Everything specific to **this** project. `CLAUDE.md` reads this file at session start and treats it as authoritative for project-specific facts.

jig is an unusual consumer of its own templates — it is a workflow fixture, not an application — so several slots below read `N/A` with the reason stated. That is the design: the shell states the invariant, this file says how it is met here.

## What We're Building

A fixture. The name is the argument: a jig makes the wrong cut impossible rather than discouraged, and the constraint is physical instead of remembered.

jig replaces `seeds`, which failed by growing prose faster than anyone could read it. The evidence, from one afternoon in seeds: a mechanical `sed -n` deny fired 7 times across 4 repos and was obeyed every time, while a prose rule was broken 11 times, 4 of them after it was written. Across a full day, one decision file was opened — the one just written — while 257KB of record sat unread and its claims still reached us, laundered through `CLAUDE.md` and code comments citing records nobody had opened.

**The filter every mechanism here has to pass: does it work when nobody remembers it's there?** Keep it if yes. Bin it if it is a paragraph hoping to be recalled at the right moment.

**What jig physically does.** Broadly two kinds of file: `scaffold/` for a new project, copied once and then owned there; and templates for repos already installed — `.claude/skills/**`, `CLAUDE.md`, the gate scripts — where jig's copy is canonical and a project's is supposed to be identical. `.claude/file-classes.yaml` is the real taxonomy, five classes with the reasoning beside each, and it is what `drift.mjs` reads. Template changes are made in jig. The exception is a file that can only be evaluated by living in it, which gets prototyped in a repo with active development and harvested back — the output style did this in muster, three revisions, then pull request #39 brought it here.

**Templates cross by a jig session's hand, in either direction, and no automation moves them.** There is no sync script and there will not be one. A session in a project runs `drift.mjs` at start and learns what is out of date; that session reports and does nothing, because deciding what crosses is a person's call. When the operator says to bring a project up to date, or to harvest a prototype back, a session *in jig* does the copying, commits in the target repo on a branch, and opens the pull request there. The two directions are not the same kind of change. Jig → project moves bytes jig already reviewed: a copy, not new code. A harvest is new code arriving in the file that ships to every repo, so it goes through the ordinary task flow here — `/kill-this`, `@code-review`, a pull request that says which repo and commit it came from — as pull request #39 did. The one file outside this is `.claude/settings.json`, classed `presence`: distributed by hand per machine and never compared, for the reasons in the registry. This was the design from the start and was not written down, and a jig session read "nothing syncs" as "do not copy" and refused a sync the operator asked for. Now it is written down, and the median-gap row below is the short form.

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
| **Surface check** | Run the script and read its output. jig's entire human-facing surface is what a gate prints, so a check that passes while printing a misleading number has not met this bar — that has already happened once, when the tape-queue count reported 6 where there were 4 |

**The gate** is `npm run verify`.

## Median gaps

Where a competent default does the wrong thing in this repo.

| Gap | Why the default is wrong here |
|---|---|
| `.claude/` is the shipped template, not a local config directory | Editing an agent or skill here is editing what every project installs. There is no separate template copy to change instead — DEC-J001 removed it deliberately |
| A red gate here usually means a missing file, not a broken check | jig is mid-migration, so a gate can be red because the corpus it reads does not exist yet. Run it and read the message. Never loosen a gate to get green — `npm run verify` says which, and `docs/PROJECT_PLAN.md` says when each one is due |
| `scripts/` is jig-only by default | The file-class registry inverts seeds' default: a script here is assumed *not* to reach a project unless it is named `check-*` or `gen-*` |
| A sibling repo's state is `origin/main`, not its working tree | Every sibling here is somebody's active session, parked on a task branch and behind. Reading `../muster/docs/…` satisfies "cite a file" and still reports the wrong repo state — muster was 26 commits behind when a merged pull request body described it. `git -C ../<repo> fetch` then `git show origin/main:<path>`, and say which you read |
| "Nothing syncs" means no automation, not "do not copy" | A jig session is the hand that moves templates, in either direction, when the operator asks. One read the phrase as a prohibition and refused a sync. The full rule is under What We're Building; the condition to check first is that the target repo's tree is clean and on `main` or a branch the operator names, since every sibling is somebody's live session and the copy commits there |

## Blast-Radius Triggers

| Trigger | Paths |
|---|---|
| Anything a project installs | `.claude/agents/**`, `.claude/skills/**`, `CLAUDE.md` — one edit lands in every repo that copies it |
| The permission policy | `.claude/settings.json` — this is the master every machine is checked against, and a wrong deny here is a wrong deny everywhere |
| Anything that writes | `scripts/settings-policy.mjs` — the only script with a write path, aimed at the file carrying a machine's hooks |

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
