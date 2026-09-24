// `drift.mjs` runs its whole comparison at module scope, so it is exercised as the command it is
// rather than by importing pieces of it. That is the honest shape for a CLI: these assertions are
// about what an operator sees, which is the only interface it has.

import { describe, expect, it } from 'vitest'
import { execFileSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const JIG = process.cwd()

/** Run drift against a project, returning `{ out, status }` rather than throwing on exit 1. */
const run = (args) => {
  try {
    return { out: execFileSync('node', ['scripts/drift.mjs', ...args], { cwd: JIG, encoding: 'utf8' }), status: 0 }
  } catch (e) {
    return { out: `${e.stdout ?? ''}${e.stderr ?? ''}`, status: e.status }
  }
}

/** A throwaway project holding whichever files the case needs. */
const project = (files) => {
  const dir = mkdtempSync(join(tmpdir(), 'driftproj-'))
  for (const [rel, text] of Object.entries(files)) {
    mkdirSync(join(dir, rel, '..'), { recursive: true })
    writeFileSync(join(dir, rel), text)
  }
  return dir
}

describe('the self-target refusal', () => {
  it('refuses to compare jig with itself, and says why', () => {
    const { out, status } = run(['--jig', JIG, JIG])
    expect(status).toBe(0)
    expect(out).toMatch(/nothing to compare/)
    expect(out).toMatch(/one copy of every file it ships/)
  })
})

describe('argument handling', () => {
  it('rejects a second project path rather than silently using the first', () => {
    // `settings-policy.mjs` guards the same shape. Two answers to one question in one repo is
    // how an operator learns not to trust either.
    const { out, status } = run(['--jig', JIG, '/tmp', '/usr'])
    expect(status).toBe(2)
    expect(out).toMatch(/expected at most one project path/)
  })

  it('rejects an unknown flag', () => {
    expect(run(['--jig', JIG, '--wat']).status).toBe(2)
  })

  it('refuses a --jig that is not a jig checkout', () => {
    const { out, status } = run(['--jig', '/tmp', project({})])
    expect(status).toBe(2)
    expect(out).toMatch(/is not a jig checkout/)
  })
})

describe('classification', () => {
  it('reports a logic file that differs', () => {
    const p = project({ 'docs/CHEATSHEET.md': 'not what jig ships\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/docs\/CHEATSHEET\.md\s+differs/)
  })

  it('reaches docs/, where two shared files live', () => {
    // TEMPLATE_ROOTS had no `docs`, so `docs/AGENTS.md: logic` and `docs/CHEATSHEET.md: logic`
    // were unreachable — the two entries existed and nothing ever evaluated them.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/docs\/AGENTS\.md/)
    expect(out).toMatch(/docs\/CHEATSHEET\.md/)
  })

  it('ships the decision schema, which every project\'s gate reads', () => {
    // `docs/**: jig-only` swallowed it, so no project ever received the file — while
    // `check-decisions.mjs` reads it from the PROJECT's `docs/decisions/` the moment a record
    // declares `schema: 1`. Not latent: a new v1 record failed with "declares `schema: 1` but
    // docs/decisions/decision-record.schema.json does not exist", and a record without the key
    // failed as not-in-baseline, so there was no way to add a decision record at all.
    // Anchored to the bucket, not just the path. A bare path match passes when the file lands in
    // UNCLASSIFIED too — which is exactly what happens if the registry line is reverted while the
    // exclusion exception stays, so the loose version would have gone green on half the fix.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/logic\s+docs\/decisions\/decision-record\.schema\.json\s+absent here/)
  })

  it('does not ask a project for the output style, and flags a copy it holds anyway', () => {
    // The style file lives in jig and is read by every session on the machine through a symlink
    // at `~/.claude/output-styles/one-piece.md` (DEC-J007). A project copy is one more place a
    // stale version can sit, and the version being iterated in jig never reaches it. That is why
    // this is `jig-only` and why the finding is NOT YOURS rather than a diff — the fix is
    // deletion, never a sync.
    const clean = run(['--jig', JIG, project({})])
    expect(clean.out).not.toMatch(/output-styles\/one-piece\.md/)

    const held = run(['--jig', JIG, project({ '.claude/output-styles/one-piece.md': 'stale' })])
    expect(held.out).toMatch(/jig-only\s+\.claude\/output-styles\/one-piece\.md/)
  })

  it('notices a style the project added that jig does not ship', () => {
    // Written when the registry said every project carries every style — a closed-set claim the
    // script neither enforced nor observed, which is the shape this repo keeps finding defects in.
    // The registry no longer says that (DEC-J007: no project holds a copy), but the detector
    // still matters: nothing stops a project writing its own style, the directory is writable,
    // and `settings.local.json` can point `outputStyle` at any name. Skills and agents have the
    // same detector, so a style going unmentioned would be asymmetric as well as wrong.
    const p = project({ '.claude/output-styles/house.md': '---\nname: House\n---\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/\.claude\/output-styles\/house\.md\s+not a template/)
  })

  it('never asks a project for a jig-only script', () => {
    const { out } = run(['--jig', JIG, project({})])
    expect(out).not.toMatch(/scripts\/drift\.mjs/)
    expect(out).not.toMatch(/scripts\/settings-policy\.mjs/)
  })

  it('never asks a project for jig\'s test suites', () => {
    // `scripts/check-*.mjs: logic` captured `check-*.test.mjs` on first match, asserting every
    // project holds jig's tests byte-identical. A project runs the gates, not their tests.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).not.toMatch(/\.test\.mjs/)
  })

  it('leaves nothing unclassified', () => {
    // An unclassified file is the absence of an answer, not an answer. Every one is a jig-side
    // gap: a template nobody decided the sync rule for.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).not.toMatch(/UNCLASSIFIED/)
  })

  it('reports a missing presence-class file without comparing its contents', () => {
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/MISSING/)
    expect(out).toMatch(/\.claude\/settings\.json/)
    expect(out).toMatch(/Contents are yours and are never compared/)
  })

  it('reports an absent doc-check.json, because a shipped gate throws without it', () => {
    // `.claude/doc-check.json` carries check-docs's rosters and exemptions and is project-owned,
    // but check-docs.mjs throws when it is absent — so presence is mandatory and context (which
    // hides absence) was the wrong class. An empty project must show it MISSING.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/MISSING[\s\S]*\.claude\/doc-check\.json/)
  })

  it('does not report a present doc-check.json as drift, however different its contents', () => {
    const p = project({ '.claude/doc-check.json': '{"repo":"someone/else","rosters":{}}\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/doc-check\.json\s+differs/)
  })

  it('does not report a context-class file as drift, however different it is', () => {
    const p = project({ '.claude/CLAUDE-context.md': 'entirely this project\'s own words\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/CLAUDE-context\.md\s+differs/)
  })
})

/**
 * The second half of "present in the project, absent from the templates".
 *
 * The `skills`/`agents`/`output-styles` loop asks: the project has it, jig does not. This asks the
 * other one: jig HAS it, jig keeps it, and the project holds a copy anyway. Neither subsumes the
 * other, and only the first was ever built — so four copies of jig's own gate test suites sat in
 * muster reporting `nothing differs` until a full `verify` went red on them.
 */
describe('a jig-only file the project holds a copy of', () => {
  it('reports it in its own block, not among the harmless absences', () => {
    // The bucket is the assertion. A bare path also appears in UNCLASSIFIED and in "also absent",
    // and matching one of those would take this test green against the wrong mechanism entirely —
    // which is exactly how PR #6's test passed while half its fix was missing.
    const p = project({ 'scripts/check-context.test.mjs': 'stale copy of a jig test\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/NOT YOURS/)
    expect(out).toMatch(/jig-only\s+scripts\/check-context\.test\.mjs/)
  })

  it('says nothing about a project script jig has no file at', () => {
    // `scripts/**` is a jig-only CATCH-ALL, so classifying project paths directly would call every
    // script a project wrote a retired jig file. muster's `gen-icons.mjs` and soundings'
    // `split-decisions.mjs` are the real cases.
    const p = project({ 'scripts/gen-icons.mjs': 'export default 1\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/gen-icons/)
  })

  it('says nothing about a doc whose template is a scaffold', () => {
    // jig's own `docs/SPEC.md` is jig-only and sits at the path `scaffold/docs/SPEC.md` installs
    // to. They are unrelated documents sharing a basename — the pair DEC-S049 proved must not be
    // compared. Four docs collide this way; without the shadow set every project gets four
    // confident false findings on its first run.
    const p = project({ 'docs/SPEC.md': "this project's own spec\n" })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/NOT YOURS/)
  })

  it('says nothing about a project\'s decision records', () => {
    // This one pins something narrower than its siblings, and saying so is the point: records are
    // stripped from `templates` by EXCLUDED_PREFIXES long before the new loop runs, so what is
    // guarded here is that the loop reuses that filtered array rather than walking the project
    // itself. Re-walking is the obvious-looking implementation, and it would light up every record
    // in the corpus.
    const p = project({ 'docs/decisions/DEC-001-a-choice.md': '---\nid: DEC-001\n---\n' })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/DEC-001/)
  })

  it('says nothing about the generated index or the project\'s own dictionary', () => {
    // Verified on disk: muster and soundings both hold all four. They were classed `jig-only`,
    // which claims a project never has one — false for every project that has ever run
    // `gen:decisions` or registered a term.
    const p = project({
      'docs/DECISIONS.md': '# Decisions\n',
      'docs/decisions-baseline.txt': 'DEC-001 abc123\n',
      'docs/dictionary.yml': 'terms: []\n',
      'docs/DICTIONARY.md': '# Dictionary\n',
    })
    const { out } = run(['--jig', JIG, p])
    expect(out).not.toMatch(/NOT YOURS/)
  })

  it('does not displace the question the skills loop asks', () => {
    // Both blocks at once: a style jig does not ship, and a jig test suite the project should not
    // hold. One check answering both would have to drop one of them.
    const p = project({
      '.claude/output-styles/house.md': '---\nname: House\n---\n',
      'scripts/check-docs.test.mjs': 'stale\n',
    })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/\.claude\/output-styles\/house\.md\s+not a template/)
    expect(out).toMatch(/jig-only\s+scripts\/check-docs\.test\.mjs/)
  })
})

describe('what is deliberately not here', () => {
  it('does not gate by project type, because there is nothing to gate', () => {
    // Carried from seeds and removed: every manifest entry was `context` class, which this script
    // skips before absence is considered, so gating could not change any outcome. Rebuild it when
    // a `logic`-class file genuinely applies to one project type.
    const tool = run(['--jig', JIG, project({ '.claude/project-type': 'tool\n' })])
    const webapp = run(['--jig', JIG, project({ '.claude/project-type': 'webapp\n' })])
    const stripName = (o) => o.replace(/driftproj-\w+/g, 'P')
    expect(stripName(tool.out)).toBe(stripName(webapp.out))
  })
})

/**
 * A gate the project HOLDS and never RUNS.
 *
 * Muster synced `check-denied.mjs` with jig v6 and never added it to `verify`. Every other gate
 * was wired by the commit that created it; this one was not, and nothing noticed for three days —
 * drift reported the file byte-identical the whole time, which it was. The bytes were never the
 * question.
 *
 * IT HAS TO BE HERE RATHER THAN IN A GATE, and that is the whole argument: a check that runs
 * inside `verify` cannot detect that `verify` does not run it. Only something looking from outside
 * closes that hole, and drift is the only thing that looks from outside.
 */
describe('a gate the project holds but never runs', () => {
  const pkg = (scripts) => JSON.stringify({ name: 'p', scripts }, null, 2)
  const GATES = {
    'check:decisions': 'node scripts/check-decisions.mjs',
    'check:denied': 'node scripts/check-denied.mjs',
  }

  it('reports a gate that is defined and left out of verify', () => {
    const p = project({
      'package.json': pkg({ ...GATES, verify: 'npm run check:decisions && npm run test' }),
    })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/NOT RUN/)
    expect(out).toMatch(/check:denied/)
    // Matched against the real `  gate    <name>` line. The first spelling of this assertion
    // looked for an em dash the output never prints, so it could not fail whatever the code did.
    expect(out).not.toMatch(/gate\s+check:decisions\b/)
  })

  it('says nothing when every gate it defines is in verify', () => {
    const p = project({
      'package.json': pkg({ ...GATES, verify: 'npm run check:decisions && npm run check:denied' }),
    })
    expect(run(['--jig', JIG, p]).out).not.toMatch(/NOT RUN/)
  })

  it('reports every gate when there is no verify script at all', () => {
    const p = project({ 'package.json': pkg(GATES) })
    const { out } = run(['--jig', JIG, p])
    expect(out).toMatch(/NOT RUN/)
    expect(out).toMatch(/check:decisions/)
    expect(out).toMatch(/check:denied/)
  })

  it('says nothing about a project with no package.json', () => {
    // A markdown-only or domain project. Nothing to wire, so nothing to report.
    expect(run(['--jig', JIG, project({})]).out).not.toMatch(/NOT RUN/)
  })

  it('ignores a script that is not one of the gates jig ships', () => {
    // drift enumerates what a project's copies differ from jig. A project's own tooling being
    // absent from verify is the project's business and not a difference from anything here.
    const p = project({
      'package.json': pkg({ ...GATES, lint: 'eslint .', verify: 'npm run check:decisions && npm run check:denied' }),
    })
    // Scoped to the real `  gate    <name>` row, not a bare /lint/ over the whole output. The
    // provenance header prints jig's branch name, so the loose spelling failed on a branch that
    // happened to be called `task/adopt-musters-lint-fix` — a gate whose colour depends on what
    // you named your branch. Same defect the assertion at the end of the previous block fixed.
    expect(run(['--jig', JIG, p]).out).not.toMatch(/gate\s+lint\b/)
  })
})

describe('which jig it compared against', () => {
  /**
   * A muster session opened and its briefing said `scripts/check-docs.mjs` differed from jig's
   * template. The file was byte-identical to jig's `main` — the difference was an unfinished
   * branch in the jig checkout. Every repo's session-open briefing reads this output, so
   * "your copy is stale" and "somebody has work in progress over there" printed the same, and
   * only the first is something a reader can act on.
   */
  it('names the branch and revision in the header', () => {
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/^jig at \S+ [0-9a-f]{7,}/m)
  })
})

/**
 * The all-clear line, and the two findings it used to print over the top of.
 *
 * `nothing differs.` was guarded on `rows`, `missing` and `unclassified` and not on `notRun` or
 * `notYours`, so a project whose only findings were an unwired gate or a jig-only copy got the
 * all-clear as its headline and the finding underneath it. That is the arrangement that let
 * `check-denied` sit switched off in muster for three days while every drift run read clean.
 */
describe('the all-clear line', () => {
  /**
   * A MINIMAL JIG, because the real one cannot make a project clean.
   *
   * Every other case in this file compares against `JIG`, where a throwaway project is absent two
   * dozen templates — so `rows` is never empty, the all-clear is unreachable, and a test written
   * that way would pass against the broken code while asserting nothing. Holding `jig-version` is
   * the whole test for a jig checkout (`drift.mjs:87`), so a fake one is three files.
   */
  const fakeJig = (classes, files) => {
    const dir = mkdtempSync(join(tmpdir(), 'driftjig-'))
    writeFileSync(join(dir, 'jig-version'), '6\n')
    mkdirSync(join(dir, '.claude'), { recursive: true })
    const entries = Object.entries(classes).map(([glob, cls]) => `  - "${glob}": ${cls}\n`).join('')
    writeFileSync(join(dir, '.claude', 'file-classes.yaml'), `file-classes:\n${entries}`)
    for (const [rel, text] of Object.entries(files)) {
      mkdirSync(join(dir, rel, '..'), { recursive: true })
      writeFileSync(join(dir, rel), text)
    }
    return dir
  }

  const SHARED = { 'docs/CHEATSHEET.md': 'the one file both sides hold\n' }

  it('prints when the project really has nothing to report', () => {
    const jig = fakeJig({ 'docs/CHEATSHEET.md': 'logic' }, SHARED)
    expect(run(['--jig', jig, project(SHARED)]).out).toMatch(/nothing differs/)
  })

  it('is withheld when the only finding is a gate the project never runs', () => {
    const files = { ...SHARED, 'scripts/check-foo.mjs': 'a gate\n' }
    const jig = fakeJig({ 'docs/CHEATSHEET.md': 'logic', 'scripts/check-foo.mjs': 'logic' }, files)
    const p = project({
      ...files,
      'package.json': JSON.stringify({
        name: 'p',
        scripts: { 'check:foo': 'node scripts/check-foo.mjs', verify: 'npm run test' },
      }),
    })
    const { out } = run(['--jig', jig, p])
    // Both halves. Asserting only the absence would go green if the fixture quietly stopped
    // producing a finding at all, which is the same way a test passes against the wrong mechanism.
    expect(out).toMatch(/gate\s+check:foo\b/)
    expect(out).not.toMatch(/nothing differs/)
  })

  it('is withheld when the only finding is a jig-only file the project holds', () => {
    const files = { ...SHARED, 'scripts/keep-tape.mjs': 'jig keeps this one\n' }
    const jig = fakeJig({ 'docs/CHEATSHEET.md': 'logic', 'scripts/keep-tape.mjs': 'jig-only' }, files)
    const { out } = run(['--jig', jig, project(files)])
    expect(out).toMatch(/jig-only\s+scripts\/keep-tape\.mjs/)
    expect(out).not.toMatch(/nothing differs/)
  })
})
