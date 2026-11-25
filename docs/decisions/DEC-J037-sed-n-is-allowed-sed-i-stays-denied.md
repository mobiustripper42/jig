---
schema: 1
id: DEC-J037
title: "sed -n is allowed; sed -i stays denied"
topic: "Session workflow & skills"
status: "active"
date: "2026-11-25"
ruling: "The settings master does not deny `sed -n`. It denies `sed -i`. Reading with the Read tool is a preference in the shell, not a ban."
claims:
  - kind: "file"
    target: ".claude/settings.json"
    note: "denies `Bash(sed -i *)` and not `Bash(sed -n *)`"
  - kind: "file"
    target: "CLAUDE.md"
    note: "Workflow Notes: Prefer the Read tool"
revisit_if: "A file read through `sed -n` is traced as the cause of a defect or of a wrong answer to the operator."
---

## DEC-J037: sed -n is allowed; sed -i stays denied

By the operator's account this had come up about three times; on 2026-11-25: "every single session
runs sed -n". In 549 transcripts from 2026-08-31 to 2026-11-04, `sed -n` was denied 929 times: 732
file reads, 133 pipes of command output and 64 piped `cat` or `git show`
(`docs/research/checker-roi/03-permission-denies.md`). The same read through `awk` ran 168 times.

The rule was added in seeds `c864ce7` because it was broken 58 times in a week; the commit notes
"zero operator corrections — nothing to correct, every call succeeded". Two denials in seeds ended
with the check being made dropped (`docs/research/checker-roi/01-calibration.md`, rows 3 and 4). A
session on 2026-11-25 dropped a check of the sibling repos the same way; that command also held a
`sed -n`.

`sed -i` is different. It exits 0 when its pattern matches nothing, so an edit that never happened
looks done. It was denied 20 times in the same window, and all 20 went to Edit.

Permissions are per machine: each one keeps the deny until its `settings-policy.mjs --write` runs.
