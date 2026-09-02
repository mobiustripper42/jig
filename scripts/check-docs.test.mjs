// Tests for the doc-set checker.
//
// Same principle as `check-context.test.mjs`, and it matters more here: five of the six classes
// below were at ZERO findings the day they were written. A check with nothing to find is
// indistinguishable from a check that has stopped working, and the whole point of this file is to
// stop the count climbing back off zero — so every class gets an explicit negative control, and
// the last block asserts the real doc set is clean.
//
// The suite also pins what each class deliberately IGNORES. Every false positive is a step toward
// someone deleting the check from `verify`, which is the actual failure mode being defended
// against — a muted guard is worse than none, because the docs claim it is covered.

import { describe, expect, it } from "vitest";
import {
  DOCS,
  HISTORICAL,
  ROSTERS,
  check,
  checkDecRefs,
  checkExemptions,
  checkIssueLinks,
  checkNpmScripts,
  checkPaths,
  checkRosterDocsExist,
  checkRosters,
} from "./check-docs.mjs";

const doc = (text, path = "fixture.md") => [{ path, text }];
const WORLD = {
  ids: new Set(["DEC-J001"]),
  scripts: { verify: "…", "check:docs": "…" },
  skills: new Set(["kill-this"]),
  agents: new Set(["pm"]),
};

describe("checkDecRefs", () => {
  it("accepts a reference to a decision that exists", () => {
    expect(checkDecRefs(doc("per DEC-J001"), WORLD.ids)).toEqual([]);
  });

  it("catches a reference to a decision that does not exist", () => {
    // The negative control for the class `check-decisions` never covered: its scan stops at
    // `docs/decisions/` + the index, leaving 148 references in the rest of the doc set unread.
    const [f] = checkDecRefs(doc("superseded by DEC-J999"), WORLD.ids);
    expect(f).toMatch(/fixture\.md:1 — cites DEC-J999, which has no decision file/);
  });

  it("ignores the seeds DEC-S series, whose record lives in another repo", () => {
    expect(checkDecRefs(doc("workflow shell per DEC-S019"), WORLD.ids)).toEqual([]);
  });
});

describe("checkNpmScripts", () => {
  it("accepts a script that exists", () => {
    expect(checkNpmScripts(doc("run `npm run verify`"), WORLD.scripts)).toEqual([]);
  });

  it("catches an instruction to run a script that does not exist", () => {
    // Audit row 6's shape: two docs told a reader to run a throughput extractor absent from this
    // repo. A wrong command costs a debugging detour before anyone suspects the doc.
    const [f] = checkNpmScripts(doc("run `npm run throughput`"), WORLD.scripts);
    expect(f).toMatch(/cites `npm run throughput`, which is not a script/);
  });

  it("ignores prose that is not a backticked command", () => {
    expect(checkNpmScripts(doc("you can npm run whatever you like"), WORLD.scripts)).toEqual([]);
  });
});

describe("checkIssueLinks", () => {
  const url = (n, kind = "issues") => `https://github.com/mobiustripper42/jig/${kind}/${n}`;

  it("accepts a link whose text matches its target", () => {
    expect(checkIssueLinks(doc(`[#204](${url(204)}) and [PR #213](${url(213, "pull")})`))).toEqual([]);
  });

  it("catches a link that reads as one issue and opens another", () => {
    // The purest case for a script: two representations of one fact, mechanically comparable,
    // and invisible to review — you would have to hover all 107 links to find this by eye.
    const [f] = checkIssueLinks(doc(`[#204](${url(207)})`));
    expect(f).toMatch(/reads #204 but links to issues\/207/);
  });

  it("catches a link pointing at a different repository", () => {
    const [f] = checkIssueLinks(doc("[#204](https://github.com/someone/else/issues/204)"));
    expect(f).toMatch(/links to someone\/else, not mobiustripper42\/jig/);
  });

  it("ignores a bare #204 with no link, which asserts no target", () => {
    expect(checkIssueLinks(doc("closes #204, see #205"))).toEqual([]);
  });
});

describe("checkRosters", () => {
  const roster = (text) => [{ path: "CLAUDE.md", text }];

  it("accepts a roster that names every skill and agent on disk", () => {
    expect(checkRosters(roster("`/kill-this` reviewed by @pm"), WORLD)).toEqual([]);
  });

  it("catches a roster silently missing an entry", () => {
    // Audit row 26, and the half that actually bit: `/doc-consistency-check` was in CLAUDE.md and
    // AGENTS.md and nowhere in the CHEATSHEET — the doc whose whole purpose is completeness. A
    // roster quietly missing a row still looks authoritative; nobody goes looking for what a
    // complete list does not mention.
    const failures = checkRosters(roster("@pm reviews things"), WORLD);
    expect(failures).toContainEqual(expect.stringMatching(/omits \/kill-this, which exists on disk/));
  });

  it("`skills: mentions` checks names against disk without demanding the full list", () => {
    // The context file is not a roster — it names a skill in passing. Both directions is right for
    // `CLAUDE.md` and `AGENTS.md`, which promise to list everything; turning it on for a file that
    // merely mentions one demands it enumerate all seven, which is a list to keep in sync and the
    // reason nobody would accept the check.
    const doc = [{ path: ".claude/CLAUDE-context.md", text: "The gate runs in `/kill-this`." }];
    const cfg = { ".claude/CLAUDE-context.md": { skills: "mentions", agents: false } };
    expect(checkRosters(doc, WORLD, cfg)).toEqual([]);
  });

  it("`skills: mentions` still catches a skill retired out from under the text", () => {
    const doc = [{ path: ".claude/CLAUDE-context.md", text: "Run `/pause-this` when interrupted." }];
    const cfg = { ".claude/CLAUDE-context.md": { skills: "mentions", agents: false } };
    const failures = checkRosters(doc, WORLD, cfg);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/pause-this/);
  });

  /**
   * `agents: "mentions"` WAS REFUSED, AND THE REFUSAL WAS RIGHT UNTIL NOW. It shipped once as a
   * value the config accepted and no code read — a rule that looks applied and is not, which is
   * the class this gate exists to close. The refusal replaced it, with a stated condition:
   * catching a retired `@agent` needs a foreign-name list of its own.
   *
   * This is that list, plus the thing the earlier reasoning missed. The objection was that
   * `AGENT_MENTION` matches any `@word` and a real corpus is full of them. Measured across jig's
   * whole gated set there are nine distinct names, and the noise is not import aliases — eight of
   * the nine sit in RETIREMENT RECORDS (`docs/AGENTS.md`, `docs/ANALYSIS.md`, `docs/CHEATSHEET.md`)
   * whose entire job is naming what was retired. A global rule would flag all eight to catch one.
   *
   * Per-file opt-in is what makes it work, and roster claims were already per-file. A retirement
   * record declares nothing and stays silent; a file that claims its names are live has to mean it.
   */
  const MENTIONS = { "X.md": { skills: false, agents: "mentions" } };

  it("`agents: mentions` accepts a doc naming an agent that exists", () => {
    expect(checkRosters([{ path: "X.md", text: "Reviewed by @pm." }], WORLD, MENTIONS)).toEqual([]);
  });

  it("`agents: mentions` catches an agent retired out from under the text", () => {
    // The live case: `scaffold/docs/FUTURE_IDEAS.md` shipped "`@ideas` tends this file" into every
    // project, naming an agent `docs/ANALYSIS.md:35` records as decided against.
    const doc = [{ path: "X.md", text: "`@ideas` tends this file and keeps the index in sync." }];
    const failures = checkRosters(doc, WORLD, MENTIONS);
    expect(failures).toHaveLength(1);
    expect(failures[0]).toMatch(/@ideas, which has no \.claude\/agents\//);
  });

  it("`agents: mentions` forgives a name the project declared foreign", () => {
    // The escape hatch, and the reason it is a list rather than a heuristic: `@me` in a template
    // is a placeholder, not a claim about an agent. Declaring it is a diff somebody reads.
    const doc = [{ path: "X.md", text: "Assign to @me before handing off." }];
    expect(checkRosters(doc, WORLD, MENTIONS, new Set(["me"]))).toEqual([]);
  });

  it("says nothing about a dead agent in a file that claims nothing", () => {
    // The whole reason this is per-file. `docs/AGENTS.md` names @workout, @doc-consistency,
    // @ideas and @tape-reader on purpose — it is the record OF their retirement. A gate that
    // cannot tell that apart from a live claim is a gate nobody will leave switched on.
    const doc = [{ path: "docs/AGENTS.md", text: "| `@tape-reader` | Read the tape, which is gone |" }];
    expect(checkRosters(doc, WORLD, { "docs/AGENTS.md": { skills: false, agents: false } })).toEqual([]);
  });

  it("catches a roster naming a skill that does not exist", () => {
    // Audit row 28: `/session-start-hook` sat in the CHEATSHEET's INFRA column with no file.
    const failures = checkRosters(roster("`/kill-this` `/no-such-skill` @pm"), WORLD);
    expect(failures).toContainEqual(expect.stringMatching(/lists \/no-such-skill, which has no \.claude\/skills\//));
  });

  it("catches a roster missing an agent", () => {
    const failures = checkRosters(roster("`/kill-this` and nothing else"), WORLD);
    expect(failures).toContainEqual(expect.stringMatching(/omits @pm, which exists on disk/));
  });

  it("reads the plain-text register, since the CHEATSHEET has no backticks", () => {
    // `CHEATSHEET.md` is a printable ASCII card — every command in it is written bare. A matcher
    // that only saw backticked spans would report all 13 skills missing from it, every run.
    expect(checkRosters([{ path: "docs/CHEATSHEET.md", text: "  /kill-this   build + commit" }], WORLD)).toEqual([]);
  });

  it("does not mistake a route for a slash command", () => {
    // `/admin/shifts` and `/crew/calendar` appear throughout the docs. Reading them as commands
    // would redden every roster with skills that were never claimed to exist.
    const failures = checkRosters(roster("`/kill-this` @pm — see /admin/shifts and /crew/calendar"), WORLD);
    expect(failures).toEqual([]);
  });

  it("does not demand agents from a roster that only claims skills", () => {
    // `CLAUDE.md:20` calls the CHEATSHEET the "one-page printable skill reference". It has no
    // agent section; requiring one would be the check inventing a rule rather than enforcing one.
    expect(ROSTERS["docs/CHEATSHEET.md"]).toEqual({ skills: true, agents: false });
    expect(checkRosters([{ path: "docs/CHEATSHEET.md", text: "  /kill-this" }], WORLD)).toEqual([]);
  });

  it("ignores plugin skills and built-ins, which have no .claude/skills/ entry by design", () => {
    expect(checkRosters(roster("`/kill-this` `/review` `/simplify` @pm"), WORLD)).toEqual([]);
  });
});

describe("checkPaths", () => {
  it("accepts a path that exists and catches one that does not", () => {
    expect(checkPaths(doc("`scripts/check-docs.mjs`"))).toEqual([]);
    expect(checkPaths(doc("`scripts/no-such-file.mjs`"))[0]).toMatch(/does not exist/);
  });

  it("reads a line-range citation, not just a comma list", () => {
    // `check-context` stripped `:148,192` but not `:88-96`, so it would have called three live
    // files dead. Its own corpus happens to cite only lists, so nothing there could surface it —
    // the bug only appeared once the same resolver ran over `docs/*.md`.
    expect(checkPaths(doc("`app/lib/auth.ts:88-96`"))).toEqual([]);
    expect(checkPaths(doc("`src/builder/derive.ts:148,192`"))).toEqual([]);
  });

  it("skips the historical ledgers, which cite deleted files correctly", () => {
    // `PROJECT_PLAN.md:186` cites a doc and annotates "(deleted 2026-07-25)" in the same sentence;
    // `SPEC.md:805` cites `src/builder/lock.ts` inside a struck passage about its deletion. A
    // check that reddens a doc for being right is the fastest route to the check being deleted.
    expect(checkPaths([{ path: "docs/SPEC.md", text: "`src/builder/lock.ts` was deleted" }])).toEqual([]);
    expect(checkPaths([{ path: "docs/PROJECT_PLAN.md", text: "`docs/PILOT_RUNBOOK.md`" }])).toEqual([]);
  });

  it("checks a doc that is not exempt, so the exemption list is opt-in and not the default", () => {
    // The list is exemptions rather than an allowlist on purpose: a doc added next year is
    // checked by default, and skipping it takes a deliberate line with a reason attached.
    expect(checkPaths([{ path: "docs/BRAND.md", text: "`scripts/gone.mjs`" }])[0]).toMatch(/does not exist/);
  });
});

describe("checkExemptions", () => {
  it("every exempted doc still exists", () => {
    // Without this, renaming a doc carries its exemption into the void while the new file quietly
    // joins the checked set — and the stale entry implies coverage that a reviewer would assume.
    expect(checkExemptions()).toEqual([]);
    expect(Object.keys(HISTORICAL).length).toBeGreaterThan(0);
  });

  it("each exemption carries a stated reason", () => {
    // The reason is the whole discipline. An exemption list of bare paths is a list that grows,
    // because adding to it costs nothing and nobody can tell later which entries were justified.
    for (const [path, reason] of Object.entries(HISTORICAL)) {
      expect(reason.length, `${path} needs a reason`).toBeGreaterThan(30);
    }
  });

  it("every doc declared a roster exists", () => {
    // `DOCS` is read off the filesystem, so deleting CHEATSHEET.md would leave the roster check
    // with nothing to check and reporting clean — the silent hole this file exists to close.
    expect(checkRosterDocsExist()).toEqual([]);
  });
});

describe("check — the real doc set", () => {
  it("is clean", () => {
    expect(check()).toEqual([]);
  });

  it("reaches the context file, whose roster nothing else checks", () => {
    // `.claude/CLAUDE-context.md` loads every session as ground truth and was the one always-loaded
    // file whose skill and agent mentions nothing verified. Muster carried `/pause-this` twice and
    // `@doc-consistency` once for a day after all three were deleted, and every gate stayed green.
    //
    // `check-context.mjs` reads this file too, for paths and § sections — the same overlap
    // `CLAUDE.md` has always had with both gates. Rosters are this gate's job, so it needs the file.
    expect(DOCS).toContain(".claude/CLAUDE-context.md");
  });

  it("covers every top-level doc, and no subdirectory", () => {
    // `docs/decisions/` belongs to check-decisions, `docs/audit/` is a frozen record that cites
    // dead paths deliberately (that is what a finding IS), `docs/design/` is mockups.
    expect(DOCS).toContain("docs/SPEC.md");
    expect(DOCS).toContain("CLAUDE.md");
    expect(DOCS.some((d) => d.includes("/decisions/") || d.includes("/audit/"))).toBe(false);
    expect(DOCS).not.toContain("docs/DECISIONS.md");
  });

  it("reports every class through one entry point, so one red build shows all of it", () => {
    const failures = check(
      [
        { path: "CLAUDE.md", text: "`/kill-this` @pm cites DEC-J999 and `npm run nope`" },
        { path: "docs/BRAND.md", text: "[#1](https://github.com/mobiustripper42/jig/issues/2) `scripts/gone.mjs`" },
      ],
      WORLD,
    );
    expect(failures).toHaveLength(4);
    expect(failures.join("\n")).toMatch(/DEC-J999/);
    expect(failures.join("\n")).toMatch(/npm run nope/);
    expect(failures.join("\n")).toMatch(/reads #1 but links to issues\/2/);
    expect(failures.join("\n")).toMatch(/scripts\/gone\.mjs/);
  });
});

describe("a roster declared for a document the gate never reads", () => {
  /**
   * THIRD TIME THIS CLASS SHOWED UP IN ONE SESSION, which is why it stopped being a note.
   *
   * `check-denied`'s runbook list fails an entry that exempts nothing; `runbookProblems` gained a
   * scope check for the same reason. Then this branch declared a roster for
   * `scaffold/claude/CLAUDE-context.md` — a real file, excluded from `DOCS` — and it was inert.
   * `checkRosters` skips a roster it has no document for (`if (!doc) continue`), and
   * `checkRosterDocsExist` only asked whether the path exists on disk. It does. Nothing failed.
   *
   * A declared rule nothing reads is the exact defect this gate exists to close, and it was
   * caught by hand-mutating the config rather than by any check.
   */
  it("fails a roster path that exists but is outside the gated set", () => {
    const failures = checkRosterDocsExist({ "scaffold/claude/CLAUDE-context.md": { skills: true } });
    expect(failures).toEqual([expect.stringMatching(/not one of the documents this gate reads/)]);
  });

  it("says nothing about a roster path the gate does read", () => {
    expect(checkRosterDocsExist({ "CLAUDE.md": { skills: true } })).toEqual([]);
  });

  it("still reports a roster path that does not exist at all", () => {
    const failures = checkRosterDocsExist({ "docs/NO-SUCH-DOC.md": { skills: true } });
    expect(failures).toEqual([expect.stringMatching(/does not exist/)]);
  });
});
