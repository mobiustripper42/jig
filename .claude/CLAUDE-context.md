# jig — Project Context

Everything specific to **this** project. `CLAUDE.md` reads this file at session start and treats it as authoritative for project-specific facts.

jig is an unusual consumer of its own templates — it is a workflow fixture, not an application — so several slots below read `N/A` with the reason stated. That is the design: the shell states the invariant, this file says how it is met here.

## What We're Building

A fixture. The name is the argument: a jig makes the wrong cut impossible rather than discouraged, and the constraint is physical instead of remembered.

jig replaces `seeds`, which failed by growing prose faster than anyone could read it. The evidence, from one afternoon in seeds: a mechanical `sed -n` deny fired 7 times across 4 repos and was obeyed every time, while a prose rule was broken 11 times, 4 of them after it was written. Across a full day, one decision file was opened — the one just written — while 257KB of record sat unread and its claims still reached us, laundered through `CLAUDE.md` and code comments citing records nobody had opened.

**The filter every mechanism here has to pass: does it work when nobody remembers it's there?** Keep it if yes. Bin it if it is a paragraph hoping to be recalled at the right moment.

Roles: one developer. Multi-dev support was carried for months, never used, and is not carried here — which is why session filenames are `YYYY-MM-DD-HHMM-<slug>.md` with no dev handle in the middle.

## Stack

- **Node** — ES modules, no build step, no framework. Scripts are `.mjs` and run straight from `scripts/`.
- **Vitest** for the test suites; **js-yaml** for the two YAML registries. That is the whole dependency list, and it should stay short enough to read.
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

- **jig develops straight to `main`.** Limited ceremony for notes and template edits. jig ships the task-branch/PR flow; it does not use it on itself.
- **The tests came from muster and some are still coupled to its corpus.** `check-dictionary.test.mjs` looks up a term in a dictionary jig does not have; `check-docs.test.mjs` hardcodes muster URLs. Red there is expected until jig grows its own corpus — but check which kind of red before assuming.
- **`npm install` is worth watching.** A symlink left in `node_modules/` during an install makes npm skip that package silently and report "changed 1 package".
- **Seeds is archived, not deleted.** It is on disk and readable. `DEC-S###` ids appear in git history and in muster's records; jig's own record starts at `DEC-J001` with an empty corpus, and the two never mix.
