// .claude/skills/build-task/cost.mjs: what a /build-task run spent, from the session's own
// transcripts, for the receipt. The tests live here, not beside the script, because a project
// receives the skill folder and runs the script, never its tests.

import { describe, expect, it } from 'vitest'
import { spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { PLACEHOLDER, format, load, tally, writeReceipt } from '../.claude/skills/build-task/cost.mjs'

const COST = join(process.cwd(), '.claude', 'skills', 'build-task', 'cost.mjs')
const T0 = Date.parse('2026-10-18T12:00:00Z')
const at = (min) => new Date(T0 + min * 60e3).toISOString()
/** One assistant reply as the transcript logs it. */
const reply = (min, id, output, { model = 'claude-opus-5-5', cacheRead = 0, cacheWrite = 0, input = 0 } = {}) => ({
  type: 'assistant',
  timestamp: at(min),
  message: { id, model, usage: { input_tokens: input, output_tokens: output, cache_read_input_tokens: cacheRead, cache_creation_input_tokens: cacheWrite } },
})
const user = (min) => ({ type: 'user', timestamp: at(min), message: { role: 'user', content: 'x' } })

describe('tally', () => {
  it('sums output per role, counting a streamed reply once at its final usage', () => {
    const main = [user(0), reply(1, 'm1', 10), reply(1, 'm1', 40), reply(2, 'm2', 60, { cacheRead: 1000 })]
    const subs = [
      { type: 'test-writer', entries: [reply(3, 's1', 500)] },
      { type: 'test-writer', entries: [reply(4, 's2', 300)] },
      { type: 'implementer', entries: [reply(5, 's3', 200, { model: 'claude-sonnet-5-5' })] },
    ]
    const t = tally(main, subs, T0)
    expect(t.roles.map((r) => [r.role, r.model, r.output, r.runs])).toEqual([
      ['lead', 'opus', 100, 1],
      ['test-writer', 'opus', 800, 2],
      ['implementer', 'sonnet', 200, 1],
    ])
    expect(t.total.output).toBe(1100)
    expect(t.total.cacheRead).toBe(1000)
  })

  it('counts nothing logged before the run started', () => {
    const main = [reply(-30, 'old', 9999), reply(1, 'new', 5)]
    const subs = [{ type: 'code-review', entries: [reply(-20, 'olds', 7777)] }]
    const t = tally(main, subs, T0)
    expect(t.total.output).toBe(5)
    expect(t.roles.map((r) => r.role)).toEqual(['lead'])
  })

  it('counts active time across every transcript, and no gap of five minutes or more', () => {
    // Lead 0→2, idle while an agent works 2→6 (the agent's log fills it), then a 30-minute wait.
    const main = [user(0), reply(2, 'a', 1), reply(6, 'b', 1), reply(36, 'c', 1), reply(37, 'd', 1)]
    const subs = [{ type: 'implementer', entries: [reply(3, 's', 1), reply(4, 't', 1)] }]
    expect(tally(main, subs, T0).activeMin).toBe(7)
  })
})

describe('format', () => {
  it('prints a total line, then one line per role', () => {
    const t = tally(
      [reply(0, 'm', 42_400, { cacheRead: 12_800_000 }), reply(10, 'n', 0)],
      [
        { type: 'test-writer', entries: [reply(1, 's1', 40_000, { cacheRead: 4_000_000 })] },
        { type: 'test-writer', entries: [reply(2, 's2', 2_300, { cacheRead: 700_000 })] },
      ],
      T0,
    )
    expect(format(t)).toEqual([
      '84.7k output tokens, 2 active min',
      '  lead          opus     42.4k out   12.8M cache read',
      '  test-writer   opus     42.3k out    4.7M cache read   (2 runs)',
    ])
  })

  it('widens the role column for a long role name, and ignores synthetic entries when naming the model', () => {
    const t = tally(
      [reply(0, 'syn', 0, { model: '<synthetic>' }), reply(1, 'm', 1000)],
      [{ type: 'general-purpose', entries: [reply(2, 's', 500, { model: 'claude-sonnet-5-5' }), reply(3, 'z', 0, { model: '<synthetic>' }), reply(3, 'z2', 0, { model: '<synthetic>' })] }],
      T0,
    )
    expect(format(t).slice(1)).toEqual([
      '  lead             opus      1.0k out       0 cache read',
      '  general-purpose  sonnet     500 out       0 cache read',
    ])
  })

  it('keeps every number to five characters, so the columns line up', () => {
    const t = tally([reply(0, 'm', 633_300, { cacheRead: 633_300 })], [], T0)
    expect(format(t)[1]).toBe('  lead          opus      633k out    633k cache read')
  })
})

describe('load and the command', () => {
  const fixture = () => {
    const home = mkdtempSync(join(tmpdir(), 'cost-home-'))
    const cwd = '/work/alpha'
    const dir = join(home, '.claude', 'projects', '-work-alpha')
    mkdirSync(join(dir, 'sid', 'subagents'), { recursive: true })
    const lines = (es) => `${es.map((e) => JSON.stringify(e)).join('\n')}\n`
    writeFileSync(join(dir, 'sid.jsonl'), lines([user(0), reply(1, 'm', 1500)]))
    writeFileSync(join(dir, 'sid', 'subagents', 'agent-x.jsonl'), lines([reply(2, 's', 500)]))
    writeFileSync(join(dir, 'sid', 'subagents', 'agent-x.meta.json'), JSON.stringify({ agentType: 'implementer' }))
    return { home, cwd }
  }

  it("finds the session's transcript and its subagents' by the session id", () => {
    const { home, cwd } = fixture()
    const { main, subagents } = load({ home, cwd, sessionId: 'sid' })
    expect(main).toHaveLength(2)
    expect(subagents.map((s) => s.type)).toEqual(['implementer'])
  })

  it('falls back to finding the session id in any project directory, when the derived name misses', () => {
    const { home } = fixture()
    const { main } = load({ home, cwd: '/somewhere/else', sessionId: 'sid' })
    expect(main).toHaveLength(2)
  })

  it('says so, rather than printing a zero-cost run, when nothing was logged since the start', () => {
    const { home, cwd } = fixture()
    const r = spawnSync(process.execPath, [COST, '--since', at(60), '--cwd', cwd], {
      env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 'sid' },
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe(`unavailable — nothing logged since ${at(60)}; check the start time`)
  })

  it('prints the cost lines for a run', () => {
    const { home, cwd } = fixture()
    const r = spawnSync(process.execPath, [COST, '--since', at(0), '--cwd', cwd], {
      env: { ...process.env, HOME: home, CLAUDE_CODE_SESSION_ID: 'sid' },
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    expect(r.stdout.split('\n')[0]).toBe('2.0k output tokens, 2 active min')
  })

  it('says why, and exits 0, when it cannot find the transcript — a receipt is never blocked on it', () => {
    const r = spawnSync(process.execPath, [COST, '--since', at(0)], {
      env: { ...process.env, CLAUDE_CODE_SESSION_ID: '' },
      encoding: 'utf8',
    })
    expect(r.status).toBe(0)
    expect(r.stdout.trim()).toBe('unavailable — no CLAUDE_CODE_SESSION_ID in this shell')
  })
})

// Haul's receipts carried the cost in four hand-typed shapes (PR 24's columns, PR 89's, 93's and
// 67's bullets), so no two runs could be compared without retyping them. The script writes its
// own lines into the receipt file, and the Lead never types them.
describe('--receipt', () => {
  const run = (args, env) => spawnSync(process.execPath, [COST, ...args], { env: { ...process.env, ...env }, encoding: 'utf8' })
  const setup = (body) => {
    const home = mkdtempSync(join(tmpdir(), 'cost-receipt-'))
    const dir = join(home, '.claude', 'projects', '-work-alpha')
    mkdirSync(join(dir, 'sid'), { recursive: true })
    writeFileSync(join(dir, 'sid.jsonl'), `${[user(0), reply(1, 'm', 1500)].map((e) => JSON.stringify(e)).join('\n')}\n`)
    const file = join(home, 'receipt.md')
    if (body !== undefined) writeFileSync(file, body)
    return { home, file, env: { HOME: home, CLAUDE_CODE_SESSION_ID: 'sid' } }
  }
  const receipt = ['```', '/build-task receipt — issue #1', '  review routes — 0 to test-writer, 0 to implementer, 0 fixed by Lead', PLACEHOLDER, '```', ''].join('\n')

  it('replaces the placeholder line with the cost lines, inside the fence', () => {
    const { file, env } = setup(receipt)
    const r = run(['--since', at(0), '--cwd', '/work/alpha', '--receipt', file], env)
    expect(r.status).toBe(0)
    const lines = readFileSync(file, 'utf8').split('\n')
    expect(lines.slice(3)).toEqual(['  cost          — 1.5k output tokens, 1 active min', '  lead          opus      1.5k out       0 cache read', '```', ''])
  })

  it('appends the lines at the end, and says so, when the file has no placeholder', () => {
    const { file, env } = setup('receipt\n')
    const r = run(['--since', at(0), '--cwd', '/work/alpha', '--receipt', file], env)
    expect(r.status).toBe(0)
    expect(readFileSync(file, 'utf8')).toBe('receipt\n1.5k output tokens, 1 active min\n  lead          opus      1.5k out       0 cache read\n')
    expect(r.stdout).toContain(`no cost placeholder in ${file}; appended at the end`)
  })

  it('writes the unavailable line in place of the placeholder, and exits 0', () => {
    const { file, env } = setup(receipt)
    const r = run(['--since', at(0), '--receipt', file], { ...env, CLAUDE_CODE_SESSION_ID: '' })
    expect(r.status).toBe(0)
    expect(readFileSync(file, 'utf8').split('\n')[3]).toBe('  cost          — unavailable — no CLAUDE_CODE_SESSION_ID in this shell')
  })

  it('prints the same lines to stdout with or without --receipt', () => {
    const { file, env } = setup(receipt)
    const plain = run(['--since', at(0), '--cwd', '/work/alpha'], env)
    const withFile = run(['--since', at(0), '--cwd', '/work/alpha', '--receipt', file], env)
    expect(withFile.stdout).toBe(plain.stdout)
  })

  it('says so, and exits 0, when the receipt file does not exist', () => {
    const { file, env } = setup()
    const r = run(['--since', at(0), '--cwd', '/work/alpha', '--receipt', file], env)
    expect(r.status).toBe(0)
    expect(r.stdout).toContain(`unavailable — no receipt file at ${file}`)
  })
})

describe('writeReceipt', () => {
  it('reports which it did', () => {
    const file = join(mkdtempSync(join(tmpdir(), 'cost-wr-')), 'r.md')
    writeFileSync(file, `a\n${PLACEHOLDER}\nb\n`)
    expect(writeReceipt(file, ['x', 'y'])).toBe('replaced')
    expect(readFileSync(file, 'utf8')).toBe('a\n  cost          — x\ny\nb\n')
    expect(writeReceipt(file, ['z'])).toBe('appended')
  })
})
