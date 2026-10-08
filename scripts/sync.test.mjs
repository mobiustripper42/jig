// sync.mjs: what a jig sync would carry into one project, file by file (issue #71), and `--pr`,
// which carries it in a worktree and opens the pull request only when the project's gates pass
// (issue #72).
//
// The rule under every verdict: jig may replace or remove a project's file only when the project's
// bytes match a version jig once shipped at that path. That is a question about jig's git HISTORY,
// so every fixture here is real git — a bare repo standing in for GitHub and a clone beside a fake
// jig, as in fleet.test.mjs. A directory fixture has no history, and every test below would pass
// against an implementation that compared only the current bytes.

import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { existsSync, lstatSync, mkdirSync, mkdtempSync, readFileSync, readdirSync, realpathSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { basename, delimiter, dirname, join } from 'node:path'

const SYNC = join(process.cwd(), 'scripts', 'sync.mjs')

/** The operator's git config is not the fixture's business — see fleet.test.mjs. */
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

/** `null` deletes the file, so a commit can retire one. */
const write = (dir, files) => {
  for (const [rel, text] of Object.entries(files)) {
    if (text === null) {
      rmSync(join(dir, rel))
      continue
    }
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

const bench = () => ({
  root: mkdtempSync(join(tmpdir(), 'sync-root-')),
  remotes: mkdtempSync(join(tmpdir(), 'sync-remotes-')),
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
/** Another clone of the same remote, for a push the checkout beside jig has not fetched. */
const elsewhere = (b, name) => {
  const dir = mkdtempSync(join(tmpdir(), 'sync-elsewhere-'))
  git(dir, 'clone', '-q', join(b.remotes, `${name}.git`), 'c')
  return join(dir, 'c')
}

/**
 * A registry shaped like the real one, carve-outs above catch-alls, small enough to read. It has
 * one entry of every class the sync has to tell apart.
 */
const CLASSES = `file-classes:
  - ".claude/skills/**": logic
  - ".claude/output-styles/**": jig-only
  - "scripts/*.test.mjs": jig-only
  - "scripts/check-*.mjs": logic
  - "scripts/**": jig-only
  - ".claude/settings.json": presence
  - ".claude/agents/architect.md": context
  - ".claude/agents/pm.md": logic
  - "CLAUDE.md": hybrid
  - ".claude/CLAUDE-context.md": context
  - "docs/CHEATSHEET.md": logic
  - "docs/**": jig-only
  - "scaffold/**": context
`
const JIG = {
  'jig-version': '6\n',
  '.claude/file-classes.yaml': CLASSES,
  'CLAUDE.md': 'shell v1\n',
  '.claude/skills/kill-this/SKILL.md': 'kill v1\n',
  '.claude/agents/pm.md': 'pm v1\n',
  '.claude/agents/architect.md': 'architect template v1\n',
  '.claude/settings.json': '{}\n',
  '.claude/CLAUDE-context.md': "jig's own context\n",
  '.claude/output-styles/one-piece.md': 'style v1\n',
  // A comment, so it is a module that runs and passes: `--pr` executes the project's gates.
  'scripts/check-docs.mjs': '// docs gate v1\n',
  'scripts/check-docs.test.mjs': 'docs gate tests v1\n',
  'scripts/drift.mjs': 'drift v1\n',
  'docs/CHEATSHEET.md': 'sheet v1\n',
  'docs/SPEC.md': "jig's own spec\n",
  'scaffold/docs/SPEC.md': 'spec placeholder\n',
}
/** A project installed from JIG and then made its own in every place it is allowed to differ. */
const pkg = (scripts) => `${JSON.stringify({ scripts }, null, 2)}\n`
const PROJECT = {
  '.claude/jig-version': '6\n',
  'CLAUDE.md': 'shell v1\n',
  '.claude/skills/kill-this/SKILL.md': 'kill v1\n',
  '.claude/agents/pm.md': 'pm v1\n',
  '.claude/agents/architect.md': "architect, rewritten for this project's rules\n",
  '.claude/settings.json': '{ "this": "machine" }\n',
  '.claude/CLAUDE-context.md': 'the project context\n',
  'scripts/check-docs.mjs': '// docs gate v1\n',
  'docs/CHEATSHEET.md': 'sheet v1\n',
  'docs/SPEC.md': 'the project spec\n',
  'package.json': pkg({ 'check:docs': 'node scripts/check-docs.mjs', verify: 'npm run check:docs' }),
}

/** jig and one project beside it, both at the same generation and nothing to carry. */
const setup = ({ project = {} } = {}) => {
  const b = bench()
  const jig = repo(b, 'jig', JIG)
  const proj = repo(b, 'alpha', { ...PROJECT, ...project })
  return { b, jig, proj }
}

const sync = (jig, proj) => {
  const r = spawnSync(process.execPath, [SYNC, '--jig', jig, proj], { env: ENV, encoding: 'utf8' })
  return { out: r.stdout + r.stderr, code: r.status }
}

/**
 * The entries under one heading, as `[path, ...rest]` rows. Read by heading, so a path asserted
 * under COPY cannot be satisfied by the same path printed under HELD — the shape every verdict test
 * here depends on, since the whole script is the difference between those two blocks.
 */
const block = (out, title) => {
  const lines = out.split('\n')
  const at = lines.findIndex((l) => l.startsWith(`${title} — `))
  if (at < 0) return []
  const rows = []
  for (const l of lines.slice(at + 1)) {
    if (!l.startsWith('  ')) break
    rows.push(l.trim().split(/\s{2,}/))
  }
  return rows
}
const paths = (out, title) => block(out, title).map((r) => r[0])
const VERDICTS = ['COPY', 'NEW', 'DELETE', 'HELD: edited locally', 'HELD: migration', 'HELD: referenced']
/** Every verdict block a path appears in — exactly one is the contract. */
const verdictsOf = (out, path) => VERDICTS.filter((t) => paths(out, t).includes(path))

describe('sync — the dry run', { timeout: 30_000 }, () => {
  it('says there is nothing to sync when the project holds what jig ships', () => {
    const { jig, proj } = setup()
    const { out, code } = sync(jig, proj)
    expect(out).toMatch(/^nothing to sync\.$/m)
    for (const t of VERDICTS) expect(block(out, t)).toEqual([])
    expect(code).toBe(0)
  })

  it('names both origin/main commits and both generations in its header', () => {
    const { jig, proj } = setup()
    const { out } = sync(jig, proj)
    const jigSha = git(jig, 'rev-parse', '--short', 'origin/main')
    const projSha = git(proj, 'rev-parse', '--short', 'origin/main')
    expect(out).toMatch(new RegExp(`^jig\\s+origin/main ${jigSha}\\s+jig-version 6$`, 'm'))
    expect(out).toMatch(new RegExp(`^alpha\\s+origin/main ${projSha}\\s+jig-version 6$`, 'm'))
  })

  // AC 1
  it('copies an untouched file that jig has since changed', () => {
    const { jig, proj } = setup()
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2\n' })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, '.claude/skills/kill-this/SKILL.md')).toEqual(['COPY'])
  })

  it('copies a version main held before a merge replaced it with the branch side', () => {
    // A hotfix lands on main while a branch rewrites the same file; the merge keeps the branch's
    // side. Default history simplification then follows only the branch parent — the merge is
    // identical to it — and the hotfix drops out of `git log -- <path>`. A project synced between
    // the hotfix and the merge holds exactly those bytes, and without `--full-history` reads as
    // "edited locally". Verified by removing the flag: this test goes red.
    const { jig, proj } = setup()
    git(jig, 'checkout', '-q', '-b', 'task/rewrite')
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2, rewritten on a branch\n' }, { push: false })
    git(jig, 'checkout', '-q', 'main')
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v1, hotfixed on main\n' })
    commit(proj, { '.claude/skills/kill-this/SKILL.md': 'kill v1, hotfixed on main\n' })
    git(jig, 'merge', '-q', '-X', 'theirs', '-m', 'merge', 'task/rewrite')
    git(jig, 'push', '-q', 'origin', 'main')
    expect(git(jig, 'show', 'origin/main:.claude/skills/kill-this/SKILL.md')).toBe('kill v2, rewritten on a branch')
    expect(verdictsOf(sync(jig, proj).out, '.claude/skills/kill-this/SKILL.md')).toEqual(['COPY'])
  })

  // AC 2
  it('holds a file edited in the project, whatever jig did to it', () => {
    const { jig, proj } = setup({ project: { '.claude/skills/kill-this/SKILL.md': 'kill v1, plus a local rule\n' } })
    expect(verdictsOf(sync(jig, proj).out, '.claude/skills/kill-this/SKILL.md')).toEqual(['HELD: edited locally'])
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2\n' })
    expect(verdictsOf(sync(jig, proj).out, '.claude/skills/kill-this/SKILL.md')).toEqual(['HELD: edited locally'])
  })

  it('holds the hybrid shell when the project edited it', () => {
    const { jig, proj } = setup({ project: { 'CLAUDE.md': 'shell v1, with a project line pasted in\n' } })
    expect(verdictsOf(sync(jig, proj).out, 'CLAUDE.md')).toEqual(['HELD: edited locally'])
  })

  // AC 3
  it('holds a file whose change landed at a newer generation, and copies the rest', () => {
    // Seeds' gate held the whole repo, and blocked two unrelated `cp`s with it (DEC-S040). The gate
    // here is per file: one held file never holds another.
    const { jig, proj } = setup()
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2\n' })
    commit(jig, { 'jig-version': '7\n' })
    commit(jig, { 'scripts/check-docs.mjs': 'docs gate v2, needs the v7 layout\n' })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, 'scripts/check-docs.mjs')).toEqual(['HELD: migration'])
    expect(block(out, 'HELD: migration')).toContainEqual(['scripts/check-docs.mjs', 'jig-version 7'])
    expect(verdictsOf(out, '.claude/skills/kill-this/SKILL.md')).toEqual(['COPY'])
  })

  it('copies a change jig made before a bump the project has not taken', () => {
    // The generation is the one jig was at when the change landed, not jig's current one.
    const { jig, proj } = setup()
    commit(jig, { 'scripts/check-docs.mjs': 'docs gate v2\n' })
    commit(jig, { 'jig-version': '7\n' })
    expect(verdictsOf(sync(jig, proj).out, 'scripts/check-docs.mjs')).toEqual(['COPY'])
  })

  // AC 4
  it('adds a file the project lacks, unless jig added it at a newer generation', () => {
    const { jig, proj } = setup()
    commit(jig, { 'scripts/check-denied.mjs': 'denied gate v1\n' })
    commit(jig, { 'jig-version': '7\n' })
    commit(jig, { '.claude/skills/fresh/SKILL.md': 'needs v7\n' })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, 'scripts/check-denied.mjs')).toEqual(['NEW'])
    expect(verdictsOf(out, '.claude/skills/fresh/SKILL.md')).toEqual(['HELD: migration'])
  })

  // AC 5
  it('deletes an untouched copy of a jig-only file, and holds an edited one', () => {
    const { jig, proj } = setup({
      project: {
        'scripts/check-docs.test.mjs': 'docs gate tests v1\n',
        '.claude/output-styles/one-piece.md': 'style v1, tuned here\n',
      },
    })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, 'scripts/check-docs.test.mjs')).toEqual(['DELETE'])
    expect(block(out, 'DELETE')).toContainEqual(['scripts/check-docs.test.mjs', 'jig-only'])
    expect(verdictsOf(out, '.claude/output-styles/one-piece.md')).toEqual(['HELD: edited locally'])
  })

  it('deletes a jig-only copy that is an older jig version', () => {
    const { jig, proj } = setup({ project: { 'scripts/check-docs.test.mjs': 'docs gate tests v1\n' } })
    commit(jig, { 'scripts/check-docs.test.mjs': 'docs gate tests v2\n' })
    expect(verdictsOf(sync(jig, proj).out, 'scripts/check-docs.test.mjs')).toEqual(['DELETE'])
  })

  it('never lists a project file that only shares a path with a scaffold', () => {
    // `docs/SPEC.md` is jig-only in jig and the project's own spec in the project, installed from
    // `scaffold/docs/SPEC.md`. drift.mjs skips the same four collisions.
    // Asserts the all-clear as well as the absence: a crash prints no `docs/SPEC.md` either, and
    // this test passed against a script that did not exist yet.
    const { jig, proj } = setup()
    const { out, code } = sync(jig, proj)
    expect(out).not.toMatch(/docs\/SPEC\.md/)
    expect(out).toMatch(/^nothing to sync\.$/m)
    expect(code).toBe(0)
  })

  // AC 6
  it('deletes an untouched skill jig retired, and never lists one the project wrote', () => {
    const { b, proj } = setup({
      project: {
        '.claude/skills/old/SKILL.md': 'old v1\n',
        '.claude/skills/mine/SKILL.md': "the project's own skill\n",
      },
    })
    const jig = join(b.root, 'jig')
    commit(jig, { '.claude/skills/old/SKILL.md': 'old v1\n' })
    commit(jig, { '.claude/skills/old/SKILL.md': null })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, '.claude/skills/old/SKILL.md')).toEqual(['DELETE'])
    expect(block(out, 'DELETE')).toContainEqual(['.claude/skills/old/SKILL.md', 'retired'])
    expect(out).not.toMatch(/skills\/mine/)
  })

  it('never deletes a retired context file whose registry line went with it', () => {
    // Found by @code-review. The three reviewer agents are each named in the registry, with no glob
    // behind them, so retiring one AND its registry line leaves the path with no class today.
    // Judged by today's registry, the untouched copy read as a retired file and came out DELETE —
    // a `context` file, which a sync must never touch. The class that counts is the one the file
    // had while jig shipped it.
    const b = bench()
    const withReviewer = `file-classes:\n  - ".claude/agents/retiring.md": context\n${CLASSES.split('\n').slice(1).join('\n')}`
    const jig = repo(b, 'jig', { ...JIG, '.claude/file-classes.yaml': withReviewer, '.claude/agents/retiring.md': 'reviewer v1\n' })
    const proj = repo(b, 'alpha', { ...PROJECT, '.claude/agents/retiring.md': 'reviewer v1\n' })
    commit(jig, { '.claude/agents/retiring.md': null, '.claude/file-classes.yaml': CLASSES })
    const { out, code } = sync(jig, proj)
    expect(out).not.toMatch(/retiring\.md/)
    expect(out).toMatch(/^nothing to sync\.$/m)
    expect(code).toBe(0)
  })

  it('holds a retired file that never had a class, rather than deleting it', () => {
    const b = bench()
    const jig = repo(b, 'jig', { ...JIG, '.claude/agents/orphan.md': 'orphan v1\n' })
    const proj = repo(b, 'alpha', { ...PROJECT, '.claude/agents/orphan.md': 'orphan v1\n' })
    commit(jig, { '.claude/agents/orphan.md': null })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, '.claude/agents/orphan.md')).toEqual([])
    expect(paths(out, 'UNCLASSIFIED in jig')).toEqual(['.claude/agents/orphan.md'])
  })

  it('holds a retired skill the project edited', () => {
    const { b, proj } = setup({ project: { '.claude/skills/old/SKILL.md': 'old v1, kept alive here\n' } })
    const jig = join(b.root, 'jig')
    commit(jig, { '.claude/skills/old/SKILL.md': 'old v1\n' })
    commit(jig, { '.claude/skills/old/SKILL.md': null })
    expect(verdictsOf(sync(jig, proj).out, '.claude/skills/old/SKILL.md')).toEqual(['HELD: edited locally'])
  })

  // AC 7
  it('holds a delete that a package.json script names', () => {
    const { jig, proj } = setup({
      project: {
        'scripts/drift.mjs': 'drift v1\n',
        'package.json': pkg({ drift: 'node scripts/drift.mjs ../jig', verify: 'echo ok' }),
      },
    })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, 'scripts/drift.mjs')).toEqual(['HELD: referenced'])
    expect(block(out, 'HELD: referenced')).toContainEqual(['scripts/drift.mjs', 'npm run drift'])
  })

  // AC 8
  it('never lists a context or presence file, however far it differs', () => {
    const { jig, proj } = setup()
    commit(jig, {
      '.claude/agents/architect.md': 'architect template v2\n',
      '.claude/settings.json': '{ "v": 2 }\n',
      '.claude/CLAUDE-context.md': "jig's own context, edited\n",
      'scaffold/docs/SPEC.md': 'spec placeholder v2\n',
    })
    const { out } = sync(jig, proj)
    expect(out).not.toMatch(/architect\.md|settings\.json|CLAUDE-context\.md|SPEC\.md/)
    expect(out).toMatch(/^nothing to sync\.$/m)
  })

  // AC 9
  it("writes nothing to the project but the refs git fetch updates", () => {
    const { jig, proj } = setup()
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2\n', 'scripts/check-denied.mjs': 'denied v1\n' })
    // A sibling is somebody's parked session: a task branch, an edit in progress, an untracked file.
    git(proj, 'checkout', '-q', '-b', 'task/parked')
    write(proj, { '.claude/skills/kill-this/SKILL.md': 'half-finished\n', 'notes.txt': 'untracked\n' })
    const state = () => ({
      head: git(proj, 'rev-parse', 'HEAD'),
      branch: git(proj, 'branch', '--show-current'),
      status: git(proj, 'status', '--porcelain', '--untracked-files=all'),
      refs: git(proj, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads', 'refs/tags'),
      worktrees: git(proj, 'worktree', 'list', '--porcelain'),
    })
    const before = state()
    const { out } = sync(jig, proj)
    expect(paths(out, 'COPY')).toContain('.claude/skills/kill-this/SKILL.md')
    expect(state()).toEqual(before)
  })

  // AC 10
  it("reads jig's origin/main, never its branch or working tree", () => {
    const { jig, proj } = setup()
    git(jig, 'checkout', '-q', '-b', 'task/unmerged')
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2, not merged\n' }, { push: false })
    write(jig, { 'scripts/check-docs.mjs': 'uncommitted edit\n' })
    expect(sync(jig, proj).out).toMatch(/^nothing to sync\.$/m)
  })

  it("reads the project's origin/main, never its branch or working tree", () => {
    const { jig, proj } = setup()
    git(proj, 'checkout', '-q', '-b', 'task/parked')
    commit(proj, { '.claude/skills/kill-this/SKILL.md': 'edited on a task branch\n' }, { push: false })
    expect(sync(jig, proj).out).toMatch(/^nothing to sync\.$/m)
  })

  it('fetches both sides first', () => {
    const { b, jig, proj } = setup()
    commit(elsewhere(b, 'jig'), { '.claude/skills/kill-this/SKILL.md': 'kill v2, merged on GitHub\n' })
    commit(elsewhere(b, 'alpha'), { 'docs/CHEATSHEET.md': 'sheet v1, edited from another machine\n' })
    const { out } = sync(jig, proj)
    expect(verdictsOf(out, '.claude/skills/kill-this/SKILL.md')).toEqual(['COPY'])
    expect(verdictsOf(out, 'docs/CHEATSHEET.md')).toEqual(['HELD: edited locally'])
  })

  // AC 11
  it('names the highest restart level among what would change', () => {
    const { jig, proj } = setup()
    commit(jig, { '.claude/skills/kill-this/SKILL.md': 'kill v2\n', '.claude/agents/pm.md': 'pm v2\n' })
    expect(sync(jig, proj).out).toMatch(/^Restart after merge: none$/m)
    commit(jig, { 'CLAUDE.md': 'shell v2\n' })
    expect(sync(jig, proj).out).toMatch(/^Restart after merge: \/clear — CLAUDE\.md$/m)
  })

  it('calls for a session restart when an output style copy goes', () => {
    // The style file is read once at launch (CLAUDE.md § Communication), so removing a project copy
    // takes effect at the next session start and not before.
    const { jig, proj } = setup({ project: { '.claude/output-styles/one-piece.md': 'style v1\n' } })
    expect(sync(jig, proj).out).toMatch(/^Restart after merge: restart the session — \.claude\/output-styles\/one-piece\.md$/m)
  })

  it('fails on a path the restart table does not cover, naming it', () => {
    // Defaulting an unknown path to "none" is how a hook change would merge with nobody restarting.
    const b = bench()
    const jig = repo(b, 'jig', { ...JIG, '.claude/file-classes.yaml': `file-classes:\n  - ".claude/hooks/**": logic\n${CLASSES.split('\n').slice(1).join('\n')}` })
    const proj = repo(b, 'alpha', PROJECT)
    commit(jig, { '.claude/hooks/guard.sh': 'echo guard\n' })
    const { out, code } = sync(jig, proj)
    expect(code).toBe(2)
    expect(out).toMatch(/\.claude\/hooks\/guard\.sh/)
    expect(out).toMatch(/restart/)
  })

  // AC 12
  it('lists unwired gates, both the ones verify skips and the ones arriving', () => {
    const { jig, proj } = setup({
      project: { 'package.json': pkg({ 'check:docs': 'node scripts/check-docs.mjs', verify: 'echo nothing' }) },
    })
    commit(jig, { 'scripts/check-denied.mjs': 'denied gate v1\n' })
    const rows = block(sync(jig, proj).out, 'UNWIRED')
    expect(rows).toContainEqual(['check:docs', 'defined, and verify never calls it'])
    expect(rows).toContainEqual(['scripts/check-denied.mjs', 'arriving, and no package.json script runs it'])
  })

  it('reports a file jig has not classified rather than skipping it silently', () => {
    const { jig, proj } = setup()
    commit(jig, { '.claude/agents/new-reviewer.md': 'unclassified\n' })
    expect(paths(sync(jig, proj).out, 'UNCLASSIFIED in jig')).toEqual(['.claude/agents/new-reviewer.md'])
  })

  describe('refusals', () => {
    it('refuses a project that is not on jig', () => {
      const b = bench()
      const jig = repo(b, 'jig', JIG)
      const { '.claude/jig-version': _, ...notOnJig } = PROJECT
      const { out, code } = sync(jig, repo(b, 'alpha', notOnJig))
      expect(code).toBe(2)
      expect(out).toMatch(/no \.claude\/jig-version on origin\/main/)
    })

    it('refuses jig itself', () => {
      const { jig } = setup()
      const { out, code } = sync(jig, jig)
      expect(code).toBe(2)
      expect(out).toMatch(/jig itself/)
    })

    it('refuses without a project path', () => {
      const { jig } = setup()
      const r = spawnSync(process.execPath, [SYNC, '--jig', jig], { env: ENV, encoding: 'utf8' })
      expect(r.status).toBe(2)
      expect(r.stderr).toMatch(/usage/)
    })
  })
})

/**
 * A stand-in for `gh`, first on PATH. It records each call's arguments, one per line under a
 * separator, and keeps a copy of the body file, which the script deletes once the pull request is
 * open. `FAKE_GH_FAIL` makes it fail the way an unauthenticated `gh` does.
 */
const fakeGh = () => {
  const dir = mkdtempSync(join(tmpdir(), 'sync-gh-'))
  const script = `#!/bin/sh
echo "--call--" >> "$FAKE_GH_DIR/calls"
prev=
for a in "$@"; do
  printf '%s\\n' "$a" >> "$FAKE_GH_DIR/calls"
  if [ "$prev" = "--body-file" ]; then cp "$a" "$FAKE_GH_DIR/body"; fi
  prev=$a
done
if [ -n "$FAKE_GH_FAIL" ]; then echo "gh: not logged in" >&2; exit 1; fi
echo "https://github.com/example/alpha/pull/1"
`
  writeFileSync(join(dir, 'gh'), script, { mode: 0o755 })
  return dir
}
const ghCalls = (dir) => {
  const file = join(dir, 'calls')
  if (!existsSync(file)) return []
  return readFileSync(file, 'utf8')
    .split('--call--\n')
    .filter(Boolean)
    .map((c) => c.split('\n').slice(0, -1))
}
const flag = (call, name) => call[call.indexOf(name) + 1]

const readOr = (file, fallback) => (existsSync(file) ? readFileSync(file, 'utf8') : fallback)
const today = () => new Date().toISOString().slice(0, 10)
/** `../<repo>-jig-sync`, beside the project — the path checklist step 2 names. */
const wtOf = (proj) => {
  const real = realpathSync(proj)
  return join(dirname(real), `${basename(real)}-jig-sync`)
}
const excludeOf = (proj) => join(proj, '.git', 'info', 'exclude')
const MODULE = 'node_modules/dep/index.js'

/** The project's GitHub, read directly: what `--pr` pushed, and the blob at a path on it. */
const bareGit = (b, ...args) => git(b.remotes, '--git-dir', join(b.remotes, 'alpha.git'), ...args)
const pushed = (b) => bareGit(b, 'for-each-ref', '--format=%(refname:short)', 'refs/heads/jig-sync/').split('\n').filter(Boolean)
const bareBlob = (b, rev) => {
  try {
    return bareGit(b, 'rev-parse', '--verify', '--quiet', rev)
  } catch {
    return null
  }
}

/** A gate that fails, printing what a real one would. */
const GATE_RED = (msg) => `console.error(${JSON.stringify(msg)})\nprocess.exit(1)\n`

/**
 * jig and a project, as `setup`, plus what a real checkout has that origin/main does not: a
 * `node_modules` (gitignored, as every Node project has it, unless `gitignore` is false) and a `gh`.
 * `tmp` stands in for the system temp directory, so a run's log never lands in the real `/tmp`.
 */
const setupPr = ({ project = {}, gitignore = true } = {}) => {
  const s = setup({ project: { ...(gitignore ? { '.gitignore': 'node_modules/\n' } : {}), ...project } })
  write(s.proj, { [MODULE]: 'module.exports = 1\n' })
  return { ...s, gh: fakeGh(), tmp: mkdtempSync(join(tmpdir(), 'sync-tmp-')) }
}
const run = (s, flags, env = {}) => {
  const r = spawnSync(process.execPath, [SYNC, '--jig', s.jig, ...flags, s.proj], {
    env: { ...ENV, PATH: `${s.gh}${delimiter}${process.env.PATH}`, FAKE_GH_DIR: s.gh, TMPDIR: s.tmp, ...env },
    encoding: 'utf8',
  })
  return { out: r.stdout + r.stderr, code: r.status, stdout: r.stdout }
}
const pr = (s) => run(s, ['--pr'])
const SKILL = '.claude/skills/kill-this/SKILL.md'

describe('sync --pr', { timeout: 60_000 }, () => {
  // AC 1
  it('pushes every copy, addition and deletion, and opens one pull request against main', () => {
    const s = setupPr({ project: { 'scripts/check-docs.test.mjs': 'docs gate tests v1\n' } })
    commit(s.jig, { [SKILL]: 'kill v2\n', 'scripts/check-denied.mjs': '// denied gate v1\n' })
    // jig's checkout is usually an unmerged branch: what crosses is origin/main, never this.
    git(s.jig, 'checkout', '-q', '-b', 'task/unmerged')
    commit(s.jig, { [SKILL]: 'kill v3, not merged\n' }, { push: false })
    write(s.jig, { 'scripts/check-denied.mjs': '// uncommitted edit\n' })
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    expect(verdictsOf(out, SKILL)).toEqual(['COPY'])
    expect(verdictsOf(out, 'scripts/check-denied.mjs')).toEqual(['NEW'])
    expect(verdictsOf(out, 'scripts/check-docs.test.mjs')).toEqual(['DELETE'])
    expect(pushed(s.b)).toEqual([`jig-sync/${today()}`])
    const [branch] = pushed(s.b)
    for (const p of [SKILL, 'scripts/check-denied.mjs']) {
      expect(bareBlob(s.b, `${branch}:${p}`)).toBe(git(s.jig, 'rev-parse', `origin/main:${p}`))
    }
    expect(bareBlob(s.b, `${branch}:scripts/check-docs.test.mjs`)).toBeNull()
    const calls = ghCalls(s.gh)
    expect(calls).toHaveLength(1)
    expect(calls[0].slice(0, 2)).toEqual(['pr', 'create'])
    expect(flag(calls[0], '--base')).toBe('main')
    expect(flag(calls[0], '--head')).toBe(branch)
  })

  // AC 2
  it('leaves every held file exactly as the project has it', () => {
    const s = setupPr({
      project: {
        [SKILL]: 'kill v1, plus a local rule\n',
        'scripts/drift.mjs': 'drift v1\n',
        'package.json': pkg({ drift: 'node scripts/drift.mjs ../jig', 'check:docs': 'node scripts/check-docs.mjs', verify: 'npm run check:docs' }),
      },
    })
    commit(s.jig, { [SKILL]: 'kill v2\n', 'docs/CHEATSHEET.md': 'sheet v2\n' })
    commit(s.jig, { 'jig-version': '7\n' })
    commit(s.jig, { '.claude/agents/pm.md': 'pm v2, needs the v7 layout\n' })
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    // The verdicts this test is about, asserted first so a fixture that stopped producing them
    // cannot pass it with nothing held.
    const held = { [SKILL]: 'HELD: edited locally', '.claude/agents/pm.md': 'HELD: migration', 'scripts/drift.mjs': 'HELD: referenced' }
    for (const [p, verdict] of Object.entries(held)) expect(verdictsOf(out, p)).toEqual([verdict])
    expect(verdictsOf(out, 'docs/CHEATSHEET.md')).toEqual(['COPY'])
    const [branch] = pushed(s.b)
    for (const p of Object.keys(held)) expect(bareBlob(s.b, `${branch}:${p}`)).toBe(git(s.proj, 'rev-parse', `origin/main:${p}`))
  })

  // AC 3
  it("writes a body with the restart line, each verdict group, each unwired gate and how to wire it, and jig's SHA", () => {
    const s = setupPr({
      project: {
        [SKILL]: 'kill v1, plus a local rule\n',
        'scripts/check-docs.test.mjs': 'docs gate tests v1\n',
        'package.json': pkg({ 'check:docs': 'node scripts/check-docs.mjs', verify: 'exit 0' }),
      },
    })
    commit(s.jig, { 'CLAUDE.md': 'shell v2\n', 'scripts/check-denied.mjs': '// denied gate v1\n' })
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    const body = readFileSync(join(s.gh, 'body'), 'utf8')
    expect(body).toContain('Restart after merge: /clear — CLAUDE.md')
    expect(body).toContain("COPY — jig's current version replaces a copy nobody edited (1):\n  CLAUDE.md\n")
    expect(body).toContain('NEW — jig ships it and the project has none (1):\n  scripts/check-denied.mjs\n')
    expect(body).toMatch(/DELETE — .* \(1\):\n {2}scripts\/check-docs\.test\.mjs {2}jig-only\n/)
    expect(body).toMatch(/HELD: edited locally — .* \(1\):\n {2}\.claude\/skills\/kill-this\/SKILL\.md\n/)
    expect(body).not.toContain('HELD: migration')
    expect(body).toContain('- `npm run verify` — passed')
    expect(body).toContain(
      '- `node scripts/check-docs.mjs` — passed. Unwired: defined, and verify never calls it. To wire it in, append ` && npm run check:docs` to `verify`.',
    )
    expect(body).toContain(
      '- `node scripts/check-denied.mjs` — passed. Unwired: arriving, and no package.json script runs it. To wire it in, add `"check:denied": "node scripts/check-denied.mjs"` to `scripts`, and append ` && npm run check:denied` to `verify`.',
    )
    expect(body).toContain(git(s.jig, 'rev-parse', 'origin/main'))
  })

  // AC 4
  it('stops on a failing verify: no push, no pull request, and the worktree stays', () => {
    const s = setupPr()
    commit(s.jig, { 'scripts/check-docs.mjs': GATE_RED('check-docs: docs/SPEC.md cites docs/gone.md') })
    const { out, code } = pr(s)
    expect(code, out).toBe(1)
    expect(block(out, 'GATES')).toContainEqual(['npm run verify', 'failed'])
    expect(out).toContain('check-docs: docs/SPEC.md cites docs/gone.md')
    expect(out).toContain(wtOf(s.proj))
    expect(existsSync(join(wtOf(s.proj), 'package.json'))).toBe(true)
    expect(pushed(s.b)).toEqual([])
    expect(ghCalls(s.gh)).toEqual([])
  })

  // AC 5
  it('stops on a failing unwired gate, naming it', () => {
    const s = setupPr()
    commit(s.jig, { [SKILL]: 'kill v2\n', 'scripts/check-denied.mjs': GATE_RED('check-denied: allow list holds git push --force') })
    const { out, code } = pr(s)
    expect(code, out).toBe(1)
    expect(block(out, 'GATES')).toContainEqual(['npm run verify', 'passed'])
    expect(block(out, 'GATES')).toContainEqual(['node scripts/check-denied.mjs', 'failed'])
    expect(out).toContain('check-denied: allow list holds git push --force')
    expect(existsSync(wtOf(s.proj))).toBe(true)
    expect(pushed(s.b)).toEqual([])
    expect(ghCalls(s.gh)).toEqual([])
  })

  // AC 6
  it('treats a project with no verify script as red, and says why', () => {
    const s = setupPr({ project: { 'package.json': pkg({ 'check:docs': 'node scripts/check-docs.mjs' }) } })
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    const { out, code } = pr(s)
    expect(code, out).toBe(1)
    expect(block(out, 'GATES')).toContainEqual(['npm run verify', 'no verify script'])
    expect(out).toMatch(/no verify script, so nothing can prove the sync here/)
    expect(pushed(s.b)).toEqual([])
    expect(ghCalls(s.gh)).toEqual([])
  })

  // AC 7
  for (const [verdict, gate, exit] of [
    ['green', '// docs gate v2\n', 0],
    ['red', GATE_RED('docs gate v2 fails here'), 1],
  ]) {
    it(`leaves the real checkout as it was after a ${verdict} run`, () => {
      const s = setupPr()
      commit(s.jig, { 'scripts/check-docs.mjs': gate })
      // A sibling is somebody's parked session: a task branch, an edit in progress, an untracked file.
      git(s.proj, 'checkout', '-q', '-b', 'task/parked')
      write(s.proj, { [SKILL]: 'half-finished\n', 'notes.txt': 'untracked\n' })
      const state = () => ({
        head: git(s.proj, 'rev-parse', 'HEAD'),
        branch: git(s.proj, 'branch', '--show-current'),
        status: git(s.proj, 'status', '--porcelain', '--untracked-files=all'),
        edit: readFileSync(join(s.proj, SKILL), 'utf8'),
        modules: readFileSync(join(s.proj, MODULE), 'utf8'),
      })
      const before = state()
      const { out, code } = pr(s)
      expect(code, out).toBe(exit)
      expect(state()).toEqual(before)
    })
  }

  // AC 8
  it('hard-links node_modules into the worktree and keeps it out of the commit, with no .gitignore to help', () => {
    const s = setupPr({ gitignore: false })
    commit(s.jig, { 'scripts/check-docs.mjs': GATE_RED('red, so the worktree stays to look at') })
    const { out, code } = pr(s)
    expect(code, out).toBe(1)
    const wt = wtOf(s.proj)
    // lstat, not stat: stat follows a symlink to the real file and reports its inode, so a tree of
    // per-file symlinks (`cp -as`) passed this test until it was run against one.
    expect(lstatSync(join(wt, 'node_modules')).isSymbolicLink()).toBe(false)
    expect(lstatSync(join(wt, MODULE)).ino).toBe(lstatSync(join(s.proj, MODULE)).ino)
    expect(git(wt, 'ls-tree', '-r', '--name-only', 'HEAD')).not.toMatch(/node_modules/)
    // The exclude line is what stops a session's later `git add -A` in the worktree sweeping it in.
    // Unanchored since issue #80, so it covers a package's `node_modules` at any depth.
    expect(readOr(excludeOf(s.proj), '')).toMatch(/^node_modules\/$/m)
    expect(git(wt, 'status', '--porcelain', '--untracked-files=all')).toBe('')
  })

  // AC 9
  it('cleans up after a green run, and the real node_modules is intact', () => {
    const s = setupPr()
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    const exclude = readOr(excludeOf(s.proj), null)
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    expect(existsSync(wtOf(s.proj))).toBe(false)
    expect(git(s.proj, 'worktree', 'list', '--porcelain')).not.toContain('jig-sync')
    expect(git(s.proj, 'branch', '--list', 'jig-sync/*')).toBe('')
    expect(readOr(excludeOf(s.proj), null)).toBe(exclude)
    expect(readFileSync(join(s.proj, MODULE), 'utf8')).toBe('module.exports = 1\n')
  })

  // AC 10
  it('does nothing when there is nothing to sync', () => {
    const s = setupPr()
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    expect(out).toMatch(/^nothing to sync\.$/m)
    expect(existsSync(wtOf(s.proj))).toBe(false)
    expect(git(s.proj, 'branch', '--list', 'jig-sync/*')).toBe('')
    expect(ghCalls(s.gh)).toEqual([])
  })

  it('keeps the pushed branch and says how to open the pull request when gh fails', () => {
    // gh unauthenticated, or scoped away from the project: the push has landed, so the branch is
    // the work, and the command to finish it is the one thing the operator needs.
    const s = setupPr()
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    const { out, code } = run(s, ['--pr'], { FAKE_GH_FAIL: '1' })
    expect(code, out).toBe(1)
    expect(pushed(s.b)).toEqual([`jig-sync/${today()}`])
    expect(out).toContain('gh: not logged in')
    const retry = out.match(/gh pr create --base main --head jig-sync\/\S+ .*--body-file (\S+)/)
    expect(retry, out).not.toBeNull()
    expect(readFileSync(retry[1], 'utf8')).toContain('Restart after merge: none')
  })

  // AC 11
  describe('refuses before writing anything', () => {
    const untouched = (s) => ({
      branches: git(s.proj, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads'),
      worktrees: git(s.proj, 'worktree', 'list', '--porcelain'),
      exclude: readOr(excludeOf(s.proj), null),
      remote: pushed(s.b),
    })
    /**
     * The wording is asserted as well as the name: with the local-branch check removed, `git
     * worktree add -b` refuses on its own, also exits 2 and also names the branch, and the test
     * passed against it — a refusal that came after the fetch and the dry run instead of before.
     */
    const refuses = (s, name, says) => {
      commit(s.jig, { [SKILL]: 'kill v2\n' })
      const before = untouched(s)
      const { out, code } = pr(s)
      expect(code, out).toBe(2)
      expect(out).toContain(name)
      expect(out).toContain(says)
      expect(untouched(s)).toEqual(before)
      expect(ghCalls(s.gh)).toEqual([])
    }

    it('when the worktree path exists', () => {
      const s = setupPr()
      mkdirSync(wtOf(s.proj))
      refuses(s, wtOf(s.proj), 'already exists')
    })

    it('when the branch exists locally', () => {
      const s = setupPr()
      git(s.proj, 'branch', `jig-sync/${today()}`)
      refuses(s, `jig-sync/${today()}`, 'already has a local branch')
    })

    it("when the branch exists on the project's origin", () => {
      const s = setupPr()
      git(s.proj, 'push', '-q', 'origin', `HEAD:refs/heads/jig-sync/${today()}`)
      refuses(s, `jig-sync/${today()}`, "already on alpha's origin")
    })
  })

  // AC 12
  it('--clean after a red run puts the project back as it was', () => {
    const s = setupPr()
    commit(s.jig, { 'scripts/check-docs.mjs': GATE_RED('red, to leave something to clean') })
    const state = () => ({
      branches: git(s.proj, 'for-each-ref', '--format=%(refname) %(objectname)', 'refs/heads'),
      worktrees: git(s.proj, 'worktree', 'list', '--porcelain'),
      exclude: readOr(excludeOf(s.proj), null),
      worktreePath: existsSync(wtOf(s.proj)),
      status: git(s.proj, 'status', '--porcelain', '--untracked-files=all'),
    })
    const before = state()
    expect(pr(s).code).toBe(1)
    expect(state()).not.toEqual(before)
    const { out, code } = run(s, ['--clean'])
    expect(code, out).toBe(0)
    expect(state()).toEqual(before)
    expect(readFileSync(join(s.proj, MODULE), 'utf8')).toBe('module.exports = 1\n')
  })

  it('--clean with nothing left behind says so', () => {
    const s = setupPr()
    const { out, code } = run(s, ['--clean'])
    expect(code, out).toBe(0)
    expect(out).toMatch(/nothing to clean/)
  })

  // AC 13
  it("never modifies the project's package.json, green or red", () => {
    const pkgJson = pkg({ 'check:docs': 'node scripts/check-docs.mjs', verify: 'exit 0' })
    // Green, with two unwired gates: the case most tempted to wire them in.
    const green = setupPr({ project: { 'package.json': pkgJson } })
    commit(green.jig, { 'scripts/check-denied.mjs': '// denied gate v1\n' })
    const g = pr(green)
    expect(g.code, g.out).toBe(0)
    expect(block(g.out, 'UNWIRED')).toHaveLength(2)
    expect(bareBlob(green.b, `${pushed(green.b)[0]}:package.json`)).toBe(git(green.proj, 'rev-parse', 'origin/main:package.json'))
    expect(readFileSync(join(green.proj, 'package.json'), 'utf8')).toBe(pkgJson)
    // Red: the worktree left behind holds the project's package.json too, committed and on disk.
    const red = setupPr({ project: { 'package.json': pkgJson } })
    commit(red.jig, { 'scripts/check-denied.mjs': GATE_RED('denied gate fails') })
    const r = pr(red)
    expect(r.code, r.out).toBe(1)
    const wt = wtOf(red.proj)
    expect(git(wt, 'rev-parse', 'HEAD:package.json')).toBe(git(red.proj, 'rev-parse', 'origin/main:package.json'))
    expect(readFileSync(join(wt, 'package.json'), 'utf8')).toBe(pkgJson)
  })
})

// Issue #77. The first real syncs reached the jig session as phone screenshots, and a green run
// printed nothing any gate said — so the "taken on trust" line issue #75 added was never seen.
describe('sync --pr and --clean write a log', { timeout: 60_000 }, () => {
  /** Every log under the stand-in temp directory: one private `jig-sync-<repo>-*` folder per run. */
  const logs = (s) =>
    readdirSync(s.tmp)
      .filter((d) => d.startsWith('jig-sync-'))
      .flatMap((d) => readdirSync(join(s.tmp, d)).map((f) => join(s.tmp, d, f)))
      .sort()
  const lastLine = (stdout) => stdout.trimEnd().split('\n').at(-1)

  it('keeps each log in a private directory nobody else can name in advance', () => {
    // Found by /security-review. A fixed `/tmp/jig-sync` let another account on the machine create
    // the directory first, then swap the log for a symlink: the run reopened the log by path on
    // every line, so it appended to — or, on creation, emptied — a file of the attacker's choosing.
    const s = setupPr()
    mkdirSync(join(s.tmp, 'jig-sync'), { mode: 0o777 }) // what the attacker would plant
    const { stdout } = run(s, ['--clean'])
    const [log] = logs(s)
    expect(lastLine(stdout)).toBe(`log  ${log}`)
    expect(dirname(log)).not.toBe(join(s.tmp, 'jig-sync'))
    expect(basename(dirname(log))).toMatch(/^jig-sync-alpha-\w{6}$/)
    expect(statSync(dirname(log)).mode & 0o077).toBe(0)
    expect(readdirSync(join(s.tmp, 'jig-sync'))).toEqual([])
  })

  it('logs every line a green run printed, plus the gate output the terminal never shows, and ends on its path', () => {
    const s = setupPr()
    commit(s.jig, { 'scripts/check-docs.mjs': 'console.log("check-docs: 3 docs read, 0 problems")\n' })
    const { stdout, code } = pr(s)
    expect(code, stdout).toBe(0)
    const [log, ...more] = logs(s)
    expect(more).toEqual([])
    expect(lastLine(stdout)).toBe(`log  ${log}`)
    const text = readFileSync(log, 'utf8')
    for (const line of stdout.split('\n').filter(Boolean)) expect(text).toContain(line)
    expect(stdout).not.toContain('check-docs: 3 docs read, 0 problems')
    expect(text).toContain('check-docs: 3 docs read, 0 problems')
  })

  it('logs a failing gate, and a red run ends on the path too', () => {
    const s = setupPr()
    commit(s.jig, { 'scripts/check-docs.mjs': GATE_RED('check-docs: docs/SPEC.md cites docs/gone.md') })
    const { stdout, code } = pr(s)
    expect(code, stdout).toBe(1)
    const [log] = logs(s)
    expect(lastLine(stdout)).toBe(`log  ${log}`)
    expect(readFileSync(log, 'utf8')).toContain('check-docs: docs/SPEC.md cites docs/gone.md')
  })

  it('logs a refusal, which ends on the path as well', () => {
    const s = setupPr()
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    mkdirSync(wtOf(s.proj))
    const { stdout, code } = pr(s)
    expect(code).toBe(2)
    const [log] = logs(s)
    expect(lastLine(stdout)).toBe(`log  ${log}`)
    expect(readFileSync(log, 'utf8')).toContain(`${wtOf(s.proj)} already exists`)
  })

  it('gives each run its own file, so one run never overwrites the log of the run before it', () => {
    // Two refusals, the quickest runs there are: the closer together two runs land, the likelier
    // a coarse timestamp gives them one name.
    const s = setupPr()
    mkdirSync(wtOf(s.proj))
    pr(s)
    pr(s)
    expect(logs(s)).toHaveLength(2)
  })

  it('logs --clean', () => {
    const s = setupPr()
    const { stdout, code } = run(s, ['--clean'])
    expect(code).toBe(0)
    const [log] = logs(s)
    expect(lastLine(stdout)).toBe(`log  ${log}`)
    expect(readFileSync(log, 'utf8')).toMatch(/nothing to clean/)
  })

  it('writes no log on a dry run, whose header says it writes nothing', () => {
    const s = setupPr()
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    const { stdout, code } = run(s, [])
    expect(code).toBe(0)
    expect(stdout).toMatch(/dry run: fetches, then writes nothing/)
    expect(logs(s)).toEqual([])
  })
})

// Issue #80. centerline has a second package, `mobile/`, with its own `node_modules`. Linking only
// the root's sent two syncs red on `expo/tsconfig.base` not found, a setup failure the script
// could have prevented: the real checkout had the directory the whole time.
describe('sync --pr links every node_modules the checkout has', { timeout: 60_000 }, () => {
  const MOBILE_MODULE = 'mobile/node_modules/dep/index.js'
  /** A second package that `verify` needs, and a third whose checkout has no `node_modules`. */
  const setupPackages = ({ verify = 'node mobile/check.mjs', gitignore = true } = {}) => {
    const s = setupPr({
      gitignore,
      project: {
        'mobile/package.json': '{ "name": "mobile" }\n',
        'mobile/check.mjs': "import { readFileSync } from 'node:fs'\nreadFileSync('mobile/node_modules/dep/index.js')\n",
        'tools/package.json': '{ "name": "tools" }\n',
        'package.json': pkg({ 'check:docs': 'node scripts/check-docs.mjs', verify }),
      },
    })
    write(s.proj, { [MOBILE_MODULE]: 'module.exports = 2\n' })
    return s
  }

  it('links a second package\'s node_modules, so a verify that needs it goes green', () => {
    const s = setupPackages()
    commit(s.jig, { [SKILL]: 'kill v2\n' })
    const { out, code } = pr(s)
    expect(code, out).toBe(0)
    expect(out).toMatch(/hard-linked from alpha's checkout: node_modules, mobile\/node_modules/)
  })

  it('shares inodes, skips a package with none, and keeps every link out of the commit with no .gitignore to help', () => {
    // Red on purpose, so the worktree stays to look at.
    const s = setupPackages({ verify: 'node mobile/check.mjs && node scripts/check-docs.mjs', gitignore: false })
    commit(s.jig, { 'scripts/check-docs.mjs': GATE_RED('red, so the worktree stays') })
    const { out, code } = pr(s)
    expect(code, out).toBe(1) // a gate, not a failed step: the package with no node_modules was skipped
    const wt = wtOf(s.proj)
    expect(lstatSync(join(wt, MOBILE_MODULE)).ino).toBe(lstatSync(join(s.proj, MOBILE_MODULE)).ino)
    expect(existsSync(join(wt, 'tools/node_modules'))).toBe(false)
    expect(git(wt, 'ls-tree', '-r', '--name-only', 'HEAD')).not.toMatch(/node_modules/)
    expect(git(wt, 'status', '--porcelain', '--untracked-files=all')).toBe('')
  })

  it('leaves the exclude file and both real node_modules as they were, after a green run and after --clean', () => {
    const green = setupPackages()
    commit(green.jig, { [SKILL]: 'kill v2\n' })
    const before = readOr(excludeOf(green.proj), null)
    expect(pr(green).code).toBe(0)
    expect(readOr(excludeOf(green.proj), null)).toBe(before)
    for (const m of [MODULE, MOBILE_MODULE]) expect(existsSync(join(green.proj, m)), m).toBe(true)

    const red = setupPackages({ verify: 'exit 1' })
    commit(red.jig, { [SKILL]: 'kill v2\n' })
    const redBefore = readOr(excludeOf(red.proj), null)
    expect(pr(red).code).toBe(1)
    expect(run(red, ['--clean']).code).toBe(0)
    expect(readOr(excludeOf(red.proj), null)).toBe(redBefore)
    for (const m of [MODULE, MOBILE_MODULE]) expect(existsSync(join(red.proj, m)), m).toBe(true)
  })

  it('--clean removes a block in the old one-line format, as a red run before this change left it', () => {
    const s = setupPr()
    const before = readOr(excludeOf(s.proj), '')
    const old = `# jig sync: node_modules is hard-linked into ${wtOf(s.proj)}. scripts/sync.mjs removes these two lines.\n/node_modules\n`
    writeFileSync(excludeOf(s.proj), `${before}${old}`)
    const { out, code } = run(s, ['--clean'])
    expect(code, out).toBe(0)
    expect(readOr(excludeOf(s.proj), '')).toBe(before)
  })
})
