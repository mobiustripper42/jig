// fleet.mjs runs drift.mjs over every repo cloned beside jig. It exists so the operator can see
// which repos are behind without opening a session in each, and without anyone keeping a list.
//
// Every fixture here is real git: a bare repo standing in for GitHub, a clone beside a fake jig.
// That is the only way to test the three things this script adds over drift itself — it reads
// `origin/main` rather than the working tree, it fetches first, and it compares against jig's
// `origin/main` rather than whatever branch jig has checked out. A plain directory has none of
// those, so a directory fixture would pass against an implementation that ignored all three.

import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, renameSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const FLEET = join(process.cwd(), 'scripts', 'fleet.mjs')

/**
 * The operator's git config is not the fixture's business. Signing, hooks or a default branch set
 * there would make these tests depend on the machine that runs them.
 */
const ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
}
const git = (cwd, ...args) => execFileSync('git', args, { cwd, env: ENV, encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }).trim()

const write = (dir, files) => {
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true })
    writeFileSync(join(dir, rel), text)
  }
}
const commit = (dir, files, { push = true } = {}) => {
  write(dir, files)
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', 'fixture')
  if (push) git(dir, 'push', '-q', 'origin', 'HEAD:main')
}

/**
 * A directory of repos with jig among them, and somewhere else holding their remotes. The remotes
 * live outside the root on purpose: a bare repo inside it would be one more thing to discover.
 */
const bench = () => ({
  root: mkdtempSync(join(tmpdir(), 'fleet-root-')),
  remotes: mkdtempSync(join(tmpdir(), 'fleet-remotes-')),
})
const repo = (b, name, files) => {
  const bare = join(b.remotes, `${name}.git`)
  git(b.remotes, 'init', '-q', '--bare', '-b', 'main', bare)
  const dir = join(b.root, name)
  git(b.root, 'init', '-q', '-b', 'main', dir)
  git(dir, 'remote', 'add', 'origin', bare)
  commit(dir, files)
  return dir
}
/** Another clone of the same remote, for pushing a change the repo beside jig has not fetched. */
const elsewhere = (b, name) => {
  const dir = mkdtempSync(join(tmpdir(), 'fleet-elsewhere-'))
  git(dir, 'clone', '-q', join(b.remotes, `${name}.git`), 'c')
  return join(dir, 'c')
}

const SHEET = 'sheet v1\n'
const SHARED = { 'CLAUDE.md': 'shell v1\n', 'docs/CHEATSHEET.md': SHEET }
const CLASSES = 'file-classes:\n  - "CLAUDE.md": hybrid\n  - "docs/CHEATSHEET.md": logic\n'
const JIG = { ...SHARED, 'jig-version': '6\n', '.claude/file-classes.yaml': CLASSES }
const onJig = (extra = {}) => ({ ...SHARED, '.claude/jig-version': '6\n', ...extra })

const fleet = (b) => {
  const r = spawnSync(process.execPath, [FLEET, '--jig', join(b.root, 'jig')], { env: ENV, encoding: 'utf8' })
  return { out: r.stdout + r.stderr, code: r.status }
}
/** The one summary line for a repo, so an assertion cannot be satisfied by the detail below it. */
const line = (out, name) => out.split('\n').find((l) => new RegExp(`^  ${name}\\s`).test(l)) ?? ''

describe('fleet', { timeout: 30_000 }, () => {
  it('says nothing differs for a repo whose main matches jig', () => {
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig())
    const { out, code } = fleet(b)
    expect(line(out, 'alpha')).toMatch(/nothing differs/)
    expect(code).toBe(0)
  })

  it("reads each repo's origin/main, not its working tree", () => {
    // Every sibling is somebody's live session, parked on a branch with edits in it. What has
    // shipped is origin/main, so a stale main with a fixed working tree is still stale, and a
    // clean main with a messy working tree is still clean.
    const b = bench()
    repo(b, 'jig', JIG)
    const alpha = repo(b, 'alpha', onJig({ 'docs/CHEATSHEET.md': 'stale\n' }))
    write(alpha, { 'docs/CHEATSHEET.md': SHEET })
    const beta = repo(b, 'beta', onJig())
    write(beta, { 'docs/CHEATSHEET.md': 'half-finished local edit\n' })
    const { out } = fleet(b)
    expect(line(out, 'alpha')).toMatch(/1 drift/)
    expect(line(out, 'beta')).toMatch(/nothing differs/)
  })

  it("compares against jig's origin/main, not the branch jig has checked out", () => {
    // The first manual run of this idea compared against an unmerged jig branch and reported two
    // repos behind on changes that had not shipped anywhere.
    const b = bench()
    const jig = repo(b, 'jig', JIG)
    git(jig, 'checkout', '-q', '-b', 'task/unmerged')
    commit(jig, { 'docs/CHEATSHEET.md': 'sheet v2, not merged\n' }, { push: false })
    repo(b, 'alpha', onJig())
    expect(line(fleet(b).out, 'alpha')).toMatch(/nothing differs/)
  })

  it('fetches each repo before reading it', () => {
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig())
    commit(elsewhere(b, 'alpha'), { 'docs/CHEATSHEET.md': 'pushed from another machine\n' })
    expect(line(fleet(b).out, 'alpha')).toMatch(/1 drift/)
  })

  it('fetches jig before comparing against it', () => {
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig())
    commit(elsewhere(b, 'jig'), { 'docs/CHEATSHEET.md': 'sheet v2, merged on GitHub\n' })
    expect(line(fleet(b).out, 'alpha')).toMatch(/1 drift/)
  })

  it('says so when a fetch fails, and reports the last-fetched state anyway', () => {
    // Offline is not a reason to report nothing, and it is not a reason to pretend the answer is
    // current either.
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig())
    renameSync(join(b.remotes, 'alpha.git'), join(b.remotes, 'moved.git'))
    expect(line(fleet(b).out, 'alpha')).toMatch(/nothing differs.*fetch failed/)
  })

  it('lists a repo once however many worktrees it has', () => {
    const b = bench()
    repo(b, 'jig', JIG)
    const alpha = repo(b, 'alpha', onJig())
    git(alpha, 'worktree', 'add', '-q', '-b', 'task/lane', join(b.root, 'alpha-lane'))
    // COUNTS THE LINES, because the worktree is named after the repo that owns it. Without the
    // dedupe it prints as a second `alpha`, not as `alpha-lane`, so asserting the absence of
    // `alpha-lane` passed against the broken code. The mutation pass caught that.
    const { out } = fleet(b)
    expect(out.split('\n').filter((l) => /^ {2}alpha\s/.test(l))).toHaveLength(1)
    expect(out).not.toMatch(/alpha-lane/)
  })

  it('names the repos that are not on jig, and never lists jig itself', () => {
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig())
    repo(b, 'gamma', { 'README.md': 'predates jig\n' })
    const { out } = fleet(b)
    expect(out).toMatch(/^not on jig \(1\): gamma$/m)
    expect(line(out, 'gamma')).toBe('')
    expect(line(out, 'jig')).toBe('')
  })

  it('reports a migration owed even when every file matches', () => {
    // drift prints its all-clear on files alone, so "nothing differs" and "owes a migration" can
    // both appear in one run. Taking the all-clear line as the answer would call this repo current.
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'delta', onJig({ '.claude/jig-version': '5\n' }))
    const { out, code } = fleet(b)
    expect(line(out, 'delta')).toMatch(/jig-version 5 → 6/)
    expect(line(out, 'delta')).not.toMatch(/nothing differs/)
    expect(code).toBe(1)
  })

  it("prints drift's full report under a repo that is behind, and exits 1", () => {
    const b = bench()
    repo(b, 'jig', JIG)
    repo(b, 'alpha', onJig({ 'docs/CHEATSHEET.md': 'stale\n' }))
    repo(b, 'beta', onJig())
    const { out, code } = fleet(b)
    expect(out).toMatch(/^── alpha ──$/m)
    expect(out).toMatch(/logic\s+docs\/CHEATSHEET\.md\s+differs/)
    expect(out).toMatch(/^jig at origin\/main [0-9a-f]{7}/m)
    expect(out).not.toMatch(/^── beta ──$/m)
    expect(code).toBe(1)
  })
})
