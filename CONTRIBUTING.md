# Contributing / Authoring guide

This guide is for anyone — human or agent — adding or editing content.

## Add an article

1. Create a Markdown file in `src/content/articles/`. The **filename is the URL
   slug**, so use lowercase kebab-case: `my-new-post.md` → `/articles/my-new-post/`.
   Use `.mdx` instead of `.md` only if you need components in the content.
2. Add frontmatter (see fields below).
3. Write the body in Markdown.
4. Preview with `pnpm dev` and visit the page.

### Frontmatter

```yaml
---
title: Human-readable title
description: One or two sentences. Shown in listings, meta tags, and RSS.
pubDate: 2026-09-30            # YYYY-MM-DD
updatedDate: 2026-10-02        # optional
tags: [astro, web]             # optional; lowercase, kebab-case
draft: false                   # true = hidden in production builds
image: ./hero.png              # optional; path under the post, or an absolute URL
blygId: 0zz6hm48t2ctcetsgya5g098bh  # permanent Blygger id; added by `pnpm new` / `pnpm blyg:sync`
---
```

The schema is enforced at build time in `src/content.config.ts` — a missing or
mistyped field fails the build rather than shipping broken.

| Field         | Required | Notes |
|---------------|----------|-------|
| `title`       | yes      | |
| `description` | yes      | Keep it tight; it's the listing + meta text. |
| `pubDate`     | yes      | `YYYY-MM-DD`. |
| `updatedDate` | no       | Show a "last updated" date. |
| `tags`        | no       | Array of lowercase kebab-case strings. New tags get their own `/tags/<tag>/` page automatically. |
| `draft`       | no       | Defaults to `false`. `true` keeps it out of production (still visible in `pnpm dev`). |
| `image`       | no       | Hero / Open Graph image. |
| `blygId`      | no       | Permanent [Blygger](https://blygger.org/) item id. Generated for you; never change or reuse it. |

## Drafts

Set `draft: true` to work on a post without publishing it. Drafts render in
`pnpm dev` but are excluded from `pnpm build` (production). Flip to
`false` to publish.

## Images

Put per-post images next to the post or in `public/` for static assets.
Reference them with a relative path (`./diagram.png`) to get Astro's image
optimization, or an absolute URL for externally hosted images.

## Style conventions

For voice and tone, follow the
[`writing-style`](./.agents/behaviors/writing-style/BEHAVIOR.md) behavior:
playful, first person, takes stated plainly, clean language, specifics over
adjectives. Agents run every draft through
[`simplify-draft`](./.agents/behaviors/simplify-draft/BEHAVIOR.md) and
[`draft-review`](./.agents/behaviors/draft-review/BEHAVIOR.md) before the
author sees it.

Mechanics:

- Prefer `##`/`###` headings within the body (the title is rendered from
  frontmatter — don't repeat it as an `#` heading).
- Fenced code blocks with a language tag get syntax highlighting.
- Keep descriptions factual and specific.

## The blyg (`/blyg/`)

Published `.md` articles are also served as a [Blygger](https://blygger.org/spec/0.3/)
blyg at `/blyg/`: a manifest, a feed, and one JSON document per article. MDX
articles are left off it.

Each article's version history lives in `src/blyg/ledger.json`, which is
committed. After publishing, editing, unpublishing, or deleting a published
article, record the change:

```sh
pnpm blyg:sync
```

That bumps the version of changed articles, adds a withdrawal for removed
ones, and writes a `blygId` into any published article missing one. Versions
are visible to subscribers, so sync once when a change is ready rather than
after every edit. `pnpm build` fails if you forget.

## Writing in Blygger Studio (Fragments)

Short-form posts are written in [Blygger Studio](https://blyg.featherandwire.dev/studio),
not in this repo. Studio has its own authoring syntax (transclusion, internal
links, instructed generation, stubs, forks), documented below.

**Where the syntax works.** Only in Studio's composers (the quick composer, the
fragment editor and the thread editor). Articles in `src/content/articles/` are
rendered by Astro, which knows none of it: `![[id]]`, `[[id]]` and
`[TK]…[/TK]` would publish as literal text. In repo articles, use standard
Markdown and the MDX components (`Admonition`, `Badge`, `Figure`) only.

**Choosing where a piece goes.**

| Piece | Where | How it's published |
| --- | --- | --- |
| Long-form, polished article | `src/content/articles/<slug>.md` in this repo | Site page + `/blyg/` thread item (`pnpm blyg:sync`) |
| Short note (≤ ~1,000 characters) | Studio, as a **fragment** | blyg.featherandwire.dev |
| Response to, or quotation of, another post | Studio, as a **thread** (often a **stub**) | blyg.featherandwire.dev |

**Agents can't publish to Studio.** It's behind the author's owner login. For
Studio pieces, draft the text using the syntax below and hand it to the author
to paste and publish. Never invent item ids: ask the author for them, or take
them from a repo article's `blygId`.

**Quoting site articles from Studio.** Every published repo article is an item
on the `/blyg/` blyg, and its id is the `blygId` in its frontmatter. Once
Studio subscribes to `https://featherandwire.dev/blyg/`, a Studio thread can
quote an article with `![[<blygId>]]` or link to it with `[[<blygId>]]`.

### Studio syntax reference

Standard Markdown always works (paragraphs, headings, lists, links, emphasis,
code). Everything below is Studio-private authoring syntax: none of it reaches
the wire except where noted.

#### Transclusion: `![[id]]`

- **Threads only.** Fragments can't transclude anything.
- **Alone on its own line**, nothing else: `![[7c9wk2n4h6q1x8v0z3m5rjy2ke]]`.
- **Resolution order:** one of your own published items, then an imported item
  from one of your blyg subscriptions. Drafts and withdrawn items resolve to
  neither.
- **Either kind, either side.** Fragments and threads share one id space, so a
  thread can quote a fragment or another thread, yours or theirs. There is no
  type sigil in the directive and none is needed. Quoting a thread nests it:
  since what gets baked is a snapshot, the quoted thread's own quotes arrive
  already rendered inside yours, with no recursive resolution and no second
  fetch.
- **A directive names an identity, not an origin.** If the same id arrived from
  two different origins, that is a publish error, not a guess.
- **Plain RSS (L0) items can't be transcluded.** A legacy feed has no item
  documents and no versions, so there is nothing to snapshot. The error says so
  by name.
- **What gets baked is always the local snapshot, never a live fetch.** That is
  what makes publishing network-independent, and what stops a remote source's
  later edits from rewriting your quote.
- **No cycles.** A thread can't transclude itself, or any thread whose own local
  quotes lead back to it. Remote chains aren't walked.
- **Always the current version.** Transclusion takes the target's current
  version at publish time. An explicit pinned-version form, `![[id@v3]]`, is
  reserved syntax, not implemented: using it fails publish with an explicit
  error rather than resolving.
- **Any unresolvable id fails the whole publish**, with every bad reference
  listed. In the thread editor, type `![[` at the start of a line to open a
  picker; an unresolvable ref shows a red placeholder in preview before you
  publish.

#### Plain internal link: `[[id]]`

- **Inline, anywhere**, mid-sentence, unlike `![[id]]`, which must own its line.
  One `!` apart, and two different acts: the directive bakes a snapshot, the
  link just points.
- **Resolves exactly like a directive:** one of your published items of either
  kind, then an imported item from a blyg subscription. Same errors, same
  publish-time failure: an unresolvable link fails the whole publish.
- **Renders as an ordinary anchor** to the target's own page, absolute (your own
  origin, or theirs for an imported item). The link text is a short quote from
  the target: items have no titles, so an id would tell a reader nothing.
- **It notifies nobody.** No `transclusions[]` entry, no Webmention, nothing on
  the wire but an anchor in your HTML. Every other way of citing in this medium
  tells the other side; this is the one that deliberately does not.
- Inside a `[TK]` scope's output it works the same way. Inside a code span or
  code block it is plain text, as are `![[id]]` and `[TK]`, so you can show the
  syntax in code. Inside another link it becomes text, so links never nest.
- Type `[[` in any composer (quick composer, fragment editor, thread editor) to
  open the same picker the directive uses. It offers the same candidates,
  because a link resolves by the same order; only the insertion differs.

#### Instructed generation (TK): `[TK]…[/TK]`

- Available in both the fragment composer and the thread editor.
- **Ungenerated scope:** `[TK]an instruction[/TK]`. **Generated scope:**
  `[TK]an instruction[=]the output[/TK]`. Studio writes the `[=]output` part
  for you when you click Generate/Regenerate; don't type it by hand.
- **An empty instruction**, `[TK][/TK]`, is valid: the "journalism TK"
  placeholder.
- A scope is **block-level** if it sits alone in its own paragraph, **inline**
  otherwise. Same grammar either way, no separate syntax.
- **No nesting:** a `[TK]` scope can't contain another.
- **Publish strips every scope down to its bare output**, so readers never see
  the instruction. Machine-generated spans carry a provenance record plus a
  highlighted style; hand-written or hand-edited output carries no disclosure.
  Publish fails if any scope still has no output ("never generated").
- **Text generated somewhere else:** `[TK]impyrt=the pasted text[/TK]`, or
  `[TK]impyrt claude-opus-5=the pasted text[/TK]` if you know the model. The
  text publishes as written and is disclosed as machine-generated, with no
  sources declared and no generation time. In the editor, select pasted text
  and use **mark selection as generated** to wrap it. It is never regenerated,
  and nothing in it is read as a source reference.

#### Source refs inside a TK scope: `![[id]]` (own-line or inline)

- **A different meaning from plain transclusion.** Inside a `[TK]…[/TK]` scope,
  every `![[id]]`, whether alone on its line or inline in the instruction or
  output text, is a source reference fed to the generator, not a quote. It's
  disclosed in the published `generated[].sources` provenance, never rendered
  as a blockquote.
- **Same id rule as transclusion**, but it must resolve to one of your own
  published fragments.
- **Works in fragment scopes too**, even though a fragment can't do a plain
  transclusion outside a scope.
- **A TK scope can't also contain a plain transclusion.** Keep the two apart
  rather than nesting them.

#### Responding vs. descending: stub and fork

Neither is authoring syntax. Both are Studio actions that make a draft for you,
and both put a citation on the published document. They are easy to confuse
and mean opposite things: **a stub cites something you are writing about; a
fork records something you are writing from.** A stub's body is yours from the
first keystroke; a fork's body starts as someone else's bytes.

##### Stub: "I am responding to this"

- **Where:** `stub ↗` on any entry in reading, or on a hopper's members.
- **A stub is a thread that declares exactly one target.** Threads only, which
  is what makes stubs stackable: threads can be transcluded, so a stub of a stub
  is nesting rather than a new construct.
- **The target** is either another blyg's item or any URL on the plain web.
  Nothing is asked of it: no pin, no cooperation, no blyg on the other end.
- **The body is yours.** The stub action starts it with `![[id]]` for blyg
  targets, quoting the whole post, because a stub without the quote isn't a
  stub in this medium's aesthetic. Delete the directive and you have published
  a response-by-link, which is legitimate and still verifies.
- **One action, four familiar shapes.** Where your words go and how much you
  quote make the difference:
  - words above a whole-post quote: a quote post
  - words below a whole-post quote: a reply
  - words above a passage: commentary on an excerpt
  - words below a passage: an inline reply
  - no words of your own on a whole-post stub: a repost

  A stub is a response, so stubbing everything a source publishes with nothing
  to say is the misuse spec §10.6 describes.
- **Quoting a passage.** Put it on the lines right after `![[id]]`, with `>` at
  the start of every line, blank ones included, or use **quote a passage
  instead** above the stub editor and select it in the post. It must be one
  unbroken stretch of the original, and is published as plain text, one
  paragraph per line. Several passages, each under its own `![[id]]`, make a
  running commentary; once a stub has one, the chooser adds the next after the
  cursor.
- **Exactly one target.** Other transclusions in the body are quotes, not
  additional targets.
- If the published body does transclude the target, the citation takes the
  version actually baked, so the two can never disagree on a published
  document.
- **This is a gesture, not a reply object.** There is no reply primitive in the
  protocol and there never will be. Transclusion is the primitive; the stub is
  the marker that says a response is what you meant.

##### Fork: "this is where my text came from"

- **Where:** `fork ↗` on a blyg-native entry in reading, or `fork…` on a pinned
  row in your own item's history panel. Both open the same picker, which lists
  that item's pinned versions and nothing else.
- **A fork starts a new draft of your own** whose content is the source's pinned
  text, of the same kind as the source. You then edit it as your own item,
  because it is one.
- **Only a pinned version can be forked.** A pin is a promise to serve those
  exact bytes forever, so it is the only thing a lineage pointer can name and
  still resolve years from now. An item with no pins offers nothing to fork;
  that is not an error, just an act its author hasn't taken.
- **Lineage is fixed the moment the draft is made, and has no setter.** Content
  and the claim about where it came from are not separable, or a draft could be
  forked and then quietly disowned.
- **It survives withdrawal.** The endcap empties what the item said (that is
  the published work being taken back), but where it came from is not the work,
  so it stays, alongside `created`.
- **A fork is neither a quote nor a response.** It says nothing about agreeing,
  replying, or even having read the rest of that blyg.
- **Forking your own pinned version** is ordinary and useful: it's how you start
  a new line of thought from a state you promised to keep.

Both citations carry the same `{origin, id, version}` shape, deliberately: "a
citation is absolute" is one rule, not two, so `origin` is required even when
it is your own.

## Before you commit

Always confirm the site still builds:

```sh
pnpm blyg:sync   # only if published content changed
pnpm build
```

If it fails, fix the error before committing — the deploy runs the same command.
