#!/usr/bin/env node
// Docs must not spell a command the permission policy denies.
//
// THE FAILURE THIS EXISTS FOR, and it is the reason the check is worth its own file.
//
// Seeds' `CLAUDE.md` denied `Bash(npx *)` fleet-wide and, in the same file, warned:
//
//   "Docs that spell commands as `npx <thing>` are the real trap — they read as sanctioned,
//    and the failure is a permission refusal rather than an error, so it looks like the agent
//    being difficult rather than the doc being stale."
//
// Seeds then shipped a context template containing eleven `npx` invocations, into every webapp
// project. The repo described the trap, in prose, and walked into it — which is the whole
// argument of this rebuild in one artifact. Nothing caught it for months; it was found in
// 2026-08-27 by someone happening to grep.
//
// It is a nastier failure than a wrong command, because of HOW it fails. A wrong command errors
// and gets fixed. A denied command produces a refusal, mid-task, that reads as the agent being
// obstructive — so the doc keeps its authority and the agent loses trust it should not lose.
//
// SCOPE is what jig ships and what jig loads: `CLAUDE.md`, `.claude/CLAUDE-context.md`,
// `docs/*.md` and `scaffold/**`. Not decision records, which quote denied commands to explain why
// they are denied, and not this file, which has to name `npx` to describe itself. Both are the
// same exemption: text ABOUT a deny is not an instruction to run one.
//
// Usage:  node scripts/check-denied.mjs
// Exit:   0 = no shipped doc spells a denied command; 1 = at least one does.

import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const POLICY = '.claude/settings.json'

/**
 * Only `Bash(...)` rules produce a command spelling. A path-scoped tool deny — the `Read` and
 * `Edit` rules covering env files and ssh keys — has no command form to find in prose, so
 * including it would mean hunting for the string `.env` in documents that legitimately discuss
 * env files. That is noise, and noise is what kills gates.
 *
 * ONLY WILDCARD RULES. `Bash(bash)` and `Bash(sh)` are exact-match rules denying the bare
 * interactive shell, and treating them as prefixes made the gate match the English word "Bash" —
 * it reported `- **JSON parsing in Bash:** Prefer …`, a line that is not a command at all. A rule
 * with no `*` denies one exact string and cannot be looked for in prose.
 */
export function deniedCommands(policyPath = POLICY) {
  if (!existsSync(policyPath)) return []
  const { permissions } = JSON.parse(readFileSync(policyPath, 'utf8'))
  return (permissions?.deny ?? [])
    .map((rule) => rule.match(/^Bash\((.+\*)\)$/)?.[1])
    .filter(Boolean)
    .map((pattern) => pattern.replace(/\s*\*+\s*$/, '').trim())
    .filter((prefix) => prefix && !prefix.startsWith('/') && prefix.length > 2)
}

/**
 * A command spelling in prose: inside a fenced block, inside backticks, or at the start of a line.
 *
 * Deliberately NOT a bare substring scan. `rm -rf` appears in this comment; "never run `npx`"
 * appears in guidance that is doing the right thing. The rule is that the command must look
 * INVOKED — first thing in a code span, a fenced line, or a shell prompt — not merely mentioned.
 *
 * MENTION VS INVOCATION IS STRUCTURAL, NOT A WORD LIST, and getting there took two wrong turns
 * worth recording because both produced a confidently wrong verdict.
 *
 * First attempt skipped any line containing a negative word. That silenced the gate on the exact
 * file it was built to catch — `npx playwright test  # … do not override` INVOKES the command,
 * and a trailing comment about worker counts made it look like guidance.
 *
 * Second attempt required the negation to come BEFORE the command. That broke the other way on
 * the shell's own text: **`npx` is denied fleet-wide** names the command first and forbids it
 * after, so a paragraph doing exactly the right thing was reported as a defect. Three lines of
 * seeds' `CLAUDE.md` were flagged for forbidding the very commands they forbid.
 *
 * The distinction neither version could see is that a code span holding ONLY the bare command is
 * naming it, and one holding arguments is running it:
 *
 *   `npx`                                  a mention — the subject of a sentence
 *   `sed -i`                               a mention
 *   `npx playwright test`                  an invocation
 *   `<e.g. npx playwright test …>`         an invocation a project is told to copy
 *
 * Inside a fenced block the question does not arise: a line beginning with the command is a
 * command, whatever the comment after it says.
 */
const spellings = (text, cmd) => {
  const out = []
  const esc = cmd.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const lines = text.split('\n')
  let fenced = false
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (/^\s*```/.test(line)) { fenced = !fenced; continue }

    if (fenced) {
      if (new RegExp('^\\s*(?:\\$\\s*)?' + esc + '\\b', 'i').test(line)) out.push(i + 1)
      continue
    }

    // Every code span on the line, so one mention does not mask an invocation later in the same
    // sentence. `[^`\n]*` keeps a span from running past its closing backtick into the next.
    for (const [, span] of line.matchAll(/`([^`\n]*)`/g)) {
      // A permission rule quoted as itself. `Bash(npx *)` is the deny entry, and the wildcard
      // reads as an argument, so the paragraph that documents a deny gets reported for it — which
      // is how a gate ends up flagging the one file doing the right thing.
      if (/^\s*(?:Bash|Read|Edit|Write|Glob|Grep)\s*\(/.test(span)) continue
      const m = new RegExp('\\b' + esc + '\\b(.*)$', 'i').exec(span)
      if (!m) continue
      // Arguments after the command make it an invocation. A trailing `>` or quote is the
      // placeholder's own punctuation, not an argument.
      if (m[1].replace(/[>'")\s.]+$/, '').trim()) { out.push(i + 1); break }
    }
  }
  return out
}

const walk = (dir) =>
  !existsSync(dir)
    ? []
    : readdirSync(dir).flatMap((e) => {
        const p = join(dir, e)
        return statSync(p).isDirectory() ? walk(p) : p.endsWith('.md') ? [p] : []
      })

/** Shipped or always-loaded. `docs/decisions/` is excluded: a record explaining a deny quotes it. */
export function scope() {
  return [
    'CLAUDE.md',
    '.claude/CLAUDE-context.md',
    ...(existsSync('docs') ? readdirSync('docs').filter((f) => f.endsWith('.md')).map((f) => `docs/${f}`) : []),
    ...walk('scaffold'),
    ...walk('.claude/skills'),
    ...walk('.claude/agents'),
  ].filter((p) => existsSync(p))
}

export function check(policyPath = POLICY, files = scope()) {
  const denied = deniedCommands(policyPath)
  const problems = []
  for (const path of files) {
    const text = readFileSync(path, 'utf8')
    for (const cmd of denied) {
      for (const line of spellings(text, cmd)) {
        problems.push(`${path}:${line} — spells \`${cmd}\`, which the permission policy denies`)
      }
    }
  }
  return { denied, problems }
}

if (process.argv[1]?.endsWith('check-denied.mjs')) {
  if (!existsSync(POLICY)) {
    console.error(`✗ denied commands — ${POLICY} is missing; nothing to check against`)
    process.exit(1)
  }
  const { denied, problems } = check()
  if (!problems.length) {
    console.log(`✓ denied commands — no shipped doc spells any of the ${denied.length} denied command prefixes`)
    process.exit(0)
  }
  console.error(`✗ denied commands — ${problems.length} problem(s):\n`)
  for (const p of problems) console.error(`  ${p}`)
  console.error(
    `\nA denied command in a doc reads as sanctioned and fails as a permission refusal, so it looks\n` +
      `like the agent being difficult rather than the doc being stale. Spell it as an npm script or\n` +
      `a direct path, or say plainly that it is denied.\n`
  )
  process.exit(1)
}
