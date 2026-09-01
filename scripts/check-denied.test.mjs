// Tests for the denied-command gate.
//
// This script had no suite for its first day, which is how a code review found five holes in one
// regex. Every case below was one of them, or one of the two false-positive shapes that earlier
// attempts at the rule produced. The policy is a fixture, not the live one: the gate must be
// testable without depending on which rules the operator happens to have today.

import { describe, expect, it } from 'vitest'
import { mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { check, deniedCommands, runbookProblems, unsearchable } from './check-denied.mjs'

const dir = mkdtempSync(join(tmpdir(), 'denied-'))

const POLICY = join(dir, 'settings.json')
writeFileSync(
  POLICY,
  JSON.stringify({
    permissions: {
      deny: [
        'Bash(npx *)',
        'Bash(curl *)',
        'Bash(npm i *)',
        'Bash(sed -i *)',
        'Bash(rm -rf ~*)',
        'Bash(rm -rf ..*)',
        'Bash(bash)', // exact, no wildcard — must not become a prefix
        'Bash(* -m pip install *)', // leading wildcard — unsearchable
        'Read(**/.env*)', // not a command at all
      ],
    },
  }),
)

/** One throwaway document, checked against the fixture policy. Returns the lines that fired. */
const fired = (text) => {
  const path = join(dir, `doc-${Math.abs(text.length * 2654435761) % 1e9}.md`)
  writeFileSync(path, text)
  return check(POLICY, [path]).problems.map((p) => Number(p.match(/:(\d+)/)[1]))
}

describe('deniedCommands', () => {
  it('takes wildcard rules only, so the English word "Bash" is never a command prefix', () => {
    // `Bash(bash)` denies the bare interactive shell. Read as a prefix it matched
    // `- **JSON parsing in Bash:** Prefer …`, a line that is not a command.
    const cmds = deniedCommands(POLICY)
    expect(cmds).toContain('npx')
    expect(cmds).not.toContain('bash')
  })

  it('drops rules whose pattern starts with a wildcard rather than counting them', () => {
    // `Bash(* -m pip install *)` has no command name to look for. It was unmatchable and still
    // included in the "N denied command prefixes" the run reports, overstating coverage.
    expect(unsearchable('* -m pip install')).toBe(true)
    expect(deniedCommands(POLICY).some(unsearchable)).toBe(false)
  })

  it('ignores path-scoped tool denies, which have no command form', () => {
    expect(deniedCommands(POLICY).join(' ')).not.toMatch(/env/)
  })
})

describe('invocations inside a code block', () => {
  it('catches a command at the start of a fenced line', () => {
    expect(fired('```\nnpx playwright test\n```\n')).toEqual([2])
  })

  it('catches one after a shell operator, which anchoring at column zero missed', () => {
    expect(fired('```\ncd app && npx playwright test\n```\n')).toEqual([2])
    expect(fired('```\nnpm ci | tee log && curl https://x.test\n```\n')).toEqual([2])
  })

  it('catches one after a YAML `run:` key, the shape a CI snippet uses', () => {
    expect(fired('```yaml\n- run: npm i left-pad\n```\n')).toEqual([2])
  })

  it('catches one after a shell prompt', () => {
    expect(fired('```\n$ curl https://example.test\n```\n')).toEqual([2])
  })

  it('reads a `~~~` fence, not only a backtick fence', () => {
    expect(fired('~~~\nnpx vitest run\n~~~\n')).toEqual([2])
  })

  it('reads a four-space indented block, which is a code block with no fence at all', () => {
    expect(fired('Text.\n\n    npx tsc --noEmit\n')).toEqual([3])
  })

  it('matches a prefix ending in punctuation, where a word boundary cannot', () => {
    // `rm -rf ~` and `rm -rf ..` are the derived prefixes. A trailing `\b` cannot match before
    // the `/` that always follows in real use, so both destructive rules were undetectable in
    // their canonical spelling.
    expect(fired('```\nrm -rf ~/.cache/foo\n```\n')).toEqual([2])
    expect(fired('```\nrm -rf ../build\n```\n')).toEqual([2])
  })
})

describe('mentions, which are not invocations', () => {
  it('leaves a bare command in a code span alone', () => {
    expect(fired('The `npx` entry is denied, and `sed -i` is too.\n')).toEqual([])
  })

  it('flags a code span carrying arguments', () => {
    expect(fired('Run `npx playwright test` to check.\n')).toEqual([1])
  })

  it('leaves a permission rule quoted as itself alone', () => {
    // `Bash(npx *)` is the deny entry; the wildcard reads as an argument, so the paragraph that
    // documents a deny was reported for it — the one file doing the right thing.
    expect(fired('The deny entry is `Bash(npx *)`, and `Bash(curl *)` beside it.\n')).toEqual([])
  })

  it('leaves a negated invocation alone when the negation is right before it', () => {
    expect(fired('Never run `npx playwright test` — use the pinned binary.\n')).toEqual([])
    expect(fired("Do not use `curl https://x.test` here.\n")).toEqual([])
  })

  it('still flags an invocation whose line merely contains a negative word later', () => {
    // The first version of the rule skipped any line with a negative word in it, which silenced
    // the gate on the file it was written for: the comment is about worker counts, not the command.
    expect(fired('```\nnpx playwright test  # workers=1 by config — do not override\n```\n')).toEqual([2])
  })
})

describe('the run itself', () => {
  it('reports the file and line, so a finding can be acted on', () => {
    const path = join(dir, 'located.md')
    writeFileSync(path, 'Fine.\n\n```\ncurl https://x.test\n```\n')
    const [p] = check(POLICY, [path]).problems
    expect(p).toMatch(/located\.md:4 — spells `curl`, which the permission policy denies/)
  })

  it('finds every distinct command on a line rather than stopping at the first', () => {
    expect(fired('```\nnpx a\ncurl b\nsed -i c\n```\n')).toEqual([2, 3, 4])
  })
})

/**
 * A runbook is documentation aimed at a PERSON, and this gate was built against jig's own docs,
 * which have none. Muster is the first repo where it met one: nine `curl` smoke checks against a
 * live domain and three quick-start installs, in `docs/DEPLOY.md`, `docs/HOSTING_MIGRATION.md`
 * and `docs/RUNNING.md`. There is no rewording that clears them — the match is structural on
 * purpose — so the only way out was deleting the code fence, which makes the runbook worse.
 *
 * The exemption goes in `.claude/doc-check.json`, which is project-owned and already carries
 * per-file exemptions with reasons under `historical`. Reusing that file rather than inventing a
 * marker syntax is the point: one place a project declares what its gates may skip.
 *
 * WHAT STOPS IT ROTTING is that an entry which exempts nothing FAILS. `check-docs.mjs` names the
 * risk out loud — "reusing an exemption because it happens to silence the right lines is how an
 * exemption list stops meaning anything" — and a list that must justify itself every run cannot
 * quietly outlive the lines it was written for.
 */
describe('a runbook a person follows', () => {
  const conf = (runbooks) => {
    const p = join(dir, `cfg-${Math.random().toString(36).slice(2)}.json`)
    writeFileSync(p, JSON.stringify({ runbooks }))
    return p
  }
  const doc = (name, text) => {
    const p = join(dir, name)
    writeFileSync(p, text)
    return p
  }
  const SMOKE = '# Deploy\n\n```bash\ncurl https://example.test/api/health\n```\n'

  it('does not fail a file the project declared as a runbook', () => {
    const path = doc('rb-ok.md', SMOKE)
    expect(check(POLICY, [path], conf({ [path]: 'post-deploy smoke check, run by a person' })).problems).toEqual([])
  })

  it('still fails the same document when it is not declared', () => {
    // The negative control. Without it, "exempt" and "the gate stopped working" look identical.
    const path = doc('rb-undeclared.md', SMOKE)
    expect(check(POLICY, [path], conf({})).problems).toHaveLength(1)
  })

  it('exempts only the file named, not its neighbours', () => {
    const a = doc('rb-a.md', SMOKE)
    const b = doc('rb-b.md', SMOKE)
    expect(check(POLICY, [a, b], conf({ [a]: 'a reason' })).problems).toHaveLength(1)
  })

  it('fails an entry that exempts nothing, so the list cannot outlive its lines', () => {
    const path = doc('rb-clean.md', '# Deploy\n\nNothing denied here.\n')
    expect(runbookProblems(conf({ [path]: 'a reason' }), [path], POLICY)).toEqual([
      expect.stringMatching(/exempts nothing/),
    ])
  })

  it('fails an entry whose reason is missing or blank', () => {
    const path = doc('rb-noreason.md', SMOKE)
    expect(runbookProblems(conf({ [path]: '   ' }), [path], POLICY)).toEqual([expect.stringMatching(/reason/)])
  })

  it('fails an entry naming a file that does not exist', () => {
    expect(runbookProblems(conf({ 'docs/GONE.md': 'a reason' }), [], POLICY)).toEqual([
      expect.stringMatching(/does not exist/),
    ])
  })

  it('is silent when a project declares no runbooks at all', () => {
    // Every project that has never needed this — jig and soundings today.
    expect(runbookProblems(conf({}), [], POLICY)).toEqual([])
  })
})
