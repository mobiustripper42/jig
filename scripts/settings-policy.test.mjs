// Tests for the hook half of the permission-policy check.
//
// THIS FILE COULD NOT EXIST BEFORE. `settings-policy.mjs` ran its whole body at module load and
// ended in `process.exit()`, so importing it from a test killed the runner — which is why it was
// the one script here with no suite while every gate beside it had one. Guarding the main body
// (the same guard `check-docs.mjs` and `check-decisions.mjs` already carry) is what made it
// testable, and this suite is the reason to bother.
//
// Only `hookProblems` is covered. The permission comparison and `--write` are not: `--write`
// rewrites the file carrying every hook this machine has, and a test that exercised it would need
// to either touch the operator's real settings or mock the filesystem deeply enough that it stopped
// testing the thing. The hook checks take their paths as arguments precisely so they don't need it.

import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { hookProblems } from './settings-policy.mjs'

const KEEP_TAPE = '/home/eric/jig/scripts/keep-tape.mjs'
/** A settings doc with one SessionEnd command hook. */
const wired = (command) => ({ hooks: { SessionEnd: [{ hooks: [{ type: 'command', command }] }] } })
/** Somewhere no tape-queue exists, so the retired-queue check is a guaranteed no-op. */
const noQueue = () => ({ tapeQueue: join(mkdtempSync(join(tmpdir(), 'sp-')), 'tape-queue') })

describe('the capture hook this machine is supposed to have', () => {
  /**
   * THE POINT OF THE CHECK. The hook is installed by hand, per machine, with no sync — so its
   * failure mode is a machine where it was never installed or got clobbered, and nobody finds out
   * until they go looking for a tape that is not there. That is the same silence the tape exists to
   * end, which is why "installed by hand" is not allowed to mean "remembered".
   *
   * Not hypothetical: this file's own header records a settings merge that "killed the SessionEnd
   * capture hook on mill-dev for four" sessions.
   */
  it('is reported absent when no SessionEnd hook mentions it', () => {
    const out = hookProblems({}, noQueue())
    expect(out.join('\n')).toMatch(/keep-tape/)
    expect(out.join('\n')).toMatch(/not installed/)
  })

  it('is reported absent when SessionEnd is wired to something else entirely', () => {
    const out = hookProblems(wired('/usr/local/bin/notify-me'), noQueue())
    expect(out.join('\n')).toMatch(/not installed/)
  })

  it('says nothing when it is installed', () => {
    expect(hookProblems(wired(`node ${KEEP_TAPE}`), noQueue())).toEqual([])
  })

  /**
   * The command is matched on the script name, not on an absolute path, and that is deliberate
   * rather than lazy. The header explains why `hooks` is excluded from the managed machine keys:
   * the command embeds a home directory that differs per machine — `/home/eric/…` here,
   * `/home/estoffer/…` on bee-grace. A check comparing full paths would report every machine but
   * one as wrong.
   */
  it('is recognised under a different home directory', () => {
    expect(hookProblems(wired('node /home/estoffer/jig/scripts/keep-tape.mjs'), noQueue())).toEqual([])
  })

  /**
   * The match is anchored on the end for this. A bare `includes('keep-tape')` is satisfied by a
   * path that merely mentions the name — a backup, or a stale entry pointing at a checkout that
   * has moved — and a check that silences itself on a path that will never run is worse than no
   * check, because reporting absence is the only thing it does.
   */
  it('is not satisfied by a command that merely mentions the name', () => {
    for (const c of ['node /backups/keep-tape.mjs.old', 'echo keep-tape', 'ls ~/jig/scripts/keep-tape.mjs.bak']) {
      expect(hookProblems(wired(c), noQueue()).join('\n')).toMatch(/not installed/)
    }
  })

  /**
   * The fix line has to be pasteable. A finding that says "install the hook" and makes the operator
   * reconstruct the JSON is the kind of check that gets ignored, and this one fires on a machine
   * that is otherwise entirely correct.
   */
  it('carries the command to install, not just the complaint', () => {
    const out = hookProblems({}, noQueue()).join('\n')
    expect(out).toMatch(/SessionEnd/)
    expect(out).toMatch(/keep-tape\.mjs/)
  })
})

describe('the retired machinery, which must keep being reported', () => {
  /**
   * `keep-tape` evades the retired regex by luck — `tape-capture.mjs` is the obvious name for the
   * new script and would have matched. These two assert the distinction holds in both directions,
   * so a later rename cannot quietly turn the live hook into a reported-dead one or vice versa.
   */
  it('still reports a tape-capture hook', () => {
    const out = hookProblems(wired('/home/eric/seeds/scripts/tape-capture.sh'), noQueue()).join('\n')
    expect(out).toMatch(/retired in jig/)
  })

  it('reports the retired hook AND the missing one when a machine has both problems', () => {
    const out = hookProblems(wired('/home/eric/seeds/scripts/tape-capture.sh'), noQueue()).join('\n')
    expect(out).toMatch(/retired in jig/)
    expect(out).toMatch(/not installed/)
  })

  /**
   * Counts captures rather than directory entries. The original bug reported 6 where there were 4,
   * by counting `index.jsonl` and a `drained/` subdirectory — and that number was then quoted as
   * evidence the queue had grown. Pinned here because the fix is one `.filter()` away from being
   * undone.
   */
  it('counts only transcripts in the retired queue', () => {
    const dir = mkdtempSync(join(tmpdir(), 'sp-q-'))
    const queue = join(dir, 'tape-queue')
    mkdirSync(join(queue, 'drained'), { recursive: true })
    writeFileSync(join(queue, 'index.jsonl'), '{}\n')
    writeFileSync(join(queue, 'a.jsonl'), 'x'.repeat(1000))
    writeFileSync(join(queue, 'b.jsonl'), 'y'.repeat(1000))
    const out = hookProblems(wired(`node ${KEEP_TAPE}`), { tapeQueue: queue }).join('\n')
    expect(out).toMatch(/2 captured transcript\(s\)/)
  })
})
