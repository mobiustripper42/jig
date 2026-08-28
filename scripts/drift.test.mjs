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
