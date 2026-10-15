---
name: draft-review
description: Review a draft (repo article or Studio piece) against the Feather & Wire voice before the author sees it. Report findings that quote the exact span, name the rule, and suggest a fix; never rewrite the draft or its takes.
---

# Review a draft

How an agent reviews a draft after `simplify-draft` and before the author
reads it. The goal is that nothing reaches the author sounding stiff,
AI-generated, unsourced, or not like them.

## Intent

The author is playful and direct and doesn't want posts that read as stuffy,
elitist, or machine-written. A second set of eyes catches what the drafter
can't see in their own text. The reviewer **finds and reports**; the author
(or the drafter, on instruction) makes the changes.

## Evidence

Before reviewing, read:

- The whole draft, including frontmatter.
- [`writing-style`](../writing-style/BEHAVIOR.md) and both references:
  [`style-analysis.md`](../writing-style/references/style-analysis.md) and
  [`ai-tells.md`](../writing-style/references/ai-tells.md).
- For a Databricks post: the public docs, release notes, or author-supplied
  research the draft relies on. Open the linked sources; don't trust that a
  link supports the sentence it's attached to.
- For a Studio piece: the "Writing in Blygger Studio" section of
  `CONTRIBUTING.md`, so Studio syntax is used correctly.

## Rules

Each rule is checked across the whole draft. Each violation is one finding.

### Sounds like the author, not a template

The draft follows `writing-style`: first person, contractions, a hook or
problem up front, takes stated plainly, mixed sentence lengths, and an ending
that stops when the point is made.

**Why:** Voice drift is the most common way a draft stops sounding like the
author, and the author can't fix what isn't pointed out.

### Has a personality

The draft contains things only this author would write: at least one moment
of humor, a parenthetical aside, an honest "I'm not sure", or a concrete
personal detail (something that happened, a tool they actually use, a number
they measured). Apply the **swap test** to each paragraph: if it could appear
unchanged on any company's engineering blog, flag it as generic.

A draft with no AI tells and no errors but no personality is **not** ready.
The suggested fix must use material the author actually supplied (their
notes, research, the About page), or ask the author for a real detail. Never
suggest inventing an anecdote, number, or experience.

**Why:** Avoiding bad patterns isn't enough. The author's complaint is posts
that sound stuffy or machine-written, and blandness is the most common way
that happens.

### No AI tells

None of the patterns in `ai-tells.md` appear, or they appear rarely enough not
to form a pattern. Flag each instance; mark clusters as more severe.

**Why:** Readers recognize these patterns quickly and stop trusting the post.

### Every claim is supported

Every factual claim, number, benchmark, or quote is either the author's own
experience (clearly framed as such), or is linked to a source that actually
supports it. Flag invented-looking specifics.

**Why:** A single made-up number undermines every true one around it.

### Databricks content is public

For Databricks topics, product claims come from public docs, public release
notes, or research the author supplied, and they link to it. Nothing reads as
internal: no roadmaps, unreleased features, customer names, internal tools,
internal metrics, or "I heard internally".

**Why:** The author works at Databricks; posts must only use public
information.

### Clean and kind

No profanity, including mild swearing. Humor is aimed at systems,
situations, and the author themself, never at readers, colleagues, other
companies' people, or users.

**Why:** Every post should be shareable at work and with customers, and
punching at people reads as elitist, which the author explicitly doesn't want.

### No padding

No point is made twice, no section restates the intro, and no paragraph
exists only to transition.

**Why:** Padding is how a good 800-word post becomes a tedious 1,500-word one.

### Mechanics

Frontmatter is valid per `CONTRIBUTING.md`, there's no top-level `#` heading
in a repo article, code blocks have language tags, links resolve, and Studio
syntax (`![[id]]`, `[[id]]`, `[TK]`) appears only in Studio pieces.

**Why:** These break the build or the page, and they're cheap to catch here.

## Execution

1. Read everything in Evidence before writing any finding.
2. Produce a review with:
   - a one-line **verdict**: "ready for the author" or "needs another pass"
   - findings ranked most severe first. Each finding:
     - quotes the exact span (short)
     - names the rule it breaks
     - says why, in one sentence
     - suggests a fix, or "cut"
   - a **rule checklist**: one line per rule above, "pass" or "fail", with
     a short reason for each pass. A verdict of "ready" needs every rule to
     pass with a reason, not just an absence of findings.
   - a short **what's working** list (2–3 items), so good choices survive the
     next edit
3. Don't edit the draft. Leave the fixing to the drafter or the author.

## Recovery

- **A source can't be opened:** flag the claim as unverified rather than
  assuming it's fine.
- **Unsure whether a line is the author's voice or an AI tell:** flag it as a
  question, not an error, and let the author decide.
- **The draft is good:** say "ready for the author" with only minor findings,
  backed by the rule checklist. Don't invent problems to look thorough, but
  don't mistake "nothing wrong" for "sounds like the author" either.

## Failure modes

- Rewriting the draft, or proposing fixes that change the author's takes.
- Flattening the humor ("this joke is unnecessary") when it's on-voice.
- Approving a draft the reviewer itself edited earlier in the same session;
  a fresh pass is required after fixes.
- Vague findings ("tighten this section") with no quoted span or rule.
- Passing a correct but bland draft because it breaks no rule.
- Passing Databricks claims without opening the cited source.
