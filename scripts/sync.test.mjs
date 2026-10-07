// sync.mjs, dry run: what a jig sync would carry into one project, file by file. Issue #71.
//
// The rule under every verdict: jig may replace or remove a project's file only when the project's
// bytes match a version jig once shipped at that path. That is a question about jig's git HISTORY,
// so every fixture here is real git — a bare repo standing in for GitHub and a clone beside a fake
// jig, as in fleet.test.mjs. A directory fixture has no history, and every test below would pass
// against an implementation that compared only the current bytes.

import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

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
  'scripts/check-docs.mjs': 'docs gate v1\n',
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
  'scripts/check-docs.mjs': 'docs gate v1\n',
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
