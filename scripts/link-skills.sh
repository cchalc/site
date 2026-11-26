#!/usr/bin/env bash
# Link this repo's agent skills (.agents/skills/<name>) into the user-level skill
# directories, so /article and /fragment work from any project and any harness.
#
#   bash scripts/link-skills.sh            # link (idempotent)
#   bash scripts/link-skills.sh --dry-run  # show what would change
#
# The repo copy stays the only real copy; user-level entries are symlinks to it.
# Run it from the checkout you keep on main: the links follow whatever branch that
# checkout has. A real directory already at a link's path is moved to
# ~/.agents/skill-backups/ first, never deleted.
set -euo pipefail

repo=$(cd "$(dirname "$(realpath "$0")")/.." && pwd)
src="$repo/.agents/skills"
dry=0
[[ "${1:-}" == "--dry-run" ]] && dry=1

run() { if ((dry)); then echo "would: $*"; else "$@"; fi; }

branch=$(git -C "$repo" rev-parse --abbrev-ref HEAD 2>/dev/null || echo "?")
if [[ "$branch" != "main" ]]; then
  echo "note: $repo is on '$branch', not main; links will follow that checkout." >&2
fi

# Claude Code reads ~/.claude/skills. pi, Codex, Gemini CLI and Copilot CLI read
# ~/.agents/skills. Skip the second when it already includes the first, so no
# harness loads a skill twice.
targets=("$HOME/.claude/skills")
claude_real=$(realpath "$HOME/.claude/skills" 2>/dev/null || true)
agents_claude=$(realpath "$HOME/.agents/skills/claude" 2>/dev/null || true)
if [[ -z "$claude_real" || "$agents_claude" != "$claude_real" ]]; then
  targets+=("$HOME/.agents/skills")
fi

backup="$HOME/.agents/skill-backups"
stamp=$(date +%Y%m%d-%H%M%S)

for skill in "$src"/*/; do
  skill=${skill%/}
  name=$(basename "$skill")
  for dir in "${targets[@]}"; do
    dest="$dir/$name"
    if [[ -L "$dest" && "$(realpath "$dest" 2>/dev/null)" == "$(realpath "$skill")" ]]; then
      echo "ok      $dest"
      continue
    fi
    run mkdir -p "$dir"
    if [[ -L "$dest" ]]; then
      run rm "$dest"
    elif [[ -e "$dest" ]]; then
      run mkdir -p "$backup"
      run mv "$dest" "$backup/$name.bak-$stamp"
      echo "backup  $dest -> $backup/$name.bak-$stamp"
    fi
    run ln -s "$skill" "$dest"
    echo "linked  $dest -> $skill"
  done
done
