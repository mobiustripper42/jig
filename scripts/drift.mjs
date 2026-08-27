#!/usr/bin/env node
/**
 * What differs between jig's templates and one project. Read-only.
 *
 * This is an ENUMERATOR, not a syncer and not a classifier (DEC-S040). It says what is different.
 * It never says which side is right, never copies, and must never grow either ability — the moment
 * it has an opinion about which version wins, it has re-acquired the judgment DEC-S040 removed, and
 * the whole argument for deleting @sync-config applies to it instead.
 *
 * Why it exists: DEC-S040 predicted this. "Enumeration was the half worth keeping and the half that
 * cost almost nothing to rebuild if it turns out to matter — a read-only differ has no gate, no
 * classifier, and no write path to get wrong. It is not being built now… build the thing when the
 * need is observed." Two copies of a stale file and one parallel edit later, the need is observed.
 *
 * What it does NOT catch, so nobody mistakes its silence for safety: drift that appears *after* it
 * runs, and rules that were stated and not followed. It reports the state of the world right now.
 *
 *   node scripts/drift.mjs ../muster
 *   node scripts/drift.mjs            # defaults to cwd, run from inside a project
 */

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { createHash } from 'node:crypto'

/**
 * `die` is a function DECLARATION, not a const arrow, and that is load-bearing. `findJig` runs
 * during module evaluation — before any `const` below it has been initialized — so a `const die`
 * sits in the temporal dead zone at exactly the moment the "cannot find jig" path needs it. The
 * script then threw `ReferenceError: Cannot access 'die' before initialization` and exited 1,
 * swallowing the one message that says how to fix the invocation. Hoisting is the fix; keep it.
 *
 * Untested, and worth stating: neither exit path here has a check. Both were verified by hand
 * against a cwd with no jig anywhere.
 */
function die(m) { console.error(`drift: ${m}`); process.exit(2) }

/**
 * Parsed by scanning, because `--jig` used to be honoured ONLY at argv[2] and the project
 * argument was excluded from the positionals by VALUE (`a !== process.argv[3]`) rather than by
 * position. Two silent failures came out of that: `drift.mjs <project> --jig <jig>` ignored the
 * flag entirely and fell through to the not-found path, and `drift.mjs --jig /x /x` dropped the
 * project argument and compared against `process.cwd()` instead, exiting 0 on the wrong directory.
 * A read-only differ reporting a confident result about a directory nobody asked about is worse
 * than one that refuses.
 */
const argv = process.argv.slice(2)
const positional = []
let jigArg = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--jig') {
    jigArg = argv[++i] ?? die('--jig needs a path')
  } else if (argv[i].startsWith('--')) {
    die(`unknown flag ${argv[i]} — the only flag is --jig`)
  } else {
    positional.push(argv[i])
  }
}

if (positional.length > 1) die(`expected at most one project path, got ${positional.length}: ${positional.join(' ')}`)

const JIG = resolve(jigArg ?? findJig())
const PROJECT = resolve(positional[0] ?? process.cwd())

/**
 * The sentinel is `jig-version` at the repo root, and it has to be a root-only file.
 *
 * Under seeds the sentinel was `dev/claude/CLAUDE.md` — a path that exists in seeds and nowhere
 * else, which is what made it safe. DEC-J001 deleted that property: jig's templates now live at
 * `.claude/` and `CLAUDE.md`, the exact paths every installed project has. Reusing the old shape
 * would match the first project the script is run inside and silently compare that project
 * against itself, reporting a confident "nothing differs" about a comparison never made.
 *
 * `jig-version` is root-only by the same argument that deleted seeds' copy of it: a project
 * carries `.claude/jig-version` to say which generation it is installed at, and jig IS the
 * generation, so the root file exists only here.
 */
function findJig() {
  // Run from inside jig, or from a project with jig as a sibling.
  for (const c of [process.cwd(), join(process.cwd(), '..', 'jig'), process.env.JIG_REPO]) {
    if (c && existsSync(join(c, 'jig-version')) && existsSync(join(c, 'CLAUDE.md'))) return c
  }
  die('Cannot find jig. Pass it: --jig /path/to/jig')
}

if (!existsSync(join(JIG, 'jig-version'))) die(`${JIG} is not a jig checkout`)

/**
 * Running this against jig itself compares a file to itself, so it refuses.
 *
 * THIS BLOCK USED TO BE FORTY LINES AND IT IS THE CLEAREST THING DEC-J001 BOUGHT. Seeds held every
 * dogfooded file twice, so seeds-as-target was a real comparison with a differently-shaped answer,
 * and four separate facts about seeds had to be encoded to stop the run producing 12 false findings
 * against 1 real one — that ratio was measured, not estimated. `dev/claude/CLAUDE.md` versus the
 * root `CLAUDE.md`, `dev/claude/docs/` versus seeds' own `docs/`, scripts run in place rather than
 * copied: each needed its own carve-out, and getting one wrong swallowed unclassified files
 * silently.
 *
 * Under one copy there is no second file to compare against. `toProject()` is the identity mapping
 * for every live path, so every hash would trivially match and a green run would mean nothing.
 *
 * A REFUSAL IS NOT THE SAME MISTAKE SEEDS MADE. Seeds' differ once refused the whole repo because
 * ONE mapping was ambiguous, and that blanket refusal hid a `logic`-class doc five lines stale
 * since session 34. The refusal here is not a blanket over an ambiguity — it is the observation
 * that the comparison has one operand. The scaffolds are the only jig-side files a project also
 * holds a version of, and every one of them is `context`: jig's own `docs/SPEC.md` and the
 * `scaffold/docs/SPEC.md` it ships are unrelated documents that share a basename, which is
 * precisely the pair seeds spent DEC-S049 proving must not be compared.
 */
if (resolve(JIG) === resolve(PROJECT)) {
  console.log('\ndrift — jig against itself')
  console.log('  nothing to compare: jig keeps one copy of every file it ships (DEC-J001).')
  console.log('  The template and the copy are the same bytes, so drift between them cannot exist.')
  console.log('  Point this at a project:  node scripts/drift.mjs ../muster\n')
  process.exit(0)
}

const hash = (p) => createHash('sha256').update(readFileSync(p)).digest('hex')

/**
 * `logic` files are byte-identical by design; `context` is project-owned; `hybrid` is the shell;
 * `presence` must exist and is never diffed; `jig-only` never reaches a project at all.
 *
 * Read from `.claude/file-classes.yaml`, which in seeds was a section inside
 * `routine-config.yaml` — 125 lines of scheduling configuration for a Routine that had been
 * switched off, wrapped around the one section anything actually read.
 */
function fileClasses() {
  const cfg = join(JIG, '.claude', 'file-classes.yaml')
  if (!existsSync(cfg)) die('no .claude/file-classes.yaml in jig — nothing to classify against')
  const body = readFileSync(cfg, 'utf8').split(/^file-classes:/m)[1] ?? ''
  const out = []
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*-\s*"([^"]+)"\s*:\s*([\w-]+)/)
    if (m) out.push({ glob: m[1], cls: m[2] })
  }
  return out
}

/**
 * The roots this script walks on jig's side. Under seeds this was one directory, `dev/claude/`,
 * and every template lived beneath it. DEC-J001 removed that prefix, so the template set is now
 * a list of the real paths jig ships from.
 *
 * `.claude/settings.local.json` is never a template — it is per-machine and gitignored — and
 * `.claude/file-classes.yaml` is this script's own config rather than something a project holds.
 * Both are excluded here rather than classified, because a registry entry saying "ignore this"
 * still has to be read and kept true; a file the walk never yields cannot go stale.
 */
const TEMPLATE_ROOTS = ['CLAUDE.md', '.claude', 'scripts', 'scaffold', 'docs']
const NOT_TEMPLATES = new Set(['.claude/settings.local.json', '.claude/file-classes.yaml'])

/**
 * `docs/` is walked because two files in it are `logic` — `AGENTS.md` and `CHEATSHEET.md`
 * describe the skills and agents, which are identical in every project, so jig holds the one
 * copy and a project's copy going stale is drift. They were briefly filed under `scaffold/`,
 * which made them a second copy of a shared file; moving them here was the fix, and the walk not
 * reaching `docs/` left both entries unreachable — the policing the move was for never happened.
 *
 * Everything else under `docs/` is jig's own and is classed `jig-only` in the registry.
 * `docs/decisions/` is excluded outright: it is `check-decisions`' subject, and a project's
 * record has nothing to do with jig's.
 */
const EXCLUDED_PREFIXES = ['docs/decisions/']

/**
 * jig-side path → project-side path.
 *
 * Identity for every live file, which is DEC-J001 stated as code: jig runs `.claude/skills/x`
 * and a project runs `.claude/skills/x`, and they are the same bytes because there is one copy.
 * The scaffolds are the only paths that move, because a placeholder's home in jig is not where it
 * lands — `scaffold/docs/SPEC.md` installs as the project's `docs/SPEC.md`, which jig also has a
 * completely different file at.
 *
 * `scaffold/templates/**` deliberately has no mapping. It installs to a path inside the project's
 * source tree that this script cannot know (`src/components/VersionTag.tsx` in a Next.js app, and
 * nowhere at all in a tool project). It is `context` class, so nothing ever compares it and the
 * missing mapping is never reached — but stating it here is cheaper than rediscovering it the
 * first time somebody reclassifies that glob.
 */
function toProject(rel) {
  if (rel.startsWith('scaffold/claude/')) return rel.replace('scaffold/claude/', '.claude/')
  if (rel.startsWith('scaffold/docs/')) return rel.replace('scaffold/docs/', 'docs/')
  return rel
}

/**
 * TYPE GATING IS NOT IMPLEMENTED HERE, DELIBERATELY, and this note exists so the next reader does
 * not rebuild it.
 *
 * It was carried from seeds, where `type-manifest.yaml` named files a project type has no use for
 * so their absence would not read as drift. Carrying it produced a manifest whose every entry was
 * inert: `agents/ui-reviewer.md` and everything under `scaffold/` are `context` class, and this
 * script skips `context` before absence is ever considered. Gating can only change the outcome
 * for a `logic`, `hybrid` or `presence` file, and jig currently ships no type-specific one.
 *
 * The seeds version had the same property and nobody noticed, because a gate that returns
 * "nothing gated" is indistinguishable from a gate with nothing to gate.
 *
 * Rebuild it when a `logic`-class file genuinely applies to one project type — not before.
 */

function walk(dir, base = dir) {
  if (!existsSync(dir)) return []
  return readdirSync(dir).flatMap((e) => {
    const p = join(dir, e)
    return statSync(p).isDirectory() ? walk(p, base) : [p.slice(base.length + 1)]
  })
}

const classes = fileClasses()
/**
 * `**` is parked under a placeholder so the single-`*` pass can't chew it in half, then restored.
 * That placeholder used to be a raw NUL byte, which made this entire file BINARY to git: every
 * diff of drift.mjs printed `Binary files a/… and b/… differ`, so no change to it was ever
 * reviewable in a PR and @code-review read none of them — including the change that introduced the
 * NUL. A printable token costs nothing and keeps the file text. Collision isn't a real risk:
 * `routine-config.yaml` holds repo paths, and one containing this string isn't worth defending.
 */
const classOf = (rel) => classes.find(({ glob }) => {
  const re = new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '@@GLOBSTAR@@').replace(/\*/g, '[^/]*').replace(/@@GLOBSTAR@@/g, '.*') + '$')
  return re.test(rel)
})?.cls

/**
 * Every template jig ships, as repo-relative paths. Seeds walked one directory and prefixed each
 * result; jig walks a list of roots, one of which is a plain file rather than a directory.
 *
 * `CLAUDE.md` is that file, and it needs its own branch. Passing it to `walk()` returns `[]` —
 * `readdirSync` on a regular file throws ENOTDIR, and the `existsSync` guard above it does not
 * fire because the path does exist. The shell would have silently left the template set, which is
 * the single most important file in it.
 */
const templates = TEMPLATE_ROOTS.flatMap((root) => {
  const abs = join(JIG, root)
  if (!existsSync(abs)) return []
  return statSync(abs).isDirectory() ? walk(abs).map((r) => `${root}/${r}`) : [root]
}).filter((rel) => !NOT_TEMPLATES.has(rel) && !EXCLUDED_PREFIXES.some((p) => rel.startsWith(p)))

const rows = []
const missing = []   // `presence` class — reported when absent, never diffed. See below.
const unclassified = []  // no registry entry at all (DEC-S046) — a jig-side gap, not project drift.
for (const rel of templates) {
  const cls = classOf(rel)
  /**
   * Ordered after `classOf` on purpose, and guarded on the class existing. Seeds' version of this
   * loop skipped its self-comparison exceptions BEFORE this line and thereby swallowed an
   * UNCLASSIFIED file silently. That is DEC-S046's exact failure reintroduced by the fix for a
   * different one: a file with no registry entry has to be reported before anything gets to
   * decide it is uninteresting,
   * because "no entry" is the absence of an answer rather than an answer.
   */
  if (cls === 'jig-only') continue         // lives in jig; a project never holds a copy
  if (cls === 'context') continue          // project-owned; differing is correct
  /**
   * `presence` (DEC-S044): the file must EXIST here, and what is in it is none of this
   * script's business. `.claude/settings.json` is the case — its contents are distributed
   * by hand per machine (DEC-S023), so a project legitimately carrying a different revision
   * is not drift, and reporting "differs" would amount to claiming jig' copy is the right
   * one. That is the opinion this script must never acquire. Absence is a different kind of
   * fact: it is checkable, it is never correct, and nothing else notices it.
   */
  if (cls === 'presence') {
    if (!existsSync(join(PROJECT, toProject(rel)))) missing.push(toProject(rel))
    continue
  }
  /**
   * No entry in the registry at all (DEC-S046). NOT the same as a class this script
   * doesn't diff: `context`, `jig-only` and `presence` are answers, and skipping
   * them is honoring one. `undefined` is the absence of an answer, and skipping it
   * silently is how `agents/pm.md` and `agents/doc-consistency.md` sat outside the
   * registry from the day they were written — bushel's `doc-consistency.md` still
   * routed findings to the deleted `@sync-config`, and every drift run on that repo
   * reported it clean. The registry's own header already says an unmatched file
   * "has never been classified; treat it as unclassified rather than assuming a
   * default, and decide deliberately" — this reports it so there is something to
   * decide about. Reported whether or not the copies differ: the defect is the
   * missing entry, not the bytes.
   */
  if (cls === undefined) { unclassified.push(toProject(rel)); continue }
  if (cls !== 'logic' && cls !== 'hybrid') continue  // a classified file this script doesn't diff
  const theirs = join(PROJECT, toProject(rel))
  if (!existsSync(theirs)) rows.push([cls, toProject(rel), 'absent here'])
  else if (hash(join(JIG, rel)) !== hash(theirs)) rows.push([cls, toProject(rel), cls === 'hybrid' ? 'differs (shell; the paired context file is yours)' : 'differs'])
}

// Present in the project, absent from the templates — a retired file nobody removed.
for (const kind of ['skills', 'agents']) {
  const src = join(JIG, '.claude', kind)
  if (!existsSync(src)) continue
  const mine = new Set(readdirSync(src, { withFileTypes: true }).map((d) => d.name.replace(/\.md$/, '')))
  const dir = join(PROJECT, '.claude', kind)
  if (!existsSync(dir)) continue
  for (const e of readdirSync(dir)) {
    const name = e.replace(/\.md$/, '')
    if (!mine.has(name)) rows.push([kind.slice(0, -1), `.claude/${kind}/${e}`, 'not a template — retired, or project-owned'])
  }
}

const v = (p) => (existsSync(p) ? readFileSync(p, 'utf8').trim() : '?')
const sv = v(join(JIG, 'jig-version'))
const pv = v(join(PROJECT, '.claude', 'jig-version'))

console.log(`\ndrift — ${basename(PROJECT)} vs jig`)
console.log(`jig-version ${pv} vs ${sv}${pv !== sv ? '  ← owes a migration' : ''}\n`)
/**
 * Split, because the two groups need different amounts of attention. A file that DIFFERS is drift:
 * two versions of something meant to be identical, and one of them is stale. A file that is ABSENT
 * is usually fine — one-time migration helpers, stack-specific tooling a project has no use for.
 * Printing them in one list buries four real problems under five non-problems, which is how a
 * report stops being read.
 */
const differs = rows.filter((r) => r[2].startsWith('differs'))
const other = rows.filter((r) => !r[2].startsWith('differs'))
const show = (title, rs) => {
  if (!rs.length) return
  const w = Math.max(...rs.map((r) => r[1].length))
  console.log(title)
  for (const [cls, path, note] of rs.sort((a, b) => a[1].localeCompare(b[1]))) {
    console.log(`  ${cls.padEnd(7)} ${path.padEnd(w)}  ${note}`)
  }
  console.log('')
}
if (!rows.length && !missing.length && !unclassified.length) console.log('  nothing differs.\n')
/**
 * A jig-side gap, printed last and phrased as one. It is not this project's drift and
 * there is nothing to copy in response — the fix is an entry in jig's registry. Kept out
 * of both drift tables for that reason: a row a reader cannot act on from here, sitting in
 * a table of rows they can, is how the actionable ones stop being read.
 */
if (unclassified.length) {
  console.log(`UNCLASSIFIED in jig — no file-class entry, so never compared (${unclassified.length}):`)
  for (const p of unclassified.sort()) console.log(`  ?       ${p}`)
  console.log('  Fix in jig: .claude/file-classes.yaml. Not this project\'s drift.\n')
}
/**
 * Printed FIRST and in its own block, above the two drift tables. It does not belong in
 * "also absent — often fine", whose whole job is to say *ignore me*: filing a missing
 * permission policy under that heading is how a real gap reads as a non-problem. Nor does it
 * belong in DRIFT, which means two copies of something meant to be identical — there is only
 * one copy here, and it is on the other machine.
 */
if (missing.length) {
  console.log(`MISSING — no copy here, and nothing else reports it (${missing.length}):`)
  for (const p of missing.sort()) console.log(`  absent  ${p}`)
  console.log('  Contents are yours and are never compared. Only the absence is reported.\n')
}
show(`DRIFT — meant to be identical, and is not (${differs.length}):`, differs)
show(`Also absent or unexpected (${other.length}) — often fine: one-time migrations, stack-specific tooling:`, other)
if (differs.length) console.log('  This says what differs, not which side is right. Read them and decide.\n')
