#!/usr/bin/env node
/**
 * What a jig sync would carry into one project, file by file, and with `--pr`, carrying it.
 *
 *   node scripts/sync.mjs ../muster           the dry run: writes nothing but the refs `git fetch` updates
 *   node scripts/sync.mjs ../muster --pr      carry it in a worktree; push and open the pull request if the gates pass
 *   node scripts/sync.mjs ../muster --clean   remove what a red `--pr` left behind
 *   node scripts/sync.mjs --jig <path> ...    a jig other than the one this script is in
 *
 * `--pr` and `--clean` also write everything they print, and every gate's full output, to a log in
 * a private directory per run, `<tmp>/jig-sync-<repo>-XXXXXX/`; the last line printed is its path
 * (issue #77).
 *
 * Issue #71 is the dry run and issue #72 the write half. `--pr` pushes and opens a pull request, so
 * it is an environment-changing command (CLAUDE.md § Workflow Notes): the operator runs it, or a
 * session does after the operator says go for that project.
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

import { execFileSync, spawnSync } from 'node:child_process'
import { appendFileSync, chmodSync, existsSync, mkdirSync, mkdtempSync, readFileSync, realpathSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import { format } from 'node:util'
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
let mode = 'dry'
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--jig') jigArg = argv[++i] ?? die('--jig needs a path')
  else if (argv[i] === '--pr' || argv[i] === '--clean') {
    if (mode !== 'dry') die('--pr and --clean are separate runs — pass one')
    mode = argv[i].slice(2)
  } else if (argv[i].startsWith('--')) die(`unknown flag ${argv[i]} — the flags are --jig, --pr and --clean`)
  else positional.push(argv[i])
}
if (positional.length !== 1) die('usage: node scripts/sync.mjs [--jig <path>] [--pr | --clean] <project>')

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

const NAME = basename(PROJECT)

/**
 * `--pr` and `--clean` keep a log: everything they print, plus the full output of every gate,
 * which the terminal shows only for a gate that failed. The first real syncs reached the jig
 * session as phone screenshots, and a green run printed nothing any gate said — so the "taken on
 * trust" line of issue #75 was never seen (issue #77).
 *
 * Each line is written as it is printed, so a run that dies partway still leaves its log, and the
 * last line on the terminal is always the path. The dry run keeps none: its header says it writes
 * nothing.
 *
 * Every run gets its own directory from `mkdtempSync` — private, and named by nobody in advance —
 * which also means a run never overwrites the log of the run before it. The first version wrote to
 * a fixed `/tmp/jig-sync/`, and the log is reopened by path for every line: another account could
 * create that directory first and swap the log for a symlink, so the run appended to, or on
 * creation emptied, any file the operator can write (found by /security-review).
 */
const terminal = console.log.bind(console)
let toLog = () => {}
if (mode !== 'dry') {
  const LOG = join(mkdtempSync(join(tmpdir(), `jig-sync-${NAME}-`)), `${NAME}-${new Date().toISOString().replaceAll(':', '-')}.log`)
  writeFileSync(LOG, '')
  toLog = (text) => appendFileSync(LOG, text)
  for (const stream of ['log', 'error']) {
    const write = console[stream].bind(console)
    console[stream] = (...args) => {
      write(...args)
      toLog(`${format(...args)}\n`) // exactly what console.log wrote, its newline included
    }
  }
  process.on('exit', () => console.log(`log  ${LOG}`))
}

/**
 * Where `--pr` works: a worktree beside the project, never the project's own checkout. Every
 * sibling is somebody's parked session, often mid-task with untracked files, and a worktree leaves
 * that checkout exactly as it was (checklist step 2 in `.claude/CLAUDE-context.md`).
 *
 * The date is UTC, so two runs either side of local midnight cannot disagree about the branch.
 */
const WORKTREE = join(dirname(PROJECT), `${NAME}-jig-sync`)
const BRANCH = `jig-sync/${new Date().toISOString().slice(0, 10)}`

/**
 * The exclude line that keeps the hard-linked `node_modules` out of a commit. Git keeps
 * `info/exclude` in the repository's common directory, shared by every worktree, so while it is
 * there the real checkout ignores `/node_modules` too — which changes nothing in a project whose
 * `.gitignore` already does, and every Node project's does. The marker names the worktree, so the
 * removal takes out exactly the lines this script added and nothing a person wrote.
 */
const EXCLUDE = join(commonDir(PROJECT), 'info', 'exclude')
const EXCLUDE_BLOCK = `# jig sync: node_modules is hard-linked into ${WORKTREE}. scripts/sync.mjs removes these two lines.\n/node_modules\n`
function addExclude() {
  mkdirSync(dirname(EXCLUDE), { recursive: true })
  const text = existsSync(EXCLUDE) ? readFileSync(EXCLUDE, 'utf8') : ''
  if (!text.includes(EXCLUDE_BLOCK)) writeFileSync(EXCLUDE, `${text}${text === '' || text.endsWith('\n') ? '' : '\n'}${EXCLUDE_BLOCK}`)
}
function dropExclude() {
  if (!existsSync(EXCLUDE)) return false
  const text = readFileSync(EXCLUDE, 'utf8')
  if (!text.includes(EXCLUDE_BLOCK)) return false
  const rest = text.replace(EXCLUDE_BLOCK, '')
  if (rest === '') unlinkSync(EXCLUDE)
  else writeFileSync(EXCLUDE, rest)
  return true
}

/** For the write path: a failure carries git's own message rather than a bare exit status. */
const sh = (dir, ...args) => execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] })
function step(what, fn) {
  try {
    return fn()
  } catch (e) {
    console.error(`sync: ${what} failed: ${String(e.stderr || e.message).trim()}`)
    if (existsSync(WORKTREE)) console.error(`The worktree is at ${WORKTREE}. node scripts/sync.mjs --clean ${PROJECT} removes it.`)
    process.exit(2)
  }
}

/**
 * `--clean`: undo a red `--pr`. It finds the worktree by its path, not by today's branch name, so
 * it still works the day after the run. Only a worktree on a `jig-sync/` branch is removed: a
 * directory at that path that is anything else is somebody's, and is left alone.
 */
if (mode === 'clean') {
  const entries = git(PROJECT, 'worktree', 'list', '--porcelain').split('\n\n').map((e) => e.split('\n'))
  const entry = entries.find((lines) => lines[0] === `worktree ${WORKTREE}`)
  const done = []
  if (entry) {
    const branch = entry.find((l) => l.startsWith('branch refs/heads/'))?.slice('branch refs/heads/'.length)
    if (!branch?.startsWith('jig-sync/')) die(`${WORKTREE} is a worktree on ${branch ?? 'a detached HEAD'}, not a jig sync — not touching it`)
    step('removing the worktree', () => sh(PROJECT, 'worktree', 'remove', '--force', WORKTREE))
    step(`deleting ${branch}`, () => sh(PROJECT, 'branch', '--quiet', '-D', branch))
    done.push(`removed the worktree ${WORKTREE}`, `deleted the local branch ${branch}`)
  } else if (existsSync(WORKTREE)) {
    die(`${WORKTREE} exists but is not a worktree of ${NAME} — not touching it`)
  }
  if (dropExclude()) done.push(`took the node_modules line back out of ${EXCLUDE}`)
  console.log(done.length ? done.map((d) => `sync --clean: ${d}`).join('\n') : `sync --clean: nothing to clean for ${NAME}`)
  process.exit(0)
}

/**
 * `--pr` refuses before touching anything when a previous run is still in the way. A worktree or a
 * local branch is a red run nobody has cleaned; the branch on origin is today's sync already pushed,
 * with its pull request open. Checked before the fetch, so a refusal writes nothing at all.
 */
if (mode === 'pr') {
  if (existsSync(WORKTREE)) die(`${WORKTREE} already exists. If a red --pr left it, node scripts/sync.mjs --clean ${PROJECT} removes it`)
  if (tryGit(PROJECT, 'rev-parse', '--verify', '--quiet', `refs/heads/${BRANCH}`) !== null) die(`${NAME} already has a local branch ${BRANCH}`)
  const remote = tryGit(PROJECT, 'ls-remote', '--heads', 'origin', `refs/heads/${BRANCH}`)
  if (remote === null) die(`could not reach ${NAME}'s origin to check for ${BRANCH}`)
  if (remote.trim()) die(`${BRANCH} is already on ${NAME}'s origin — today's sync was pushed; merge or close its pull request first`)
}

/**
 * Both sides at `origin/main`, fetched first — the rule `fleet.mjs` states at its top. What has
 * shipped is `main` on GitHub. jig's checkout is usually on an unmerged branch, and every project
 * is somebody's parked session, so neither working tree is the answer. A failed fetch is reported
 * beside the header rather than stopping the run, as fleet does.
 */
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

/**
 * path → blob id, for every file at `origin/main`. Blob ids compare bytes without reading them.
 * `modes`, when given, collects path → mode, for the files `--pr` writes.
 */
function tree(dir, modes) {
  const files = new Map()
  for (const rec of git(dir, 'ls-tree', '-r', '-z', REF).split('\0')) {
    if (!rec) continue
    const tab = rec.indexOf('\t')
    const [mode, type, oid] = rec.slice(0, tab).split(' ')
    if (type !== 'blob') continue
    files.set(rec.slice(tab + 1), oid)
    modes?.set(rec.slice(tab + 1), mode)
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
const landing = (path) => git(JIG, 'log', '--first-parent', '-1', '--format=%H', REF, '--', path).trim()
const genCache = new Map()
function landedAt(path) {
  const commit = landing(path)
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
const jigModes = new Map()
const jigTree = tree(JIG, jigModes)
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
/** project path → the jig path a Copy or New is read from. They differ only for a scaffold. */
const source = new Map()

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
    else {
      const into = theirs === undefined ? add : copy
      into.push([path])
      source.set(path, rel)
    }
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
  /**
   * Classed as it was while jig shipped it — the registry in the commit before the retirement
   * landed — as well as by today's. Today's alone was the bug @code-review found: the reviewer
   * agents are each named in the registry with no glob behind them, so retiring one AND its line
   * left the path with no class, and an untouched `context` copy came out DELETE. Either registry
   * calling it project-owned keeps it out; neither giving it a class at all holds it as
   * unclassified rather than defaulting to removable.
   */
  const then = classifier(parseFileClasses(tryGit(JIG, 'show', `${landing(rel)}^:.claude/file-classes.yaml`) ?? ''))(rel)
  const classes = [then, classOf(rel)]
  if (classes.some((c) => c === 'context' || c === 'presence')) continue
  if (!classes.some((c) => c === 'logic' || c === 'hybrid' || c === 'jig-only')) {
    unclassified.push([rel, 'retired, and had no class while jig shipped it'])
    continue
  }
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
const HEADER = {
  dry: 'dry run: fetches, then writes nothing',
  pr: 'carries it in a worktree, and pushes only if the gates pass',
}
console.log(`\nsync — ${NAME}, ${HEADER[mode]}`)
console.log(`${'jig'.padEnd(w)}  ${REF} ${short(JIG)}  jig-version ${jigGen}`)
console.log(`${NAME.padEnd(w)}  ${REF} ${short(PROJECT)}  jig-version ${projGen}`)
for (const d of fetchFailed) console.log(`${d === JIG ? 'jig' : NAME}: fetch failed, so this is ${REF} as of the last fetch`)
console.log('')

/** One block as lines. The verdict blocks are printed and, under `--pr`, are the body's core. */
const blockLines = (title, rows, { sort = true } = {}) => {
  if (!rows.length) return []
  const pad = Math.max(...rows.map(([p]) => p.length))
  const ordered = sort ? [...rows].sort((a, b) => a[0].localeCompare(b[0])) : rows
  return [`${title} (${rows.length}):`, ...ordered.map(([p, note]) => (note ? `  ${p.padEnd(pad)}  ${note}` : `  ${p}`)), '']
}

const report = [
  ...blockLines("COPY — jig's current version replaces a copy nobody edited", copy),
  ...blockLines('NEW — jig ships it and the project has none', add),
  ...blockLines('DELETE — a copy nobody edited, of a file jig keeps to itself or retired', remove),
  ...blockLines('HELD: edited locally — matches no version jig ever shipped at this path; a session decides', edited),
  ...blockLines("HELD: migration — jig made this change at a newer jig-version than the project's", migration),
  ...blockLines('HELD: referenced — a package.json script runs it, so deleting it would break that command', referenced),
  ...blockLines('UNWIRED — gates verify never runs. Add each to verify, or decide it does not apply here', unwired),
  ...blockLines('UNCLASSIFIED in jig — no file-class entry, so never synced. Fix in jig: .claude/file-classes.yaml', unclassified),
]
if (changing.length) {
  const top = changing.filter((p) => at.get(p) === level)
  report.push(`Restart after merge: ${LEVELS[level]}${level > 0 ? ` — ${top.join(', ')}` : ''}`)
  if (changing.some((p) => p.startsWith('.claude/skills/'))) {
    report.push('  A conversation that already read an old skill keeps that text until /clear.')
  }
  report.push('')
}

if (!changing.length) console.log('nothing to sync.\n')
if (report.length) console.log(report.join('\n'))
if (mode === 'dry' || !changing.length) process.exit(0)

// ——— `--pr` from here. Checklist steps 2, 3, 4, 7 and 8 in `.claude/CLAUDE-context.md`, as code. ———

const jigSha = git(JIG, 'rev-parse', REF).trim()

step('making the worktree', () => sh(PROJECT, 'worktree', 'add', '--quiet', '--no-track', '-b', BRANCH, WORKTREE, REF))
console.log(`worktree  ${WORKTREE}, on ${BRANCH} from ${NAME} ${REF} ${short(PROJECT)}`)

/**
 * Copy and New are written from jig's `origin/main`, never its working tree, which is usually an
 * unmerged branch. A new file takes jig's executable bit; a copy keeps the project's mode, because
 * the verdict compared bytes and a mode change would be a change the dry run never reported.
 */
step('applying the verdicts', () => {
  for (const [path] of [...copy, ...add]) {
    const rel = source.get(path)
    const bytes = execFileSync('git', ['-C', JIG, 'show', `${REF}:${rel}`], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'pipe'] })
    const dest = join(WORKTREE, path)
    mkdirSync(dirname(dest), { recursive: true })
    writeFileSync(dest, bytes)
    if (!projTree.has(path) && jigModes.get(rel) === '100755') chmodSync(dest, 0o755)
  }
  if (remove.length) sh(WORKTREE, 'rm', '--quiet', '--', ...remove.map(([p]) => p))
})

/**
 * The gates need the project's dependencies, and a fresh worktree has none. A hard link, never a
 * symlink: Next's Turbopack refuses a `node_modules` that points outside the tree. A virtualenv or a
 * build output is not made here; a gate that needs one goes red and the run is handed off.
 */
const realModules = join(PROJECT, 'node_modules')
if (existsSync(realModules)) {
  addExclude()
  step('hard-linking node_modules', () => execFileSync('cp', ['-al', realModules, join(WORKTREE, 'node_modules')], { stdio: ['ignore', 'pipe', 'pipe'] }))
  console.log(`node_modules  hard-linked from ${NAME}'s checkout; /node_modules added to ${EXCLUDE}`)
}

/**
 * Staged by name, never `git add -A`, so nothing but what the verdicts wrote reaches the commit —
 * `node_modules` included, even in a project whose ignore files would let it through.
 */
step('committing', () => {
  const written = [...copy, ...add].map(([p]) => p)
  if (written.length) sh(WORKTREE, 'add', '--', ...written)
  const counts = `${copy.length} copied, ${add.length} added, ${remove.length} deleted`
  sh(WORKTREE, 'commit', '--quiet', '-m', `jig sync: jig origin/main ${jigSha.slice(0, 7)}`, '-m', `Carried by scripts/sync.mjs --pr from jig origin/main ${jigSha}: ${counts}.`)
  console.log(`commit    ${sh(WORKTREE, 'rev-parse', '--short', 'HEAD').trim()} — ${counts}`)
})

/**
 * `verify`, then each unwired gate run directly, the way jig runs its own. Every gate runs even
 * after one fails, so a handoff names all of them at once. A project with no `verify` is red:
 * nothing there can prove the sync, and a pull request that says it passed would be untrue.
 */
const gateName = (path) => `check:${basename(path, '.mjs').slice('check-'.length)}`
const results = []
/** Every gate's output goes to the log as it finishes, passing or not; the terminal gets the red. */
const record = (result) => {
  results.push(result)
  const body = result.output.trimEnd()
  toLog(`——— ${result.label}: ${result.status} ———\n${body ? `${body}\n` : ''}\n`)
}
const runGate = (label, cmd, args, extra = {}) => {
  console.log(`running   ${label}`)
  const r = spawnSync(cmd, args, { cwd: WORKTREE, encoding: 'utf8', maxBuffer: 1 << 30 })
  const ok = r.status === 0
  record({ label, ok, status: ok ? 'passed' : 'failed', output: `${r.stdout ?? ''}${r.stderr ?? ''}${r.error ? String(r.error) : ''}`, ...extra })
}
if (typeof projScripts.verify === 'string') runGate('npm run verify', 'npm', ['run', 'verify'])
else {
  record({
    label: 'npm run verify',
    ok: false,
    status: 'no verify script',
    output: `${NAME}'s package.json has no verify script, so nothing can prove the sync here.`,
  })
}
for (const [name, why] of unwired) {
  const arriving = name.startsWith('scripts/')
  const path = arriving ? name : [...gates].find((g) => projScripts[name].includes(g))
  const wire = arriving
    ? `add \`"${gateName(path)}": "node ${path}"\` to \`scripts\`, and append \` && npm run ${gateName(path)}\` to \`verify\``
    : `append \` && npm run ${name}\` to \`verify\``
  runGate(`node ${path}`, process.execPath, [path], { why, wire })
}
console.log('')
console.log(blockLines('GATES — run in the worktree; any failure stops the push', results.map((g) => [g.label, g.status]), { sort: false }).join('\n'))

const cleanUp = () => {
  step('removing the worktree', () => sh(PROJECT, 'worktree', 'remove', '--force', WORKTREE))
  step(`deleting the local ${BRANCH}`, () => sh(PROJECT, 'branch', '--quiet', '-D', BRANCH))
  dropExclude()
  console.log(`cleaned up: the worktree, the local branch and the exclude line are gone; ${BRANCH} lives on ${NAME}'s origin`)
}

/**
 * Red: hand off. The worktree, its commit and the exclude line stay, so a session can do checklist
 * step 5 — decide whether the failure is the project's content, a template defect to fix in jig
 * first, or the setup.
 */
const red = results.filter((g) => !g.ok)
if (red.length) {
  console.log('RED — no push and no pull request. The worktree stays, with its commit, for checklist step 5:')
  console.log(`  ${WORKTREE}  (${BRANCH})\n`)
  // To the terminal only: `record` already put each of these in the log.
  for (const g of red) terminal(`——— ${g.label}: ${g.status} ———\n${g.output.trimEnd()}\n`)
  console.log(`When it is settled: node scripts/sync.mjs --clean ${PROJECT}`)
  process.exit(1)
}

const push = spawnSync('git', ['-C', WORKTREE, 'push', '--quiet', '-u', 'origin', BRANCH], { encoding: 'utf8' })
if (push.status !== 0) {
  console.log(`The gates passed, but the push failed, so nothing was opened:\n${`${push.stderr ?? ''}${push.error ?? ''}`.trim()}`)
  console.log(`The worktree stays at ${WORKTREE}. node scripts/sync.mjs --clean ${PROJECT} removes it.`)
  process.exit(1)
}
console.log(`pushed    ${BRANCH} to ${NAME}'s origin`)

const fence = (lines) => ['```text', ...lines, '```']
const body = [
  `Synced from jig \`origin/main\` ${jigSha} (jig-version ${jigGen}) by \`scripts/sync.mjs --pr\`. Every file below was decided by a lookup in jig's history (DEC-J012), and every held file is exactly as it was here.`,
  '',
  ...fence(report.join('\n').trimEnd().split('\n')),
  '',
  '## Gates',
  '',
  'Run in a worktree off `origin/main` with this commit applied, before anything was pushed. A failing gate stops the sync there.',
  '',
  ...results.map((g) => `- \`${g.label}\` — ${g.status}${g.why ? `. Unwired: ${g.why}. To wire it in, ${g.wire}.` : ''}`),
  '',
  ...(unwired.length ? ["Whether an unwired gate applies here is this project's call. The sync never edits `package.json`.", ''] : []),
].join('\n')
const bodyFile = join(mkdtempSync(join(tmpdir(), 'jig-sync-')), 'body.md')
writeFileSync(bodyFile, body)

/**
 * `gh` runs in the worktree, which has the project's remotes, so it opens the pull request on the
 * project's repository. The base is always `main`, never `production`, which is a deploy pointer.
 */
const title = `jig sync ${BRANCH.slice('jig-sync/'.length)}: jig ${jigSha.slice(0, 7)}`
const gh = spawnSync('gh', ['pr', 'create', '--base', 'main', '--head', BRANCH, '--title', title, '--body-file', bodyFile], {
  cwd: WORKTREE,
  encoding: 'utf8',
})
cleanUp()
if (gh.status !== 0) {
  console.log(`\ngh pr create failed:\n${`${gh.stderr ?? ''}${gh.error ?? ''}`.trim()}`)
  console.log(`${BRANCH} is pushed, so the pull request is all that is missing. Open it with:`)
  console.log(`  cd ${PROJECT} && gh pr create --base main --head ${BRANCH} --title ${JSON.stringify(title)} --body-file ${bodyFile}`)
  process.exit(1)
}
rmSync(dirname(bodyFile), { recursive: true, force: true })
console.log(`opened    ${gh.stdout.trim()}`)
