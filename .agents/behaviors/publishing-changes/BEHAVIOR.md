---
name: publishing-changes
description: Build, commit, and deploy changes to the site safely — the build must pass, and publishing a post or pushing to the deploy branch needs author approval.
---

# Publishing changes

How an agent commits and ships changes in this repository.

## Intent

Get reviewed, building changes onto the live site without shipping broken pages
or publishing drafts prematurely. The deploy branch is auto-deployed by
Cloudflare Pages, so what lands there goes public.

## Evidence

- Output of `pnpm build` — the single source of truth for "does it work".
- `git status` / `git diff` — what is actually about to be committed.
- Whether the change publishes content: a new post, or flipping `draft: false`.

## Decision

- **Never push a failing build.** `pnpm build` must complete cleanly first.
- **Publishing is author-gated.** Do not flip `draft: true` → `false`, and do
  not push to the deploy branch, without explicit author approval.
- Commit scope should be coherent: one post or one logical change per commit.
- Don't commit `dist/`, `node_modules/`, or `.astro/` (already gitignored).

## Execution

1. `pnpm build` → confirm it passes.
2. `git status` and review the diff; stage only intended files.
3. Write a clear commit message describing the change.
4. Push only when the author has approved publishing. Cloudflare Pages rebuilds
   from the deploy branch automatically; verify the live URL afterward.

## Recovery

- **Build fails:** fix it before committing. Do not use `--no-verify` or
  comment out code to force a green build.
- **Pushed something wrong:** tell the author immediately; revert the commit and
  push the revert rather than force-pushing over history.
- **Unsure whether a change should go live:** leave it as a draft / local commit
  and ask.
