// Vitest global setup: one temp directory per test run, deleted when the run ends (issue #79).
//
// One `npm run test` used to leave 295 entries, 113M, in /tmp, and mutation passes multiply that
// by every deliberate break. Cleaning up in each suite is a line every new test has to remember;
// this is the one place that does not have to be remembered.
//
// It works by pointing TMPDIR at the run's directory before any worker starts. `os.tmpdir()` reads
// TMPDIR on every call, workers inherit the main process's environment, and so does every child a
// test spawns: sync.mjs, git, npm. A run killed before teardown leaves this one directory, which the
// machine's own /tmp age-out removes.

import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

export default function setup() {
  const before = process.env.TMPDIR
  const dir = mkdtempSync(join(tmpdir(), 'jig-test-'))
  process.env.TMPDIR = dir
  return () => {
    if (before === undefined) delete process.env.TMPDIR
    else process.env.TMPDIR = before
    rmSync(dir, { recursive: true, force: true })
  }
}
