# [Project Name] — Project Context

Everything specific to **this** project. The `CLAUDE.md` shell reads this file at session start and treats it as authoritative for project-specific facts. Fill in every `[placeholder]`; delete sections that don't apply — a tool project with no database replaces Migration Protocol with `N/A`. Nothing here syncs from jig; it's yours to edit freely.

## What We're Building

[One paragraph — what it replaces, who uses it, what it does.]

Roles:
- **Admin** — [what they manage]
- **[Role 2]** — [what they do]

## Stack

What this project is built with, and what it runs on. One line per layer; delete the rows that do
not apply rather than writing `N/A` beside six of them.

- **[Layer]** — [choice, and the version if it matters]
- **[Layer]** — [choice]
- **Hosting/target** — [where it runs]
- **Testing** — [what the test tooling is]

## Core Data Model

```
[Entity relationships — e.g.:]

things → sub_things → line_items
              ↓
        memberships (user × thing)
```

## Commands

Every command a session might need to run, spelled the way it should be typed.

**Locally-pinned binaries are spelled `npm run <script>` or `./node_modules/.bin/<bin>`, never
`npx`** — and the equivalent for whatever the toolchain is. `Bash(npx *)` is denied fleet-wide and
`deny` beats `allow`, so no project can allowlist its way out: the same syntax that runs an
installed dependency also fetches an arbitrary package off the network, and the command string
cannot distinguish them. A doc that spells a denied command reads as sanctioned and fails as a
permission refusal, which looks like the agent being difficult rather than the doc being stale.

```bash
# Development
[run it locally]
[build it]
[lint it]

# The gate — what /kill-this runs before committing
[the one command that must pass]

# Testing
[full suite]
[one file, during development]
```

## Additional Docs

Project-specific docs beyond the shell's `## Key Docs`. jig ships three that are webapp-shaped and belong here rather than in the shell — keep the rows this project installed, delete the rest.

| File | Purpose |
|------|---------|
| `docs/BRAND.md` | Brand and visual direction |
| `docs/USER_STORIES.md` | What each role does |
| `docs/DEV_REFERENCE.md` | Deploy + review reference — `<VersionTag />` wiring, CHANGELOG format, phone PR-review notes |

## Workflow Mechanisms

The shell's `## Micro Workflow` says what three steps must achieve and names a slot for how. Fill each one. **These are slots, not overrides** — the shell states no default to correct, and nothing here should cite a step *number*: numbers move, and a stale cross-reference in an always-loaded file fails silently.

| Slot | What it answers | This project |
|---|---|---|
| **Proof** | What counts as a check written before the change | `<e.g. Playwright integration test; pgTAP if RLS-touching — or: Vitest against the domain core>` |
| **Proof command** | How to run the checks covering what you touched | `<e.g. ./node_modules/.bin/playwright test tests/foo.spec.ts --project=desktop>` |
| **Surface check** | How to confirm the change is right where a person meets it | `<e.g. 375px screenshot — or: flash the bench node and read one packet — or: none, no human-facing surface>` |

**The gate** (`npm run verify`, `cargo test`, …) is what `/kill-this` runs before committing — name it under `## Commands`, not here.

**Every slot gets a real answer, including "none".** `Surface check: none — this is a library with no UI` is checkable and can be argued with. A blank slot is indistinguishable from one nobody has thought about.

## Median gaps

Where this repo would make a competent default do the wrong thing. The shell's `## Where this repo differs from the median` states the entry test; this is where the instances go.

Not preferences — a preference belongs in the output style or a settings key, where it is applied rather than recalled. The test is whether someone doing the obvious correct thing would be wrong here.

| Gap | Why the default is wrong here |
|---|---|
| `<e.g. Formatting is not chained to typecheck — running one does not run the other>` | `<what a competent default would assume>` |

Starts empty. Add one line the first time an incident produces one.

## Blast-Radius Triggers

Read by `/kill-this` Step 3.5. When a branch diff hits one of these, the skill runs `/security-review` locally and surfaces `/code-review ultra` as the optional deeper pass. **Name paths, not categories** — "the money path" is unmatchable against a diff; `src/billing/**` is.

If this section is absent the skill falls back to four generic triggers, which are better than nothing and worse than a real list — a generic trigger can't know that this project's payroll export is the dangerous file.

| Trigger | Paths |
|---|---|
| Money moving | `<e.g. src/payments/**, app/api/webhooks/stripe/**>` |
| Money computed | `<e.g. src/domain/pay-period/** — anything producing an amount that reaches an invoice or paycheck>` |
| Auth / capability URL | `<e.g. src/auth/**, middleware.ts, signed-link minting and validation>` |
| Data-changing migration | `<migrations containing drop / alter … type / update / delete — an additive add column does not trigger>` |

**The test when a path isn't listed:** *does a number this code produces end up on someone's paycheck or invoice?* If yes it's the money path, whether or not a payment provider is anywhere near the diff. Add it the first time you notice, not the second.

## Migration Protocol (project)

The migration **discipline** is in the shell and is universal: schema changes go through
migrations, migrations are the source of truth, never edit an applied one, check for open work on
the same tables first.

This section holds **this project's toolchain** — the commands, and whatever guard stops a
destructive one reaching production. Projects without a database: `N/A — no database.`

- **Create a migration:** [command]
- **Apply locally:** [command]
- **Apply to the deployed environment:** [command, and who runs it]
- **Regenerate types, if the stack has generated types:** [command]

### Production write protection

[How a destructive command is stopped from reaching production, and what it does NOT cover.]

Two layers is the shape that has worked: a discipline (never point local tooling at production)
and a mechanism that refuses the dangerous subcommands. State both, and state what the mechanism
misses — a wrapper around one binary does not stop a direct database connection, and writing that
down is what keeps the discipline load-bearing rather than assumed.

## Conventions

How this project is written — typing, structure, data fetching, auth, error handling, naming,
testing layout. **Stack-specific, so this project owns them**: every webapp is not Next.js on
Vercel, and a convention inherited by not deleting it was never chosen.

Write what this project actually does, not what a template guessed.

- **[Language/typing]** — [e.g. strict mode, no implicit any]
- **[Structure]** — [where things live, and the size at which you split them]
- **[Error handling]** — [the contract: what a failure returns and where it surfaces]
- **[Naming]** — [files, symbols, database columns, migrations]
- **[Testing layout]** — [what runs where]

## Workflow Notes (project)

Debugging gotchas specific to this project. The shell holds the universal rules; this is the local
knowledge that would otherwise be rediscovered once a quarter.

Start empty. Add one the first time something costs you twenty minutes and would have been a
sentence — a stale process serving an old build, a tool that needs its environment loaded and one
that does not, a config whose glob syntax is subtly wrong. Write the symptom first, because the
symptom is what a future session will be looking at:

- **[Symptom someone would actually see]** — [what is really happening, and the fix.]
