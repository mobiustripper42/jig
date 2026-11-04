/**
 * The gate runs from a repo root and classifies paths relative to it, so it is exercised as the
 * command it is — `cwd` is the fixture, not jig. Importing it instead would bind `isClaim`'s set of
 * top-level directories to jig's own, which is the one thing a fixture exists to vary.
 */

import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const JIG = process.cwd()
const GATE = join(JIG, 'scripts', 'check-shipped-citations.mjs')

const run = (cwd) => {
  try {
    return { out: execFileSync('node', [GATE], { cwd, encoding: 'utf8' }), status: 0 }
  } catch (e) {
    return { out: `${e.stdout ?? ''}${e.stderr ?? ''}`, status: e.status }
  }
}

/** A throwaway repo with a file-class registry and whichever files the case needs. */
const repo = (classes, files) => {
  const dir = mkdtempSync(join(tmpdir(), 'citations-'))
  mkdirSync(join(dir, '.claude'), { recursive: true })
  const entries = Object.entries(classes).map(([glob, cls]) => `  - "${glob}": ${cls}\n`).join('')
  writeFileSync(join(dir, '.claude', 'file-classes.yaml'), `file-classes:\n${entries}`)
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true })
    writeFileSync(join(dir, rel), text)
  }
  return dir
}

/**
 * The observed defect, planted.
 *
 * `its-dead` cited `scripts/keep-tape.mjs` bare. jig has that file, so jig's own `check:context`
 * was green and stayed green; muster received the skill and went red on a line jig wrote. The fix
 * was the `<jig>/` prefix, which `isClaim` already declines to treat as a claim about this repo.
 */
describe('a shipped file citing a path jig keeps to itself', () => {
  const CLASSES = {
    '.claude/skills/**': 'logic',
    'scripts/keep-tape.mjs': 'jig-only',
  }
  const skill = (citation) => ({
    '.claude/skills/its-dead/SKILL.md': `A \`SessionEnd\` hook (\`${citation}\`) copies the tape.\n`,
    'scripts/keep-tape.mjs': 'export const PLAIN = /^[\\w.-]+$/\n',
  })

  it('fails, naming the file, the line and the path', () => {
    const { out, status } = run(repo(CLASSES, skill('scripts/keep-tape.mjs')))
    expect(status).toBe(1)
    expect(out).toMatch(/\.claude\/skills\/its-dead\/SKILL\.md:1/)
    expect(out).toMatch(/scripts\/keep-tape\.mjs/)
  })

  it('passes once the citation carries the <jig>/ prefix', () => {
    const { out, status } = run(repo(CLASSES, skill('<jig>/scripts/keep-tape.mjs')))
    expect(status).toBe(0)
    expect(out).toMatch(/✓ shipped citations/)
  })

  it('says nothing about a jig-only file citing a jig-only path', () => {
    // Nobody downstream ever reads it, so there is no project for the path to be missing from.
    // Deliberately a doc rather than a script: `scripts/**` is skipped wholesale for a different
    // reason, and using one here would take this green without the class ever being consulted.
    const p = repo(
      { 'docs/**': 'jig-only', 'scripts/keep-tape.mjs': 'jig-only' },
      {
        'docs/ANALYSIS.md': 'The hook is `scripts/keep-tape.mjs`.\n',
        'scripts/keep-tape.mjs': 'export const PLAIN = 1\n',
      },
    )
    expect(run(p).status).toBe(0)
  })
})

/**
 * Three subtractions from the subject and target sets, each of which was a false finding on jig's
 * real corpus before it was made — seventeen of them between these and the two above.
 */
describe('what it deliberately does not ask about', () => {
  it('skips a path in a shipped script, where no gate resolves one', () => {
    // The shipped gates name muster's `docs/DEPLOY.md` and `docs/HARDWARE_BUILD_PLAN.md` in
    // comments as worked examples. A bare path in a code comment misleads a reader at worst; the
    // defect this gate exists for is a downstream gate going red, and none reads a comment.
    const p = repo(
      { 'scripts/check-docs.mjs': 'logic', 'docs/ANALYSIS.md': 'jig-only' },
      {
        'scripts/check-docs.mjs': '// the worked example is `docs/ANALYSIS.md`\n',
        'docs/ANALYSIS.md': '# notes\n',
      },
    )
    expect(run(p).status).toBe(0)
  })

  it("skips jig's own file at a path a scaffold installs to", () => {
    // jig's `.claude/CLAUDE-context.md` is jig's own context document; what a project receives is
    // `scaffold/claude/CLAUDE-context.md`. Judging the subject by its path alone calls jig's
    // documents templates — the DEC-S049 collision from the subject side.
    const p = repo(
      { '.claude/CLAUDE-context.md': 'context', 'scaffold/**': 'context', 'docs/ANALYSIS.md': 'jig-only' },
      {
        '.claude/CLAUDE-context.md': 'Read `docs/ANALYSIS.md` before changing the shape of jig.\n',
        'scaffold/claude/CLAUDE-context.md': '# context\n',
        'docs/ANALYSIS.md': '# notes\n',
      },
    )
    expect(run(p).status).toBe(0)
  })

  it('skips a path jig does not actually hold', () => {
    // The registry classifies by glob, so `docs/**: jig-only` answers for a document this repo has
    // never had as confidently as for its own. A path jig does not hold is not one jig keeps.
    //
    // `docs/ANALYSIS.md` is here only so that `docs/` is a real top-level directory. Without it
    // `isClaim` rejects the citation before the class is ever consulted and this test passes
    // against any implementation at all — which is what it did on the first writing.
    const p = repo(
      { '.claude/skills/**': 'logic', 'docs/**': 'jig-only' },
      {
        '.claude/skills/retro/SKILL.md': "muster's `docs/HARDWARE_BUILD_PLAN.md` is the example.\n",
        'docs/ANALYSIS.md': '# notes\n',
      },
    )
    expect(run(p).status).toBe(0)
  })
})

/**
 * THE EXEMPTIONS ARE MOST OF THIS GATE, and these are the cases that prove it.
 *
 * Without them the check produces 31 findings against jig's own corpus and every one is noise:
 * `docs/SPEC.md`, `docs/PROJECT_PLAN.md`, `docs/RETROSPECTIVES.md` and `docs/decisions/` are
 * jig-only IN JIG and present in every project, because a scaffold installs to a path jig also has
 * its own unrelated file at. That is the collision DEC-S049 exists about. A gate that cries wolf 31
 * times gets muted, and then it is worse than no gate.
 */
describe('the paths that are jig-only here and present everywhere', () => {
  it('says nothing about a path a scaffold installs to', () => {
    const p = repo(
      {
        '.claude/skills/**': 'logic',
        'scaffold/**': 'context',
        'docs/SPEC.md': 'jig-only',
      },
      {
        '.claude/skills/retro/SKILL.md': 'Check `docs/SPEC.md` before scoring.\n',
        'scaffold/docs/SPEC.md': '# SPEC\n',
        'docs/SPEC.md': "# jig's own spec\n",
      },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/SPEC/)
  })

  it('says nothing about a decision record path', () => {
    // Every project keeps its own records at `docs/decisions/`; jig's are excluded from the
    // template set entirely, so the class here says nothing about what a project has.
    const p = repo(
      { '.claude/skills/**': 'logic', 'docs/**': 'jig-only' },
      {
        '.claude/skills/retro/SKILL.md': 'It supersedes `docs/decisions/DEC-001-a-choice.md`.\n',
        'docs/decisions/DEC-001-a-choice.md': '---\nid: DEC-001\n---\n',
      },
    )
    expect(run(p).status).toBe(0)
  })
})

describe('being run where it cannot work', () => {
  it('says so and exits 2 rather than throwing a stack trace', () => {
    // It reads cwd, so the wrong directory is the easy mistake. Exit 2 rather than 1: "could not
    // run" and "ran and found something" are different answers, and a `verify` chain that reads
    // them as one learns nothing from either.
    const { out, status } = run(mkdtempSync(join(tmpdir(), 'no-registry-')))
    expect(status).toBe(2)
    expect(out).toMatch(/no \.claude\/file-classes\.yaml here/)
    expect(out).not.toMatch(/at Object|at Module|node:internal/)
  })
})

/**
 * A directory jig keeps, cited bare (issue 109). `CLAUDE.md` cited `docs/research/checker-roi/` and
 * passed, because the gate compared cited paths only against jig's files and a directory is not one.
 * Every project's `check:context` would have gone red at the next sync, on a line written here.
 *
 * A directory is jig's only when nothing under it reaches a project: every file there is `jig-only`
 * AND no scaffold installs anything under it. Anything looser flags `docs/` or `.claude/skills/`,
 * which every project has. Each case below that says nothing is the rule refusing to be looser; the
 * first one is what makes those silences mean anything.
 */
describe('a shipped file citing a directory jig keeps to itself', () => {
  const KEPT = {
    'docs/research/checker-roi/README.md': '# pilot\n',
    'docs/research/checker-roi/second-loop/tally.md': '# tally\n',
  }

  it('AC1: fails, naming the file, the line, the directory and the <jig>/ fix', () => {
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      { 'CLAUDE.md': '# Shell\n\nThe numbers are in `docs/research/checker-roi/`.\n', ...KEPT },
    )
    const { out, status } = run(p)
    expect(status).toBe(1)
    expect(out).toContain(
      'CLAUDE.md:3 — cites `docs/research/checker-roi/`, which jig keeps. Write `<jig>/docs/research/checker-roi/`',
    )
  })

  it('AC2: passes once the directory citation carries the <jig>/ prefix', () => {
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      { 'CLAUDE.md': 'The numbers are in `<jig>/docs/research/checker-roi/`.\n', ...KEPT },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).toMatch(/✓ shipped citations/)
  })

  it('AC6: matches the directory cited without its trailing slash', () => {
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      { 'CLAUDE.md': 'The numbers are in `docs/research/checker-roi`.\n', ...KEPT },
    )
    const { out, status } = run(p)
    expect(status).toBe(1)
    expect(out).toContain(
      'CLAUDE.md:1 — cites `docs/research/checker-roi`, which jig keeps. Write `<jig>/docs/research/checker-roi`',
    )
  })

  it('AC3: says nothing about a directory holding a file that ships, however deep', () => {
    // The shipped file is one level down on purpose: a rule that looks only at a directory's direct
    // children sees two `jig-only` files here and flags a path every project has.
    const p = repo(
      {
        'CLAUDE.md': 'logic',
        'docs/research/checker-roi/shared/GUIDE.md': 'logic',
        'docs/**': 'jig-only',
      },
      {
        'CLAUDE.md': 'The guide is under `docs/research/checker-roi/`.\n',
        ...KEPT,
        'docs/research/checker-roi/shared/GUIDE.md': '# guide\n',
      },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/checker-roi/)
  })

  it('AC4: says nothing about a directory a scaffold installs a file under, though every jig file there is jig-only', () => {
    // `scaffold/docs/research/README.md` lands as the project's `docs/research/README.md`, so the
    // directory exists in every project whatever jig's own copies of it are classed.
    const p = repo(
      { 'CLAUDE.md': 'logic', 'scaffold/**': 'context', 'docs/**': 'jig-only' },
      {
        'CLAUDE.md': 'Notes go in `docs/research/`.\n',
        ...KEPT,
        'scaffold/docs/research/README.md': '# research\n',
      },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/docs\/research/)
  })

  it('AC4: still says nothing about a bare docs/decisions/ citation', () => {
    // Every file there is `jig-only` and no scaffold installs under it, so the directory rule alone
    // would flag it. It is exempt today, and holding directories must not take that away.
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      {
        'CLAUDE.md': 'Records live in `docs/decisions/`.\n',
        'docs/decisions/DEC-001-a-choice.md': '---\nid: DEC-001\n---\n',
      },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/docs\/decisions/)
  })

  it('AC5: says nothing about a directory jig does not hold at all', () => {
    // `docs/**: jig-only` answers for `docs/deploy/` as confidently as for a directory jig has. A
    // path jig does not hold is not one jig keeps, for a directory as for a file.
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      { 'CLAUDE.md': "muster's runbooks are in `docs/deploy/`.\n", ...KEPT },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/docs\/deploy/)
  })

  it('AC5: does not hold a directory by a bare string prefix of one it does hold', () => {
    // `docs/res` is a string prefix of `docs/research/…` and holds nothing. Matching it as a prefix
    // flags a path jig has never had.
    const p = repo(
      { 'CLAUDE.md': 'logic', 'docs/**': 'jig-only' },
      { 'CLAUDE.md': 'Results go in `docs/res/`.\n', ...KEPT },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/docs\/res\//)
  })

  it('AC8: says nothing about a directory holding a file with no registry entry', () => {
    // An unclassified file has not been decided about, so it is not `jig-only`, so the directory is
    // not kept. Treating it as jig's would be this gate guessing — the opinion `subjects()` refuses.
    const p = repo(
      {
        'CLAUDE.md': 'logic',
        'docs/research/checker-roi/README.md': 'jig-only',
        'docs/research/checker-roi/second-loop/tally.md': 'jig-only',
      },
      {
        'CLAUDE.md': 'The numbers are in `docs/research/checker-roi/`.\n',
        ...KEPT,
        'docs/research/checker-roi/unfiled.md': '# nobody classed this\n',
      },
    )
    const { out, status } = run(p)
    expect(status).toBe(0)
    expect(out).not.toMatch(/checker-roi/)
  })
})

/**
 * The live assertion, and the one that would actually catch a regression in the exemptions: jig's
 * real corpus, checked as it stands. It is clean today — PR #41 fixed the only bare citation that
 * ever shipped — so this pins that the exemptions are wide enough for the real registry, not just
 * for the hand-rolled ones above.
 */
describe('jig itself', () => {
  it('ships no bare citation of a path it keeps', () => {
    const { out, status } = run(JIG)
    expect(status).toBe(0)
    expect(out).toMatch(/✓ shipped citations/)
  })
})
