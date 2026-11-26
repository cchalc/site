---
name: article
description: Use when the user types /article, or asks to write up, blog about, or publish work from the current project as a long-form post (repo article) on the Feather & Wire blog at featherandwire.dev.
---

# Publish a repo article on Feather & Wire

The blog's own behavior specs are the rules. This skill only orchestrates them, so read
them fresh every run and don't work from memory. Optional args: topic, angle, slug.

**Find the blog (`BLOG`).** This skill lives in the blog repo at
`.agents/skills/article/`. Take the skill's base directory (the loader reports it), resolve
symlinks, and go up three levels:

```sh
BLOG=$(cd "$(realpath <skill-base-dir>)/../../.." && pwd)
```

This works whether the skill loaded from the repo or through a symlink such as
`~/.claude/skills/article`. Check that `$BLOG/src/content/articles` exists. If it doesn't,
try `~/Projects/Public/blog`, then ask the user.

## 1. Read the rules

Read each of these before drafting:
- `$BLOG/AGENTS.md`
- `$BLOG/CONTRIBUTING.md`
- `$BLOG/.agents/behaviors/` → `writing-style/` (including `references/`),
  `author-post-from-notes/`, `simplify-draft/`, `draft-review/`, and
  `publishing-changes/BEHAVIOR.md`

## 2. Gather facts from the source project

- Draw on the README, the git log, the code, and this conversation.
- Obey the source project's own AGENTS.md/CLAUDE.md privacy rules. No secrets and no
  private data. Real people's names go in only if the project's rules allow it.
- Re-run whatever produces a number you plan to cite (tests, benchmarks, counts). Cite
  only what you observed. A README claim without an artifact is not a fact.
- Write the post's point as one sentence. If it won't come, ask the user.

## 3. Work in a fresh worktree

Never edit `$BLOG` itself, because it often holds other work in progress.

```sh
git -C "$BLOG" fetch origin
git -C "$BLOG" worktree add ../blog-<topic> -b cchalc/<topic> origin/main
cd "$BLOG/../blog-<topic>" && pnpm install
```

The new worktree is relative to the checkout `BLOG` points at.

## 4. Draft

- Pick the slug: lowercase kebab-case, short, from the title. The filename is the URL
  (`/articles/<slug>/`).
- Write the post to `src/content/articles/<slug>.md`. Write it by hand, not with
  `pnpm new`, which leaves `title` unquoted and breaks on a colon.
- Frontmatter:
  - Required: `title`, `description`, `pubDate`. Quote `title` and `description`.
  - Set `pubDate` to today and `draft: true`.
  - Leave `blygId` out; `pnpm blyg:sync` adds it at publish.
  - Reuse existing tags. List them with
    `grep -h '^tags:' src/content/articles/*.md* | tr -d '[]' | cut -d: -f2 | tr ',' '\n' | sed 's/ //g' | sort -u`.
- Code: a fence with a language tag. Fence titles don't render, so name the file in the
  sentence before the fence.
- Diagrams: a hand-written SVG next to the post, `![alt](./<name>.svg)`. Give the SVG
  an opaque background rect and use palette hexes from `src/styles/tokens.css`.
  - The site's theme toggle sets `data-theme`, which an `<img>` can't see, so the
    opaque card keeps it readable in both themes.
  - A plain (no-language) ASCII fence is the fallback.
  - No Mermaid in any form, including pre-rendered output.

## 5. Pipeline (from `author-post-from-notes`)

1. Run simplify, then review, in a fresh-context subagent that gets the behavior file
   paths and the draft.
2. Fix the findings.
3. Run a fresh review again. Repeat until a no-edit pass says "ready for the author".

## 6. Gate

- `pnpm build` must pass. It validates the schema but skips drafts.
- To see the draft rendered, run `pnpm dev` in the background (port 4321), then take a
  screenshot:

  ```sh
  "$CHROME" --headless=new \
    --user-data-dir=/tmp/chrome-shot --no-first-run --virtual-time-budget=5000 \
    --hide-scrollbars --window-size=900,7000 --screenshot=/tmp/<slug>.png \
    http://localhost:4321/articles/<slug>/
  ```

  `CHROME` is whatever exists, checked in this order:
  1. `/Applications/Google Chrome.app/Contents/MacOS/Google Chrome` (macOS)
  2. `google-chrome`
  3. `chromium`
  4. `nix run nixpkgs#chromium --`

  `--virtual-time-budget` matters: without it, Chrome can hang on the dev server's
  live-reload socket. If no browser is available, say so and skip the visual check. Never
  skip it silently.

  Then Read the PNG to confirm the diagrams and code render. Add `--force-dark-mode` for a
  dark pass. If the image is too tall to read, crop it with `magick in.png -crop
  900x2400+0+0 out.png` (or `nix run nixpkgs#imagemagick -- …`). The dev server
  daemonizes, so stop it with `pnpm astro dev stop`.
- Code fences wrap at about 70 characters, so reflow long lines in snippets the way
  rustfmt would, and mark trimmed code with `// ...`.

## 7. Report, then STOP

Report:
- the path and word count
- the simplifier's cuts
- the review verdict
- any `TODO:`s
- the screenshot

Then wait for the user to approve the text.

## 8. On approval only

1. Set `draft: false`.
2. Run `pnpm blyg:sync` once, then `pnpm build`.
3. Stage only the post, its assets, and `src/blyg/ledger.json`.
4. Commit `docs(articles): publish <slug>`. End the message with the commit attribution
   lines from the session's system reminder, if any. Use a plain `git commit -F <msgfile>` first. Only if a hook
   fails for lack of a TTY, retry with `script -q /dev/null git commit -F <msgfile>`. Never
   use `--no-verify`.
5. `git push -u origin cchalc/<topic>`, then `gh pr create --base main`. End the PR body
   with the PR attribution line from the system reminder, if any. If the user will
   want a fragment, add a "Companion fragment (draft)" section with its text.
6. Don't merge unless asked. Merging to `main` deploys.
7. Tell the user that once it's live, they can run `/fragment` to announce it, from a
   session that has the `blyg-studio` MCP server connected.

## Red flags: stop if you're about to

- edit `$BLOG` instead of a worktree
- set `draft: false`, run `blyg:sync`, or push before approval
- use Studio syntax (`[[id]]`, `![[id]]`, `[TK]`) in a repo article
- use Mermaid
- cite a number you didn't see
- link to something private
