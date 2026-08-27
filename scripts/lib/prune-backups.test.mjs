// The only code in this repo that deletes. Every case here is a file it must NOT remove.

import { describe, expect, it } from 'vitest'
import { existsSync, mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { BACKUP_STAMP, pruneBackups } from './prune-backups.mjs'

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
    const left = readdirSync(dir).filter((f) => BACKUP_STAMP.test(f)).sort()
    expect(left).toHaveLength(5)
    expect(left[0]).toContain('2026-08-04')
    expect(left[4]).toContain('2026-08-08')
  })

  it('does nothing when there are fewer than N', () => {
    const { dir, target } = scene(3)
    expect(pruneBackups(target, 5)).toEqual([])
    expect(readdirSync(dir).filter((f) => BACKUP_STAMP.test(f))).toHaveLength(3)
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
    expect(readdirSync(dir).filter((f) => BACKUP_STAMP.test(f))).toHaveLength(5)
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
})
