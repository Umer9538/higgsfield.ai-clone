"use client";

import Link from "next/link";

import { Sparkles } from "lucide-react";
import { useField } from "../state";

/** Label with a switch, e.g. Genjutsu's optional Prompt or Effects' free gens. */
export function PromptToggle({
  id,
  label,
  defaultOn,
  badge,
}: {
  id: string;
  label: string;
  defaultOn: boolean;
  badge?: string;
}) {
  const [on, setOn] = useField(id, defaultOn);

  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3">
      <span className="flex items-center gap-2 text-sm font-medium">
        <span className={on ? "text-white" : "text-hf-dim"}>{label}</span>
        {badge ? (
          <span className="flex items-center gap-1 rounded bg-hf-lime/15 px-1.5 py-0.5 text-[10px] font-semibold text-hf-lime">
            <Sparkles className="size-2.5" aria-hidden strokeWidth={2.5} />
            {badge}
          </span>
        ) : null}
      </span>

      <button
        type="button"
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn(!on)}
        className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
          on ? "bg-hf-lime" : "bg-hf-surface-4"
        }`}
      >
        <span
          className={`absolute top-0.5 size-5 rounded-full bg-white transition-[left] ${
            on ? "left-[22px]" : "left-0.5"
          }`}
        />
      </button>
    </div>
  );
}

export function LinkRow({ label, icon }: { label: string; icon?: string }) {
  return (
    <Link
      href="/chatgpt-plugin"
      className="flex items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3 text-sm font-medium text-white transition-colors hover:bg-hf-surface-3"
    >
      <span className="flex items-center gap-2">
        <span className="flex size-5 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black">
          {icon ? "✦" : "→"}
        </span>
        {label}
      </span>
      <span className="text-hf-dim">&rsaquo;</span>
    </Link>
  );
}
