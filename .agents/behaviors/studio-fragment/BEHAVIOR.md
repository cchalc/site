---
name: studio-fragment
description: Write and publish a short Blygger Studio fragment, usually announcing or pointing at a repo article, through the blyg-studio MCP server. Draft first, show the exact text, publish only on the author's go-ahead, and link only to public pages.
---

# Studio fragment

How an agent writes and publishes a short Studio piece (a **fragment**, about
1,000 characters at most), most often the companion note for a repo article.

## Intent

A fragment is a quick take that points readers at the longer piece. It is
public the moment it is published and every publish is versioned, so the text
must be the author's, accurate, and approved before it goes out.

## Evidence

- The repo article the fragment points at, and its URL on the live site.
- [`writing-style`](../writing-style/BEHAVIOR.md) for the voice, and the
  "Writing in Blygger Studio" section of `CONTRIBUTING.md` for syntax.
- That the `blyg-studio` MCP server is connected (a read-only `listItems`
  call). It authenticates with `BLYG_STUDIO_TOKEN` from the gitignored
  `.envrc`.
- Whether Studio subscribes to this site's blyg (`listSubscriptions`). If it
  doesn't, `[[<blygId>]]` won't resolve.
- That the article is live, so the link works.

## Decision

- **Link only to public pages.** The article's live URL, public docs, public
  repos. Never a private repo, internal doc, local path, token, or anything
  behind a login. If the only available source is non-public, leave it out.
- **Plain Markdown link** to the article URL when Studio has no subscription
  to this site; `[[<blygId>]]` only once it does.
- **Facts come from the article.** The fragment adds no number, claim or
  anecdote the article doesn't already carry.
- **Publishing is author-gated.** Create the item as a draft, show the exact
  text, and call `publishItem` only after an explicit go-ahead on that text.
- Fragments can't transclude (`![[id]]`); that's for threads.

## Execution

1. Confirm the article is live and note its URL.
2. Draft in the house voice: one hook line, the take, one or two concrete
   details from the article, then the link. Stay under the length cap.
3. Show the text to the author with the character count.
4. On approval: `createItem` with `mode: blank`, `kind: fragment`, then
   `publishItem`. Report the item id and version.
5. Don't edit a published fragment without asking; each publish mints a new
   version that subscribers see.

## Recovery

- **The MCP server isn't connected:** start the agent from the blog folder
  after `direnv allow`, or hand the text to the author to paste into Studio.
- **A call is rejected on scope:** report which scope is missing; don't try
  another credential.
- **The text was published wrong:** tell the author immediately; use
  `withdrawItem` only if they ask, since a withdrawal is a visible endcap.

## Failure modes

- Publishing before the author approved the exact text.
- A link to something non-public, or a `[[id]]` that doesn't resolve.
- Claims or details that aren't in the article.
- Going over the length cap, or writing a fragment that is just a title and a
  link.
- Putting a token or private path in the text.
