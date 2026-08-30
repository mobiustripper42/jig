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

  it('ships output styles, which every project carries and none turns on by default', () => {
    // The style file is shared vocabulary; the choice of which is ON lives in
    // `.claude/settings.local.json`, gitignored and per-machine. Without a registry entry this
    // path is UNCLASSIFIED — caught by the sibling test, but only as an absence, and the point
    // here is that a project is positively told it is missing the file.
    const { out } = run(['--jig', JIG, project({})])
    expect(out).toMatch(/logic\s+\.claude\/output-styles\/one-piece\.md\s+absent here/)
  })

  it('notices a style the project added that jig does not ship', () => {
    // The registry says every project carries every style. A closed-set claim the script neither
    // enforces nor observes is the shape this repo keeps finding defects in — and skills and
    // agents already got this detector, so a style going unmentioned was asymmetric as well as
    // wrong. Nothing stops a project writing one: the directory is writable and
    // `settings.local.json` can point `outputStyle` at any name.
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
