// The run-wide temp directory (issue #79). Each case runs a real vitest against the real config,
// because the claim is about what a run leaves behind, and only a run can leave something behind.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, readdirSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, join } from 'node:path'
import { spawnSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const ROOT = fileURLToPath(new URL('..', import.meta.url))
const CONFIG = join(ROOT, 'vitest.config.mjs')
const VITEST = join(ROOT, 'node_modules', '.bin', 'vitest')

/** Run vitest with `TMPDIR` pointed at a fresh empty directory; return that directory and the exit. */
const runIn = (args, cwd = ROOT) => {
  const empty = mkdtempSync(join(tmpdir(), 'empty-'))
  const r = spawnSync(VITEST, ['run', '--config', CONFIG, ...args], {
    cwd,
    env: { ...process.env, TMPDIR: empty },
    encoding: 'utf8',
  })
  return { empty, status: r.status, out: r.stdout + r.stderr }
}

describe('test-tmp global setup', () => {
  it('points tmpdir() inside a test at the run\'s jig-test- directory', () => {
    // A worker that never saw the setup's TMPDIR answers with the machine's /tmp, so this is the
    // case that proves the variable reaches the workers and not only the main process.
    expect(basename(tmpdir())).toMatch(/^jig-test-[A-Za-z0-9]{6}$/)
  })

  it('leaves TMPDIR empty after a suite that leaks today', () => {
    // prune-backups.test.mjs makes nine `prune-` directories and deletes none of them.
    const { empty, status, out } = runIn(['scripts/lib/prune-backups.test.mjs'])
    expect(status, out).toBe(0)
    expect(readdirSync(empty)).toEqual([])
  }, 60_000)

  it('leaves TMPDIR empty when the run fails', () => {
    // A suite outside the repo, so the main run never collects it. It leaks a directory, then
    // fails. `--globals` because a file under /tmp cannot resolve an `import 'vitest'`.
    const fixture = mkdtempSync(join(tmpdir(), 'failing-suite-'))
    writeFileSync(
      join(fixture, 'leaks-then-fails.test.mjs'),
      [
        "import { mkdtempSync } from 'node:fs'",
        "import { tmpdir } from 'node:os'",
        "import { join } from 'node:path'",
        "test('leaks, then fails', () => {",
        "  mkdtempSync(join(tmpdir(), 'leak-'))",
        "  throw new Error('deliberate')",
        '})',
        '',
      ].join('\n'),
    )
    const { empty, status, out } = runIn(['--root', fixture, '--globals'], fixture)
    expect(status, out).toBe(1)
    expect(out).toContain('deliberate')
    expect(readdirSync(empty)).toEqual([])
  }, 60_000)
})
