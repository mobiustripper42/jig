// Tests for the decision-record generator and validator (DEC-S036).
//
// These scripts decide whether the build passes — a guard nobody tests is a guard nobody
// trusts, and this suite exists because the originating project shipped a backwards-amendment
// check that was silently inert for five ids and nobody could tell.
//
// Almost everything here runs against hand-written fixtures, not the real record, so a
// legitimate edit to a decision never turns these red. The one exception is the last block,
// which asserts the real record is valid: that IS the thing being guarded, and it is cheap.
//
// Fixtures declare their own id families rather than borrowing the project's, so the suite
// tests the MECHANISM and stays green whatever `docs/decisions/_config.json` says.
//
// Drop this file if the project has no test runner — the scripts stand alone.

import { describe, expect, it } from 'vitest'
import {
  TOPICS,
  compareDecisionIds,
  parseFrontmatter,
  rank,
  referencePattern,
  renderDecision,
  renderSpec,
  sectionNumber,
  specSections,
  stripSpecBlocks,
} from './gen-decisions-index.mjs'
import {
  RECORD_DIRS,
  check,
  fingerprint,
  frontmatterBlock,
  hasSchemaKey,
  idOf,
  legacyVerdict,
  recordBody,
  sizeOf,
  supersessionProblems,
  validateSchemaRecord,
} from './check-decisions.mjs'

const MAX = 2000

/** A three-family record with the families sitting between DEC-014 and DEC-015 — the shape
 *  a project gets when a side family predates the numeric main line. */
const FAM = { MSG: 14.5, ROLE: 14.5, DATA: 14.5 }

const TOPIC = TOPICS[0]

const fm = `---
id: DEC-042
title: "A title with \\"quotes\\" and: a colon"
topic: ${JSON.stringify(TOPIC)}
---

## DEC-042: A title

Body.
`

describe('parseFrontmatter', () => {
  it('reads scalars, unescaping quotes and tolerating colons in values', () => {
    const { meta } = parseFrontmatter(fm)
    expect(meta.id).toBe('DEC-042')
    expect(meta.title).toBe('A title with "quotes" and: a colon')
    expect(meta.topic).toBe(TOPIC)
  })

  it('rejects a retired `amends:` list rather than parsing it', () => {
    // DEC-S036 (amended 2026-08-16) retired the DEC→DEC leg. `amends` is no longer a known
    // list key, so its items have no open list to attach to and the parser throws. That is
    // the intended migration signal: a record still carrying the old frontmatter fails
    // loudly on the next gate run instead of having its declarations silently ignored.
    const stale = fm.replace('---\n\n## DEC-042', '---\n\n## DEC-042')
    const withAmends = stale.replace(
      `topic: ${JSON.stringify(TOPIC)}`,
      `topic: ${JSON.stringify(TOPIC)}\namends:\n  - id: DEC-020\n    relation: refines\n    scope: "one leg only"`,
    )
    expect(() => parseFrontmatter(withAmends)).toThrow(/list item outside any list/)
  })

  it('returns the body without the frontmatter block', () => {
    expect(parseFrontmatter(fm).body.trim().startsWith('## DEC-042:')).toBe(true)
  })

  it('throws rather than silently skipping a file it cannot parse', () => {
    expect(() => parseFrontmatter('no frontmatter here')).toThrow(/no frontmatter/)
    expect(() => parseFrontmatter('---\nid: DEC-001\n')).toThrow(/unterminated/)
    expect(() => parseFrontmatter('---\n!! junk\n---\n\nbody\n')).toThrow(/unparseable/)
  })
})

describe('renderDecision', () => {
  const d = {
    id: 'DEC-020',
    title: 'A title',
    topic: TOPIC,
    body: '## DEC-020: A title\n\nOriginal body.\n',
  }

  it('passes the body through untouched — an `## Amendment` section is prose, not output', () => {
    const amended = {
      ...d,
      body: '## DEC-020: A title\n\nOriginal body.\n\n## Amendment, 2026-08-16 (operator) — flipped\n\nWhat changed.\n',
    }
    const out = renderDecision(amended)
    expect(out).toContain('## Amendment, 2026-08-16 (operator) — flipped')
    expect(out).toContain('Original body.')
  })

  it('is a fixed point — regenerating rewrites nothing', () => {
    const once = renderDecision(d)
    const twice = renderDecision({ ...d, body: parseFrontmatter(once).body })
    expect(twice).toBe(once)
  })

  it('is a fixed point when the body has a double blank line of its own', () => {
    // The old stripBanner collapsed blank lines globally, which made the generator a
    // non-fixed-point here: gen:decisions wrote the file, check:decisions re-generated,
    // collapsed the unrelated gap, and called the file it just wrote stale. Nothing
    // touches the body now, but the guarantee is worth keeping pinned.
    const gappy = { ...d, body: '## DEC-020: A title\n\nFirst para.\n\n\nSecond para, after a wide gap.\n' }
    const once = renderDecision(gappy)
    const twice = renderDecision({ ...gappy, body: parseFrontmatter(once).body })
    expect(twice).toBe(once)
    expect(once).toContain('First para.\n\n\nSecond para')
  })

  it('escapes quotes in the title so the frontmatter it writes parses back', () => {
    const out = renderDecision({ ...d, title: 'has "quotes"' }, [])
    expect(parseFrontmatter(out).meta.title).toBe('has "quotes"')
  })
})

describe('amends_spec parsing', () => {
  const withSpec = `---
id: DEC-061
title: "A title"
topic: ${JSON.stringify(TOPIC)}
amends_spec:
  - section: "2.4"
    scope: "the confirm step is gone"
  - section: "2.6"
    scope: "the acceptance is now automatic"
---

## DEC-061: A title

Body.
`

  it('reads the list, keyed on the open list key rather than the first field', () => {
    const { meta } = parseFrontmatter(withSpec)
    expect(meta.amends_spec).toEqual([
      { section: '2.4', scope: 'the confirm step is gone' },
      { section: '2.6', scope: 'the acceptance is now automatic' },
    ])
  })

  it('gives a decision with no list an empty list, not undefined', () => {
    const { meta } = parseFrontmatter('---\nid: DEC-001\ntitle: "T"\ntopic: "X"\n---\n\nBody.\n')
    expect(meta.amends_spec).toEqual([])
  })

  it('throws on a list item that opens before any list key', () => {
    expect(() => parseFrontmatter('---\nid: DEC-001\n  - section: "2.4"\n---\n\nBody.\n')).toThrow(/outside any list/)
  })

  it('round-trips through renderDecision', () => {
    const { meta, body } = parseFrontmatter(withSpec)
    const out = renderDecision({ ...meta, body })
    expect(parseFrontmatter(out).meta.amends_spec).toEqual(meta.amends_spec)
  })

  it('normalizes the section sign, so §2.4 and 2.4 are the same anchor', () => {
    expect(sectionNumber('§2.4')).toBe('2.4')
    expect(sectionNumber('2.4')).toBe('2.4')
  })
})

describe('specSections', () => {
  const spec = ['# 0. Overview', 'text', '## 0.4 Glossary', 'text', '### 2.6.1 The ask', '## 2.6 Crew App'].join('\n')

  it('resolves every numbered heading depth, with or without the trailing dot', () => {
    const s = specSections(spec)
    expect(s.get('0')).toBe(0)
    expect(s.get('0.4')).toBe(2)
    expect(s.get('2.6.1')).toBe(4)
    expect(s.get('2.6')).toBe(5)
  })

  it('ignores unnumbered headings, whose text is prose that gets reworded', () => {
    expect(specSections('## Booking availability — a computed set').size).toBe(0)
  })
})

describe('renderSpec', () => {
  const spec = ['# 1. Substrate', '', 'Text about the substrate.', '', '## 1.3 Availability', '', 'Old prose.', ''].join(
    '\n',
  )
  const edges = new Map([['1.3', [{ from: 'DEC-140', scope: 'two mechanisms, not one rule engine' }]]])

  it("puts the block under the amended section's heading, not at the top of the file", () => {
    const out = renderSpec(spec, edges).split('\n')
    expect(out.indexOf('## 1.3 Availability')).toBeLessThan(out.findIndex((l) => l.includes('Amended by DEC-140')))
    expect(out.findIndex((l) => l.includes('Amended by DEC-140'))).toBeLessThan(out.indexOf('Old prose.'))
  })

  it('is a fixed point — regenerating an already-annotated spec changes nothing', () => {
    const once = renderSpec(spec, edges)
    expect(renderSpec(once, edges)).toBe(once)
  })

  it('strips back to the pristine spec exactly, so the insertion is fully reversible', () => {
    expect(stripSpecBlocks(renderSpec(spec, edges))).toBe(spec)
  })

  it('drops the block when the declaration is removed', () => {
    expect(renderSpec(renderSpec(spec, edges), new Map())).toBe(spec)
  })

  it('leaves the file alone when an anchor does not resolve — check() reports it instead', () => {
    expect(renderSpec(spec, new Map([['9.9', [{ from: 'DEC-001', scope: 'x' }]]]))).toBe(spec)
  })

  it('fails the freshness comparison when a declared amendment never landed', () => {
    // THE negative control: a decision declares it amends §1.3, the spec says nothing about
    // it, and `check()` compares the regenerated text against the file on disk. Before this
    // check existed, that claim lived in prose and nothing anywhere noticed it had not landed.
    expect(renderSpec(spec, edges)).not.toBe(spec)
  })
})

describe('rank and comparison', () => {
  it('places a declared family at the position its config gives it', () => {
    expect(compareDecisionIds('DEC-014', 'DEC-DATA-1', FAM)).toBeLessThan(0)
    expect(compareDecisionIds('DEC-DATA-1', 'DEC-015', FAM)).toBeLessThan(0)
    expect(compareDecisionIds('DEC-MSG-1', 'DEC-142', FAM)).toBeLessThan(0)
  })

  it('orders within a family by its trailing number', () => {
    expect(compareDecisionIds('DEC-MSG-1', 'DEC-MSG-3', FAM)).toBeLessThan(0)
    expect(compareDecisionIds('DEC-MSG-3', 'DEC-MSG-1', FAM)).toBeGreaterThan(0)
  })

  it('accepts the un-hyphenated spelling, so a DEC-S001-style record ranks', () => {
    expect(rank('DEC-S019', { S: 0 })).toEqual({ n: 0, family: 'S', seq: 19 })
    expect(compareDecisionIds('DEC-S019', 'DEC-S020', { S: 0 })).toBeLessThan(0)
  })

  it('abstains across families rather than inventing an order document position cannot support', () => {
    expect(compareDecisionIds('DEC-MSG-2', 'DEC-ROLE-1', FAM)).toBeNull()
    expect(compareDecisionIds('DEC-DATA-1', 'DEC-MSG-1', FAM)).toBeNull()
  })

  it('abstains on DEC-TBD, which is a container of open questions and has no date', () => {
    expect(rank('DEC-TBD', FAM)).toBeNull()
    expect(compareDecisionIds('DEC-TBD', 'DEC-001', FAM)).toBeNull()
  })

  it('abstains on an id family nobody declared, instead of passing silently', () => {
    // The guard's whole failure mode: it used to bail out without a word whenever an id
    // failed the numeric shape, so it never ran once for a record built on prefixed ids.
    expect(rank('DEC-S019', FAM)).toBeNull()
    expect(compareDecisionIds('DEC-S019', 'DEC-S020', FAM)).toBeNull()
  })
})

describe('referencePattern', () => {
  // `numeric` is injected in both directions rather than left to default. It defaults to the
  // HOST repo's `_config.json`, so a test that omits it asserts something different depending on
  // which repo runs it: green in a project with a numeric main line, red in seeds, whose ids are
  // `DEC-S###` and whose config sets `numericIds: false` on purpose (DEC-S025). That is how this
  // case sat failing — the assertion was right about projects and the suite had never been run
  // anywhere else. A test whose expected value depends on its surroundings is not a test.
  it('matches declared families and the numeric main line, when one is declared', () => {
    const re = referencePattern(FAM, true)
    expect('see DEC-042 and DEC-MSG-2 and DEC-TBD'.match(re)).toEqual(['DEC-042', 'DEC-MSG-2', 'DEC-TBD'])
  })

  it('does not match a numeric id when the record has no numeric main line', () => {
    const re = referencePattern(FAM, false)
    expect('see DEC-042 and DEC-MSG-2 and DEC-TBD'.match(re)).toEqual(['DEC-MSG-2', 'DEC-TBD'])
  })

  it("does not match another repo's undeclared series", () => {
    expect('see DEC-S019'.match(referencePattern(FAM, true))).toBeNull()
    expect('see DEC-S019'.match(referencePattern(FAM, false))).toBeNull()
  })

  it('matches an un-hyphenated family when it is declared', () => {
    expect('see DEC-S019'.match(referencePattern({ S: 0 }))).toEqual(['DEC-S019'])
  })
})

describe('the real record', () => {
  it('is valid — no stale index, dangling reference, unknown topic, or bad edge', () => {
    expect(check()).toEqual([])
  })
})

// ── Schema v1 (issue #816) ───────────────────────────────────────────────────
//
// Only records carrying `schema: 1` are validated; everything else is grandfathered, which
// is what lets the corpus convert one record at a time without a red build the whole way.
// Fixtures below declare their own ids and topics for the reason the header gives.

describe('schema v1 validation', () => {
  const ok = {
    schema: 1,
    id: 'DEC-200',
    title: 'A short title',
    topic: TOPIC,
    status: 'active',
    date: '2026-08-26',
    ruling: 'The customer pays the whole price at booking and nothing is collected later.',
    claims: [{ kind: 'file', target: 'src/reservations/payment-config.ts' }],
    // Required in jig, optional in muster — the one place the two schemas differ. Without it
    // this fixture is not well-formed here, and four tests below fail on a key they never
    // mention. See the `revisit_if is required here` test for the divergence stated directly.
    revisit_if: 'the deposit split is revisited for any reason',
  }

  const errs = (patch, body = 'Body.\n', bytes = 500) =>
    validateSchemaRecord({ ...ok, ...patch }, body, bytes).join(' | ')

  it('accepts a well-formed record', () => {
    expect(validateSchemaRecord(ok, 'Body.\n', 500)).toEqual([])
  })

  // jig's single divergence from muster's schema, tested rather than left to the JSON.
  // Nothing in schema v1 retires a record, which is how 78% of muster's reservations corpus
  // went dead while still being cited. Optional means the corpus rots; required means it does
  // not compile without saying when it expires.
  it('requires `revisit_if`, which muster leaves optional', () => {
    const { revisit_if, ...without } = ok
    expect(validateSchemaRecord(without, 'Body.\n', 500)).toEqual([
      'missing required key `revisit_if`',
    ])
    expect(errs({ revisit_if: 'x'.repeat(161) })).toMatch(/revisit_if.*160/)
    expect(errs({ revisit_if: 'short' })).toMatch(/revisit_if.*10/)
  })

  it('names the offending key on an unknown one, because that is the `dumb:` accident', () => {
    expect(errs({ boat: 'Brew 3' })).toMatch(/boat/)
  })

  it('reports each missing required key by name', () => {
    const { ruling, claims, ...missing } = ok
    const out = validateSchemaRecord(missing, 'Body.\n', 500).join(' | ')
    expect(out).toMatch(/ruling/)
    expect(out).toMatch(/claims/)
  })

  it('holds the ruling to 240 characters and says what the length was', () => {
    expect(errs({ ruling: 'x'.repeat(241) })).toMatch(/ruling.*240/)
  })

  it('holds the title to 80 and a claim note to 120', () => {
    expect(errs({ title: 'x'.repeat(81) })).toMatch(/title.*80/)
    expect(errs({ claims: [{ kind: 'file', target: 'a.ts', note: 'x'.repeat(121) }] })).toMatch(/note.*120/)
  })

  it('rejects a status outside the enum and a claim kind outside the enum', () => {
    expect(errs({ status: 'draft' })).toMatch(/status/)
    expect(errs({ claims: [{ kind: 'vibes', target: 'a.ts' }] })).toMatch(/kind/)
  })

  it('rejects a topic the project has not declared', () => {
    expect(errs({ topic: 'Nautical trivia' })).toMatch(/topic/)
  })

  it('requires at least one claim — a record that asserts nothing is the thing being caught', () => {
    expect(errs({ claims: [] })).toMatch(/claims/)
  })

  it('does not verify claim targets yet, so a nonexistent path is well-formed', () => {
    expect(validateSchemaRecord({ ...ok, claims: [{ kind: 'file', target: 'src/no/such.ts' }] }, 'Body.\n', 500)).toEqual(
      [],
    )
  })

  it('rejects an id shape the record does not use, and accepts a lettered one', () => {
    expect(errs({ id: 'DEC-2000' })).toMatch(/id/)
    expect(validateSchemaRecord({ ...ok, id: 'DEC-107a' }, 'Body.\n', 500)).toEqual([])
  })

  it('caps the file at 2000 bytes and says the actual size', () => {
    expect(errs({}, 'Body.\n', 2001)).toMatch(/2001.*2000|2000.*2001/)
  })

  it('rejects a `**Bold:**` lead-in, which is the structure that belongs in frontmatter', () => {
    expect(errs({}, '**Decision:** we do the thing.\n')).toMatch(/Decision/)
    expect(errs({}, '**Tradeoffs.** Several.\n')).toMatch(/Tradeoffs/)
  })

  it('leaves ordinary bold in a sentence alone', () => {
    expect(validateSchemaRecord(ok, 'It is **not** a cutover, and that matters.\n', 500)).toEqual([])
  })
})

describe('the schema:1 opt-in gate', () => {
  // Regression: the gate was a raw-text regex (`/^schema: *1 *$/m`), which is stricter than
  // YAML. A trailing comment or a quoted value read as "never opted in", so the record got
  // ZERO enforcement and nothing said so — a rule that looks applied and isn't, which is the
  // class this whole gate exists to close. Found in review, reproduced, then fixed by
  // gating on the parsed value.

  it('pre-filters on the key, not on a formatting of its value', () => {
    expect(hasSchemaKey('schema: 1\nid: DEC-200\n')).toBe(true)
    expect(hasSchemaKey('schema: 1  # v1 draft\nid: DEC-200\n')).toBe(true)
    expect(hasSchemaKey('schema: "1"\nid: DEC-200\n')).toBe(true)
    expect(hasSchemaKey('id: DEC-042\ntitle: "T"\n')).toBe(false)
  })

  it('the old regex is what let two of those through', () => {
    const old = (block) => /^schema: *1 *$/m.test(block)
    expect(old('schema: 1  # v1 draft\n')).toBe(false)
    expect(old('schema: "1"\n')).toBe(false)
  })
})

describe('the id sweep', () => {
  // One id, one file — across `docs/decisions/` AND `docs/decisions/archive/`. `load()`
  // catches a duplicate inside its own directory and stops there; an archived copy beside
  // the live record is the case it cannot see, and the one that makes a citation ambiguous.

  it('reads the id from a legacy block and a schema-v1 block alike', () => {
    expect(idOf('id: DEC-042\ntitle: "T"\n')).toBe('DEC-042')
    expect(idOf('schema: 1\nid: DEC-107a\nstatus: active\n')).toBe('DEC-107a')
  })

  it('returns nothing for a file with no id, rather than a false match', () => {
    expect(idOf('title: "T"\ntopic: "X"\n')).toBeUndefined()
    expect(idOf('# not frontmatter at all\n')).toBeUndefined()
  })

  it('is unbothered by a missing archive/ directory — the real record has none', () => {
    // `sweep` returns early on a directory that does not exist, which is why `check()` is
    // green here rather than throwing on ENOENT. Pinned because the branch is otherwise
    // never taken: no project in this repo has an archive/ yet.
    expect(check()).toEqual([])
  })
})

describe('schema v1 frontmatter shapes the legacy parser must now read', () => {
  // `claims` is a list of objects; `supersedes` is a list of BARE STRINGS, a shape
  // `parseFrontmatter` had no branch for at all. Both were the blocker that made incremental
  // conversion impossible — `load()` threw on the first converted record and took every other
  // file's checks with it.
  const v1 = `---
schema: 1
id: DEC-200
title: "A title"
topic: ${JSON.stringify(TOPIC)}
status: active
date: "2026-08-26"
ruling: "The customer pays the whole price at booking and nothing is collected later."
supersedes:
  - DEC-107
  - DEC-155
claims:
  - kind: file
    target: src/reservations/payment-config.ts
  - kind: unverifiable
    target: nothing writes a balance figure to the database
    note: needs a lint rule to become checkable
---

Body.
`

  it('reads a list of objects', () => {
    expect(parseFrontmatter(v1).meta.claims).toEqual([
      { kind: 'file', target: 'src/reservations/payment-config.ts' },
      {
        kind: 'unverifiable',
        target: 'nothing writes a balance figure to the database',
        note: 'needs a lint rule to become checkable',
      },
    ])
  })

  it('reads a list of bare strings', () => {
    expect(parseFrontmatter(v1).meta.supersedes).toEqual(['DEC-107', 'DEC-155'])
  })

  it('keeps the scalars either side of the lists', () => {
    const { meta } = parseFrontmatter(v1)
    expect(meta.schema).toBe('1')
    expect(meta.id).toBe('DEC-200')
    expect(meta.status).toBe('active')
  })

  it('still throws on a list item that opens before any list key', () => {
    // The bare-string branch must not turn this into a silent accept — an item with no open
    // list is the `dumb:`-shaped accident, not a value.
    expect(() => parseFrontmatter('---\nid: DEC-001\n  - DEC-002\n---\n\nBody.\n')).toThrow(/outside any list/)
  })
})

describe('renderDecision round-trips schema v1', () => {
  // THE regression guard for the bug this was written against: `renderDecision` emitted four
  // keys, so the first `gen:decisions` after a conversion DELETED `schema`, `status`, `date`,
  // `ruling`, `claims` and `revisit_if` — the whole decision — and the record then read as
  // legacy, so the gate went GREEN on a file whose content it had just destroyed. And
  // `check:decisions` is what tells you to run the generator in the first place.
  const v1 = {
    schema: '1',
    id: 'DEC-200',
    title: 'Sales tax is read live, not frozen onto the booking',
    topic: TOPIC,
    status: 'superseded',
    date: '2026-08-26',
    ruling: 'The sales tax rate is read fresh whenever a balance is worked out, rather than frozen onto the booking.',
    claims: [
      { kind: 'file', target: 'src/reservations/payment-config.ts' },
      { kind: 'unverifiable', target: 'no surface calls setPaymentConfig', note: 'a grep, not a check' },
    ],
    supersedes: ['DEC-107', 'DEC-155'],
    superseded_by: 'DEC-201',
    revisit_if: 'a rate change actually happens',
    amends_spec: [{ section: '2.8', scope: 'the tax rate is a live read' }],
    body: '## DEC-200: Sales tax is read live\n\nRationale.\n',
  }

  it('emits every v1 key, so nothing is dropped on the next generate', () => {
    const back = parseFrontmatter(renderDecision(v1)).meta
    for (const k of ['schema', 'id', 'title', 'topic', 'status', 'date', 'ruling', 'revisit_if', 'superseded_by']) {
      expect(back[k], `key \`${k}\` was dropped`).toEqual(v1[k])
    }
    expect(back.claims).toEqual(v1.claims)
    expect(back.supersedes).toEqual(v1.supersedes)
    expect(back.amends_spec).toEqual(v1.amends_spec)
  })

  it('still opts in to validation after a round trip', () => {
    const out = renderDecision(v1)
    expect(/^schema:/m.test(out.slice(4, out.indexOf('\n---\n', 3)))).toBe(true)
  })

  it('quotes the date, so YAML does not hand back a Date and fail the string check', () => {
    expect(renderDecision(v1)).toContain('date: "2026-08-26"')
  })

  it('emits `schema: 1` unquoted, so the parsed value is the number the gate compares against', () => {
    expect(renderDecision(v1)).toContain('\nschema: 1\n')
  })

  it('is a fixed point — regenerating a converted record rewrites nothing', () => {
    const once = renderDecision(v1)
    const twice = renderDecision({ ...parseFrontmatter(once).meta, body: parseFrontmatter(once).body })
    expect(twice).toBe(once)
  })

  it('leaves a legacy record on the existing four-key output', () => {
    const legacy = { id: 'DEC-020', title: 'A title', topic: TOPIC, body: '## DEC-020: A title\n\nBody.\n' }
    const out = renderDecision(legacy)
    expect(out.slice(4, out.indexOf('\n---\n', 3)).split('\n').filter(Boolean)).toEqual([
      'id: DEC-020',
      `title: ${JSON.stringify('A title')}`,
      `topic: ${JSON.stringify(TOPIC)}`,
    ])
  })
})

describe('sizeOf', () => {
  const head = '---\nschema: 1\nid: DEC-J001\n---\n\n## DEC-J001: A title\n\nThe decision.\n'

  /**
   * `beforeAmendments` IS GONE AND THESE TESTS INVERT ITS OLD ONES. It existed only so the byte
   * cap could ignore `## Amendment` sections, and the amendment convention it served is retired
   * (DEC-J003): a change of mind is a new record with `supersedes`, not a section appended to an
   * old one. The carve-out was never free — a record that merely QUOTED the convention measured
   * 21 bytes and escaped both the cap and the bold-lead-in rule.
   *
   * Whole-file measurement has no fence problem to solve, so the fence tests go with it.
   */
  it('measures the whole file, amendments included', () => {
    const amended = head + '\n## Amendment, 2026-08-27 (eric) — later\n\n' + 'x'.repeat(5000) + '\n'
    expect(sizeOf(amended)).toBe(Buffer.byteLength(amended, 'utf8'))
    expect(sizeOf(amended)).toBeGreaterThan(MAX)
  })

  it('is not fooled by an `## Amendment` inside a fence, because it no longer looks for one', () => {
    const quoting = '---\nschema: 1\n---\n\n```md\n## Amendment, YYYY-MM-DD (who)\n```\n\n' + 'y'.repeat(3000)
    expect(sizeOf(quoting)).toBe(Buffer.byteLength(quoting, 'utf8'))
  })

  it('a record with no amendments measures the whole file', () => {
    expect(sizeOf(head)).toBe(Buffer.byteLength(head, 'utf8'))
  })
})

describe('the generator and the checker agree on what they are reading', () => {
  /**
   * BOTH BUGS HERE FAILED IN THE SAME DIRECTION: an untouched legacy record rejected as
   * `not-listed`, which is the opposite of the class this gate closes and just as fatal to the
   * adoption it exists for. Found by review before this shipped to other projects.
   *
   * They were two spellings of one mistake — the generator and the checker each deciding for
   * themselves what "the corpus" and "the frontmatter" are. Shared functions, so they cannot
   * drift again.
   */
  it('names both record directories — the checker sweeps archive/, so the generator must too', () => {
    expect(RECORD_DIRS).toEqual(['docs/decisions', 'docs/decisions/archive'])
  })

  it('reads a block with CRLF line endings', () => {
    // The checker demanded `---\n` at byte 0. A CRLF file made that false, so the block came back
    // empty, `idOf` returned undefined, and the record failed forever as `not-listed` — while the
    // generator's lenient split had written a correct baseline line for it.
    expect(idOf(frontmatterBlock('---\r\nid: DEC-001\r\ntitle: "T"\r\n---\r\n\r\nBody.\r\n'))).toBe('DEC-001')
  })

  it('reads a block behind a UTF-8 BOM', () => {
    expect(idOf(frontmatterBlock('﻿---\nid: DEC-002\ntitle: "T"\n---\n\nBody.\n'))).toBe('DEC-002')
  })

  it('still sees a `schema:` key through CRLF, so a v1 record is never mistaken for legacy', () => {
    expect(hasSchemaKey(frontmatterBlock('---\r\nschema: 1\r\nid: DEC-003\r\n---\r\n\r\nBody.\r\n'))).toBe(true)
  })

  it('returns empty for a file with no frontmatter at all', () => {
    expect(frontmatterBlock('# Just a heading\n\nBody.\n')).toBe('')
  })

  it('slices the body off the same normalized text the block came from', () => {
    // Half-normalizing was the same mistake one layer down: `frontmatterBlock` normalized while
    // the body slice still ran on raw text, so a CRLF record's `indexOf('\n---\n')` missed and
    // `body` came back as very nearly the whole file — frontmatter included.
    const crlf = '---\r\nschema: 1\r\nid: DEC-004\r\n---\r\n\r\n## DEC-004: T\r\n\r\nThe decision.\r\n'
    expect(recordBody(crlf)).toBe('\n## DEC-004: T\n\nThe decision.\n')
    expect(recordBody(crlf)).not.toContain('schema:')
  })
})

/**
 * Supersession is a PAIR, and the half that gets skipped is the one you have to go back for.
 *
 * `CLAUDE.md` states it: the new record carries `supersedes: [DEC-<id>]`, the old one flips to
 * `status: superseded`. Writing the new record is the half you are already doing; returning to the
 * old one is the half nothing enforced. Muster's DEC-107 is retired, carries its full original
 * argument, and names no successor — and an agent hit it in a grep, read the title, and reported a
 * spec contradiction that did not exist. Code cites it too, for the opposite of what it rules.
 *
 * Extracted as a pure function over the rewritten map so it can be tested at all. The
 * `superseded_by` resolution below it moved in with the new rules and had no test before this —
 * it could only run against the real corpus, which has never had a superseded record in it.
 */
describe('supersession is a pair, or it is a dangling argument', () => {
  const rec = (id, extra = {}) => [id, { id, path: `docs/decisions/${id}-x.md`, status: 'active', ...extra }]
  /** `seenIds` is every id on disk, including legacy files that never reach `rewritten`. */
  const corpus = (...entries) => new Map(entries)
  const ids = (m) => new Set(m.keys())
  const msgs = (m, seen = ids(m)) => supersessionProblems(m, seen).map(([, msg]) => msg)
  const paths = (m, seen = ids(m)) => supersessionProblems(m, seen).map(([p]) => p)

  it('rejects a superseded record that names no successor', () => {
    // muster's DEC-107 exactly. The record still greps, still quotes, and still reads as a live
    // ruling to anything that finds it by title.
    const m = corpus(rec('DEC-107', { status: 'superseded' }))
    expect(msgs(m)).toEqual([expect.stringMatching(/superseded_by/)])
    expect(paths(m)).toEqual(['docs/decisions/DEC-107-x.md'])
  })

  it('does not demand a successor for a withdrawn record', () => {
    // `withdrawn` means retired with nothing replacing it. Demanding a pointer would force an
    // invented one, which is worse than the gap it closes.
    expect(msgs(corpus(rec('DEC-050', { status: 'withdrawn' })))).toEqual([])
  })

  it('rejects a one-sided pair, and reports it on the record that has to change', () => {
    // A declares it; B never flipped. The fix is an edit to B, so the message lands on B's path
    // and names A — pointing at A would name the file that is already correct.
    const m = corpus(rec('DEC-200', { supersedes: ['DEC-100'] }), rec('DEC-100'))
    expect(paths(m)).toEqual(['docs/decisions/DEC-100-x.md'])
    expect(msgs(m)).toEqual([expect.stringMatching(/DEC-200 declares .*supersedes/)])
  })

  it('rejects a pair whose two halves name different records, on both files that need editing', () => {
    // Two messages, not one, and that is the honest count: DEC-100 says it was replaced by
    // DEC-201 while DEC-200 claims it replaced DEC-100. Three records disagree and there is no
    // single one of them you can call wrong — so each gets the complaint that is actionable from
    // where it sits, rather than one message asserting which of the three the author meant.
    const m = corpus(
      rec('DEC-200', { supersedes: ['DEC-100'] }),
      rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-201' }),
      rec('DEC-201'),
    )
    expect(msgs(m).join('\n')).toMatch(/superseded_by DEC-201/)
    expect(msgs(m).join('\n')).toMatch(/does not list DEC-100/)
    expect(msgs(m)).toHaveLength(2)
  })

  it('rejects a successor that does not declare what it replaced', () => {
    // The other direction: B points at A, A never listed B.
    const m = corpus(rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-200' }), rec('DEC-200'))
    expect(paths(m)).toEqual(['docs/decisions/DEC-200-x.md'])
    expect(msgs(m)).toEqual([expect.stringMatching(/does not list DEC-100/)])
  })

  it('accepts a pair whose halves agree', () => {
    const m = corpus(
      rec('DEC-200', { supersedes: ['DEC-100'] }),
      rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-200' }),
    )
    expect(msgs(m)).toEqual([])
  })

  it('says nothing about a frozen record it cannot ask anything of', () => {
    // A frozen record is one editing fails the build over, so a rule demanding an edit to it is a
    // rule with no compliant action — the trap the dictionary baseline already walked into. Frozen
    // and legacy records never enter `rewritten`, so the exemption is structural rather than a
    // list to maintain.
    const m = corpus(rec('DEC-200', { supersedes: ['DEC-041'] }))
    expect(msgs(m, new Set([...ids(m), 'DEC-041']))).toEqual([])
  })

  it('still catches a supersedes pointing at nothing at all', () => {
    // Not in `rewritten` AND not on disk is a dangling reference, which is different from frozen.
    const m = corpus(rec('DEC-200', { supersedes: ['DEC-999'] }))
    expect(msgs(m)).toEqual([expect.stringMatching(/DEC-999/)])
  })

  it('rejects a record superseded by itself, and says it once', () => {
    // A self-pointer makes three other rules true at the same time — the target is retired, the
    // target does not list it, the chain never terminates — and all three are the same typo. One
    // message, then stop looking at this record.
    const m = corpus(rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-100' }))
    expect(msgs(m)).toEqual([expect.stringMatching(/itself/)])
  })

  it('says the missing half once, when someone did claim the record', () => {
    // THE MOST LIKELY SHAPE IN PRACTICE, and the one the isolated-record case above does not
    // reach: the new record was written correctly and nobody went back to the old one. Rule 1
    // already names it, so the reciprocity rule must not also complain — it would print
    // `superseded_by undefined` and call a missing half a disagreement between two named records.
    const m = corpus(rec('DEC-200', { supersedes: ['DEC-100'] }), rec('DEC-100', { status: 'superseded' }))
    expect(msgs(m)).toHaveLength(1)
    expect(msgs(m)[0]).toMatch(/no `superseded_by`/)
    expect(msgs(m).join('\n')).not.toMatch(/undefined/)
  })

  it('says nothing extra about a self-pointer someone else also claims', () => {
    // The incoming direction of the same typo. Loop 1 stops looking at the self-pointer; without
    // the matching guard on the target side, an unrelated record's claim drags it back in.
    const m = corpus(
      rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-100' }),
      rec('DEC-300', { supersedes: ['DEC-100'] }),
    )
    expect(msgs(m)).toEqual([expect.stringMatching(/itself/)])
  })

  it('does not read a self-pointer\'s other claims either', () => {
    // Pins the source-side guard, which was otherwise inert — every case that exercised it had no
    // outgoing `supersedes` to skip, so deleting it changed nothing and the suite stayed green.
    const m = corpus(
      rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-100', supersedes: ['DEC-050'] }),
      rec('DEC-050'),
    )
    expect(msgs(m)).toEqual([expect.stringMatching(/itself/)])
  })

  it('says it once when a supersedes list names the same record twice', () => {
    // Schema-valid — `supersedes` declares no `uniqueItems` — and an ordinary YAML copy/paste slip.
    const m = corpus(rec('DEC-200', { supersedes: ['DEC-100', 'DEC-100'] }), rec('DEC-100'))
    expect(msgs(m)).toHaveLength(1)
  })

  it('rejects a superseded_by pointing at a record that is itself retired', () => {
    // Pre-existing rule, moved in with the rest. A chain is a thing a reader has to walk.
    const m = corpus(
      rec('DEC-100', { status: 'superseded', superseded_by: 'DEC-200' }),
      rec('DEC-200', { status: 'superseded', superseded_by: 'DEC-300', supersedes: ['DEC-100'] }),
      rec('DEC-300', { supersedes: ['DEC-200'] }),
    )
    expect(msgs(m)).toEqual([expect.stringMatching(/whose status is superseded/)])
  })
})

describe('the legacy freeze', () => {
  /**
   * Omitting `schema:` used to be how a record opted OUT of every rule — the schema, the byte
   * cap and the lead-in check all at once — and nothing told old history apart from a record
   * written yesterday that forgot the key. The baseline is that distinction: a fixed list of ids
   * and fingerprints, generated once at adoption. Getting on it takes a reviewable diff; getting
   * off it takes an edit.
   */
  const legacy = '---\nid: DEC-001\ntitle: "Old"\n---\n\n## DEC-001: Old\n\nWritten before the schema.\n'
  const listed = () => new Map([['DEC-001', fingerprint(legacy)]])

  it('skips a listed record that has not changed', () => {
    expect(legacyVerdict('DEC-001', legacy, listed())).toBe('frozen')
  })

  it('fails a record that is not listed — omission is not an opt-out', () => {
    expect(legacyVerdict('DEC-099', legacy, listed())).toBe('not-listed')
  })

  it('fails a listed record that was edited, which is what forces conversion', () => {
    expect(legacyVerdict('DEC-001', legacy + '\nOne more line.\n', listed())).toBe('edited')
  })

  it('an empty baseline grandfathers nothing — jig gets its strictness from having none', () => {
    expect(legacyVerdict('DEC-001', legacy, new Map())).toBe('not-listed')
  })

  it('the fingerprint covers the whole file, frontmatter included', () => {
    const reFrontmattered = legacy.replace('title: "Old"', 'title: "Renamed"')
    expect(legacyVerdict('DEC-001', reFrontmattered, listed())).toBe('edited')
  })
})

describe('the frontmatter predicates the sweep runs on', () => {
  it('`hasSchemaKey` matches the key, whatever the value looks like', () => {
    expect(hasSchemaKey('schema: 1\nid: DEC-J200\n')).toBe(true)
    expect(hasSchemaKey('schema: 1  # v1 draft\n')).toBe(true)
    expect(hasSchemaKey('schema: "1"\n')).toBe(true)
    expect(hasSchemaKey('id: DEC-J042\ntitle: "T"\n')).toBe(false)
  })

  it('`idOf` reads the id from either block shape', () => {
    expect(idOf('id: DEC-J042\ntitle: "T"\n')).toBe('DEC-J042')
    expect(idOf('schema: 1\nid: DEC-J107a\nstatus: active\n')).toBe('DEC-J107a')
    expect(idOf('title: "no id here"\n')).toBeUndefined()
  })
})
