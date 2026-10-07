/**
 * The file-class registry, read once and shared.
 *
 * `.claude/file-classes.yaml` says which of jig's files a project receives and which jig keeps to
 * itself. Two scripts need that answer — `drift.mjs`, which compares a project's copies against
 * jig's, and `check-shipped-citations.mjs`, which asks whether a shipped file points at a path the
 * project will not have. Neither can import the other: `drift.mjs` runs its whole comparison at
 * module scope, which is why even its own tests shell out to it (`scripts/drift.test.mjs`).
 *
 * So the parser lives here rather than in either of them. A second copy of a registry reader is the
 * shape this repo keeps finding defects in — two answers to one question, and the one you are not
 * reading is the stale one.
 *
 * Nothing here exits or prints. A caller that cannot find the registry owns its own message, so
 * `drift.mjs` keeps saying `drift: …` and the gate keeps saying its own thing.
 */

import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Every `- "<glob>": <class>` line under the `file-classes:` key, in file order.
 *
 * ORDER IS THE CONTRACT, not an artifact of parsing. First match wins, so the carve-outs above a
 * glob are what keep it from swallowing them — `scripts/check-*.mjs: logic` would otherwise claim
 * the jig-only gate sitting right beside the shipped ones. The registry's own header says this;
 * returning an array rather than an object is what keeps it true.
 *
 * Throws rather than exiting: see the module note.
 */
export function fileClasses(jigRoot) {
  const cfg = join(jigRoot, '.claude', 'file-classes.yaml')
  if (!existsSync(cfg)) throw new Error(`no .claude/file-classes.yaml at ${jigRoot}`)
  return parseFileClasses(readFileSync(cfg, 'utf8'))
}

/**
 * The same parse over the registry's text. `sync.mjs` reads the registry out of jig's `origin/main`
 * rather than off disk, so an unmerged registry edit in the jig checkout cannot change what a sync
 * carries — only merged jig crosses.
 */
export function parseFileClasses(text) {
  const body = text.split(/^file-classes:/m)[1] ?? ''
  const out = []
  for (const line of body.split('\n')) {
    const m = line.match(/^\s*-\s*"([^"]+)"\s*:\s*([\w-]+)/)
    if (m) out.push({ glob: m[1], cls: m[2] })
  }
  return out
}

/**
 * `**` is parked under a placeholder so the single-`*` pass can't chew it in half, then restored.
 * That placeholder used to be a raw NUL byte, which made `drift.mjs` BINARY to git: every diff of
 * it printed `Binary files a/… and b/… differ`, so no change to it was ever reviewable in a PR and
 * @code-review read none of them — including the change that introduced the NUL. A printable token
 * costs nothing and keeps the file text.
 */
export const classifier = (classes) => (rel) => classes.find(({ glob }) => {
  const re = new RegExp('^' + glob.replace(/[.+^${}()|[\]\\]/g, '\\$&').replace(/\*\*/g, '@@GLOBSTAR@@').replace(/\*/g, '[^/]*').replace(/@@GLOBSTAR@@/g, '.*') + '$')
  return re.test(rel)
})?.cls

/**
 * The roots jig ships templates from. Under seeds this was one directory, `dev/claude/`, and every
 * template lived beneath it. DEC-J001 removed that prefix, so the template set is now a list of the
 * real paths jig ships from.
 *
 * `.claude/settings.local.json` is never a template — it is per-machine and gitignored — and
 * `.claude/file-classes.yaml` is this registry rather than something a project holds. Both are
 * excluded here rather than classified, because a registry entry saying "ignore this" still has to
 * be read and kept true; a file the filter never yields cannot go stale.
 *
 * `docs/` is a root because two files in it are `logic` — `AGENTS.md` and `CHEATSHEET.md` describe
 * the skills and agents, which are identical in every project. They were briefly filed under
 * `scaffold/`, and the walk not reaching `docs/` left both registry entries unreachable.
 *
 * `docs/decisions/` is excluded: it is `check-decisions`' subject, and a project's record has
 * nothing to do with jig's. THE EXCLUSION WAS RIGHT ABOUT RECORDS AND WRONG ABOUT THE SCHEMA SITTING
 * BESIDE THEM. `decision-record.schema.json` is the rules every project validates its own records
 * against, read from the PROJECT's `docs/decisions/`. Excluding the directory outright meant no
 * project ever received it, so an adopting repo could not add a decision record at all.
 *
 * Here rather than in `drift.mjs`, where it was written, because `sync.mjs` asks the same question
 * and a second copy of the answer is the shape the module note above warns about.
 */
export const TEMPLATE_ROOTS = ['CLAUDE.md', '.claude', 'scripts', 'scaffold', 'docs']
const NOT_TEMPLATES = new Set(['.claude/settings.local.json', '.claude/file-classes.yaml'])
const EXCLUDED_PREFIXES = ['docs/decisions/']
const EXCLUSION_EXCEPTIONS = new Set(['docs/decisions/decision-record.schema.json'])

export const isTemplate = (rel) =>
  TEMPLATE_ROOTS.some((root) => rel === root || rel.startsWith(`${root}/`)) &&
  !NOT_TEMPLATES.has(rel) &&
  (EXCLUSION_EXCEPTIONS.has(rel) || !EXCLUDED_PREFIXES.some((p) => rel.startsWith(p)))

/** A gate jig ships: `scripts/check-<name>.mjs`, classed `logic`. */
export const isShippedGate = (rel, classOf) => /^scripts\/check-[\w-]+\.mjs$/.test(rel) && classOf(rel) === 'logic'

/**
 * A project's `package.json` scripts, or `{}` when there is none to read. A file that cannot be
 * parsed is not this module's finding to make: every other tool in the project will say so louder,
 * and guessing at a malformed file is how a differ starts having opinions.
 */
export function packageScripts(text) {
  if (text == null) return {}
  try {
    return JSON.parse(text).scripts ?? {}
  } catch {
    return {}
  }
}

/**
 * The names of `package.json` scripts that run a shipped gate and that `verify` never calls.
 *
 * Known limit, stated rather than discovered: the parse is `npm run <name>` chains and nothing
 * else. A gate reached indirectly through another script reads as absent, and so would one wired
 * with `npm-run-all`, `run-s`, `yarn <script>` or bare `pnpm <script>` — that spelling would flag
 * every gate at once, which is at least loud rather than silent. Acceptable while the fleet is
 * plain `npm run` chains; revisit on the first project that is not.
 */
export function notRunGates(scripts, gatePaths) {
  const referenced = new Set([...(scripts.verify ?? '').matchAll(/npm run ([\w:-]+)/g)].map((m) => m[1]))
  const out = []
  for (const [name, cmd] of Object.entries(scripts)) {
    if (name === 'verify') continue
    if (![...gatePaths].some((g) => cmd.includes(g))) continue
    if (!referenced.has(name)) out.push(name)
  }
  return out
}

/**
 * jig-side path → project-side path.
 *
 * Identity for every live file, which is DEC-J001 stated as code: jig runs `.claude/skills/x` and a
 * project runs `.claude/skills/x`, and they are the same bytes because there is one copy. The
 * scaffolds are the only paths that move, because a placeholder's home in jig is not where it lands
 * — `scaffold/docs/SPEC.md` installs as the project's `docs/SPEC.md`, which jig also has a
 * completely different file at.
 *
 * `scaffold/templates/**` deliberately has no mapping. It installs to a path inside the project's
 * source tree that nothing here can know (`src/components/VersionTag.tsx` in a Next.js app, and
 * nowhere at all in a tool project). It is `context` class, so nothing ever compares it and the
 * missing mapping is never reached — but stating it here is cheaper than rediscovering it the first
 * time somebody reclassifies that glob.
 */
export function toProject(rel) {
  if (rel.startsWith('scaffold/claude/')) return rel.replace('scaffold/claude/', '.claude/')
  if (rel.startsWith('scaffold/docs/')) return rel.replace('scaffold/docs/', 'docs/')
  return rel
}

/**
 * The project paths a scaffold installs to. jig keeps its own, unrelated file at four of them —
 * `scaffold/docs/SPEC.md` installs as the project's `docs/SPEC.md`, where jig keeps the spec for
 * jig, and the same for PROJECT_PLAN, RETROSPECTIVES and FUTURE_IDEAS — and jig's copy is
 * `jig-only`. Without this set, every project's own spec reads as a stray copy of jig's: four
 * confident false findings per repo, on exactly the basename pair DEC-S049 proved must never be
 * compared.
 *
 * Derived through `toProject` rather than listed, so it cannot disagree with the mapping it
 * inverts. `scaffold/templates/**` has no mapping and contributes its own unmapped path, a key
 * nothing can match — inert by construction.
 */
export const scaffoldTargets = (templates) => new Set(templates.filter((r) => r.startsWith('scaffold/')).map(toProject))
