---
schema: 1
id: DEC-J007
title: "The output style lives in jig and is read through the machine"
topic: "Template storage & distribution"
status: "active"
date: "2026-09-18"
ruling: "One style file, kept in jig as `jig-only`, read by every session through a symlink at `~/.claude/output-styles/`. The `outputStyle` key is set once in `~/.claude/settings.json`. Nothing ships either; drift flags a project copy."
claims:
  - kind: "file"
    target: ".claude/file-classes.yaml"
    note: "`.claude/output-styles/**` is `jig-only`"
  - kind: "script"
    target: "scripts/drift.mjs"
    note: "a project copy is `NOT YOURS` via the jig-only walk"
  - kind: "file"
    target: "CLAUDE.md"
    note: "the setting and the file named as two things"
revisit_if: "A session runs somewhere that cannot see this machine's home directory and needs the style, or a second style is ever wanted on."
---

## DEC-J007: The output style lives in jig and is read through the machine

A style is two things that share a name: the **setting** says which is on, the **file** says what
it is. Jig shipped both — the key in the settings master, the file as `logic` — and that made "set
it once at the machine level" impossible. A project-level `.claude/settings.json` beats the
machine file, so the shipped key won everywhere; and a repo's style file beats the machine's —
observed: soundings ran its stale v2 over the machine's v6 — so the version being iterated
reached nobody who still held a copy.

So neither travels. The key is a preference for whoever is at the keyboard. The file is workflow
vocabulary, which is what jig is for, so it stays here, versioned, and the machine reads it via
symlink. An edit here is on at the next session start, and there is nothing to sync.

`jig-only` rather than deleting: the class already makes a project copy `NOT YOURS`, and the fix
is deletion. `logic` was the state that had four repos on three versions.
