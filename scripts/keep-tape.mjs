#!/usr/bin/env node
// SessionEnd transcript capture. Copies the ending session's `.jsonl` to `~/.claude/tape/`.
//
// WHY THIS EXISTS: Claude Code deletes transcripts on a rolling window. A session you want to read
// in three months is gone, and the loss is silent — you find out by going to look.
//
// WHAT IT IS NOT. Seeds had a `tape-capture` hook feeding `~/.claude/tape-queue/`, which fed
// `read-the-tape` (~$2 a session) and `@workout` (20k characters nobody read). All three are
// retired and `settings-policy.mjs` reports any machine still wired to them. This is the copy
// without the reader: no model call, no network, no index, no queue, nothing drains it. A human
// opens one of these in a chat session occasionally. That is the entire feature.
//
// THE DESIGN TURNS ON ONE DOCUMENTED FIELD. `transcript_path` is a common field on every hook
// payload — "Path to conversation JSON" — so the hook is handed its own transcript. It never
// searches. Every wrong version of this script picks "the newest `.jsonl`" or assumes one live
// session, and both are wrong the moment two sessions run at once, which is the normal case here
// (two lanes in linked worktrees). Nothing below globs, sorts by mtime, or reads a "latest" marker.
//
// It also cannot break a session end, and not because of the error handling below: "Exit codes and
// output do not affect anything. SessionEnd hooks cannot block or delay session end." The trapping
// is so a crash doesn't write a stack trace across the operator's terminal, and so a skip says why
// — a silent no-op and a successful copy are indistinguishable from outside.
//
// Install per machine, by hand, in `~/.claude/settings.json` — user level, so no workspace-trust
// prompt and nothing committed. There is no sync; `settings-policy.mjs` reports it missing.
//
//   "hooks": {
//     "SessionEnd": [
//       { "hooks": [{ "type": "command", "command": "node /path/to/jig/scripts/keep-tape.mjs" }] }
//     ]
//   }
//
// No `matcher`, deliberately: every `reason` fires (`clear`, `resume`, `logout`,
// `prompt_input_exit`, `other`). A session ending via `clear` still had a transcript worth keeping,
// and a repeat costs one `cp` because the copy is idempotent.

import { copyFileSync, existsSync, mkdirSync, readFileSync, renameSync, rmSync, statSync } from 'node:fs'
import { appendFileSync } from 'node:fs'
import { basename, join } from 'node:path'
import { homedir } from 'node:os'

export const TAPE_DIR = join(homedir(), '.claude', 'tape')

/**
 * A declared name must be a plain filename. Its contents come from `/its-dead` following prose
 * instructions, and they become a path — `../../../etc/cron.d/x` would put a copy wherever it
 * liked. Refused rather than sanitised: a stem that needed cleaning up is not a stem anyone chose,
 * and falling back to the uuid still keeps the tape, which is the thing that matters.
 *
 * THE CHARACTER CLASS IS WHAT CLOSES TRAVERSAL, not the `..` check beside it. `PLAIN` admits no
 * `/` and no `\`, so nothing matching it can address anything outside `tapeDir` however many dots
 * it contains. The `..` check is belt-and-braces against a future edit that relaxes the class —
 * which is the edit to be careful about, because removing a separator from the class is the change
 * that silently reopens this while the `..` line sits above it looking like the guard.
 */
const PLAIN = /^[A-Za-z0-9][A-Za-z0-9._-]*$/
const isPlainName = (s) => PLAIN.test(s) && !s.includes('..')

/**
 * Copy the transcript a SessionEnd payload names.
 *
 * `tapeDir` is a parameter rather than a constant because the tests must not write to the
 * operator's real tape — one of them deliberately corrupts a name file, and a test that wrote
 * there would be indistinguishable from the hook having run.
 *
 * @param {unknown} payload parsed SessionEnd hook input
 * @returns {{status:'copied'|'skipped', target?:string, bytes?:number, reason?:string, note?:string}}
 */
export function keep(payload, { tapeDir = TAPE_DIR } = {}) {
  if (!payload || typeof payload !== 'object') return { status: 'skipped', reason: 'payload is not an object' }

  const { hook_event_name: event, transcript_path: src } = payload
  if (event !== 'SessionEnd') return { status: 'skipped', reason: `hook_event_name is ${event ?? 'absent'}, not SessionEnd` }
  if (typeof src !== 'string' || !src) return { status: 'skipped', reason: 'no transcript_path in the payload' }
  if (!existsSync(src)) return { status: 'skipped', reason: `transcript_path is not on disk: ${src}` }

  const uuid = basename(src, '.jsonl')
  let stem = uuid
  let note

  /**
   * The name file is keyed by uuid, which is what makes two lanes ending at the same instant a
   * non-event: each looks up its own key and neither can read the other's.
   */
  const nameFile = join(tapeDir, '.names', uuid)
  let declared
  if (existsSync(nameFile)) {
    declared = readFileSync(nameFile, 'utf8').trim()
    if (isPlainName(declared)) stem = declared
    else note = `declared name ${JSON.stringify(declared)} is not a plain filename — used the uuid`
  }

  const target = join(tapeDir, `${stem}.jsonl`)

  /**
   * A `.jsonl` is append-only, so a later copy is a superset and overwriting is the point. The one
   * direction that is wrong is replacing a LARGER capture with a shorter source: the likely cause
   * is Claude Code having already truncated or rotated the live file, and copying it over a
   * complete capture destroys exactly what this hook exists to preserve.
   */
  if (existsSync(target)) {
    const have = statSync(target).size
    const incoming = statSync(src).size
    if (have > incoming) {
      return { status: 'skipped', reason: `${target} is larger (${have} > ${incoming} bytes) — kept the existing capture`, note }
    }
  }

  /**
   * COPY ASIDE, THEN RENAME. `copyFileSync` onto an existing target truncates it first, so a copy
   * that dies partway — disk full, the process killed at session end, an I/O error — leaves the
   * destination short or empty. On a session whose earlier capture was complete, that destroys the
   * thing this hook exists to preserve, in exactly the interrupted-write case the size guard above
   * is already watching for. And the `catch` would report `skipped`, which reads as "nothing
   * happened" while the good copy is already gone.
   *
   * `renameSync` within the same directory is atomic, so the target is either the old capture or
   * the new one and never a truncated half. A failed copy leaves a `.part-` file behind, which is
   * visible and harmless; the next run overwrites it.
   */
  const part = join(tapeDir, `.part-${stem}-${process.pid}`)
  try {
    mkdirSync(tapeDir, { recursive: true })
    copyFileSync(src, part)
    renameSync(part, target)
  } catch (e) {
    try {
      rmSync(part, { force: true })
    } catch {
      // Leaving a `.part-` file is the lesser problem; it is not worth masking the real error.
    }
    return { status: 'skipped', reason: `copy failed: ${e.message}`, note }
  }

  // Only after the copy landed. A name consumed on a failed copy would silently become a uuid
  // filename on the retry, which reads as "/its-dead never ran" and is a different bug to chase.
  if (declared !== undefined) rmSync(nameFile, { force: true })

  return { status: 'copied', target, bytes: statSync(target).size, note }
}

if (process.argv[1]?.endsWith('keep-tape.mjs')) {
  // Always exit 0, always one line. `reason` and `note` are the only record that anything happened,
  // because nothing reads the tape and nobody watches a session end.
  let line
  try {
    const raw = readFileSync(0, 'utf8')
    const r = keep(JSON.parse(raw))
    line = r.status === 'copied' ? `copied ${r.target} (${r.bytes} bytes)` : `skipped — ${r.reason}`
    if (r.note) line += ` [${r.note}]`
  } catch (e) {
    line = `skipped — could not read or parse stdin: ${e.message}`
  }
  try {
    mkdirSync(TAPE_DIR, { recursive: true })
    appendFileSync(join(TAPE_DIR, 'keep-tape.log'), `${new Date().toISOString()} ${line}\n`)
  } catch {
    // Nowhere to log is not worth a stack trace at session end.
  }
  process.exit(0)
}
