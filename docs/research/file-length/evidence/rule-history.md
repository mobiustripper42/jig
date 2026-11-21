# Rule history and the refs measured

Gathered 2026-11-21, read-only, from existing refs. Each block is the command and its output.

## Refs measured (origin/main in each repo; local task branches carry unmerged work, so they were not used)

```
$ git -C centerline log -1 --format='%H %ad' --date=short origin/main
500504dd34cdb7975d84ce76d201fa98f2e560e2 2026-11-08
$ git -C soundings log -1 --format='%H %ad' --date=short origin/main
a879fb69268f9eaa0ffdc1eb1c572649a28326d1 2026-10-08
$ git -C muster log -1 --format='%H %ad' --date=short origin/main
906eadb92624449d1c5d6d8d42df0769b0fe4c35 2026-11-20
$ git -C haul log -1 --format='%H %ad' --date=short origin/main
e79d837f304a67b4b953cf1f8621d41e1fca5ca9 2026-11-20
$ git -C sailbook log -1 --format='%H %ad' --date=short origin/main
1becdf41c4a84cf9a87b47d17d26acd3b55b78e5 2026-07-24
$ git -C soundings rev-list --count 2e8f2d4..origin/main ; git -C soundings rev-list --count 2e8f2d4..HEAD
180
156
```

## jig's rule

```
$ grep -n 200 jig/.claude/agents/code-review.md
22:5. **Oversized units** — any file / module / component over ~200 lines should be flagged with a split suggestion
```

## centerline

```
$ git -C centerline log --format='%h %ad %s' --date=short -S'200 lines' origin/main -- .claude/agents/code-review.md
91c7378 2026-10-04 Lint mobile's TypeScript; split on responsibility, with no line limit
59f05b5 2026-09-19 Install jig scaffold and write the V1 spec
$ git -C centerline grep -n -i -E 'Oversized|File size|line limit|~?[23]00 lines' origin/main -- .claude/agents/code-review.md .claude/CLAUDE-context.md
origin/main:.claude/CLAUDE-context.md:176:- **Structure** — Next.js App Router in `app/`, domain logic in `src/`, database scripts and migrations in `db/`. Split a component on responsibility, so a task reads only the part it changes; there is no line limit.
```

## soundings

```
$ git -C soundings log --format='%h %ad %s' --date=short -S'200 lines' origin/main -- .claude/agents/code-review.md
2e8f2d4 2026-06-13 Phase 0: fix velocity guide + agent criteria for tool-type project
a19f3d2 2026-04-22 Seed .claude/agents/ from seeds/dev templates
$ git -C soundings grep -n -i -E 'Oversized|File size|line limit|~?[23]00 lines' origin/main -- .claude/agents/code-review.md .claude/CLAUDE-context.md
```

## muster

```
$ git -C muster log --format='%h %ad %s' --date=short -S'200 lines' origin/main -- .claude/agents/code-review.md
3302c0c7 2026-07-24 code-review: adopt the reviewed version — Pass B, evidence rule, volume cap
692ebf75 2026-07-24 Rewrite @architect, @code-review, @ui-reviewer as real project-context files
36790007 2026-06-03 Scaffold Muster from seeds + planning docs (Phase 0.1–0.2)
$ git -C muster grep -n -i -E 'Oversized|File size|line limit|~?[23]00 lines' origin/main -- .claude/agents/code-review.md .claude/CLAUDE-context.md
origin/main:.claude/CLAUDE-context.md:165:- Feature components in `components/<feature>/`. **Guideline, not a rule: keep a component under ~300 lines of code** (the doc-comment block doesn't count — this repo comments heavily). Split when it's genuinely two responsibilities or the diff is hard to 
origin/main:.claude/agents/code-review.md:121:18. **File size** — flag a file over ~800 lines *when it also mixes concerns*. Size alone isn't the
origin/main:.claude/agents/code-review.md:252:  class you observed — not individual findings. Keep MEMORY.md under 200 lines; curate rather
```

## haul

```
$ git -C haul log --format='%h %ad %s' --date=short -S'200 lines' origin/main -- .claude/agents/code-review.md
6786cf1 2026-10-25 Install jig scaffold (generation 6), unmodified
$ git -C haul grep -n -i -E 'Oversized|File size|line limit|~?[23]00 lines' origin/main -- .claude/agents/code-review.md .claude/CLAUDE-context.md
origin/main:.claude/agents/code-review.md:22:5. **Oversized units** — any file / module / component over ~200 lines should be flagged with a split suggestion
```

## sailbook

```
$ git -C sailbook log --format='%h %ad %s' --date=short -S'200 lines' origin/main -- .claude/agents/code-review.md
092820b 2026-04-04 Phase 3.1 — admin attendance page, breadcrumbs, error handling standardization, cleanup
$ git -C sailbook grep -n -i -E 'Oversized|File size|line limit|~?[23]00 lines' origin/main -- .claude/agents/code-review.md .claude/CLAUDE-context.md
origin/main:.claude/CLAUDE-context.md:117:- Feature components in `components/[feature]/`. Keep components under 200 lines; split if larger.
origin/main:.claude/agents/code-review.md:19:5. **Oversized components** — anything over 200 lines should be flagged with a split suggestion
```

## muster: the commit that dropped the 200-line flag (message excerpt)

```
692ebf75 2026-07-24
Dropped the >200-line flag. 276 source files, 12 over 500 lines, largest is a
legitimate 1366-line one-method-per-aggregate adapter. Replaced with ~800 lines
AND mixed concerns, exempting adapters, contract suites, tests, and seeds.

$ git -C muster log --format='%h %ad %s' --date=short -S'300 lines' origin/main -- .claude/CLAUDE-context.md
167c34c2 2026-07-12 Component size: 200→~300 LOC, guideline not a rule (excl. doc-comments)
```

## centerline: the commit that replaced the rule

```
91c7378 2026-10-04
Lint mobile's TypeScript; split on responsibility, with no line limit

eslint now covers mobile/**/*.{ts,tsx} under the web's rules, plus react-hooks
on mobile's .tsx, and `npm run lint` (so `verify`) includes mobile. Kotlin is
not linted. @code-review drops its ~200-line check, and the context file's
structure convention drops "roughly 300 lines" for the reason the split exists:
a task reads only the part it changes.

```
