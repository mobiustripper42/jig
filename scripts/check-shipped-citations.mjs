#!/usr/bin/env node
/**
 * No file a project receives may cite a path jig keeps to itself. jig-only, and it has to be.
 *
 * `its-dead` cited `scripts/keep-tape.mjs` bare. jig has that script, so jig's `check:context` was
 * green and would have stayed green forever; muster received the skill and went red on a line jig
 * wrote. It surfaced there, looked like muster's problem, and cost a muster session to chase back.
 *
 * THAT IS WHY THIS CANNOT BE A SHIPPED GATE. The defect does not exist in jig — every citation here
 * resolves, because jig holds the file it points at. It exists only in the copy, in somebody else's
 * repo, after the sync. A check running downstream finds it far too late (that check is
 * `check:context`, and it is not broken — it correctly reports a path that is not there). Only
 * something running HERE, with the registry in hand, can refuse to ship it.
 *
 * The fix for a finding is the `<jig>/` prefix, which the skills already use: `<jig>/scripts/…`
 * reads the same to a person and stops being a claim about the local repo, because `isClaim`
 * declines anything containing `<`.
 *
 * Reads cwd, not a path argument. `isClaim` binds its set of top-level directories at import, so
 * the repo under test has to BE the working directory — the tests run it with `cwd` set rather
 * than passing a root.
 *
 *   npm run check:shipped-citations
 */

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { classifier, fileClasses, toProject } from './lib/file-classes.mjs'
import { PATHISH, isClaim } from './check-context.mjs'

/** Same roots `drift.mjs` walks, for the same reason: they are the paths jig ships from. */
const TEMPLATE_ROOTS = ['CLAUDE.md', '.claude', 'scripts', 'scaffold', 'docs']
const NOT_TEMPLATES = new Set(['.claude/settings.local.json', '.claude/file-classes.yaml'])

const walk = (dir, base = dir) => {
  let out = []
  let entries
  try {
    entries = readdirSync(dir)
  } catch {
    return []
  }
  for (const e of entries) {
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out = out.concat(walk(p, base))
    else out.push(p.slice(base.length + 1))
  }
  return out
}

const templates = () =>
  TEMPLATE_ROOTS.flatMap((root) => {
    try {
      return statSync(root).isDirectory() ? walk(root).map((r) => `${root}/${r}`) : [root]
    } catch {
      return []
    }
  }).filter((rel) => !NOT_TEMPLATES.has(rel))

/**
 * THE EXEMPTIONS ARE MOST OF THIS GATE. Without them it reports 31 findings against jig's own
 * corpus and all 31 are noise, which is the failure `check-context.mjs` already carries a comment
 * about: a check that cries wolf gets muted, and a muted check is worse than none.
 *
 * Both exemptions are the same fact from two directions — a path can be jig-only HERE and present
 * in every project.
 *
 * 1. A scaffold installs to a path jig also has its own unrelated file at. `scaffold/docs/SPEC.md`
 *    lands as the project's `docs/SPEC.md`; jig's `docs/SPEC.md` is a different document and is
 *    jig-only. Six paths collide this way as of writing — the four docs DEC-S049 argued about, plus
 *    `.claude/CLAUDE-context.md` and `.claude/doc-check.json` — and the count is here to orient a
 *    reader, not to be relied on. The set is derived through `toProject` rather than hand-listed,
 *    so it cannot disagree with the mapping it inverts, and it grows on its own.
 * 2. Decision records. Every project keeps its own at `docs/decisions/`; jig's are excluded from
 *    the template set outright, so this repo's class for that prefix says nothing about what a
 *    project has. `drift.mjs` excludes the same prefix for the same reason.
 */
const scaffoldTargets = (all) => new Set(all.filter((r) => r.startsWith('scaffold/')).map(toProject))

const exemptions = (scaffolded) => (target) => {
  const clean = target.replace(/\/+$/, '')
  return scaffolded.has(clean) || clean === 'docs/decisions' || clean.startsWith('docs/decisions/')
}

/**
 * The files a project receives AND whose paths something there will try to resolve. Three
 * subtractions, each of which was a false finding before it was made.
 *
 * `scripts/**` — the shipped `check-*`/`gen-*` gates are full of backticked paths in comments, and
 * they are prose: `docs/DEPLOY.md` and `docs/HARDWARE_BUILD_PLAN.md` name muster's documents as
 * worked examples. No gate resolves a path in a code comment, so a bare one there misleads a reader
 * at worst and breaks nothing. Eleven of the first seventeen findings were this.
 *
 * The scaffold targets — jig's OWN file at a path a scaffold installs to. jig's
 * `.claude/CLAUDE-context.md` is jig's context document; what a project receives is
 * `scaffold/claude/CLAUDE-context.md`. Same DEC-S049 collision as the target-side exemption, from
 * the other end: judging the subject by its path classifies jig's own documents as templates.
 *
 * `docs/decisions/` — a project's records are its own and never came from here.
 */
const subjects = (all, scaffolded, classOf) =>
  all.filter((rel) => {
    const cls = classOf(rel)
    /**
     * `undefined` is drift's finding, not this one. A file with no registry entry has not been
     * decided about, and guessing that it ships would make this gate report on jig's own untracked
     * files — which is how a narrow check acquires the opinion it was built to avoid.
     */
    if (cls === undefined || cls === 'jig-only') return false
    if (rel.startsWith('scripts/')) return false
    if (rel.startsWith('docs/decisions/')) return false
    return !scaffolded.has(rel)
  })

export function check() {
  let classes
  try {
    classes = fileClasses('.')
  } catch {
    // The lib throws rather than exiting, so every caller owns its own message (see its module
    // note). Without this the gate answered a missing registry with a raw Node stack trace — which
    // is what a reader gets for running it from anywhere but a repo root, since it reads cwd.
    throw new Error('no .claude/file-classes.yaml here — run this from the root of a jig checkout')
  }
  const classOf = classifier(classes)
  const all = templates()
  const scaffolded = scaffoldTargets(all)
  const exempt = exemptions(scaffolded)
  const here = new Set(all)
  const failures = []

  for (const rel of subjects(all, scaffolded, classOf)) {
    let text
    try {
      text = readFileSync(rel, 'utf8')
    } catch {
      continue
    }
    text.split('\n').forEach((line, i) => {
      for (const m of line.matchAll(PATHISH)) {
        const target = m[1]
        if (!isClaim(target)) continue
        const clean = target.replace(/\/+$/, '')
        if (exempt(target)) continue
        /**
         * A path jig does not actually hold is not a path jig KEEPS. The registry classifies by
         * glob, so `docs/**: jig-only` answers for `docs/HARDWARE_BUILD_PLAN.md` — a muster
         * document this repo has never had — as confidently as for its own. Six of the first
         * seventeen findings were a glob answering about a file that exists nowhere here.
         */
        if (!here.has(clean)) continue
        if (classOf(clean) !== 'jig-only') continue
        failures.push(`${rel}:${i + 1} — cites \`${target}\`, which jig keeps. Write \`<jig>/${target}\``)
      }
    })
  }
  return failures
}

if (process.argv[1]?.endsWith('check-shipped-citations.mjs')) {
  let failures
  try {
    failures = check()
  } catch (e) {
    // Exit 2, as `drift.mjs` does for the same condition: "this could not run" is a different
    // answer from "this ran and found something", and a `verify` chain reading them as one
    // learns nothing from either.
    console.error(`check-shipped-citations: ${e.message}`)
    process.exit(2)
  }
  if (failures.length) {
    console.error(`✗ shipped citations — ${failures.length} bare reference${failures.length === 1 ? '' : 's'} to a path jig keeps:\n`)
    for (const f of failures) console.error(`  ${f}`)
    console.error('\n  A project receives these files and does not receive the paths. Its check:context goes red on a line written here.\n')
    process.exit(1)
  }
  console.log('✓ shipped citations — no file a project receives cites a path jig keeps to itself')
}
