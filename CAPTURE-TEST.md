# CAPTURE-TEST.md

Proof that automatic agent capture is installed and working, per the 8x assignment setup.

## 1. Tool and model

| | |
|---|---|
| **Tool** | Claude Code (CLI), macOS |
| **Model** | `claude-opus-5` — 1M-context variant, exact id `claude-opus-5[1m]` |
| **Planner / executor split** | None. One model does both planning and execution. |
| **Automatic mechanism available?** | Yes — Claude Code lifecycle hooks |

The model name is resolved per log entry rather than hardcoded, so a mid-build model
switch would show up in the log as required.

## 2. Mechanism and config

Claude Code exposes lifecycle hook events configured in `.claude/settings.json`. I
checked the documented event list and payload schemas rather than assuming. Two events
are used:

| Event | Fires | Payload field used |
|---|---|---|
| `UserPromptSubmit` | every prompt submitted | `prompt` |
| `Stop` | end of every assistant turn | `last_assistant_message` |

Both fire on their own. There is nothing to remember to run.

**Files changed:**

- `.claude/settings.json` — wires both events to the capture script
- `.claude/hooks/agent-capture.py` — the script that appends to `.agent-logs/`

**Deliberate divergence from the brief.** The setup instructions say the end-of-turn
hook receives a path to the session transcript and to read the response from there. It
does receive one, but the documentation explicitly warns that the transcript is written
asynchronously and lags the live conversation, so the current turn's final message may
not be present when the hook fires. Reading it would have dropped or misaligned
responses. I use `last_assistant_message` from the `Stop` payload instead, which is
authoritative for the turn that just ended. The transcript is still read, but only to
resolve the model name.

**Credential redaction (disclosed, not silent).** Text matching known secret formats
(OpenAI/GitHub/AWS/Google/Slack keys, bearer tokens, `password:`-style assignments,
PEM private keys) is masked in place as `[REDACTED: credential]`. No entry is ever
removed or trimmed — the exchange stays in full, only the secret itself is masked.

**What is excluded, by design:** thinking blocks, tool calls, intermediate steps, file
reads, diffs, and self-corrections mid-turn. Only the prompt and the final response.
Verified with a leakage grep across all logs: zero matches.

## 3. Where the canaries landed

`.agent-logs/`, one file per session, named `YYYY-MM-DD_HH-MM-SS_<session-id>.md`.

| Session | File | Type |
|---|---|---|
| `4035d02a` | `.agent-logs/2026-09-13_21-57-14_4035d02a-4bd6-45f3-a86b-1b09766ee28d.md` | interactive, real build session |
| `ae5686ce` | `.agent-logs/2026-09-13_22-01-06_ae5686ce-0f6c-4209-9f9a-bf200fdb62f7.md` | canary, separate session |
| `9cb8b4ed` | `.agent-logs/2026-09-13_22-02-03_9cb8b4ed-e629-4243-a837-c516fd9302ae.md` | canary, separate session |
| `069dabc2` | `.agent-logs/2026-09-13_22-02-22_069dabc2-*.md` | canary, separate session |

Four distinct session ids, four separate files, each created by a process that did not
install the hook. That is the point of the two-session requirement: the hook is
installed at config level, not session level.

## 4. Canary entries, pasted raw

### Session `ae5686ce` — second session

    [LOG_ENTRY type=PROMPT num=1 session=ae5686ce]
    timestamp: 2026-09-13T22:01:06.334Z
    model: unknown

    CAPTURE TEST — 8x assignment, Umer, session two. Reply with one short sentence confirming receipt. Do not use any tools.


    [LOG_ENTRY type=RESPONSE num=1 session=ae5686ce]
    timestamp: 2026-09-13T22:01:08.529Z
    model: unknown

    Received — capture test for the 8x assignment, session two, logged without tool use.

### Session `069dabc2` — after the model-resolution fix

    [LOG_ENTRY type=PROMPT num=1 session=069dabc2]
    timestamp: 2026-09-13T22:02:22.284Z
    model: claude-opus-5

    CAPTURE TEST — 8x assignment, Umer, session four. Reply with one short sentence confirming receipt. Do not use any tools.


    [LOG_ENTRY type=RESPONSE num=1 session=069dabc2]
    timestamp: 2026-09-13T22:02:24.818Z
    model: claude-opus-5

    Received — session four capture test logged, no tools used.

## 5. What did not work first

Three real failures, in the order they happened. Left in because they are the honest record.

**1. First dry run logged nothing and reported success.**
My test harness was at fault — zsh's `echo` expanded `\n` into a literal newline, which
produced invalid JSON, so the script's `json.loads` threw. But the script caught the
exception and returned exit code 0, so the failure was completely silent. A capture
system that fails quietly is worse than no capture system, because you only find out
when you go to submit. Fixed: parse failures and unexpected crashes now append to
`.agent-logs/capture-errors.log` instead of being swallowed, while still never blocking
the session.

**2. Redaction double-substituted.**
Running the key-format patterns before the `keyword: value` pattern meant an
already-masked secret matched again, producing
`[REDACTED: credential] credential]`. Fixed with a guard that skips values already
containing `REDACTED`.

**3. `model: unknown` in fresh sessions — the one that actually mattered.**
The hook payload carries no model name, so it is read off the transcript. In a
brand-new session the transcript has no assistant record yet when the hooks fire, so
session `ae5686ce` logged `model: unknown` on both entries. Since the brief requires the
model name specifically so that a mid-build switch is visible, that was a real defect,
not a cosmetic one. Fixed in two parts: the `Stop` hook now retries briefly to let the
transcript flush, and a resolved model is cached to `.claude/.last-model` so the first
prompt of a later session resolves immediately. Session `9cb8b4ed` confirmed the
response fix; session `069dabc2` confirmed both entries resolve.

The earlier `unknown` entries have been left exactly as written. Editing a log entry
after the fact is against the rules of this setup, and the failure is more useful in the
record than a clean file would be.

## 6. Known artifact

The first entry in session `4035d02a` is a `RESPONSE` with no matching `PROMPT`, and its
numbering starts at 1 alongside a later `PROMPT num=1`. The hook went live part-way
through an in-progress turn, so it captured the tail of an exchange whose prompt predates
its own installation. Left uncorrected for the same reason as above.
