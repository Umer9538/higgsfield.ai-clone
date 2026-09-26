"use client";

import { ArrowLeft, Sparkles, Wand2 } from "lucide-react";
import { TAG_GROUPS, promptParts, type Picks, type Tag, type TagGroup } from "@/lib/onboarding/sandbox";

/**
 * Step 2: build the prompt from a subject and tags, with a live preview.
 * Presentational: it reports intent, and the Sandbox owns the state and
 * what gets announced.
 */
export function BuilderStep({
  subject,
  picks,
  settings,
  announcement,
  onSubjectChange,
  onSurprise,
  onToggleTag,
  onBack,
  onRender,
}: {
  subject: string;
  picks: Picks;
  settings: [string, string][];
  announcement: string;
  onSubjectChange: (value: string) => void;
  onSurprise: () => void;
  onToggleTag: (group: TagGroup, tag: Tag) => void;
  onBack: () => void;
  onRender: () => void;
}) {
  return (
    <>
      <h1 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
        Build your prompt
      </h1>
      <p className="mt-2 text-sm text-hf-muted">Tap tags to add them. The prompt writes itself as you go.</p>

      <div className="mt-6 flex flex-wrap items-end gap-2">
        <label className="min-w-0 flex-1">
          <span className="mb-1.5 block text-xs font-medium text-hf-dim">What&apos;s in the shot?</span>
          <input
            value={subject}
            maxLength={300}
            onChange={(event) => onSubjectChange(event.target.value)}
            className="min-h-11 w-full rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none"
          />
        </label>
        <button
          type="button"
          onClick={onSurprise}
          className="press flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-hf-accent/40 bg-hf-accent/10 px-4 text-sm font-medium text-hf-accent-soft hover:bg-hf-accent/20"
        >
          <Sparkles className="size-4" aria-hidden strokeWidth={2} />
          Surprise me
        </button>
      </div>

      <div className="mt-6 space-y-5">
        {TAG_GROUPS.map((group) => (
          <div key={group.id}>
            <p id={`group-${group.id}`} className="mb-2 text-xs font-medium text-hf-dim">
              {group.label}
            </p>
            <div role="radiogroup" aria-labelledby={`group-${group.id}`} className="flex flex-wrap gap-2">
              {group.tags.map((tag) => {
                const on = picks[group.id] === tag.id;
                return (
                  <button
                    key={tag.id}
                    type="button"
                    role="radio"
                    aria-checked={on}
                    onClick={() => onToggleTag(group, tag)}
                    className={`press flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors sm:min-h-9 ${
                      on
                        ? "border-hf-cyan bg-hf-cyan/15 text-white"
                        : "border-hf-border text-hf-muted hover:border-hf-cyan/50 hover:text-white"
                    }`}
                  >
                    {tag.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="gradient-border mt-6 rounded-[var(--radius-panel)] p-4">
        <p className="text-xs font-medium text-hf-dim">Live prompt</p>
        <p role="status" className="sr-only">
          {announcement}
        </p>
        {/* <output> is implicitly a polite live region; off, or it re-reads
            on every keystroke. Tag changes are announced above. */}
        <output data-live-prompt aria-live="off" className="mt-1.5 block text-base leading-relaxed text-white">
          {promptParts(subject, picks).map((part, index) => (
            <span key={index}>
              {index > 0 ? <span className="text-hf-dim">, </span> : null}
              <span className={part.tag ? "text-hf-cyan" : ""}>{part.text}</span>
            </span>
          ))}
        </output>
        {settings.length > 0 ? (
          <ul aria-label="Studio settings" className="mt-3 flex flex-wrap gap-1.5">
            {settings.map(([key, value]) => (
              <li key={key} className="rounded-md bg-hf-surface-4 px-2 py-1 font-mono text-[11px] text-hf-muted">
                {key} <span className="text-white">{value}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <div className="mt-8 flex gap-2">
        <button
          type="button"
          onClick={onBack}
          aria-label="Back"
          className="press flex size-12 items-center justify-center rounded-[var(--radius-control)] border border-hf-border text-hf-muted hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden strokeWidth={2} />
        </button>
        <button
          type="button"
          disabled={!subject.trim()}
          onClick={onRender}
          className="press glow flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-hf-accent text-sm font-semibold text-black hover:bg-hf-accent-hover disabled:cursor-not-allowed disabled:bg-hf-accent-muted disabled:text-black/60"
        >
          <Wand2 className="size-4" aria-hidden strokeWidth={2} />
          Render a test frame
        </button>
      </div>
    </>
  );
}
