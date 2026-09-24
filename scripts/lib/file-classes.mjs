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
  const body = readFileSync(cfg, 'utf8').split(/^file-classes:/m)[1] ?? ''
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
