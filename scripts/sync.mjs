#!/usr/bin/env node
/**
 * What a jig sync would carry into one project, file by file. A dry run: it writes nothing but the
 * remote-tracking refs `git fetch` updates. Issue #71; the write half is issue #72.
 *
 *   node scripts/sync.mjs ../muster
 *   node scripts/sync.mjs --jig <path> ../muster
 *
 * THE RULE UNDER EVERY VERDICT: jig may replace or remove a project's file only when the project's
 * bytes match a version jig once shipped at that path. A match means nobody edited the file there,
 * so taking jig's current version loses nothing. No match means somebody did, and the file is held
 * for a session to decide. That is the whole judgment this script makes, and it is a lookup in
 * jig's git history rather than an opinion — which is the line between this and what seeds retired.
 *
 * Seeds automated the crossing three times and retired all three (DEC-S038, DEC-S040, in seeds).
 * Its sync classified hunks, merged them, and gated whole repos on a version number, and every fix
 * narrowed what it could touch until it covered only "the files where copying was already trivial."
 * This covers exactly those files and stops there, on purpose: no classifier, no hunk merge, and a
 * generation gate that holds one file rather than one repo. DEC-J012 records the choice.
 *
 * `drift.mjs` stays what it is — an enumerator that never says which side is right. This script
 * does say, and only for the case where the answer is a lookup: an untouched copy is stale.
 */

import { execFileSync } from 'node:child_process'
import { existsSync, realpathSync } from 'node:fs'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import {
  TEMPLATE_ROOTS,
  classifier,
  isShippedGate,
  isTemplate,
  notRunGates,
  packageScripts,
  parseFileClasses,
  scaffoldTargets,
  toProject,
} from './lib/file-classes.mjs'

function die(m) {
  console.error(`sync: ${m}`)
  process.exit(2)
}

const HERE = dirname(fileURLToPath(import.meta.url))
const REF = 'origin/main'

const argv = process.argv.slice(2)
const positional = []
let jigArg = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--jig') jigArg = argv[++i] ?? die('--jig needs a path')
  else if (argv[i].startsWith('--')) die(`unknown flag ${argv[i]} — the only flag is --jig`)
  else positional.push(argv[i])
}
if (positional.length !== 1) die('usage: node scripts/sync.mjs [--jig <path>] <project>')

const jigPath = resolve(jigArg ?? join(HERE, '..'))
if (!existsSync(join(jigPath, 'jig-version'))) die(`${jigPath} is not a jig checkout`)
const JIG = realpathSync(jigPath)
if (!existsSync(positional[0])) die(`no such directory: ${positional[0]}`)
const PROJECT = realpathSync(resolve(positional[0]))

/** Raw output: `-z` records are NUL-separated, and trimming would eat a meaningful byte. */
const git = (dir, ...args) =>
  execFileSync('git', ['-C', dir, '-c', 'core.quotePath=false', ...args], {
    encoding: 'utf8',
    maxBuffer: 1 << 30,
    stdio: ['ignore', 'pipe', 'ignore'],
  })
const tryGit = (dir, ...args) => {
  try {
    return git(dir, ...args)
  } catch {
    return null
  }
}
const show = (dir, path) => tryGit(dir, 'show', `${REF}:${path}`)

/**
 * Compared by git's common directory, not by path: a linked worktree of jig is jig too, and
 * comparing it against jig would report every file as already synced.
 */
const commonDir = (dir) => tryGit(dir, 'rev-parse', '--path-format=absolute', '--git-common-dir')?.trim()
if (!commonDir(PROJECT)) die(`${PROJECT} is not a git repository`)
if (commonDir(PROJECT) === commonDir(JIG)) die('that is jig itself — point this at a project')

/**
 * Both sides at `origin/main`, fetched first — the rule `fleet.mjs` states at its top. What has
 * shipped is `main` on GitHub. jig's checkout is usually on an unmerged branch, and every project
 * is somebody's parked session, so neither working tree is the answer. A failed fetch is reported
 * beside the header rather than stopping the run, as fleet does.
 */
const NAME = basename(PROJECT)
const fetchFailed = [JIG, PROJECT].filter((d) => tryGit(d, 'fetch', '--quiet', 'origin', 'main') === null)
for (const [dir, name] of [[JIG, 'jig'], [PROJECT, NAME]]) {
  if (tryGit(dir, 'rev-parse', '--verify', '--quiet', `${REF}^{commit}`) === null) die(`${name} has no ${REF}`)
}

const generation = (text) => {
  const n = Number(String(text ?? '').trim())
  return Number.isInteger(n) ? n : null
}
const jigGen = generation(show(JIG, 'jig-version')) ?? die(`jig's ${REF} has no readable jig-version`)
const projGen =
  generation(show(PROJECT, '.claude/jig-version') ?? die(`no .claude/jig-version on ${REF} — ${NAME} is not on jig`)) ??
  die(`${NAME}'s .claude/jig-version is not a whole number`)

/** path → blob id, for every file at `origin/main`. Blob ids compare bytes without reading them. */
function tree(dir) {
  const files = new Map()
  for (const rec of git(dir, 'ls-tree', '-r', '-z', REF).split('\0')) {
    if (!rec) continue
    const tab = rec.indexOf('\t')
    const [, type, oid] = rec.slice(0, tab).split(' ')
    if (type === 'blob') files.set(rec.slice(tab + 1), oid)
  }
  return files
}

/**
 * path → every blob id jig's `main` has ever held at that path.
 *
 * `--full-history` and `-m` are both load-bearing. Default history simplification follows only the
 * parent a merge is identical to, so a version that was on `main` and then replaced inside a merged
 * branch can drop out — and a project synced while that version was current holds exactly those
 * bytes. `-m` adds each merge's own diff, which is the only place a conflict resolution's blob ever
 * appears. Missing a version here is not neutral: it turns an untouched copy into "edited locally".
 */
function history() {
  const seen = new Map()
  const raw = git(JIG, 'log', '--full-history', '-m', '--no-renames', '--format=', '--raw', '--no-abbrev', '-z', REF, '--', ...TEMPLATE_ROOTS)
  const tokens = raw.split('\0')
  for (let i = 0; i < tokens.length; i++) {
    const meta = tokens[i].replace(/^\n+/, '')
    if (!meta.startsWith(':')) continue
    const [, , before, after] = meta.slice(1).split(' ')
    const path = tokens[++i]
    if (!seen.has(path)) seen.set(path, new Set())
    for (const oid of [before, after]) if (!/^0+$/.test(oid)) seen.get(path).add(oid)
  }
  return seen
}

/**
 * The generation jig was at when its current state of a path landed on `main` — the version a Copy
 * or New would carry, or the deletion behind a retired file.
 *
 * First-parent on purpose, and it is a different question from `history()`'s. A change reaches
 * `main` through a merge, and the merge is when it shipped. A branch cut before a `jig-version` bump
 * and merged after it ships its change into the newer generation, and that is the generation a
 * project has to be at to take it. Stricter than the branch commit's own generation, which is the
 * safe direction for a gate.
 *
 * A commit from before `jig-version` existed has no generation, and reads as 0: it predates every
 * migration, so no project can owe one for it.
 */
const genCache = new Map()
function landedAt(path) {
  const commit = git(JIG, 'log', '--first-parent', '-1', '--format=%H', REF, '--', path).trim()
  if (!genCache.has(commit)) genCache.set(commit, generation(tryGit(JIG, 'show', `${commit}:jig-version`)) ?? 0)
  return genCache.get(commit)
}

/**
 * Restart level per path, for what a merge would change. Unknown paths fail the run rather than
 * defaulting to "none": a default is how a hook change would merge with nobody restarting.
 *
 * - Skills and agents: none. Claude Code watches `.claude/agents/` and "the next delegation uses
 *   the updated definition, with no restart needed" (code.claude.com/docs/en/sub-agents). A skill
 *   is read when invoked; a conversation that already read the old one keeps it until /clear.
 * - `CLAUDE.md` and `docs/**`: /clear. The shell loads at the start of a context.
 * - Output styles: a new session. The style is "read once at launch" (CLAUDE.md § Communication),
 *   so deleting a project's stray copy takes effect at the next session start and not before.
 *
 * `.claude/settings.json` is `presence`, so a sync never carries it.
 */
const RESTART = [
  [/^\.claude\/skills\//, 0],
  [/^\.claude\/agents\//, 0],
  [/^scripts\//, 0],
  [/^CLAUDE\.md$/, 1],
  [/^docs\//, 1],
  [/^\.claude\/output-styles\//, 2],
]
const LEVELS = ['none', '/clear', 'restart the session']

const registry = show(JIG, '.claude/file-classes.yaml') ?? die(`jig's ${REF} has no .claude/file-classes.yaml`)
const classOf = classifier(parseFileClasses(registry))
const jigTree = tree(JIG)
const projTree = tree(PROJECT)
const once = history()
const templates = [...jigTree.keys()].filter(isTemplate)
const scaffolded = scaffoldTargets(templates)
const projScripts = packageScripts(show(PROJECT, 'package.json'))

const copy = []
const add = []
const remove = []
const edited = []
const migration = []
const referenced = []
const unclassified = []

/**
 * A delete the project still calls is held: removing `scripts/drift.mjs` from a repo whose
 * `npm run drift` runs it breaks a command that `verify` may never exercise.
 */
function removal(path, why) {
  const by = Object.entries(projScripts).find(([, cmd]) => cmd.includes(path))
  if (by) referenced.push([path, `npm run ${by[0]}`])
  else remove.push([path, why])
}

for (const rel of templates) {
  const cls = classOf(rel)
  if (cls === undefined) {
    unclassified.push([rel])
    continue
  }
  if (cls === 'logic' || cls === 'hybrid') {
    const path = toProject(rel)
    const theirs = projTree.get(path)
    if (theirs === jigTree.get(rel)) continue
    if (theirs !== undefined && !once.get(rel)?.has(theirs)) {
      edited.push([path])
      continue
    }
    const gen = landedAt(rel)
    if (gen > projGen) migration.push([path, `jig-version ${gen}`])
    else (theirs === undefined ? add : copy).push([path])
    continue
  }
  /**
   * A copy of a file jig keeps to itself. No generation gate: the file should never have reached
   * the project at all, so there is no migration that makes holding it correct.
   */
  if (cls === 'jig-only') {
    if (scaffolded.has(rel)) continue
    const theirs = projTree.get(rel)
    if (theirs === undefined) continue
    if (!once.get(rel)?.has(theirs)) edited.push([rel])
    else removal(rel, 'jig-only')
  }
  // `context` and `presence` are never candidates: the project owns the first, and the second's
  // contents are distributed by hand per machine.
}

/**
 * Files jig retired. drift.mjs lists these as "retired, or project-owned" because it cannot tell
 * the two apart; jig's history can. A path jig never had is the project's own and is never listed.
 * A path jig once had, holding bytes jig once shipped there, is a retired copy nobody edited.
 */
const RETIRABLE = ['.claude/skills/', '.claude/agents/', '.claude/output-styles/']
for (const [rel, theirs] of projTree) {
  if (!RETIRABLE.some((p) => rel.startsWith(p)) || jigTree.has(rel) || !once.has(rel)) continue
  const cls = classOf(rel)
  if (cls === 'context' || cls === 'presence') continue
  if (!once.get(rel).has(theirs)) {
    edited.push([rel])
    continue
  }
  const gen = landedAt(rel)
  if (gen > projGen) migration.push([rel, `jig-version ${gen}`])
  else removal(rel, 'retired')
}

/**
 * Gates nothing runs: the project's NOT RUN set, as drift reports it, plus any gate arriving under
 * NEW with no `package.json` script to run it. The second is the one that bit — `check-denied`
 * reached muster with a sync and sat switched off for three days. Listed, never wired: whether a
 * gate applies is the project's call, and this never edits a project's `package.json`.
 */
const gates = new Set(templates.filter((rel) => isShippedGate(rel, classOf)))
const unwired = [
  ...notRunGates(projScripts, gates).map((name) => [name, 'defined, and verify never calls it']),
  ...add
    .filter(([p]) => isShippedGate(p, classOf) && !Object.values(projScripts).some((cmd) => cmd.includes(p)))
    .map(([p]) => [p, 'arriving, and no package.json script runs it']),
]

const changing = [...copy, ...add, ...remove].map(([p]) => p)
let level = -1
const at = new Map()
for (const p of changing) {
  const hit = RESTART.find(([re]) => re.test(p)) ?? die(`no restart level for ${p} — add its path to RESTART in scripts/sync.mjs`)
  at.set(p, hit[1])
  level = Math.max(level, hit[1])
}

const short = (dir) => git(dir, 'rev-parse', '--short', REF).trim()
const w = Math.max(3, NAME.length)
console.log(`\nsync — ${NAME}, dry run: fetches, then writes nothing`)
console.log(`${'jig'.padEnd(w)}  ${REF} ${short(JIG)}  jig-version ${jigGen}`)
console.log(`${NAME.padEnd(w)}  ${REF} ${short(PROJECT)}  jig-version ${projGen}`)
for (const d of fetchFailed) console.log(`${d === JIG ? 'jig' : NAME}: fetch failed, so this is ${REF} as of the last fetch`)
console.log('')

const print = (title, rows) => {
  if (!rows.length) return
  const pad = Math.max(...rows.map(([p]) => p.length))
  console.log(`${title} (${rows.length}):`)
  for (const [p, note] of rows.sort((a, b) => a[0].localeCompare(b[0]))) console.log(note ? `  ${p.padEnd(pad)}  ${note}` : `  ${p}`)
  console.log('')
}

if (!changing.length) console.log('nothing to sync.\n')
print("COPY — jig's current version replaces a copy nobody edited", copy)
print('NEW — jig ships it and the project has none', add)
print('DELETE — a copy nobody edited, of a file jig keeps to itself or retired', remove)
print('HELD: edited locally — matches no version jig ever shipped at this path; a session decides', edited)
print("HELD: migration — jig made this change at a newer jig-version than the project's", migration)
print('HELD: referenced — a package.json script runs it, so deleting it would break that command', referenced)
print('UNWIRED — gates verify never runs. Add each to verify, or decide it does not apply here', unwired)
print('UNCLASSIFIED in jig — no file-class entry, so never synced. Fix in jig: .claude/file-classes.yaml', unclassified)

if (changing.length) {
  const top = changing.filter((p) => at.get(p) === level)
  console.log(`Restart after merge: ${LEVELS[level]}${level > 0 ? ` — ${top.join(', ')}` : ''}`)
  if (changing.some((p) => p.startsWith('.claude/skills/'))) {
    console.log('  A conversation that already read an old skill keeps that text until /clear.')
  }
  console.log('')
}
