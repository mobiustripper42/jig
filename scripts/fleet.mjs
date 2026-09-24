#!/usr/bin/env node
/**
 * Every repo cloned beside jig, each one's `origin/main` compared against jig's `origin/main`.
 *
 * It runs `drift.mjs` once per repo and puts one line per repo on top. Read-only apart from
 * `git fetch`, which updates each repo's remote-tracking refs and touches no branch or working tree.
 *
 * WHY THIS IS NOT A LEDGER. `its-alive` refuses a fleet list: "there is no fleet list to maintain,
 * and no report enumerating repos nobody has touched since spring." What that refuses is a record of
 * last-known state kept by hand, which is wrong the first time somebody forgets to update it. This
 * stores nothing. The list is whatever is cloned beside jig, and the state is read from git every run,
 * so there is nothing to forget.
 *
 * WHY `origin/main` ON BOTH SIDES. Every sibling is somebody's live session, parked on a task branch
 * with edits in it, and jig is usually on a branch too. The first manual run of this idea compared
 * against an unmerged jig branch and reported muster and centerline behind on work that had shipped
 * nowhere. What has shipped is `main` on GitHub, so each side is fetched and then exported with
 * `git archive` into a scratch directory, and drift compares the two exports.
 *
 * What it cannot see, so nobody mistakes its silence for safety: a repo not cloned on this machine.
 *
 *   node scripts/fleet.mjs            # jig is the checkout this script is in
 *   node scripts/fleet.mjs --jig <path>
 */

import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, mkdtempSync, readdirSync, realpathSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

function die(m) { console.error(`fleet: ${m}`); process.exit(2) }

const HERE = dirname(fileURLToPath(import.meta.url))
const DRIFT = join(HERE, 'drift.mjs')
const REF = 'origin/main'

const argv = process.argv.slice(2)
let jigArg = null
for (let i = 0; i < argv.length; i++) {
  if (argv[i] === '--jig') jigArg = argv[++i] ?? die('--jig needs a path')
  else die(`unexpected argument ${argv[i]} — the only flag is --jig`)
}
const JIG = realpathSync(resolve(jigArg ?? join(HERE, '..')))
if (!existsSync(join(JIG, 'jig-version'))) die(`${JIG} is not a jig checkout`)

const git = (dir, ...args) =>
  execFileSync('git', ['-C', dir, ...args], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim()
const tryGit = (dir, ...args) => {
  try {
    return git(dir, ...args)
  } catch {
    return null
  }
}

/**
 * `git fetch origin main` updates `origin/main` as well as FETCH_HEAD. A failure is reported beside
 * the repo rather than stopping the run: offline is not a reason to report nothing, and it is not a
 * reason to present the last-fetched state as current either.
 */
const fetched = (dir) => tryGit(dir, 'fetch', '--quiet', 'origin', 'main') !== null

/** `origin/main` exported to a scratch directory, which is the only form drift can read. */
function snapshot(dir) {
  const out = mkdtempSync(join(tmpdir(), 'fleet-'))
  const tar = execFileSync('git', ['-C', dir, 'archive', REF], { maxBuffer: 1 << 30, stdio: ['ignore', 'pipe', 'ignore'] })
  execFileSync('tar', ['-x', '-C', out], { input: tar })
  return out
}

/**
 * One entry per repository, not per directory. A linked worktree (`muster-s91` beside `muster`)
 * shares its repo's refs, so listing it would print the same `origin/main` twice under two names.
 * Keyed on the common git dir, and named after the checkout that owns it.
 *
 * The toplevel check is what keeps a plain directory out when the parent is itself inside a git
 * repo — without it, every subdirectory of a home directory under git would answer as that repo.
 */
function discover() {
  const root = dirname(JIG)
  const jigCommon = tryGit(JIG, 'rev-parse', '--path-format=absolute', '--git-common-dir')
  const repos = new Map()
  for (const e of readdirSync(root).sort()) {
    const dir = join(root, e)
    try {
      if (!statSync(dir).isDirectory()) continue
    } catch {
      continue
    }
    const top = tryGit(dir, 'rev-parse', '--show-toplevel')
    if (!top || realpathSync(top) !== realpathSync(dir)) continue
    const common = tryGit(dir, 'rev-parse', '--path-format=absolute', '--git-common-dir')
    if (!common || common === jigCommon) continue
    // The key is the dedupe. A second worktree overwrites the first; both read the same refs.
    repos.set(common,{ name: basename(common) === '.git' ? basename(dirname(common)) : e, dir })
  }
  return [...repos.values()]
}

/**
 * drift's report, reduced to one line. Parsed from its block headers, which means this reads drift's
 * output format — and so "clean" is decided ONLY by drift's own all-clear line plus the migration
 * check. A header this parse fails to recognize can cost a count on the summary line; it can never
 * turn a repo that is behind into one that reads current.
 */
const BLOCKS = [
  [/^jig-version (\S+) vs (\S+)\s+← owes a migration/m, (m) => `jig-version ${m[1]} → ${m[2]}`],
  [/^DRIFT — .*\((\d+)\):$/m, (m) => `${m[1]} drift`],
  [/^MISSING — .*\((\d+)\):$/m, (m) => `${m[1]} missing`],
  [/^NOT RUN — .*\((\d+)\):$/m, (m) => `${m[1]} not run`],
  [/^NOT YOURS — .*\((\d+)\):$/m, (m) => `${m[1]} not yours`],
  [/^UNCLASSIFIED in jig — .*\((\d+)\):$/m, (m) => `${m[1]} unclassified in jig`],
  [/^Also absent or unexpected \((\d+)\)/m, (m) => `${m[1]} absent or unexpected`],
]
function summarize(report) {
  const found = BLOCKS.flatMap(([re, say]) => {
    const m = re.exec(report)
    return m ? [say(m)] : []
  })
  const clean = /^ {2}nothing differs\.$/m.test(report) && !/owes a migration/.test(report)
  if (clean) return { clean, text: 'nothing differs' }
  return { clean, text: found.length ? found.join(' · ') : 'differs — see below' }
}

const scratch = []
let exit = 0
try {
  const jigFetched = fetched(JIG)
  const jigSha = tryGit(JIG, 'rev-parse', '--short', REF) ?? die(`jig has no ${REF}`)
  const jigSnap = snapshot(JIG)
  scratch.push(jigSnap)

  const onJig = []
  const notOnJig = []
  const noMain = []
  for (const r of discover()) {
    r.fetched = fetched(r.dir)
    r.sha = tryGit(r.dir, 'rev-parse', '--short', REF)
    if (!r.sha) noMain.push(r.name)
    else if (tryGit(r.dir, 'cat-file', '-e', `${REF}:.claude/jig-version`) === null) notOnJig.push(r.name)
    else onJig.push(r)
  }

  for (const r of onJig) {
    const snap = snapshot(r.dir)
    scratch.push(snap)
    const run = spawnSync(process.execPath, [DRIFT, '--jig', jigSnap, snap], { encoding: 'utf8' })
    if (run.status !== 0) {
      r.clean = false
      r.text = 'drift failed — see below'
      r.report = (run.stdout + run.stderr).trim()
      continue
    }
    // drift names what it was handed, and it was handed two scratch directories.
    r.report = run.stdout
      .replace(`drift — ${basename(snap)} vs jig`, `drift — ${r.name} vs jig`)
      .replace(/^jig at .*$/m, `jig at ${REF} ${jigSha}`)
      .trim()
    Object.assign(r, summarize(r.report))
  }

  console.log(`\nfleet — every repo beside jig, ${REF} against jig ${REF} ${jigSha}`)
  if (!jigFetched) console.log(`jig: fetch failed, so this is jig as of its last fetch`)
  console.log('')
  // Both columns padded: git lengthens a short hash when seven characters are ambiguous, and
  // muster's is eight.
  const w = Math.max(0, ...onJig.map((r) => r.name.length))
  const s = Math.max(0, ...onJig.map((r) => r.sha.length))
  for (const r of onJig) {
    const stale = r.fetched ? '' : '  (fetch failed — as of last fetch)'
    console.log(`  ${r.name.padEnd(w)}  ${r.sha.padEnd(s)}  ${r.text}${stale}`)
  }
  if (!onJig.length) console.log('  no repo beside jig is on jig')
  console.log('')
  if (notOnJig.length) console.log(`not on jig (${notOnJig.length}): ${notOnJig.join(', ')}`)
  if (noMain.length) console.log(`no ${REF} (${noMain.length}): ${noMain.join(', ')}`)

  for (const r of onJig.filter((r) => !r.clean)) {
    exit = 1
    console.log(`\n── ${r.name} ──\n${r.report}`)
  }
  console.log('')
} finally {
  for (const d of scratch) rmSync(d, { recursive: true, force: true })
}
process.exit(exit)
