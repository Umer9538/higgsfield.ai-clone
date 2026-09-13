#!/usr/bin/env python3
"""
8x assignment - automatic agent capture.

Fires on two Claude Code hook events:
  UserPromptSubmit -> appends a [LOG_ENTRY type=PROMPT] block
  Stop             -> appends a [LOG_ENTRY type=RESPONSE] block

Captures ONLY the verbatim prompt and the final assistant response.
Thinking blocks, tool calls, file reads and diffs are deliberately excluded.

One markdown file per session: .agent-logs/YYYY-MM-DD_HH-MM-SS_<session-id>.md
"""
import glob
import json
import os
import re
import subprocess
import sys
import time
from datetime import datetime, timezone

TOOL = "claude-code"
PROJECT = "naano-rebuild"


# Credential redaction. Disclosed in CAPTURE-TEST.md - entries are never removed,
# only the secret itself is masked, so the exchange stays visible in the log.
SECRET_PATTERNS = [
    re.compile(r"sk-[A-Za-z0-9_\-]{16,}"),
    re.compile(r"(?:ghp|gho|ghs|ghu)_[A-Za-z0-9]{20,}"),
    re.compile(r"github_pat_[A-Za-z0-9_]{20,}"),
    re.compile(r"AKIA[0-9A-Z]{16}"),
    re.compile(r"AIza[A-Za-z0-9_\-]{30,}"),
    re.compile(r"xox[baprs]-[A-Za-z0-9\-]{10,}"),
    re.compile(r"(?i)bearer\s+[A-Za-z0-9._\-]{20,}"),
    re.compile(r"(?i)\b(?:api[_-]?key|secret|token|password|passwd)\b\s*[:=]\s*[\"\']?([^\s\"\']{8,})"),
    re.compile(r"-----BEGIN [A-Z ]*PRIVATE KEY-----[\s\S]*?-----END [A-Z ]*PRIVATE KEY-----"),
]


def redact(text: str) -> str:
    for pat in SECRET_PATTERNS:
        if pat.groups:
            text = pat.sub(
                lambda m: m.group(0)
                if "REDACTED" in m.group(1)
                else m.group(0).replace(m.group(1), "[REDACTED: credential]"),
                text,
            )
        else:
            text = pat.sub("[REDACTED: credential]", text)
    return text


def note(msg: str) -> None:
    """Record a capture failure where it will actually be noticed."""
    try:
        root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
        log_dir = os.path.join(root, ".agent-logs")
        os.makedirs(log_dir, exist_ok=True)
        with open(os.path.join(log_dir, "capture-errors.log"), "a", encoding="utf-8") as fh:
            fh.write(f"{datetime.now(timezone.utc).isoformat()} {msg}\n")
    except Exception:
        pass


def utc_now() -> str:
    return datetime.now(timezone.utc).isoformat(timespec="milliseconds").replace("+00:00", "Z")


def author() -> str:
    override = os.environ.get("AGENT_LOG_AUTHOR")
    if override:
        return override
    try:
        name = subprocess.run(
            ["git", "config", "user.name"], capture_output=True, text=True, timeout=5
        ).stdout.strip()
        return name or "unknown"
    except Exception:
        return "unknown"


MODEL_CACHE = ".claude/.last-model"


def _scan_transcript(path: str) -> str:
    """Most recent model named in the transcript, or empty string."""
    if not path or not os.path.exists(path):
        return ""
    try:
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            lines = fh.readlines()
    except Exception:
        return ""
    for line in reversed(lines):
        try:
            obj = json.loads(line)
        except Exception:
            continue
        model = (obj.get("message") or {}).get("model")
        if model:
            return model
    return ""


def _cache_path() -> str:
    root = os.environ.get("CLAUDE_PROJECT_DIR") or os.getcwd()
    return os.path.join(root, MODEL_CACHE)


def resolve_model(data: dict, retries: int = 1) -> str:
    """
    The hook payload carries no model name, so it comes off the transcript.
    A brand-new session has no assistant record yet and the transcript is written
    asynchronously, so retry briefly, then fall back to the last model seen.
    """
    path = data.get("transcript_path")
    for attempt in range(retries):
        model = _scan_transcript(path)
        if model:
            try:
                os.makedirs(os.path.dirname(_cache_path()), exist_ok=True)
                with open(_cache_path(), "w", encoding="utf-8") as fh:
                    fh.write(model)
            except Exception:
                pass
            return model
        if attempt + 1 < retries:
            time.sleep(0.4)
    try:
        with open(_cache_path(), "r", encoding="utf-8") as fh:
            cached = fh.read().strip()
            if cached:
                return cached
    except Exception:
        pass
    return "unknown"


def session_file(log_dir: str, session_id: str) -> str:
    existing = glob.glob(os.path.join(log_dir, f"*_{session_id}.md"))
    if existing:
        return existing[0]
    stamp = datetime.now(timezone.utc).strftime("%Y-%m-%d_%H-%M-%S")
    return os.path.join(log_dir, f"{stamp}_{session_id}.md")


def split_frontmatter(text: str):
    m = re.match(r"(?s)\A---\n(.*?)\n---\n(.*)\Z", text)
    if not m:
        return {}, text
    meta = {}
    for line in m.group(1).splitlines():
        if ":" in line:
            k, v = line.split(":", 1)
            meta[k.strip()] = v.strip()
    return meta, m.group(2)


def render(meta: dict, body: str) -> str:
    order = [
        "session_id", "date", "author", "model", "tool", "project",
        "total_exchanges", "first_prompt_time", "last_prompt_time",
    ]
    lines = [f"{k}: {meta[k]}" for k in order if k in meta]
    return "---\n" + "\n".join(lines) + "\n---\n" + body


def main() -> int:
    raw = sys.stdin.read()
    try:
        data = json.loads(raw or "{}")
    except Exception as exc:
        # Never block the session, but never fail silently either.
        note(f"could not parse hook payload: {exc!r} :: first 200 chars: {raw[:200]!r}")
        return 0

    event = data.get("hook_event_name", "")
    session_id = data.get("session_id") or "unknown"

    if event == "UserPromptSubmit":
        kind, content = "PROMPT", data.get("prompt") or ""
    elif event == "Stop":
        # Docs: prefer last_assistant_message over the transcript, which lags the live turn.
        kind, content = "RESPONSE", data.get("last_assistant_message") or ""
    else:
        return 0

    content = redact(content)

    if not content.strip():
        return 0

    root = os.environ.get("CLAUDE_PROJECT_DIR") or data.get("cwd") or os.getcwd()
    log_dir = os.path.join(root, ".agent-logs")
    os.makedirs(log_dir, exist_ok=True)

    path = session_file(log_dir, session_id)
    ts = utc_now()
    model = resolve_model(data, retries=6 if kind == "RESPONSE" else 2)

    prior = ""
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8", errors="replace") as fh:
            prior = fh.read()
    meta, body = split_frontmatter(prior)

    short = session_id.split("-")[0]
    if not meta:
        meta = {
            "session_id": session_id,
            "date": ts[:10],
            "author": author(),
            "model": model,
            "tool": TOOL,
            "project": PROJECT,
            "total_exchanges": "0",
            "first_prompt_time": ts,
            "last_prompt_time": ts,
        }
        body = (
            f"\n# Session Log - {ts[:10]}\n\n"
            f"Session: `{short}` | Project: `{PROJECT}` | Author: `{meta['author']}`\n\n---\n\n"
        )

    num = len(re.findall(r"\[LOG_ENTRY type=PROMPT ", body)) + (1 if kind == "PROMPT" else 0)
    num = max(num, 1)

    body += (
        f"[LOG_ENTRY type={kind} num={num} session={short}]\n"
        f"timestamp: {ts}\n"
        f"model: {model}\n\n"
        f"{content.rstrip()}\n\n\n"
    )

    meta["last_prompt_time"] = ts
    meta["total_exchanges"] = str(len(re.findall(r"\[LOG_ENTRY type=PROMPT ", body)))
    if model != "unknown":
        meta["model"] = model

    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        fh.write(render(meta, body))
    os.replace(tmp, path)
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except Exception as exc:  # pragma: no cover
        note(f"capture crashed: {exc!r}")
        sys.exit(0)
