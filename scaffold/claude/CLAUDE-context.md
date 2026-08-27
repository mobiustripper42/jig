# [Project Name] — Project Context

Everything specific to **this** project. The `CLAUDE.md` shell reads this file at session start and treats it as authoritative for project-specific facts. Fill in every `[placeholder]`; delete sections that don't apply — a tool project with no database replaces Migration Protocol with `N/A`. Nothing here syncs from jig; it's yours to edit freely.

## What We're Building

[One paragraph — what it replaces, who uses it, what it does.]

Roles:
- **Admin** — [what they manage]
- **[Role 2]** — [what they do]

## Stack

- **Frontend:** Next.js 14+ (App Router), Tailwind, shadcn/ui
- **Backend:** Supabase (PostgreSQL + Auth + RLS) — no separate API server
- **Payments:** Stripe — remove if not applicable
- **Notifications:** Twilio (SMS), Resend (email) — remove if not applicable
- **Hosting:** Vercel, Supabase Cloud
- **Testing:** pgTAP (RLS), Playwright (integration), axe-core (accessibility)

## Core Data Model

```
[Entity relationships — e.g.:]

things → sub_things → line_items
              ↓
        memberships (user × thing)
```

## Commands

**Locally-pinned binaries are spelled `npm run <script>` or `./node_modules/.bin/<bin>`, never `npx`.** `Bash(npx *)` is denied fleet-wide and `deny` beats `allow`, so no project can allowlist its way out — the same syntax that runs your devDependency also fetches an arbitrary package off the network, and the command string cannot distinguish them. Prefer the npm script: it survives someone reading this file a year from now.

```bash
# Development
npm run dev
npm run build
npm run lint

# Database (local Supabase)
supabase start
supabase db reset
supabase migration new <name>

# Testing
supabase test db                                      # pgTAP RLS
npm run test:e2e                                      # full suite
./node_modules/.bin/playwright test tests/foo.spec.ts --project=desktop
./node_modules/.bin/playwright test --ui

# Types — after every schema change
./node_modules/.bin/supabase gen types typescript --local > src/lib/supabase/types.ts
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

The migration **discipline** is in the shell. This section holds the **toolchain**. Projects without a database: replace everything below with "N/A — no database."

**All schema changes go through `supabase/migrations/`.**

- Create: `supabase migration new descriptive_name`
- Test locally: `supabase db reset` (replays migrations + seed)
- Apply: `supabase db push`
- Never edit schema through the dashboard, on any environment
- `supabase/seed.sql` runs automatically on `db reset` — use for test data
- Regenerate types after every schema change

### Production write protection

Two layers against running destructive Supabase CLI ops on production:

1. **Discipline:** never `supabase link` to a prod project ref from a dev box. Production reads its URL and service-role key from the host's env vars — there is no reason for a local link to prod. Link only to staging or local.
2. **Wrapper script:** reads the linked ref from `supabase/.temp/project-ref` and refuses `db reset`, `db push`, `db remote *`, `migration up` and `migration repair` when that ref appears in `.claude/prod-supabase-refs`. Everything else passes through. The matcher walks adjacent argument pairs, so leading global flags don't bypass it.

> **jig does not ship this script.** It lives in the archived seeds checkout at
> `dev/claude/scripts/safe-supabase.sh`. The first project that needs it should bring it into
> jig rather than copy it privately — a safety mechanism held in one project is one the next
> project silently lacks.

The wrapper only catches CLI ops. **Not guarded**, and relying on the discipline: a `--db-url postgres://…prod…` flag that skips the linked project entirely, direct `psql` against the prod URL, and any tool that doesn't go through the `supabase` binary.

### Cross-environment env-var sync

**Host env vars and Supabase project refs do not auto-sync.** A project running separate dev/preview and production Supabase instances has the three vars twice in Vercel — once per environment scope — with intentionally different values. Production matches the prod project; Preview + Development match the dev project, which is what `.env.local` has.

Vercel does not redeploy on env-var change. Trigger one after updating.

Failure modes: **undefined values** give `HTTP 500` site-wide while local `npm run dev` keeps working off `.env.local`, masking it until someone hits the deployed site. **Swapped projects** show test fixtures in prod or real data on a preview URL. **A name typo** produces the same 500 with a correct value.

## Conventions

### TypeScript
- Strict mode. No `any`. Use generated Supabase types; regenerate after every schema change.

### Components
- Server Components by default; `'use client'` only when needed.
- shadcn/ui in `components/ui/` — don't edit directly. Feature components in `components/[feature]/`.
- Under 200 lines. Split if larger.

### Data Fetching
- Server Components fetch directly via the Supabase server client.
- Mutations go through Server Actions, not API routes.

### Auth & RLS
- All auth through Supabase Auth. No custom JWT handling.
- Role flags on the users table, not mutually exclusive.
- **Every table needs RLS policies before shipping.** Every RLS change requires a pgTAP test.

### Error Handling
- Form actions return `string | null` — `null` is success. Button actions return `{ error: string | null }`.
- Never `throw` in a server action; return the error for inline feedback.

### Naming
- Files `kebab-case.tsx`, components `PascalCase`, server actions `camelCase`, DB columns `snake_case`.
- Migrations `supabase/migrations/YYYYMMDDHHMMSS_descriptive_name.sql`.

### UI / Brand
- White/black base, semantic shadcn tokens. No color for color's sake.
- One border radius. Layout padding in `layout.tsx` only.
- Every page works at 375px.

### Testing
- **Test the user, not the function.** Heavy integration, light unit.
- **Test-first when behaviour changes.** Update the test, then the code.
- pgTAP in `supabase/tests/`, Playwright in `tests/`. Viewports 375 / 768 / 1440.
- Mock external services in test mode.

## Workflow Notes (project)

Project-specific debugging gotchas. The shell holds the universal rules.

- **Before starting `npm run dev`:** check whether one is already running before starting another — `curl` is denied, so use the Read/Bash tools you have or just try the port. Starting a second server on top of a live one is the failure this prevents — don't start another.
- **Stale `next start` on port 3001:** Playwright reuses an existing server there, so an orphan from an earlier debug run serves the previous build's bundle to every test, producing phantom failures. Kill it once per session: `lsof -ti:3001 | xargs -r kill -9`, then re-check that the port is clean.
- **Supabase OAuth redirect URLs — use `/**` not `/*`.** Single-star matches one path segment, so `/auth/callback` fails to match, and Supabase silently falls back to Site URL — landing the user on `/?code=…` with the callback route never running. The symptom is auth that "almost works" but never exchanges the code.
