#!/usr/bin/env python3
"""Inject a small operating-mode reminder into Claude Code.

Default mode keeps Claude in PM/tech-lead posture and prefers Codex for code
changes and reviews. If the submitted prompt invokes a gstack slash command,
the PM-only bias is suspended for that turn so the active gstack skill can run
at full fidelity.
"""

from __future__ import annotations

import json
import re
import sys
from typing import Any


GSTACK_SKILLS = [
    "office-hours",
    "plan-ceo-review",
    "plan-eng-review",
    "plan-design-review",
    "design-consultation",
    "design-shotgun",
    "design-html",
    "review",
    "ship",
    "land-and-deploy",
    "canary",
    "benchmark",
    "browse",
    "connect-chrome",
    "qa",
    "qa-only",
    "design-review",
    "setup-browser-cookies",
    "setup-deploy",
    "retro",
    "investigate",
    "document-release",
    "codex",
    "cso",
    "autoplan",
    "careful",
    "freeze",
    "guard",
    "unfreeze",
    "gstack-upgrade",
    "learn",
]

GSTACK_PATTERN = re.compile(
    r"(^|\s)/(?:gstack-)?("
    + "|".join(re.escape(skill) for skill in GSTACK_SKILLS)
    + r")(?=\s|$)"
)

DEFAULT_CONTEXT = (
    "Default mode for this repo: act as PM/tech lead. Prefer Codex via MCP for "
    "implementation, refactors, bug fixes, and code review. Use Claude mainly "
    "for scoping, planning, delegation, acceptance criteria, and synthesis. "
    "Only code directly if the user explicitly asks or Codex is unavailable."
)

GSTACK_CONTEXT = (
    "Detected a gstack slash command. For this turn, suspend the repo's "
    "PM-only default and follow the invoked gstack skill at full fidelity. Do "
    "not cut required planning, review, or QA steps just to save tokens. After "
    "the gstack turn, revert to the default PM/Codex mode."
)


def extract_prompt(payload: Any) -> str:
    if isinstance(payload, str):
        return payload
    if isinstance(payload, dict):
        for key in ("prompt", "text", "message", "userPrompt", "user_prompt"):
            value = payload.get(key)
            if isinstance(value, str) and value.strip():
                return value
        for value in payload.values():
            prompt = extract_prompt(value)
            if prompt:
                return prompt
    if isinstance(payload, list):
        for value in payload:
            prompt = extract_prompt(value)
            if prompt:
                return prompt
    return ""


def main() -> int:
    raw = sys.stdin.read()
    if not raw.strip():
        print(DEFAULT_CONTEXT)
        return 0

    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        print(DEFAULT_CONTEXT)
        return 0

    prompt = extract_prompt(payload)
    if GSTACK_PATTERN.search(prompt):
        print(GSTACK_CONTEXT)
    else:
        print(DEFAULT_CONTEXT)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
