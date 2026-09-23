#!/usr/bin/env python3
"""PreToolUse hook: enforce git flow (root CLAUDE.md hard rule 5).

Blocks commits/merges while on main and force-pushes anywhere.
The routine side of the rule lives in the git-flow skill.
"""
import json
import re
import subprocess
import sys

data = json.load(sys.stdin)
command = (data.get("tool_input") or {}).get("command", "")
cwd = data.get("cwd") or "."

if not re.search(r"\bgit\b", command):
    sys.exit(0)

if re.search(r"\bgit\b[^|;&]*\bpush\b[^|;&]*(\s-\w*f|\s--force)", command):
    print(
        "Blocked: force-push is never allowed (root CLAUDE.md hard rule 5).",
        file=sys.stderr,
    )
    sys.exit(2)

if re.search(r"\bgit\b[^|;&]*\b(commit|merge)\b", command):
    # The session's cwd is reset to the project root between commands, so a
    # commit made from a worktree (`cd <path> && git …` or `git -C <path> …`)
    # must be judged in that worktree, not at the root.
    target = re.match(r"\s*cd\s+(?:\"([^\"]+)\"|'([^']+)'|(\S+))\s*(?:&&|;)", command) or re.search(
        r"\bgit\s+-C\s+(?:\"([^\"]+)\"|'([^']+)'|(\S+))", command
    )
    if target:
        cwd = next(g for g in target.groups() if g)
    try:
        branch = subprocess.run(
            ["git", "branch", "--show-current"],
            cwd=cwd, capture_output=True, text=True, timeout=10,
        ).stdout.strip()
    except Exception:
        sys.exit(0)
    if branch == "main":
        print(
            "Blocked: no commits or merges directly on main (root CLAUDE.md "
            "hard rule 5). Create a branch (feat/, fix/, chore/, docs/) and "
            "open a PR — see the git-flow skill.",
            file=sys.stderr,
        )
        sys.exit(2)
