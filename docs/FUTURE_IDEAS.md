# jig — Future Ideas

Parked, not planned. An entry here is an idea with a reason attached, not a commitment.

---

## The word ceiling

A check that counts the always-loaded surface and fails the build when it goes over a set number,
so `CLAUDE.md` and `.claude/CLAUDE-context.md` cannot regrow after being cut from 13,053 words to
4,795.

**Why it is parked rather than built.** It looks simple and is not. Three constraints came with the
idea, and the third is unresolved:

- It has to cover the whole surface, not one file, or the escape is moving prose across the
  boundary and going green while a session loads exactly as much.
- It has to enumerate what is loaded rather than hardcode paths, or the next escape is a third
  always-loaded file the check does not know about.
- **It does not actually know what "loaded" means.** The two files load in full, but every skill
  and agent `description:` line loads too, and so does the output style. A ceiling over two files
  would report a number that is honest about those files and wrong about the session — and the
  escape it exists to prevent works perfectly by padding an agent description.

Words are also a proxy for tokens rather than tokens.

**What would make it worth building:** an observation that the surface is growing. It has been cut
once and nothing has pushed back on it yet. Build the thing when the need is observed.

**Revisit if:** the always-loaded surface exceeds ~5,300 words, or a second cut becomes necessary
for the same reason as the first.
