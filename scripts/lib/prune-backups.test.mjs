// The only code in this repo that deletes. Every case here is a file it must NOT remove.

import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { pruneBackups } from './prune-backups.mjs'

/**
 * The shape a real backup has, written out here rather than imported.
 *
 * THE SUITE USED TO COUNT WITH `BACKUP_STAMP` — the regex under test. Reverting it to the
 * original `*.bak` bug left all seven tests green, while the scenario named "leaves a hand-named
 * backup alone" silently deleted four real backups instead of two: the assertion counted survivors
 * with the broken regex, so it saw five either way. A test that measures with the thing it is
 * testing cannot fail, and this is the only code in the repo that deletes.
 */
const looksLikeBackup = (f) => /^settings\.json\.\d{4}-\d{2}-\d{2}T[\d-]+Z\.bak$/.test(f)

/** A settings file with `n` timestamped backups, oldest first, plus whatever else is named. */
const scene = (n, extras = []) => {
  const dir = mkdtempSync(join(tmpdir(), 'prune-'))
  const target = join(dir, 'settings.json')
  writeFileSync(target, '{}')
  for (let i = 0; i < n; i++) {
    const stamp = `2026-08-${String(i + 1).padStart(2, '0')}T10-00-00-000Z`
    writeFileSync(join(dir, `settings.json.${stamp}.bak`), String(i))
  }
  for (const f of extras) writeFileSync(join(dir, f), 'do not touch')
  return { dir, target }
}

describe('pruneBackups', () => {
  it('keeps the newest N and deletes the rest', () => {
    const { dir, target } = scene(8)
    pruneBackups(target, 5)
    const left = readdirSync(dir).filter((f) => looksLikeBackup(f)).sort()
    expect(left).toHaveLength(5)
    expect(left[0]).toContain('2026-08-04')
    expect(left[4]).toContain('2026-08-08')
  })

  it('does nothing when there are fewer than N', () => {
    const { dir, target } = scene(3)
    expect(pruneBackups(target, 5)).toEqual([])
    expect(readdirSync(dir).filter((f) => looksLikeBackup(f))).toHaveLength(3)
  })

  it('never touches the settings file it is pruning backups of', () => {
    const { target } = scene(9)
    pruneBackups(target, 1)
    expect(existsSync(target)).toBe(true)
  })

  it('leaves a hand-named backup alone, however it sorts', () => {
    // The bug this pins. Matching `*.bak` let `settings.json.pre-jig-hook-removal.bak` — created
    // by a person, in the same session — sort after every `2026-…` name and read as the newest,
    // so it held a keep-slot while a real backup was deleted to make room for it.
    const hand = 'settings.json.pre-jig-hook-removal.bak'
    const { dir, target } = scene(7, [hand, 'settings.json.backup', 'settings.json.aaa.bak'])
    pruneBackups(target, 5)
    expect(existsSync(join(dir, hand))).toBe(true)
    expect(existsSync(join(dir, 'settings.json.backup'))).toBe(true)
    expect(existsSync(join(dir, 'settings.json.aaa.bak'))).toBe(true)
    // and it still pruned the two oldest real ones
    expect(readdirSync(dir).filter((f) => looksLikeBackup(f))).toHaveLength(5)
  })

  it('leaves another file\'s backups alone', () => {
    const { dir, target } = scene(7, ['other.json.2026-08-01T10-00-00-000Z.bak'])
    pruneBackups(target, 5)
    expect(existsSync(join(dir, 'other.json.2026-08-01T10-00-00-000Z.bak'))).toBe(true)
  })

  it('returns what it deleted, so a caller can say so', () => {
    const { target } = scene(7)
    const gone = pruneBackups(target, 5)
    expect(gone).toHaveLength(2)
    expect(gone[0]).toContain('2026-08-01')
  })

  it('orders by name, because mtime lies after a restore', () => {
    // Copying a backup, or restoring one to look at it, rewrites its mtime. Sorting by mtime
    // would make the oldest CONTENT look newest and survive. ISO-8601 is fixed-width, so
    // lexicographic order is chronological order.
    const { dir, target } = scene(6)
    const oldest = join(dir, 'settings.json.2026-08-01T10-00-00-000Z.bak')
    writeFileSync(oldest, 'touched just now') // newest mtime, oldest name
    pruneBackups(target, 5)
    expect(existsSync(oldest)).toBe(false)
  })

  it('keeps the NEWEST, not just any five', () => {
    // The newest is created FIRST, so creation order and name order disagree. Without that, a
    // no-op sort passes: `readdirSync` tends to hand back creation order, which is already
    // chronological, and deleting "the first three" happens to be right by accident.
    const dir = mkdtempSync(join(tmpdir(), 'prune-'))
    const target = join(dir, 'settings.json')
    writeFileSync(target, '{}')
    const day = (n) => `settings.json.2026-08-${String(n).padStart(2, '0')}T10-00-00-000Z.bak`
    for (const n of [8, 1, 2, 3, 4, 5, 6, 7]) writeFileSync(join(dir, day(n)), String(n))
    pruneBackups(target, 5)
    const left = readdirSync(dir).filter(looksLikeBackup).sort()
    expect(left.map((f) => f.match(/2026-08-(\d\d)/)[1])).toEqual(['04', '05', '06', '07', '08'])
  })

  it('is anchored on the full name — a file merely containing ".bak" is not a backup', () => {
    // Loosening the pattern to /bak/ or dropping the trailing dot from the prefix both left the
    // old suite green.
    // `settings.jsonOTHER.<stamp>.bak` is the one that matters: it starts with the target's
    // basename but not with `basename + "."`, so dropping the trailing dot from the prefix
    // silently pulls another file's backups into this file's keep-window.
    const decoys = [
      'settings.jsonXbackup.txt',
      'notes-bak-2026.md',
      'settings.json.bak',
      'settings.jsonOTHER.2026-08-01T10-00-00-000Z.bak',
      'settings.jsonOTHER.2026-08-02T10-00-00-000Z.bak',
      'settings.jsonOTHER.2026-08-03T10-00-00-000Z.bak',
    ]
    const { dir, target } = scene(7, decoys)
    pruneBackups(target, 5)
    for (const f of decoys) {
      expect(existsSync(join(dir, f)), f).toBe(true)
    }
  })
})
