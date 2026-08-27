// Bounding the timestamped backups `settings-policy.mjs --write` leaves beside a settings file.
//
// Its own module because it is the only code in this repo that DELETES, and a function that
// deletes needs a test — which it could not have while it lived inside a script that runs its
// whole check at import time.

import { readdirSync, unlinkSync } from 'node:fs'
import { basename, join, resolve } from 'node:path'

/** How many timestamped backups to keep beside a written settings file. */
export const KEEP_BACKUPS = 5

/**
 * The shape `--write` produces: `<name>.2026-08-27T16-20-46-192Z.bak`.
 *
 * MATCHING THE TIMESTAMP RATHER THAN `*.bak` IS THE SAFETY PROPERTY. The first version matched
 * any `<name>.*.bak`, and the sort-order argument below quietly assumed every match was one this
 * function had written. A hand-made `settings.json.pre-jig-hook-removal.bak` sorts after every
 * `2026-…` name, so it read as the newest and would have held a keep-slot while a real backup was
 * deleted to make room for it. Deleting the wrong file is the one outcome this cannot afford.
 */
export const BACKUP_STAMP = /\.\d{4}-\d{2}-\d{2}T[\d-]+Z\.bak$/

/**
 * Delete all but the newest `keep` backups of one settings file.
 *
 * Sorted by NAME, not mtime, which is safe only because the names are ISO-8601 with fixed width:
 * lexicographic order is chronological order. Sorting by mtime would be the obvious choice and is
 * the wrong one — copying a backup, or restoring one to inspect it, rewrites its mtime and would
 * make the oldest content look newest and survive the prune.
 *
 * @returns {string[]} the paths deleted, so a caller can report them
 */
export function pruneBackups(path, keep = KEEP_BACKUPS) {
  const dir = resolve(path, '..')
  const prefix = `${basename(path)}.`
  const backups = readdirSync(dir)
    .filter((f) => f.startsWith(prefix) && BACKUP_STAMP.test(f))
    .sort()
  const doomed = backups.slice(0, -keep)
  for (const f of doomed) unlinkSync(join(dir, f))
  return doomed.map((f) => join(dir, f))
}
