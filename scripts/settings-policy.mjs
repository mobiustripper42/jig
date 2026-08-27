#!/usr/bin/env node
/**
 * settings-policy.mjs — is this machine's (or this repo's) permission policy current,
 * and repair it without destroying everything else in the file.
 *
 * DEC-S023 makes jig's `.claude/settings.json` the master permission policy and distributes it
 * BY HAND, per machine and per repo. Nothing tracked what had actually been distributed. The
 * measured state on 2026-08-22: four generations live across seventeen checkouts, seven of them
 * on a policy with no secret denies at all, four with no file.
 *
 * DEC-S044 concluded that the user settings file "is not in any checkout, so nothing enumerates
 * it and nothing ever will." That is true of machines you are NOT on, and false of the one you
 * are sitting at — which is the only one you can fix anyway. This reads it directly.
 *
 * WHY --write EXISTS, AND WHY IT IS NOT `cp`. The master has exactly one top-level key,
 * `permissions`. A real user settings file has more — on mill-dev: hooks, enabledPlugins,
 * effortLevel, tui, theme, agentPushNotifEnabled. Copying the master over it destroys six of
 * seven. That is not hypothetical: it killed the SessionEnd capture hook on mill-dev for four
 * days, along with the theme and the effort level, and was recovered from a stray backup file.
 * `--write` replaces the `permissions` key and touches nothing else.
 *
 * THE COMPARISON IS STRICT, AND THAT IS A CHOICE. `permissions` must deep-equal the master's.
 * A tolerant check cannot tell a deliberate local addition from a stale entry nobody cleaned up,
 * which is the entire problem this script exists for. Per-project exceptions belong at
 * `.claude/settings.local.json` (level 3, gitignored, highest of the levels you control).
 * There is no user-level local file — the documented levels are managed > command line >
 * project local > shared project > user.
 *
 * Read-only unless --write is passed. Never edits the master.
 *
 * Usage:
 *   node settings-policy.mjs                      # check ~/.claude/settings.json
 *   node settings-policy.mjs --repo [path]        # check <repo>/.claude/settings.json
 *   node settings-policy.mjs --all [path]         # check both, for one repo
 *   node settings-policy.mjs --write [target]     # merge the policy into a target
 *   node settings-policy.mjs --jig /path/to/jig ...
 *
 * Exit: 0 = current; 1 = stale, absent or unreadable; 2 = usage error.
 */

import { readFileSync, writeFileSync, existsSync, copyFileSync, statSync, readdirSync, unlinkSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'
import { homedir } from 'node:os'
import { fileURLToPath } from 'node:url'
import { pruneBackups } from './lib/prune-backups.mjs'

const die = (msg) => {
  console.error(`settings-policy: ${msg}`)
  process.exit(2)
}

const argv = process.argv.slice(2)
let jigArg = null
let mode = 'user'
let writeTarget = null
const positional = []

/**
 * Mode flags are mutually exclusive and `--write` REQUIRES an adjacent target. Both rules exist
 * because the first version had neither, and a review demonstrated the consequence on a real
 * machine rather than in the abstract:
 *
 *   `--write --jig /path`, `--all --write`, `<path> --write`  → wrote ~/.claude/settings.json
 *   `--write --repo /path`                                      → silently ran a CHECK instead
 *
 * The first shape is the bad one: the single file this script exists to protect is the one a
 * misordered flag reaches. A default target is a convenience worth exactly nothing here — the
 * check's own output prints the full `Fix:` command with the path already in it.
 */
let modeFlag = null
const setMode = (m, flag) => {
  if (modeFlag && modeFlag !== flag) die(`${modeFlag} and ${flag} cannot be combined — pick one`)
  modeFlag = flag
  mode = m
}

for (let i = 0; i < argv.length; i++) {
  const a = argv[i]
  if (a === '--jig') jigArg = argv[++i] ?? die('--jig needs a path')
  else if (a === '--repo') setMode('repo', '--repo')
  else if (a === '--all') setMode('all', '--all')
  else if (a === '--write') {
    setMode('write', '--write')
    const next = argv[i + 1]
    if (!next || next.startsWith('--')) die('--write needs a target path immediately after it, e.g. --write ~/.claude/settings.json')
    writeTarget = argv[++i]
  } else if (a.startsWith('--')) die(`unknown flag ${a}`)
  else positional.push(a)
}

/**
 * A bare path with no mode flag is a usage error, not a default.
 *
 * Without this, `settings-policy.mjs /some/repo/.claude/settings.json` left `mode` at `user`,
 * silently ignored the path, and checked `~/.claude/settings.json` instead — printing a
 * perfectly normal `current`/`STALE`/`ABSENT` line for the wrong target. An observed session
 * swept eleven sibling repos that way, twice, and got eleven plausible answers about a file it
 * never looked at. Nothing in the output could have said so: the script's only failure signal is
 * the verdict itself, and the verdict was real, just about `~/.claude/settings.json`.
 *
 * The second check catches the shape that actually happened — a path to the settings *file* where
 * a repo *root* was expected. `resolve()` accepts it happily and `join(x, '.claude/settings.json')`
 * then points at a path that cannot exist, which reads as ABSENT rather than as a mistake.
 */
if (positional.length && !modeFlag) {
  die(`a path argument needs a mode flag — did you mean "--repo ${positional[0]}" or "--all ${positional[0]}"?`)
}
if (positional.length > 1) die(`expected at most one path, got ${positional.length}`)
if (positional.length && (!existsSync(positional[0]) || !statSync(positional[0]).isDirectory())) {
  die(`${positional[0]} is not a directory. This argument is a repo ROOT; the script appends .claude/settings.json itself`)
}

/**
 * The master is found relative to THIS FILE, not the working directory. The script is run from
 * whatever repo you happen to be in — that is the point — so cwd says nothing about where jig
 * is. `--jig` and the sibling/env fallbacks exist for the case where the script has been copied
 * somewhere else, which it should not be: it is jig-only.
 *
 * `here` climbs TWO levels, not four. Under seeds this file sat at `dev/claude/scripts/`, three
 * deep; under DEC-J001 it sits at `scripts/`, one deep. A stale climb count does not throw — it
 * resolves to some ancestor directory that simply has no `.claude/settings.json`, so the loop
 * falls through to the sibling guess and the failure surfaces as "cannot find jig" from a
 * checkout that is right there.
 *
 * The sentinel is `jig-version` beside the settings file. `.claude/settings.json` alone is not
 * one — every project installed from jig has that path, so a lone check matches the first repo
 * it is run inside and reports that repo's own policy as the master.
 */
function findJig() {
  const here = resolve(fileURLToPath(import.meta.url), '..', '..')
  for (const c of [jigArg, here, join(process.cwd(), '..', 'jig'), process.env.JIG_REPO]) {
    if (c && existsSync(join(c, 'jig-version')) && existsSync(join(c, '.claude', 'settings.json'))) return resolve(c)
  }
  die('cannot find jig. Pass it: --jig /path/to/jig')
}

const JIG = findJig()
const MASTER = join(JIG, '.claude', 'settings.json')
const USER_SETTINGS = join(homedir(), '.claude', 'settings.json')
const repoRoot = resolve(positional[0] ?? process.cwd())
const REPO_SETTINGS = join(repoRoot, '.claude', 'settings.json')

const readJson = (p) => {
  try {
    return { ok: true, value: JSON.parse(readFileSync(p, 'utf8')) }
  } catch (e) {
    return { ok: false, error: e.message }
  }
}

const master = readJson(MASTER)
if (!master.ok) die(`cannot read the master policy at ${MASTER} — ${master.error}`)
const masterPerms = master.value.permissions ?? die(`${MASTER} has no "permissions" key`)

/**
 * Stable, order-insensitive comparison. A reordered deny list is not a policy change — and
 * neither is a duplicated entry, so arrays are deduped too. Without the dedupe, a file with a
 * repeated rule reported STALE while `describe()` (Set-based) had nothing to name, printing a
 * failure with a blank explanation.
 */
const canon = (v) =>
  Array.isArray(v)
    ? [...new Set(v)].sort()
    : v && typeof v === 'object'
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, canon(v[k])]))
      : v

const same = (a, b) => JSON.stringify(canon(a)) === JSON.stringify(canon(b))

/**
 * What differs, in the terms a person fixing it needs: which rules are missing here, which are
 * here and not in the master, and which scalar settings disagree. "3 entries differ" sends you
 * to a diff; naming them means you can decide without one.
 */
function describe(theirs) {
  const lines = []
  for (const key of ['allow', 'deny']) {
    const m = new Set(masterPerms[key] ?? [])
    const t = new Set(theirs[key] ?? [])
    const missing = [...m].filter((x) => !t.has(x))
    const extra = [...t].filter((x) => !m.has(x))
    if (missing.length) lines.push(`      missing ${missing.length} ${key}: ${missing.slice(0, 4).join(', ')}${missing.length > 4 ? ` … +${missing.length - 4}` : ''}`)
    if (extra.length) lines.push(`      extra ${extra.length} ${key}: ${extra.slice(0, 4).join(', ')}${extra.length > 4 ? ` … +${extra.length - 4}` : ''}`)
    const dupes = (theirs[key] ?? []).filter((x, i, a) => a.indexOf(x) !== i)
    if (dupes.length) lines.push(`      note: ${dupes.length} duplicate ${key} entr${dupes.length === 1 ? 'y' : 'ies'} — harmless, not why this is stale`)
  }
  const keys = new Set([...Object.keys(masterPerms), ...Object.keys(theirs)])
  for (const k of keys) {
    if (k === 'allow' || k === 'deny') continue
    if (!same(masterPerms[k], theirs[k])) lines.push(`      ${k}: ${JSON.stringify(theirs[k])} — master has ${JSON.stringify(masterPerms[k])}`)
  }
  return lines
}

/**
 * Keys the master owns at the USER level, and nowhere else.
 *
 * These are machine preferences, not repo ones: one edit covers every checkout on the box and a
 * new clone inherits it. They are checked at the user level only, which also means a deliberate
 * per-repo override in `.claude/settings.local.json` is correctly invisible rather than reported
 * as drift.
 *
 * **Why all of them and not just `outputStyle`.** The first version managed `outputStyle` alone and
 * called the rest taste, on the argument that two machines *could* legitimately differ. The
 * operator's answer: they could, and they don't — and the cost of letting them is not theoretical.
 * `tui: "fullscreen"` was set here and unset on bee-grace, which changes how the terminal hands off
 * mouse events, which is why text selection behaved differently on one machine and cost most of an
 * afternoon to chase. A difference nobody chose is not a preference, it is drift wearing a
 * preference's clothes.
 *
 * `hooks` is the one key that stays out, and not by taste: the capture hook's `command` is an
 * absolute path and the home directory differs per machine (`/home/eric/…` here,
 * `/home/estoffer/…` on bee-grace — both confirmed on disk). It cannot be one shared value, so it
 * is derived instead. See `hookProblems`.
 */
const MACHINE_KEYS = ['outputStyle', 'theme', 'effortLevel', 'tui', 'agentPushNotifEnabled', 'enabledPlugins']
function machineKeyProblems(doc) {
  return MACHINE_KEYS.filter((k) => master.value[k] !== undefined)
    .filter((k) => !same(doc[k], master.value[k]))
    .map((k) =>
      doc[k] === undefined
        ? `      ${k}: not set — master expects ${JSON.stringify(master.value[k])}`
        : `      ${k}: ${JSON.stringify(doc[k])} — master expects ${JSON.stringify(master.value[k])}`
    )
}

/**
 * Retired machinery still wired into this machine, checked at the USER level only.
 *
 * THE POLARITY IS INVERTED FROM SEEDS, and that is the whole change. Seeds checked that the
 * `SessionEnd` capture hook was present, correct and executable (DEC-S045). jig does not carry
 * the tape: `read-the-tape` cost ~$2 a session and produced little anyone could use, `@workout`
 * emitted 20k characters nobody read, and both are binned. So the hook has nothing to feed, and
 * every session it fires copies a transcript onto a queue no skill will ever drain.
 *
 * Left alone this is invisible. Uninstalling seeds does not uninstall its hooks — they live in
 * `~/.claude/settings.json`, per machine, and survive deleting the repo that installed them. The
 * queue had already grown by four sessions on 2026-08-27, after being drained, with nothing
 * reporting it. That is the shape of failure this whole script exists for: a machine quietly
 * running rules its source of truth no longer holds.
 *
 * The dev-handle check went with it — multi-dev support is not carried (one developer, no second
 * one coming), so `~/.claude/devname` is not expected to exist and its absence is not a finding.
 *
 * Reported, never repaired. Removing a hook edits the file that carries every hook this machine
 * has, and `--write` touches `permissions` plus the machine keys by design. Deleting entries out
 * of `hooks` is a different and more dangerous operation, done by hand, once.
 */
function hookProblems(doc) {
  const out = []
  const retired = /tape-capture|read-the-tape|workout/

  const commands = (doc.hooks?.SessionEnd ?? [])
    .flatMap((e) => e.hooks ?? [])
    .filter((h) => h.type === 'command')
    .map((h) => h.command)

  for (const c of commands.filter((c) => retired.test(c))) {
    out.push(`      SessionEnd hook: still wired to ${c} — retired in jig, and it queues a transcript every session`)
  }

  /**
   * Reported separately from the wiring: the queue outlives the hook. Removing the entry stops it
   * growing and leaves whatever already accumulated sitting on disk unread.
   *
   * COUNTS CAPTURES, NOT DIRECTORY ENTRIES, and the difference is not cosmetic. The first version
   * used a bare `readdirSync().length`, which counted `index.jsonl` and the `drained/`
   * subdirectory alongside the transcripts and reported 6 where there were 4. That number was
   * then quoted as evidence the queue had grown during a session — a claim about a real thing,
   * inflated by 50%, produced by the check written to make the problem visible. A check nobody
   * can trust the number of is worse than no check, because it gets argued with instead of acted
   * on. Size is reported too: the point is not that files exist, it is that this is megabytes of
   * transcript nothing will ever read.
   */
  const queue = join(homedir(), '.claude', 'tape-queue')
  if (existsSync(queue)) {
    const captures = readdirSync(queue).filter((f) => f.endsWith('.jsonl') && f !== 'index.jsonl')
    if (captures.length) {
      const mb = captures.reduce((n, f) => n + statSync(join(queue, f)).size, 0) / 1e6
      out.push(`      ${queue}: ${captures.length} captured transcript(s), ${mb.toFixed(1)} MB — nothing in jig drains this`)
    }
  }

  if (out.length) out.push(`      Remove by hand, on this machine. Not repaired by --write.`)
  return out
}

/** @returns {'current'|'stale'|'absent'|'unreadable'} */
function check(label, path, { style = false } = {}) {
  if (!existsSync(path)) {
    console.log(`  ABSENT   ${label}`)
    console.log(`           ${path}`)
    console.log(`           No policy here at all — not a stale revision, no seatbelt.`)
    console.log(`           Fix: node ${rel(import.meta.url)} --write ${path}`)
    return 'absent'
  }
  const got = readJson(path)
  if (!got.ok) {
    console.log(`  UNREADABLE ${label} — ${got.error}`)
    console.log(`           ${path}`)
    return 'unreadable'
  }
  const perms = got.value.permissions
  if (!perms) {
    console.log(`  NO POLICY ${label} — the file exists but has no "permissions" key`)
    console.log(`           ${path}`)
    console.log(`           Fix: node ${rel(import.meta.url)} --write ${path}`)
    return 'stale'
  }
  const keyIssues = style ? machineKeyProblems(got.value) : []
  const hookIssues = style ? hookProblems(got.value) : []
  if (same(perms, masterPerms) && !keyIssues.length && !hookIssues.length) {
    console.log(`  current  ${label}`)
    return 'current'
  }
  console.log(`  STALE    ${label}`)
  console.log(`           ${path}`)
  for (const l of describe(perms)) console.log(l)
  for (const l of keyIssues) console.log(l)
  for (const l of hookIssues) console.log(l)
  // Only offer --write when --write can actually fix what was reported. The hook is not one of
  // those things, and a repair command printed under a problem it does not repair is worse than
  // no command: it gets run, it reports success, and the problem is still there.
  if (!same(perms, masterPerms) || keyIssues.length) console.log(`           Fix: node ${rel(import.meta.url)} --write ${path}`)
  return 'stale'
}

const rel = (u) => {
  const p = fileURLToPath(u)
  return p.startsWith(process.cwd()) ? p.slice(process.cwd().length + 1) : p
}

/**
 * Merge, never copy. Every key other than `permissions` is preserved exactly as found, and the
 * previous file is kept alongside as `.bak` — this writes to the file that carries a machine's
 * hooks, and being wrong here is the failure the whole script is named after.
 */
function write(path) {
  // The header says "never edits the master" — say it in code, not just in a comment. Without
  // this, `--jig <other-checkout>` plus a target that happens to be a master rewrites the
  // actual source of truth, silently and in the direction nobody wants.
  if (resolve(path) === resolve(MASTER)) die(`refusing to write: ${path} is the master policy itself`)

  const existed = existsSync(path)
  let doc = {}
  let backup = null
  if (existed) {
    const got = readJson(path)
    if (!got.ok) die(`refusing to write: ${path} is not valid JSON (${got.error}). Fix or move it first.`)
    doc = got.value
    // Timestamped, because a fixed `.bak` name loses the original on the second run — and the
    // incident this script is named after was recovered from exactly such a stray backup.
    backup = `${path}.${new Date().toISOString().replace(/[:.]/g, '-')}.bak`
    copyFileSync(path, backup)
    pruneBackups(path)
  } else {
    const dir = resolve(path, '..')
    if (!existsSync(dir)) die(`refusing to write: ${dir} does not exist. Create it first.`)
  }
  doc.permissions = JSON.parse(JSON.stringify(masterPerms))
  // The machine keys ride along ONLY when repairing the user settings file — they are machine
  // preferences, and writing them into a repo's committed file would put per-repo overrides
  // where none are wanted.
  const isUser = resolve(path) === resolve(USER_SETTINGS)
  const keysWritten = isUser ? MACHINE_KEYS.filter((k) => master.value[k] !== undefined) : []
  for (const k of keysWritten) doc[k] = JSON.parse(JSON.stringify(master.value[k]))
  // Computed AFTER the writes, so a key this run overwrote is never listed as "untouched" —
  // it read as reassurance about the exact key that had just changed.
  const written = ['permissions', ...keysWritten]
  const preserved = Object.keys(doc).filter((k) => !written.includes(k))
  writeFileSync(path, `${JSON.stringify(doc, null, 2)}\n`)
  console.log(`settings-policy: wrote ${written.join(' + ')} into ${path}`)
  console.log(`  ${backup ? `backed up to ${backup}` : 'created (no previous file)'}`)
  console.log(
    preserved.length
      ? `  preserved ${preserved.length} other key(s) untouched: ${preserved.join(', ')}`
      : `  no other keys were present`
  )
  // Re-read rather than assume the write took. Same reason check-mirrors re-runs after --write:
  // "I wrote it" and "the file matches" are different claims.
  const after = readJson(path)
  const keysOk = after.ok === true && keysWritten.every((k) => same(after.value[k], master.value[k]))
  if (!after.ok || !same(after.value.permissions, masterPerms) || !keysOk) {
    console.error(`settings-policy: the file does not match the master after writing. Check ${path}.`)
    process.exit(1)
  }
  console.log(`  verified: ${written.join(' + ')} now match the master`)
  console.log(`  Takes effect at the NEXT session start — settings are read once, at launch.`)
  process.exit(0)
}

console.log(`\nsettings-policy — against ${rel(new URL(`file://${MASTER}`))}`)
console.log(`  master: ${masterPerms.allow?.length ?? 0} allow, ${masterPerms.deny?.length ?? 0} deny, defaultMode ${JSON.stringify(masterPerms.defaultMode)}\n`)

if (mode === 'write') write(resolve(writeTarget ?? USER_SETTINGS)) // exits

const results = []
if (mode === 'user' || mode === 'all') results.push(check('user settings   (this machine, every project)', USER_SETTINGS, { style: true }))
if (mode === 'repo' || mode === 'all') results.push(check('shared project  (committed; travels with the repo)', REPO_SETTINGS))

const bad = results.filter((r) => r !== 'current').length
console.log(
  bad
    ? `\n${bad} of ${results.length} not current. Per-project exceptions belong in .claude/settings.local.json, not here.\n`
    : `\nCurrent.\n`
)
process.exit(bad ? 1 : 0)
