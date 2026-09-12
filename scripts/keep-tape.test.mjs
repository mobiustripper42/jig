// Tests for the SessionEnd transcript capture.
//
// The whole reason this exists is that Claude Code deletes transcripts on a rolling window, so the
// failure mode is silence: you go looking for a session months later and there is nothing there.
// Every case below is therefore about the copy happening, or about it being SKIPPED LOUDLY rather
// than failing — a hook that throws at session end writes noise to the operator's terminal and
// still loses the tape.
//
// Nothing here touches the real `~/.claude/tape`. Every case passes its own `tapeDir`, which is
// also why `keep()` takes one: a test that wrote to the operator's actual tape directory would be
// indistinguishable from the hook running, and the fourth case deliberately corrupts a name file.

import { afterEach, beforeEach, describe, expect, it } from 'vitest'
import { existsSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { keep } from './keep-tape.mjs'

const UUID = '907444e1-3e5d-5014-89a2-b6693eebb5ae'
const STEM = '2026-09-05-1736-phase-14'

let dir, tape, src

/** A payload shaped like the documented SessionEnd input. Only the fields the hook reads. */
const payload = (over = {}) => ({
  hook_event_name: 'SessionEnd',
  session_id: UUID,
  transcript_path: src,
  cwd: '/home/eric/jig',
  reason: 'other',
  ...over,
})

beforeEach(() => {
  dir = mkdtempSync(join(tmpdir(), 'keep-tape-'))
  tape = join(dir, 'tape')
  src = join(dir, 'projects', `${UUID}.jsonl`)
  mkdirSync(join(dir, 'projects'), { recursive: true })
  writeFileSync(src, '{"type":"user"}\n')
})

afterEach(() => rmSync(dir, { recursive: true, force: true }))

describe('the transcript the payload names', () => {
  /**
   * THIS IS THE CASE THE WHOLE DESIGN TURNS ON. `transcript_path` is a common field on every hook
   * payload — "Path to conversation JSON" — so the hook is HANDED its own transcript and never has
   * to work out which of several is live. Any scheme that globs a directory and takes the newest
   * is wrong under concurrent sessions, and this asserts we are not doing that: the source is read
   * from the payload and nothing else in this file supplies one.
   */
  it('is copied to the tape directory, byte for byte', () => {
    const r = keep(payload(), { tapeDir: tape })
    expect(r.status).toBe('copied')
    expect(readFileSync(r.target, 'utf8')).toBe(readFileSync(src, 'utf8'))
  })

  it('is named by uuid when no name has been declared for it', () => {
    const r = keep(payload(), { tapeDir: tape })
    expect(r.target).toBe(join(tape, `${UUID}.jsonl`))
  })
})

describe('the name /its-dead declares', () => {
  /**
   * `/its-dead` cannot do the copy — it runs BEFORE the session ends, so the transcript is still
   * being appended to and a copy taken there loses every turn after it. But it is the only thing
   * that knows both the session file's stem and, from `$CLAUDE_CODE_SESSION_ID`, the uuid. So it
   * writes the name and the hook honours it later.
   */
  it('becomes the filename', () => {
    mkdirSync(join(tape, '.names'), { recursive: true })
    writeFileSync(join(tape, '.names', UUID), `${STEM}\n`)
    const r = keep(payload(), { tapeDir: tape })
    expect(r.target).toBe(join(tape, `${STEM}.jsonl`))
  })

  it('is consumed, so a later session cannot inherit it', () => {
    mkdirSync(join(tape, '.names'), { recursive: true })
    writeFileSync(join(tape, '.names', UUID), STEM)
    keep(payload(), { tapeDir: tape })
    expect(existsSync(join(tape, '.names', UUID))).toBe(false)
  })

  /**
   * The name file's contents become a PATH, and it is written by a skill following instructions in
   * prose. A stem of `../../../etc/cron.d/x` would put a copy wherever it liked. Rejecting it
   * rather than sanitising it: a stem that needed cleaning up is not a stem anyone chose, and
   * falling back to the uuid still keeps the tape.
   */
  it('is refused when it is not a plain filename, and the uuid is used instead', () => {
    mkdirSync(join(tape, '.names'), { recursive: true })
    writeFileSync(join(tape, '.names', UUID), '../../../etc/passwd')
    const r = keep(payload(), { tapeDir: tape })
    expect(r.target).toBe(join(tape, `${UUID}.jsonl`))
    expect(r.note).toMatch(/not a plain filename/)
  })
})

describe('a hook that must never fail a session end', () => {
  /**
   * The documentation is explicit that this is not load-bearing — "Exit codes and output do not
   * affect anything. SessionEnd hooks cannot block or delay session end." So these cases are not
   * about protecting the session; they are about the hook reporting WHY it did nothing, because a
   * silent no-op and a successful copy look identical from outside and the tape is checked months
   * later, if ever.
   */
  it('skips a payload from a different event', () => {
    const r = keep(payload({ hook_event_name: 'SessionStart' }), { tapeDir: tape })
    expect(r.status).toBe('skipped')
    expect(r.reason).toMatch(/SessionStart/)
    expect(existsSync(tape)).toBe(false)
  })

  it('skips a payload with no transcript_path', () => {
    const r = keep(payload({ transcript_path: undefined }), { tapeDir: tape })
    expect(r.status).toBe('skipped')
    expect(r.reason).toMatch(/transcript_path/)
  })

  it('skips a transcript that is not on disk', () => {
    const r = keep(payload({ transcript_path: join(dir, 'gone.jsonl') }), { tapeDir: tape })
    expect(r.status).toBe('skipped')
    expect(r.reason).toMatch(/not on disk/)
  })

  it('skips a payload that is not an object at all', () => {
    expect(keep(null, { tapeDir: tape }).status).toBe('skipped')
    expect(keep('nonsense', { tapeDir: tape }).status).toBe('skipped')
  })
})

describe('running twice', () => {
  /**
   * A `.jsonl` is append-only, so a later copy is always a superset of an earlier one and
   * overwriting is not just safe but the point. What must never happen is a second FILE — a
   * `-1` suffix, or the uuid name sitting beside the stem name for one session.
   */
  it('overwrites in place rather than making a second file', () => {
    keep(payload(), { tapeDir: tape })
    writeFileSync(src, '{"type":"user"}\n{"type":"assistant"}\n')
    const r = keep(payload(), { tapeDir: tape })
    expect(r.status).toBe('copied')
    expect(readFileSync(r.target, 'utf8')).toBe(readFileSync(src, 'utf8'))
  })

  /**
   * The one case where overwriting is wrong. If the target is LARGER than the source, the source
   * is not a superset — the most likely cause is Claude Code having already truncated or rotated
   * the live transcript, and copying it over a complete capture would destroy the thing this hook
   * exists to preserve. Refusing is the only safe direction.
   */
  it('refuses to replace a larger capture with a shorter source', () => {
    writeFileSync(src, '{"a":1}\n{"b":2}\n{"c":3}\n')
    const first = keep(payload(), { tapeDir: tape })
    const before = statSync(first.target).size
    writeFileSync(src, '{"a":1}\n')
    const r = keep(payload(), { tapeDir: tape })
    expect(r.status).toBe('skipped')
    expect(r.reason).toMatch(/larger/)
    expect(statSync(first.target).size).toBe(before)
  })
})

describe('a copy that fails', () => {
  /**
   * THE ONE PATH BY WHICH THIS HOOK COULD DESTROY WHAT IT EXISTS TO PRESERVE, and the reason the
   * copy goes to a `.part-` file and is renamed into place.
   *
   * `copyFileSync` onto an existing target truncates it first. A copy that dies partway — disk
   * full, the process killed at session end, an I/O error — would leave a complete earlier capture
   * short or empty, and the `catch` would report `skipped`, which reads as "nothing happened".
   * `renameSync` in the same directory is atomic, so the target is the old capture or the new one
   * and never a truncated half.
   *
   * A directory as the source is the cheapest way to make `copyFileSync` throw after the guards
   * have passed: it exists, so the `not on disk` check lets it through, and EISDIR lands inside
   * the try.
   */
  it('leaves the existing capture whole', () => {
    const good = keep(payload(), { tapeDir: tape })
    const before = readFileSync(good.target, 'utf8')

    const asDir = join(dir, 'projects', `${UUID}-dir`)
    mkdirSync(asDir)
    const r = keep(payload({ transcript_path: asDir }), { tapeDir: tape })

    expect(r.status).toBe('skipped')
    expect(r.reason).toMatch(/copy failed/)
    expect(readFileSync(good.target, 'utf8')).toBe(before)
  })

  it('leaves no part file behind on success', () => {
    keep(payload(), { tapeDir: tape })
    expect(readdirSync(tape).filter((f) => f.startsWith('.part-'))).toEqual([])
  })
})

describe('two sessions ending at once', () => {
  /**
   * The operator runs two lanes in linked worktrees. Keyed by uuid end to end, so this is not a
   * race the hook has to arbitrate — but it is worth an assertion, because every WRONG design here
   * (newest file, one live session, a single `latest.jsonl`) passes every other test in this file
   * and fails this one.
   */
  it('write two files and neither clobbers the other', () => {
    const otherUuid = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee'
    const other = join(dir, 'projects', `${otherUuid}.jsonl`)
    writeFileSync(other, '{"lane":"b"}\n')
    const a = keep(payload(), { tapeDir: tape })
    const b = keep(payload({ transcript_path: other, session_id: otherUuid }), { tapeDir: tape })
    expect(a.target).not.toBe(b.target)
    expect(readFileSync(a.target, 'utf8')).toBe('{"type":"user"}\n')
    expect(readFileSync(b.target, 'utf8')).toBe('{"lane":"b"}\n')
  })
})
