// .claude/skills/sample/sample.mjs: the hand-back sample (issue 130). The tests live here, not
// beside the script, because a project receives the skill folder and runs the script, never its
// tests.
//
// Why a sample at all: Haul's word-on-screen tests lasted weeks, 545 assertions in 62 of 181 test
// files, because the only way to review a task was its whole diff, where nothing stands out. A
// sample the builder did not choose surfaces a pattern within a few pull requests.
//
// Each rule is tested at the layer that owns it: `findBlocks` what counts as a test or a function
// and which files hold them, `changedLines` which diff lines count, `touched` whether the diff
// reached a block, `format` the empty forms. The `pick` CLI is tested for what only it does: the
// base, the merge-base, HEAD's copy and the seed. Every `pick` fixture is real git, because a
// directory has no merge-base and no HEAD.

import { describe, expect, it } from 'vitest'
import { execFileSync, spawnSync } from 'node:child_process'
import { createHash } from 'node:crypto'
import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import {
  changedLines,
  findBlocks,
  format,
  mark,
  noneLine,
  pick,
  sampleLine,
  touched,
  unanswered,
} from '../.claude/skills/sample/sample.mjs'

const SAMPLE = join(process.cwd(), '.claude', 'skills', 'sample', 'sample.mjs')

/**
 * The operator's git config is not the fixture's business — see fleet.test.mjs. The dates are
 * fixed so a commit's sha depends only on its content and message, and a seeded pick is the same
 * on every run of this suite.
 */
const ENV = {
  ...process.env,
  GIT_CONFIG_GLOBAL: '/dev/null',
  GIT_CONFIG_NOSYSTEM: '1',
  GIT_AUTHOR_NAME: 'fixture',
  GIT_AUTHOR_EMAIL: 'fixture@example.invalid',
  GIT_COMMITTER_NAME: 'fixture',
  GIT_COMMITTER_EMAIL: 'fixture@example.invalid',
  GIT_AUTHOR_DATE: '2026-11-18T12:00:00Z',
  GIT_COMMITTER_DATE: '2026-11-18T12:00:00Z',
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
const commit = (dir, files, message = 'fixture') => {
  write(dir, files)
  git(dir, 'add', '-A')
  git(dir, 'commit', '-q', '-m', message)
}
/** A repo on `main` with one commit. No remote: a test that needs `origin` adds one. */
const repo = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'sample-repo-'))
  git(dir, 'init', '-q', '-b', 'main')
  commit(dir, files)
  return dir
}
const checkout = (dir, ...args) => git(dir, 'checkout', '-q', ...args)

const run = (cwd, ...args) => spawnSync(process.execPath, [SAMPLE, ...args], { cwd, env: ENV, encoding: 'utf8' })
const out = (r) => r.stdout.replace(/\n+$/, '').split('\n')
/** Every `path:line` a sample printed, in order. */
const sampled = (r) => [...r.stdout.matchAll(/`([^`]+:\d+)`/g)].map((m) => m[1])

const lines = (...ls) => ls.join('\n') + '\n'
/** Replace 1-based lines of `text`. */
const edit = (text, changes) => {
  const ls = text.split('\n')
  for (const [n, s] of Object.entries(changes)) ls[n - 1] = s
  return ls.join('\n')
}

// Tests open at 4, 7, 10 and 13; their bodies are lines 5, 8, 11 and 14.
const A_TEST = lines(
  "import { describe, it, expect } from 'vitest'",
  '',
  "describe('a', () => {",
  "  it('one', () => {",
  '    expect(1).toBe(1)',
  '  })',
  "  it('two', () => {",
  '    expect(2).toBe(2)',
  '  })',
  "  it('three', () => {",
  '    expect(3).toBe(3)',
  '  })',
  "  it('four', () => {",
  '    expect(4).toBe(4)',
  '  })',
  '})',
)
// Functions open at 1, 5 and 7; `add`'s body is line 2.
const LIB = lines(
  'export function add(a, b) {',
  '  return a + b',
  '}',
  '',
  'export const double = (x) => x * 2',
  '',
  'export function untouched() {',
  '  return 0',
  '}',
)
const body = (n) => `    expect(${n}).toBe(${n * 10})`

/** `main` holds both files; `task` changes the bodies of tests one, two and three, and `add`. */
const changedBranch = () => {
  const dir = repo({ 'tests/a.test.mjs': A_TEST, 'src/lib.mjs': LIB })
  checkout(dir, '-b', 'task')
  commit(dir, {
    'tests/a.test.mjs': edit(A_TEST, { 5: body(1), 8: body(2), 11: body(3) }),
    'src/lib.mjs': edit(LIB, { 2: '  return b + a' }),
  })
  return dir
}

describe('changedLines', () => {
  const DIFF = lines(
    'diff --git a/src/a.mjs b/src/a.mjs',
    'index 1111111..2222222 100644',
    '--- a/src/a.mjs',
    '+++ b/src/a.mjs',
    '@@ -1,5 +1,6 @@',
    ' one',
    '-two',
    '+two, changed',
    '+inserted',
    ' three',
    ' four',
    ' five',
    '@@ -20,3 +21,3 @@',
    ' twenty',
    '-gone',
    '+here',
    ' twenty-two',
    'diff --git a/src/only-deletes.mjs b/src/only-deletes.mjs',
    'index 5555555..6666666 100644',
    '--- a/src/only-deletes.mjs',
    '+++ b/src/only-deletes.mjs',
    '@@ -3,3 +3,2 @@',
    ' kept',
    '-removed',
    ' kept too',
    'diff --git a/tests/old.test.mjs b/tests/old.test.mjs',
    'deleted file mode 100644',
    'index 3333333..0000000',
    '--- a/tests/old.test.mjs',
    '+++ /dev/null',
    '@@ -1,2 +0,0 @@',
    "-it('gone', () => {",
    '-})',
    'diff --git a/src/new.mjs b/src/new.mjs',
    'new file mode 100644',
    'index 0000000..4444444',
    '--- /dev/null',
    '+++ b/src/new.mjs',
    '@@ -0,0 +1,2 @@',
    '+export function fresh() {}',
    '+fresh()',
  )

  it("AC1: changedLines numbers each + line 1-based in HEAD's copy, by repo-relative path", () => {
    const got = changedLines(DIFF)
    expect([...(got.get('src/a.mjs') ?? [])].sort((a, b) => a - b)).toEqual([2, 3, 22])
    expect([...(got.get('src/new.mjs') ?? [])].sort((a, b) => a - b)).toEqual([1, 2])
    expect([...got.keys()].some((p) => p.startsWith('b/'))).toBe(false)
  })

  it('AC1: changedLines counts no context line and nothing from a hunk that only deletes', () => {
    const got = changedLines(DIFF)
    expect(got.get('src/a.mjs')).toBeInstanceOf(Set)
    expect([...got.get('src/a.mjs')].filter((n) => [1, 4, 5, 6, 21, 23].includes(n))).toEqual([])
    expect((got.get('src/only-deletes.mjs') ?? new Set()).size).toBe(0)
  })

  it('AC3: changedLines gives a deleted file no entry', () => {
    const got = changedLines(DIFF)
    expect(got.has('src/new.mjs')).toBe(true)
    expect(got.has('tests/old.test.mjs')).toBe(false)
    expect(got.has('/dev/null')).toBe(false)
    expect(got.has('dev/null')).toBe(false)
  })
})

describe('findBlocks', () => {
  it('AC1: a test opens on it( or test( as the first token, inside a describe too; submit(, split( and latest( never open one', () => {
    const text = lines(
      "import { describe, it, test } from 'vitest'",
      'latest(z)',
      "describe('group', () => {",
      "  it('one', () => {",
      '    submit(x)',
      '    split(y)',
      '    latest(z)',
      '  })',
      '  const helper = () => 1',
      "  test('two', async () => {",
      '    expect(1).toBe(1)',
      '  })',
      '})',
    )
    expect(findBlocks('tests/group.test.mjs', text)).toEqual([
      { kind: 'test', line: 4, end: 9 },
      { kind: 'test', line: 10, end: 13 },
    ])
  })

  it('AC1: in a test file only test lines bound a block, and the last block ends at the last line', () => {
    // The helper between two tests falls inside the earlier test, and a trailing newline adds no line.
    const text = "it('a', () => {})\nfunction helper() {}\nit('b', () => {\n})"
    const want = [
      { kind: 'test', line: 1, end: 2 },
      { kind: 'test', line: 3, end: 4 },
    ]
    expect(findBlocks('x.test.mjs', text)).toEqual(want)
    expect(findBlocks('x.test.mjs', text + '\n')).toEqual(want)
  })

  it('AC2: a function opens on a declaration or a one-line arrow const, nested and TS-typed included; .map((x) => …) is not one', () => {
    const text = lines(
      "import x from 'y'",
      'export default async function* gen(a) {',
      '  const ids = xs.map((x) => x.id)',
      '  const inner = (b) => b + 1',
      '  return ids',
      '}',
      'export function plain(a, b) {',
      '  function nested() {}',
      '}',
      'async function later() {}',
      'const arrow = async (a: number): Promise<void> => {',
      '}',
      'export const one = x => x * 2',
      'const notFn = 3',
      'const typed = (p: string): string => p',
    )
    expect(findBlocks('src/a.ts', text)).toEqual([
      { kind: 'function', line: 2, end: 3 },
      { kind: 'function', line: 4, end: 6 },
      { kind: 'function', line: 7, end: 7 },
      { kind: 'function', line: 8, end: 9 },
      { kind: 'function', line: 10, end: 10 },
      { kind: 'function', line: 11, end: 12 },
      { kind: 'function', line: 13, end: 14 },
      { kind: 'function', line: 15, end: 15 },
    ])
  })

  it('AC3: findBlocks finds blocks in .js .mjs .cjs .ts .tsx .jsx .mts .cts files and none in any other', () => {
    for (const ext of ['.js', '.mjs', '.cjs', '.ts', '.tsx', '.jsx', '.mts', '.cts']) {
      expect(findBlocks(`src/a${ext}`, 'export function f() {}\n'), ext).toEqual([{ kind: 'function', line: 1, end: 1 }])
      expect(findBlocks(`src/a.test${ext}`, "it('a', () => {})\n"), `.test${ext}`).toEqual([{ kind: 'test', line: 1, end: 1 }])
    }
    for (const path of ['src/a.py', 'docs/a.md', 'a.json', 'src/a.vue', 'notes.txt', 'tests/a.test.py']) {
      expect(findBlocks(path, "export function f() {}\nit('a', () => {})\n"), path).toEqual([])
    }
  })

  it('AC4: *.test.*, *.spec.* and anything under __tests__/ is a test file; every other matching file is source', () => {
    const text = "function helper() {}\nit('a', () => {})\n"
    for (const path of ['x.test.mjs', 'src/x.spec.ts', '__tests__/x.js', 'src/__tests__/deep/x.ts']) {
      expect(findBlocks(path, text), path).toEqual([{ kind: 'test', line: 2, end: 2 }])
    }
    for (const path of ['src/x.mjs', 'src/contest.mjs', 'src/latest.ts', 'src/testing/x.js']) {
      expect(findBlocks(path, text), path).toEqual([{ kind: 'function', line: 1, end: 2 }])
    }
  })
})

describe('touched', () => {
  const BLOCKS = [
    { kind: 'test', line: 1, end: 4 },
    { kind: 'test', line: 5, end: 8 },
    { kind: 'test', line: 9, end: 12 },
  ]

  it("AC1: touched keeps a block whose range holds a changed line, its opening line and its end included", () => {
    expect(touched(BLOCKS, new Set([4, 9]))).toEqual([BLOCKS[0], BLOCKS[2]])
    expect(touched(BLOCKS, new Set([5, 6, 7, 8]))).toEqual([BLOCKS[1]])
  })

  it('AC3: touched drops a block the diff did not reach, and a changed line outside every block touches nothing', () => {
    expect(touched(BLOCKS, new Set([6, 13, 40]))).toEqual([BLOCKS[1]])
    expect(touched(BLOCKS.slice(1), new Set([2, 3]))).toEqual([])
  })
})

describe('pick', () => {
  const cands = () => Array.from({ length: 10 }, (_, i) => ({ path: `t/${i}.test.mjs`, kind: 'test', line: i + 1, end: i + 1 }))
  const sha = (s) => createHash('sha1').update(String(s)).digest('hex')

  it('AC1: pick returns n distinct candidates', () => {
    const got = pick(cands(), 2, sha(1))
    expect(got).toHaveLength(2)
    for (const c of got) expect(cands()).toContainEqual(c)
    expect(new Set(got.map((c) => c.path)).size).toBe(2)
  })

  it('AC5: pick gives the same candidates for the same seed', () => {
    const first = pick(cands(), 2, sha(1))
    expect(first).toHaveLength(2)
    expect(pick(cands(), 2, sha(1))).toEqual(first)
  })

  it('AC5: pick is seeded: across 200 seeds every candidate is picked by some seed', () => {
    const seen = new Set()
    for (let s = 0; s < 200; s++) for (const c of pick(cands(), 2, sha(s))) seen.add(c.path)
    expect(seen.size).toBe(10)
  })

  it('AC6: pick returns every candidate when there are fewer than n', () => {
    const one = cands().slice(0, 1)
    expect(pick(one, 2, sha(1))).toEqual(one)
    expect(pick([], 1, sha(1))).toEqual([])
  })
})

describe('sampleLine and format', () => {
  const T1 = { path: 'tests/a.test.mjs', kind: 'test', line: 4, end: 6 }
  const T2 = { path: 'tests/a.test.mjs', kind: 'test', line: 10, end: 12 }
  const F1 = { path: 'src/lib.mjs', kind: 'function', line: 1, end: 4 }
  const trim = (s) => s.replace(/\n+$/, '')

  it('AC7: sampleLine writes an unmarked sample as - `path:line` — kind — unanswered — —', () => {
    expect(sampleLine(T1)).toBe('- `tests/a.test.mjs:4` — test — unanswered — —')
    expect(sampleLine(F1)).toBe('- `src/lib.mjs:1` — function — unanswered — —')
  })

  it('AC7: sampleLine writes a marked sample with its mark and pattern', () => {
    expect(sampleLine({ ...T2, mark: "can't tell", pattern: 'platform guarantee' })).toBe(
      "- `tests/a.test.mjs:10` — test — can't tell — platform guarantee",
    )
    expect(sampleLine({ ...F1, mark: 'waste' })).toBe('- `src/lib.mjs:1` — function — waste — —')
  })

  it('AC7: format prints **Sample:** alone, then the tests, then the function, with no blank lines', () => {
    expect(trim(format([T1, T2], [F1]))).toBe(
      lines(
        '**Sample:**',
        '- `tests/a.test.mjs:4` — test — unanswered — —',
        '- `tests/a.test.mjs:10` — test — unanswered — —',
        '- `src/lib.mjs:1` — function — unanswered — —',
      ).trimEnd(),
    )
  })

  it('AC6: format prints - no changed function in place of a function when there is none', () => {
    expect(trim(format([T1], []))).toBe(
      lines('**Sample:**', '- `tests/a.test.mjs:4` — test — unanswered — —', '- no changed function').trimEnd(),
    )
  })

  it('AC6: format prints - no changed test in place of the tests when there is none', () => {
    expect(trim(format([], [F1]))).toBe(
      lines('**Sample:**', '- no changed test', '- `src/lib.mjs:1` — function — unanswered — —').trimEnd(),
    )
  })

  it('AC6: format prints a single none line when there is neither', () => {
    expect(trim(format([], []))).toBe('**Sample:** none — no changed test or function in a JS/TS file')
  })

  it('AC6: noneLine writes **Sample:** none — <reason>', () => {
    expect(noneLine('base nope not found')).toBe('**Sample:** none — base nope not found')
  })
})

describe('sample.mjs pick', () => {
  it('AC1: pick prints 2 distinct changed tests, each at its opening line', () => {
    const r = run(changedBranch(), 'pick', '--base', 'main')
    const tests = out(r).filter((l) => l.includes(' — test — '))
    const allowed = [4, 7, 10].map((n) => `- \`tests/a.test.mjs:${n}\` — test — unanswered — —`)
    expect(tests).toHaveLength(2)
    for (const t of tests) expect(allowed).toContain(t)
    expect(new Set(tests).size).toBe(2)
  })

  it('AC2: pick prints the changed function at its opening line', () => {
    const r = run(changedBranch(), 'pick', '--base', 'main')
    expect(out(r).filter((l) => l.includes(' — function — '))).toEqual(['- `src/lib.mjs:1` — function — unanswered — —'])
  })

  it('AC3: pick samples nothing from untouched blocks, a deleted file or a file that is not JS/TS', () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST, 'tests/old.test.mjs': A_TEST, 'src/lib.mjs': LIB })
    checkout(dir, '-b', 'task')
    commit(dir, {
      // The import line comes before the first test; the header comes before the first function.
      'tests/a.test.mjs': edit(A_TEST, { 1: "import { describe, it, expect, vi } from 'vitest'" }),
      'src/lib.mjs': '// header\n' + LIB,
      'tests/old.test.mjs': null,
      'tools/gen.py': "def it():\n    pass\n\nfunction f() {}\n",
    })
    const r = run(dir, 'pick', '--base', 'main')
    expect(r.status).toBe(0)
    expect(r.stdout.trimEnd()).toBe('**Sample:** none — no changed test or function in a JS/TS file')
  })

  it("AC1: pick reads blocks and changes from HEAD, not the working tree", () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST, 'src/lib.mjs': LIB })
    checkout(dir, '-b', 'task')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 5: body(1) }) })
    // Uncommitted: three lines on top shift every opening line, and test four's body changes.
    write(dir, { 'tests/a.test.mjs': '// one\n// two\n// three\n' + edit(A_TEST, { 5: body(1), 14: body(4) }) })
    const r = run(dir, 'pick', '--base', 'main')
    expect(r.stdout).toContain('**Sample:**')
    expect(sampled(r)).toEqual(['tests/a.test.mjs:4'])
  })

  it('AC5: pick prints the same sample on every run at the same HEAD', () => {
    const dir = changedBranch()
    const first = run(dir, 'pick', '--base', 'main').stdout
    expect(first).toMatch(/`tests\/a\.test\.mjs:\d+`/)
    expect(run(dir, 'pick', '--base', 'main').stdout).toBe(first)
  })

  it("AC5: pick's sample follows HEAD's sha", () => {
    // Eight tests, all changed: 28 possible pairs. The same tree under eight different shas.
    const many = lines(...Array.from({ length: 8 }, (_, i) => [`it('t${i}', () => {`, `  expect(${i}).toBe(${i})`, '})']).flat())
    const changed = lines(...Array.from({ length: 8 }, (_, i) => [`it('t${i}', () => {`, `  expect(${i}).toBe(${i + 1})`, '})']).flat())
    const dir = repo({ 'tests/many.test.mjs': many })
    checkout(dir, '-b', 'task')
    commit(dir, { 'tests/many.test.mjs': changed })
    const samples = new Set()
    for (let i = 0; i < 8; i++) {
      git(dir, 'commit', '-q', '--amend', '-m', `message ${i}`)
      samples.add(sampled(run(dir, 'pick', '--base', 'main')).join(' '))
    }
    expect(samples.size).toBeGreaterThan(1)
  })

  it('AC7: pick prints only the **Sample:** block, one line per sample, and no task heading or points line', () => {
    const lns = out(run(changedBranch(), 'pick', '--base', 'main'))
    expect(lns).toHaveLength(4)
    expect(lns[0]).toBe('**Sample:**')
    for (const l of lns.slice(1)) expect(l).toMatch(/^- `[^`]+:\d+` — (test|function) — unanswered — —$/)
    expect(lns.filter((l) => l.startsWith('## Task') || l.startsWith('**Points:**'))).toEqual([])
  })

  it('AC9: --base naming the parent of a stacked branch samples only the child', () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST })
    checkout(dir, '-b', 'parent')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 5: body(1), 8: body(2) }) })
    checkout(dir, '-b', 'child')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 5: body(1), 8: body(2), 14: body(4) }) })
    expect(sampled(run(dir, 'pick', '--base', 'parent'))).toEqual(['tests/a.test.mjs:13'])
  })

  it('AC9: --base HEAD~1 on main samples only the last commit', () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST, 'src/lib.mjs': LIB })
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 11: body(3) }), 'src/lib.mjs': edit(LIB, { 2: '  return b + a' }) })
    expect(sampled(run(dir, 'pick', '--base', 'HEAD~1'))).toEqual(['tests/a.test.mjs:10', 'src/lib.mjs:1'])
  })

  it('AC9: pick compares from the merge-base, so what the base gained after the branch is not sampled', () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST })
    checkout(dir, '-b', 'task')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 5: body(1) }) })
    checkout(dir, 'main')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 11: body(3) }) })
    checkout(dir, 'task')
    expect(sampled(run(dir, 'pick', '--base', 'main'))).toEqual(['tests/a.test.mjs:4'])
  })

  it('AC9: with no --base, pick compares against origin/main', () => {
    const dir = repo({ 'tests/a.test.mjs': A_TEST })
    const bare = mkdtempSync(join(tmpdir(), 'sample-remote-'))
    git(bare, 'init', '-q', '--bare', '-b', 'main')
    git(dir, 'remote', 'add', 'origin', bare)
    git(dir, 'push', '-q', 'origin', 'HEAD:main')
    // Local main moves past origin/main without pushing; a pick against `main` would miss test two.
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 8: body(2) }) })
    checkout(dir, '-b', 'task')
    commit(dir, { 'tests/a.test.mjs': edit(A_TEST, { 8: body(2), 14: body(4) }) })
    expect(sampled(run(dir, 'pick')).sort()).toEqual(['tests/a.test.mjs:13', 'tests/a.test.mjs:7'])
  })

  it('AC9: a --base git cannot resolve prints the none line naming it, on stdout, and exits 0', () => {
    const r = run(changedBranch(), 'pick', '--base', 'nope')
    expect(r.status).toBe(0)
    expect(r.stdout.trimEnd()).toBe('**Sample:** none — base nope not found')
  })

  it('AC9: with no --base and no origin/main, the none line names origin/main and exits 0', () => {
    const r = run(changedBranch(), 'pick')
    expect(r.status).toBe(0)
    expect(r.stdout.trimEnd()).toBe('**Sample:** none — base origin/main not found')
  })
})

// Line 6 mentions a path and the word but is no sample line; lines 8, 16 and 17 are unanswered.
const SESSION = lines(
  '# Session 12',
  '',
  '## Task 1: Add the picker',
  '',
  '**Points:** 3',
  '- `notes.mjs:1` stays unanswered until someone reads it',
  '**Sample:**',
  '- `scripts/a.test.mjs:12` — test — unanswered — —',
  '- `scripts/a.test.mjs:30` — test — real — —',
  '- no changed function',
  '',
  '## Task 2: Mark the answers',
  '',
  '**Sample:**',
  '- `x.test.ts:3` — test — waste — word test',
  '- `x.test.ts:40` — test — unanswered — —',
  '- `lib/c.ts:7` — function — unanswered — —',
  '',
  '## Next Steps',
  '- Next task: issue 131',
)
const sessionFile = (text = SESSION) => {
  const file = join(mkdtempSync(join(tmpdir(), 'sample-session-')), 'session.md')
  writeFileSync(file, text)
  return file
}

describe('unanswered', () => {
  it('AC10: unanswered numbers the unanswered sample lines in file order, with line, task heading and kind', () => {
    expect(unanswered(SESSION)).toMatchObject([
      { n: 1, line: 8, task: 'Task 1: Add the picker', kind: 'test' },
      { n: 2, line: 16, task: 'Task 2: Mark the answers', kind: 'test' },
      { n: 3, line: 17, task: 'Task 2: Mark the answers', kind: 'function' },
    ])
  })

  it('AC10: unanswered skips a line that says unanswered but is not a sample line', () => {
    const text = lines('## Task 4: Probe', '- `notes.mjs:1` stays unanswered until someone reads it', '- `a.test.mjs:2` — test — unanswered — —')
    expect(unanswered(text)).toMatchObject([{ n: 1, line: 3, task: 'Task 4: Probe', kind: 'test' }])
  })
})

describe('mark', () => {
  it('AC11: mark rewrites line n with the mark and pattern and touches no other line', () => {
    expect(mark(SESSION, 2, 'waste', 'platform guarantee')).toBe(
      edit(SESSION, { 16: '- `x.test.ts:40` — test — waste — platform guarantee' }),
    )
  })

  it('AC11: mark with no pattern writes —', () => {
    expect(mark(SESSION, 3, 'real')).toBe(edit(SESSION, { 17: '- `lib/c.ts:7` — function — real — —' }))
  })

  it("AC11: mark counts only sample lines, so n 1 is the first sample and not a line that says unanswered", () => {
    expect(mark(SESSION, 1, "can't tell")).toBe(edit(SESSION, { 8: "- `scripts/a.test.mjs:12` — test — can't tell — —" }))
  })

  it('AC11: n is the position in the list at the call, so the rest renumber after each mark', () => {
    const both = edit(SESSION, { 8: '- `scripts/a.test.mjs:12` — test — real — —', 16: '- `x.test.ts:40` — test — waste — —' })
    expect(mark(mark(SESSION, 1, 'real'), 1, 'waste')).toBe(both)
    // /sample marks from the highest n down, so each n still names the line it named in the list.
    expect(mark(mark(mark(SESSION, 3, 'real'), 2, 'waste', 'word test'), 1, "can't tell")).toBe(
      edit(SESSION, {
        8: "- `scripts/a.test.mjs:12` — test — can't tell — —",
        16: '- `x.test.ts:40` — test — waste — word test',
        17: '- `lib/c.ts:7` — function — real — —',
      }),
    )
  })
})

describe('sample.mjs list and mark', () => {
  it('AC10: list prints each unanswered sample numbered, with its task heading and its question', () => {
    const r = run(process.cwd(), 'list', sessionFile())
    expect(r.status).toBe(0)
    expect(out(r)).toEqual([
      "1. Task 1: Add the picker — `scripts/a.test.mjs:12` — If this test fails, what's broken for a member?",
      "2. Task 2: Mark the answers — `x.test.ts:40` — If this test fails, what's broken for a member?",
      '3. Task 2: Mark the answers — `lib/c.ts:7` — What is this handling that I never asked for?',
    ])
  })

  it('AC10: list with nothing unanswered prints no unanswered samples and exits 0', () => {
    const answered = SESSION.replaceAll('— unanswered —', '— real —')
    const r = run(process.cwd(), 'list', sessionFile(answered))
    expect(r.status).toBe(0)
    expect(r.stdout.trimEnd()).toBe('no unanswered samples')
  })

  it("AC11: mark rewrites the file in place, taking can't tell and the pattern each as one argument", () => {
    const file = sessionFile()
    const r = run(process.cwd(), 'mark', file, '1', "can't tell", 'platform guarantee')
    expect(r.status).toBe(0)
    expect(readFileSync(file, 'utf8')).toBe(edit(SESSION, { 8: "- `scripts/a.test.mjs:12` — test — can't tell — platform guarantee" }))
  })

  it('AC11: any other mark exits non-zero naming real, waste and can\'t tell, and leaves the file unchanged', () => {
    const file = sessionFile()
    const r = run(process.cwd(), 'mark', file, '1', 'maybe')
    expect(r.status).not.toBe(0)
    const said = r.stdout + r.stderr
    for (const m of ['real', 'waste', "can't tell"]) expect(said).toContain(m)
    expect(readFileSync(file, 'utf8')).toBe(SESSION)
  })

  it('AC11: an n outside the list exits non-zero naming 1 and the list length, and leaves the file unchanged', () => {
    for (const n of ['0', '4']) {
      const file = sessionFile()
      const r = run(process.cwd(), 'mark', file, n, 'real')
      expect(r.status, `n ${n}`).not.toBe(0)
      const said = r.stdout + r.stderr
      expect(said, `n ${n}`).toMatch(/\b1\b/)
      expect(said, `n ${n}`).toMatch(/\b3\b/)
      expect(readFileSync(file, 'utf8')).toBe(SESSION)
    }
  })
})

describe('the counts', () => {
  it('AC8: TESTS = 2 and FUNCTIONS = 1 sit at the top of the script, with a comment to revisit after about 20 samples', () => {
    const src = readFileSync(SAMPLE, 'utf8').split('\n')
    const tests = src.findIndex((l) => /^(export\s+)?const\s+TESTS\s*=\s*2\b/.test(l))
    const functions = src.findIndex((l) => /^(export\s+)?const\s+FUNCTIONS\s*=\s*1\b/.test(l))
    expect(tests, 'const TESTS = 2').toBeGreaterThanOrEqual(0)
    expect(functions, 'const FUNCTIONS = 1').toBeGreaterThanOrEqual(0)
    const firstFunction = src.findIndex((l) => /^(export\s+)?(default\s+)?(async\s+)?function\b/.test(l))
    expect(Math.max(tests, functions), 'the counts come before any function').toBeLessThan(firstFunction)
    const near = src.slice(Math.max(0, Math.min(tests, functions) - 6), Math.max(tests, functions) + 1)
    expect(near.some((l) => /(\/\/|\/\*|^\s*\*).*\b20\b/.test(l)), 'a comment naming 20 beside the counts').toBe(true)
  })
})
