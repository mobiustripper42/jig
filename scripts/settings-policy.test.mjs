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
import { mkdirSync, mkdtempSync, symlinkSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { hookProblems, styleProblems } from './settings-policy.mjs'

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

/**
 * The style file this machine is supposed to be reading through.
 *
 * Same shape of gap as the hook above and the same argument: `~/.claude/output-styles/one-piece.md`
 * is a symlink into a jig checkout, made by hand once per machine, and nothing has ever checked it.
 * A regular file there, or a link to a checkout that has moved, runs something other than jig's copy
 * and the only symptom is a session that does not behave like the style says — which is not a
 * symptom anyone attributes to a symlink.
 */
describe('the output style this machine reads through jig', () => {
  /** A fake jig holding one style, plus a machine styles directory that starts empty. */
  const bench = (name = 'One piece') => {
    const jig = mkdtempSync(join(tmpdir(), 'sp-jig-'))
    mkdirSync(join(jig, '.claude', 'output-styles'), { recursive: true })
    const styleFile = join(jig, '.claude', 'output-styles', 'one-piece.md')
    writeFileSync(styleFile, `---\nname: ${name}\ndescription: x\n---\n\nbody\n`)
    const stylesDir = mkdtempSync(join(tmpdir(), 'sp-styles-'))
    return { jig, styleFile, stylesDir, opts: { jig, stylesDir } }
  }
  const linked = 'one-piece.md'

  it('says nothing when the setting names no style', () => {
    // An unset `outputStyle` has no symptom: nothing is reading the file, so a missing link is a
    // machine that never bootstrapped one rather than a machine running the wrong thing.
    const b = bench()
    expect(styleProblems({}, b.opts)).toEqual([])
  })

  it('says nothing when the setting names a style jig does not ship', () => {
    // The operator's own style is the operator's business. jig only answers for its own.
    const b = bench()
    expect(styleProblems({ outputStyle: 'Explanatory' }, b.opts)).toEqual([])
  })

  it('reports the link missing when the setting names a style jig ships', () => {
    const b = bench()
    const out = styleProblems({ outputStyle: 'One piece' }, b.opts).join('\n')
    expect(out).toMatch(/one-piece\.md/)
    expect(out).toMatch(/ln -sfn/)
  })

  it('reports a regular file, which is a copy that will never follow jig', () => {
    const b = bench()
    writeFileSync(join(b.stylesDir, linked), '---\nname: One piece\n---\n\nan old copy\n')
    const out = styleProblems({ outputStyle: 'One piece' }, b.opts).join('\n')
    expect(out).toMatch(/not a symlink|regular file/)
    expect(out).toMatch(/ln -sfn/)
  })

  it('reports a symlink into some other checkout', () => {
    // The failure that leaves no trace: the link exists, so every "is it there" check passes, and
    // the bytes come from a jig somebody moved or deleted.
    const b = bench()
    const other = bench()
    symlinkSync(other.styleFile, join(b.stylesDir, linked))
    const out = styleProblems({ outputStyle: 'One piece' }, b.opts).join('\n')
    expect(out).toMatch(/one-piece\.md/)
    expect(out).toMatch(other.jig)
  })

  it('reports a link whose target is gone, rather than calling it absent', () => {
    // `existsSync` follows the link, so a dangling one reads as "nothing here" and would be
    // reported as never bootstrapped — the wrong finding, with the wrong fix, on the machine where
    // the right one matters most. This is the case `lstatSync` is here for.
    const b = bench()
    const gone = bench()
    symlinkSync(join(gone.jig, '.claude', 'output-styles', 'vanished.md'), join(b.stylesDir, linked))
    const out = styleProblems({ outputStyle: 'One piece' }, b.opts).join('\n')
    expect(out).toMatch(/which does not exist/)
    expect(out).toMatch(/vanished\.md/)
  })

  it('says nothing when the link points at this checkout', () => {
    const b = bench()
    symlinkSync(b.styleFile, join(b.stylesDir, linked))
    expect(styleProblems({ outputStyle: 'One piece' }, b.opts)).toEqual([])
  })

  it("matches the style's frontmatter name, not a slug of its filename", () => {
    // The setting says `One piece`; the file is `one-piece.md`. Slugifying works for that one style
    // and breaks on the first whose name is not its filename — so the fixture is a file named
    // `one-piece.md` whose frontmatter says `House rules`, with no link made.
    //
    // ASSERTS A FINDING, NOT ITS ABSENCE, and that is the whole point. The first spelling had the
    // style linked correctly and expected `[]` from both spellings of the match — which a slug
    // implementation also returns, by failing to find the file at all. Two ways of producing an
    // empty array are indistinguishable, and a passing test said nothing.
    const b = bench('House rules')
    const out = styleProblems({ outputStyle: 'House rules' }, b.opts).join('\n')
    expect(out).toMatch(/does not exist/)
    expect(out).toMatch(/one-piece\.md/)
  })
})
