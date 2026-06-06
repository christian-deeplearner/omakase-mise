#!/usr/bin/env bash
# Omakase PreToolUse guard — guardrails in the brief, not in your nerves.
# Receives the tool call as JSON on stdin. Exit 2 = block (message shown to the model).
# A small, legible example of harness-level safety: hooks turn a standard into a wall.

input="$(cat)"
cmd="$(printf '%s' "$input" | jq -r '.tool_input.command // ""' 2>/dev/null)"

# 1) Never force-push shared history. Git is memory, not an Etch A Sketch.
if printf '%s' "$cmd" | grep -Eq 'git[[:space:]]+push([[:space:]]|$).*(--force([^-]|$)|--force-with-lease|(^|[[:space:]])-f([[:space:]]|$))'; then
  echo "BLOCKED: force-pushing shared history is not allowed (CLAUDE.md: Git is memory). Land a new commit instead." >&2
  exit 2
fi

# 2) Never rm -rf at the repo root or above.
if printf '%s' "$cmd" | grep -Eq 'rm[[:space:]]+(-[a-zA-Z]*r[a-zA-Z]*f|-[a-zA-Z]*f[a-zA-Z]*r)[[:space:]]+(/|\.|\*|~)'; then
  echo "BLOCKED: refusing a destructive recursive delete at the repo root. Be specific about the path." >&2
  exit 2
fi

# 3) Production deploys are confirmed, never silent. Warn, but allow.
if printf '%s' "$cmd" | grep -Eq 'vercel.*(--prod|deploy)'; then
  echo "NOTE: this is a PRODUCTION deploy. Confirm the verification gate is green (pnpm build + pnpm test:e2e) before shipping. (Omakase /ship)" >&2
fi

exit 0
