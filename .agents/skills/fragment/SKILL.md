---
name: fragment
description: Use when the user types /fragment, or asks to post a short note, quick take or announcement (under about 1,000 characters) to Blygger Studio for the Feather & Wire blog, often pointing at a published featherandwire.dev article.
---

# Publish a Studio fragment

A fragment is public the moment it's published, and every publish mints a version.
Rules live in the blog repo, so read them fresh.

**Find the blog (`BLOG`).** This skill lives in the blog repo at `.agents/skills/fragment/`.
Take the skill's base directory, resolve symlinks, and go up three levels:

```sh
BLOG=$(cd "$(realpath <skill-base-dir>)/../../.." && pwd)
```

Check that `$BLOG/.agents/behaviors/studio-fragment` exists. If it doesn't, try
`~/Projects/Public/blog`, then ask the user.

If the fragment announces an article, the article must already be merged and live. If
it isn't, draft the text and leave it for later, for example in the article's PR body.

## 1. Read the rules

- `$BLOG/.agents/behaviors/studio-fragment/BEHAVIOR.md`
- `$BLOG/.agents/behaviors/writing-style/BEHAVIOR.md` and its `references/ai-tells.md`
- the "Writing in Blygger Studio" section of `$BLOG/CONTRIBUTING.md`

## 2. Check that the MCP works

The server's tools include `listItems`, `listSubscriptions`, `createItem` and `publishItem`.
In Claude Code they're named `mcp__blyg-studio__<tool>`. If they're deferred, load them with
ToolSearch.
Make a read-only `listItems` call. If the server is missing or returns 401, stop and
tell the user:

> Run `cd <MAIN> && direnv allow`, check `BLYG_STUDIO_TOKEN` in `.envrc`, then restart
> your agent from that folder and run `/fragment` again.

`<MAIN>` is the blog's main checkout, the one that holds the gitignored `.envrc`. A
worktree doesn't have one. Find it with:

```sh
git -C "$BLOG" worktree list --porcelain | awk 'NR==1{print $2}'
```

If they'd rather not fix it now, finish steps 3–5 anyway and hand them the approved
text to paste into Studio.

Never look for, read or print the token yourself. Then call `listSubscriptions`. If
Studio subscribes to this site's blyg, link with `[[<blygId>]]`. Otherwise use a plain
Markdown link.

## 3. Pin the source

- **Pointing at an article:**
  - Find it in `src/content/articles/`.
  - Require `draft: false`.
  - Require `curl -s -o /dev/null -w '%{http_code}' https://featherandwire.dev/articles/<slug>/`
    to return `200`.
  - Every fact must already be in the article.
- **Standalone note:** use only facts you verified in the current project. Public links
  only: no private repos, internal docs, or local paths.

## 4. Draft and count

Write the fragment in this order:
1. One hook line.
2. The take.
3. One or two concrete details.
4. The link.

Then count it, and stay at or under 1,000:

```sh
printf %s "$text" | LC_ALL=en_US.UTF-8 wc -m
```

If a draft was left in a PR body or an earlier report, start from it, but re-check
every fact against the live article.

## 5. Show the text, then STOP

Show the exact text and its character count. Wait for an explicit go-ahead on that
text.

## 6. On approval only

1. Call `createItem` with `mode: blank`, `kind: fragment`, and the approved text.
2. Call `publishItem`.
3. Report the item id and version.
4. Never edit or withdraw a published fragment without asking. A withdrawal is a
   permanent, visible endcap.
