#!/usr/bin/env python3
"""PreToolUse hook: block hand-edits to generated token CSS (ADR-0003).

Generated files carry a "GENERATED — do not edit" header; the sources are
packages/tsugite/theme-default/*.tokens.js, regenerated via `pnpm tokens`.
"""
import json
import sys

data = json.load(sys.stdin)
path = (data.get("tool_input") or {}).get("file_path", "")

if path.endswith(".generated.css") or path.endswith("styles/ui-tokens.css"):
    print(
        "Blocked: this file is generated (ADR-0003). Author tokens in "
        "packages/tsugite/theme-default/*.tokens.js and run `pnpm tokens`.",
        file=sys.stderr,
    )
    sys.exit(2)
