// Tests for the shared record-format helpers.
//
// These exist as their own file because two gates now read decision records and only one of them
// knew what "frozen" meant. `check-decisions` skipped the schema, the byte cap and the lead-in rule
// for a baselined record — because EDITING ONE FAILS THE BUILD, so a rule demanding an edit has no
// compliant action. `check-dictionary` read the same records and applied its full rule set.
//
// The cost was measured in muster: registering one term with a forbidden alternate produced 13
// failures, 5 of them inside DEC-041, DEC-077 and DEC-145 — all frozen, one of them in a record's
// own title. There is no way to act on those five short of converting three records to schema v1
// to register a single word.

import { describe, expect, it } from 'vitest'
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { fingerprint, frozenRecords, idOf, frontmatterBlock } from './records.mjs'

/** A throwaway corpus: `{ 'DEC-001-x.md': text }`, plus the baseline lines to write beside it. */
const corpus = (files, baselineLines) => {
  const root = mkdtempSync(join(tmpdir(), 'records-'))
  const dir = join(root, 'decisions')
  mkdirSync(dir, { recursive: true })
  for (const [name, text] of Object.entries(files)) writeFileSync(join(dir, name), text)
  const baseline = join(root, 'baseline.txt')
  writeFileSync(baseline, `# header\n${baselineLines.join('\n')}\n`)
  return { dir, baseline }
}

const record = (id, body = 'Body.\n') => `---\nid: ${id}\ntitle: "T"\n---\n\n## ${id}: T\n\n${body}`

describe('frozenRecords', () => {
  it('names a record that is listed and unchanged', () => {
    const text = record('DEC-041')
    const { dir, baseline } = corpus({ 'DEC-041-x.md': text }, [`DEC-041 ${fingerprint(text)}`])
    expect([...frozenRecords([dir], baseline)]).toEqual([`${dir}/DEC-041-x.md`])
  })

  it('does not name a listed record whose bytes changed', () => {
    // `frozen` is listed AND unmodified — an edited one already fails `check:decisions` with its
    // own message, and suppressing a second gate on it would be agreeing to ignore a file
    // somebody changed. This is the distinction bare membership would lose.
    const { dir, baseline } = corpus({ 'DEC-041-x.md': record('DEC-041', 'Edited.\n') }, [
      `DEC-041 ${fingerprint(record('DEC-041'))}`,
    ])
    expect([...frozenRecords([dir], baseline)]).toEqual([])
  })

  it('does not name a record that was never baselined', () => {
    const text = record('DEC-J001')
    const { dir, baseline } = corpus({ 'DEC-J001-x.md': text }, [])
    expect([...frozenRecords([dir], baseline)]).toEqual([])
  })

  it('is empty for a repo with no baseline file at all', () => {
    // jig's own case, and the reason this had to be tested rather than observed: the corpus
    // started empty on 2026-08-27 and every record is v1, so nothing here is ever frozen.
    const { dir } = corpus({ 'DEC-J001-x.md': record('DEC-J001') }, [])
    expect([...frozenRecords([dir], join(dir, 'no-such-baseline.txt'))]).toEqual([])
  })

  it('reads an id through CRLF and a BOM, like both gates already must', () => {
    // The shared-parser bug this whole cluster was extracted to prevent: two scripts each deciding
    // for themselves what "the frontmatter" is, and a CRLF record failing forever as `not-listed`
    // in one of them while the other wrote a correct baseline line for it.
    expect(idOf(frontmatterBlock('﻿---\r\nid: DEC-002\r\ntitle: "T"\r\n---\r\n\r\nBody.\r\n'))).toBe('DEC-002')
  })
})
