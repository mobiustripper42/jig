---
name: build-task
description: Build a specced task through @test-writer and @implementer instead of coding it in the session. For tasks of 3 points or more that change behavior, once the spec is written into the issue from this skill's task-spec.md and the branch is cut. Replaces the prove / build / run-the-proof steps and ends by running /kill-this.
tools: Read, Edit, Write, Bash, Glob, Grep, Agent
---

You are the Lead. You do not write production code or tests in this skill. You check the spec, hand
work to two agents, verify what they return, and ship. Every check below is one you run yourself —
an agent's report that something passed is a claim, not a result.

**The operator running this skill is the approval of the spec.** The spec was written into the
issue from `task-spec.md` (beside this file) and worked through with the operator before now:
the summary first, then the job and acceptance criteria, then the `[Lead]` lines. Do not present
it again. From here the run goes to the pull request, stopping only where information turns out
to be missing.

## Step 0 — Gate

Abort with a one-line reason if any of these fail:

- **Points.** The issue carries `points:3` or higher. Below that, use the normal loop.
- **Testable.** At least one acceptance criterion is something the `Proof` slot can check —
  behavior, data, or on-screen wording and order. A task that is only layout, spacing or styling
  has nothing for `@test-writer` to assert: use the normal loop, with `@ui-reviewer` and a
  screenshot at the hand-back.
- **Branch.** You are on `task/X.Y-*`, not `main`.
- **Proof slot.** `.claude/CLAUDE-context.md` § Workflow Mechanisms names a real `Proof` and
  `Proof command`. If it says `none`, there is nothing to write tests in — use the normal loop.
- **Spec.** Read the issue body with `gh issue view <N>`. Every section in `task-spec.md` is
  present and non-empty, and `Open questions` is empty. "None" is an answer; blank is not.

The issue body is the spec. Agents are pointed at it by number. Never paraphrase it into a prompt.

## Step 1 — Readback

Spawn `@test-writer` with: the issue number, and the instruction **readback only — write nothing.**

It returns two lists: **assumptions** (things it would have to decide that the spec does not) and
**questions**. If both are empty, go to Step 2.

Sort each item:

- **An assumption the code settles** — write the answer into the section it belongs to as a
  `[code]` line with the path (`gh issue edit <N> --body-file`), and keep going. Note it for the
  receipt.
- **An assumption that needs a judgment call, or a question** — stop. Put these in front of the
  operator. Write each answer into the issue body as a `[you]` line, not just into the chat.

After any edit to the issue body, run Step 1 again on the updated spec. An answer that lives only
in this conversation is invisible to both agents.

## Step 2 — Tests

Spawn `@test-writer` with: the issue number, and the instruction **write the tests.**

It returns: the test files it wrote, a map of acceptance criterion → test names, and the output of
running them. Check, in order:

1. **Coverage both ways.** Every acceptance criterion has at least one test. Every test names the
   criterion it covers. A gap either way goes back to `@test-writer`.
2. **Fails for the right reason.** Run the `Proof command` yourself. Each test must fail on the
   behavior the spec names — a missing function, a wrong value — not on a typo, a bad import path,
   or broken setup. Wrong-reason failures go back to `@test-writer`.
3. **Lock the tests.** `sha256sum <test files> > "$(git rev-parse --git-dir)/build-task.lock"`.
   Inside the git directory it is never committed and needs no ignore line. This is what proves
   Step 3 did not touch them.

## Step 3 — Implement

Spawn `@implementer` with: the issue number, the test file list, and the failing output from
Step 2.

It returns one of:

- **Done** — a summary of what changed. Go to Step 4.
- **Stop** — a test it believes is wrong, and why. Do not let it work around the test. Bring it to
  the operator: either the spec was wrong (fix the issue body, back to Step 2) or the test was
  (back to Step 2 with the finding).

## Step 4 — Verify

1. `sha256sum -c "$(git rev-parse --git-dir)/build-task.lock"` — any changed test file fails the task. Discard the
   implementation and re-run Step 3 once. A second violation: stop and tell the operator.
2. Run the `Proof command` yourself. Green, or back to Step 3 with the failure output.

**Two failed `@implementer` rounds on the same tests: stop and ask.** Something is wrong with the
spec, the tests, or the task's size, and a third round is spending the allowance to find out
which.

## Step 5 — Ship

Run `/kill-this`. When it reaches code-review findings, route each one:

| Finding | Goes to |
|---|---|
| Real bug a test should have caught | `@test-writer` (new test, re-lock), then `@implementer` |
| Real bug, tests are fine | fresh `@implementer`, finding as its brief |
| One-line cleanup, naming, a constant | fix it yourself |
| Architectural | escalate to `@architect`, as `@code-review` already says |

After any fix: Step 4 again, then let `/kill-this` open the pull request.

## Step 6 — Receipt

Print every time, before the hand-back:

```
/build-task receipt — issue #<N>
  readback      — <rounds>, <questions asked>
  settled       — <n> [code] lines added during the run (<sections>) | none
  test-writer   — <tests> tests across <criteria> criteria
  implementer   — <rounds> rounds
  test lock     — intact | violated (<file>)
  review routes — <n> to test-writer, <n> to implementer, <n> fixed by Lead
```

The receipt is also the data for the side-by-side trial: it is what this workflow spent, in a
shape the old loop's session file can be compared against.
