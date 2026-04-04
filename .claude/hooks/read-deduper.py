#!/usr/bin/env python3
"""Prevent redundant Read calls for unchanged files within a compaction window.

This hook keeps a small per-session state file alongside Claude Code's
transcript. It records:

- instruction files loaded into context
- successful Read tool calls and their covered line ranges

If Claude tries to Read a file range that's already covered by an unchanged
earlier load in the same compaction window, the hook denies the tool call to
save tokens. The tracker resets after /clear and compaction so Claude can
re-read files when earlier context may no longer be available.
"""

from __future__ import annotations

import json
import os
import sys
from pathlib import Path
from typing import Any


def fresh_state() -> dict[str, Any]:
    return {
        "sessionId": "",
        "epoch": 0,
        "reads": {},
    }


def load_payload() -> dict[str, Any]:
    raw = sys.stdin.read()
    if not raw.strip():
        return {}
    try:
        payload = json.loads(raw)
    except json.JSONDecodeError:
        return {}
    return payload if isinstance(payload, dict) else {}


def state_path_for(payload: dict[str, Any]) -> Path:
    transcript_path = payload.get("transcript_path")
    if isinstance(transcript_path, str) and transcript_path.strip():
        transcript = Path(os.path.expanduser(transcript_path))
        return Path(f"{transcript}.read-deduper.json")

    session_id = str(payload.get("session_id") or "unknown-session")
    project_dir = os.environ.get("CLAUDE_PROJECT_DIR") or payload.get("cwd") or os.getcwd()
    fallback_dir = Path(project_dir) / ".claude" / "hook-state"
    return fallback_dir / f"{session_id}.read-deduper.json"


def read_state(path: Path) -> dict[str, Any]:
    if not path.exists():
        return fresh_state()
    try:
        data = json.loads(path.read_text())
    except (OSError, json.JSONDecodeError):
        return fresh_state()
    if not isinstance(data, dict):
        return fresh_state()
    state = fresh_state()
    state.update(data)
    if not isinstance(state.get("reads"), dict):
        state["reads"] = {}
    if not isinstance(state.get("epoch"), int):
        state["epoch"] = 0
    return state


def write_state(path: Path, state: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    temp_path = path.with_name(f"{path.name}.tmp")
    temp_path.write_text(json.dumps(state, ensure_ascii=True, separators=(",", ":")))
    os.replace(temp_path, path)


def normalize_path(file_path: Any, cwd: Any) -> str | None:
    if not isinstance(file_path, str) or not file_path.strip():
        return None
    path = Path(os.path.expanduser(file_path))
    if not path.is_absolute():
        base = Path(cwd) if isinstance(cwd, str) and cwd else Path.cwd()
        path = base / path
    try:
        return str(path.resolve(strict=False))
    except OSError:
        return str(path)


def file_fingerprint(file_path: str) -> dict[str, int] | None:
    try:
        stat_result = os.stat(file_path)
    except OSError:
        return None
    return {
        "size": stat_result.st_size,
        "mtimeNs": getattr(stat_result, "st_mtime_ns", int(stat_result.st_mtime * 1_000_000_000)),
    }


def coverage_from_input(tool_input: dict[str, Any]) -> tuple[int, int | None]:
    raw_offset = tool_input.get("offset")
    raw_limit = tool_input.get("limit")

    start = 1
    if isinstance(raw_offset, int) and raw_offset > 0:
        start = raw_offset

    if not isinstance(raw_limit, int):
        return start, None
    if raw_limit <= 0:
        return start, start
    return start, start + raw_limit


def coverage_contains(existing: dict[str, Any], requested: tuple[int, int | None]) -> bool:
    existing_start = existing.get("start", 1)
    existing_end = existing.get("end")
    requested_start, requested_end = requested

    if not isinstance(existing_start, int):
        existing_start = 1
    if existing_start > requested_start:
        return False

    if existing_end is None:
        return True
    if requested_end is None:
        return False
    return isinstance(existing_end, int) and existing_end >= requested_end


def same_fingerprint(existing: dict[str, Any], current: dict[str, int] | None) -> bool:
    if current is None:
        return False
    return (
        existing.get("size") == current.get("size")
        and existing.get("mtimeNs") == current.get("mtimeNs")
    )


def describe_range(start: int, end: int | None) -> str:
    if end is None:
        if start == 1:
            return "entire file"
        return f"lines {start}+"
    if end <= start:
        return f"line {start}"
    return f"lines {start}-{end - 1}"


def compact_entries(entries: list[dict[str, Any]], current_epoch: int) -> list[dict[str, Any]]:
    compacted: list[dict[str, Any]] = []
    seen: set[tuple[Any, ...]] = set()
    for entry in entries:
        if entry.get("epoch") != current_epoch:
            continue
        key = (
            entry.get("start"),
            entry.get("end"),
            entry.get("size"),
            entry.get("mtimeNs"),
            entry.get("source"),
        )
        if key in seen:
            continue
        seen.add(key)
        compacted.append(entry)
    return compacted


def record_entry(
    state: dict[str, Any],
    file_path: str,
    start: int,
    end: int | None,
    fingerprint: dict[str, int] | None,
    source: str,
) -> None:
    reads = state.setdefault("reads", {})
    entries = reads.setdefault(file_path, [])
    if not isinstance(entries, list):
        entries = []
        reads[file_path] = entries

    entry = {
        "epoch": state.get("epoch", 0),
        "start": start,
        "end": end,
        "source": source,
    }
    if fingerprint is not None:
        entry.update(fingerprint)

    entries.append(entry)
    reads[file_path] = compact_entries(entries, state.get("epoch", 0))


def init_or_reset_state(payload: dict[str, Any], state: dict[str, Any]) -> dict[str, Any]:
    session_id = str(payload.get("session_id") or "")
    source = payload.get("source")

    if state.get("sessionId") != session_id:
        state = fresh_state()
        state["sessionId"] = session_id

    if source == "compact" or source == "clear":
        state["epoch"] = int(state.get("epoch", 0)) + 1
        state["reads"] = {}
    elif source == "startup" and not state.get("reads"):
        state["epoch"] = int(state.get("epoch", 0))
        state["reads"] = {}

    state["sessionId"] = session_id
    return state


def handle_session_start(payload: dict[str, Any], state_path: Path) -> int:
    state = init_or_reset_state(payload, read_state(state_path))
    write_state(state_path, state)
    return 0


def handle_instructions_loaded(payload: dict[str, Any], state_path: Path) -> int:
    state = read_state(state_path)
    state["sessionId"] = str(payload.get("session_id") or state.get("sessionId") or "")

    file_path = normalize_path(payload.get("file_path"), payload.get("cwd"))
    if file_path is None:
        return 0

    record_entry(
        state=state,
        file_path=file_path,
        start=1,
        end=None,
        fingerprint=file_fingerprint(file_path),
        source="InstructionsLoaded",
    )
    write_state(state_path, state)
    return 0


def deny_duplicate(file_path: str, requested: tuple[int, int | None], existing: dict[str, Any]) -> int:
    requested_label = describe_range(*requested)
    existing_label = describe_range(existing.get("start", 1), existing.get("end"))
    source = existing.get("source", "Read")

    reason = (
        "[read-deduper] Duplicate Read blocked for unchanged file "
        f"{file_path}. Requested {requested_label}, already covered by {source} "
        f"({existing_label}) in this compaction window."
    )
    additional_context = (
        "This project blocks redundant Read calls for unchanged files to save tokens. "
        "Reuse the earlier context, or request a different unread range/file. "
        "The tracker automatically resets after /clear or compaction, and it unblocks "
        "reads when the file changes on disk."
    )

    print(
        json.dumps(
            {
                "hookSpecificOutput": {
                    "hookEventName": "PreToolUse",
                    "permissionDecision": "deny",
                    "permissionDecisionReason": reason,
                    "additionalContext": additional_context,
                }
            },
            ensure_ascii=True,
        )
    )
    return 0


def handle_pre_tool_use(payload: dict[str, Any], state_path: Path) -> int:
    if payload.get("tool_name") != "Read":
        return 0

    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return 0

    file_path = normalize_path(tool_input.get("file_path"), payload.get("cwd"))
    if file_path is None:
        return 0

    current_fingerprint = file_fingerprint(file_path)
    if current_fingerprint is None:
        return 0

    requested = coverage_from_input(tool_input)
    state = read_state(state_path)
    entries = state.get("reads", {}).get(file_path, [])
    if not isinstance(entries, list):
        return 0

    current_epoch = state.get("epoch", 0)
    for entry in entries:
        if entry.get("epoch") != current_epoch:
            continue
        if not same_fingerprint(entry, current_fingerprint):
            continue
        if coverage_contains(entry, requested):
            return deny_duplicate(file_path, requested, entry)

    return 0


def handle_post_tool_use(payload: dict[str, Any], state_path: Path) -> int:
    if payload.get("tool_name") != "Read":
        return 0

    tool_input = payload.get("tool_input")
    if not isinstance(tool_input, dict):
        return 0

    file_path = normalize_path(tool_input.get("file_path"), payload.get("cwd"))
    if file_path is None:
        return 0

    state = read_state(state_path)
    state["sessionId"] = str(payload.get("session_id") or state.get("sessionId") or "")

    start, end = coverage_from_input(tool_input)
    record_entry(
        state=state,
        file_path=file_path,
        start=start,
        end=end,
        fingerprint=file_fingerprint(file_path),
        source="Read",
    )
    write_state(state_path, state)
    return 0


def main() -> int:
    payload = load_payload()
    if not payload:
        return 0

    state_path = state_path_for(payload)
    event_name = payload.get("hook_event_name")

    if event_name == "SessionStart":
        return handle_session_start(payload, state_path)
    if event_name == "InstructionsLoaded":
        return handle_instructions_loaded(payload, state_path)
    if event_name == "PreToolUse":
        return handle_pre_tool_use(payload, state_path)
    if event_name == "PostToolUse":
        return handle_post_tool_use(payload, state_path)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
