"use client";

import { Sparkles } from "lucide-react";
import type { GenerateAction } from "@/lib/workspace/types";
import { useGeneration } from "./generation";

export function GenerateButton({
  action,
  className = "",
}: {
  action: GenerateAction;
  className?: string;
}) {
  const { cost, originalCost, disabled, badge } = action;
  const { status, start } = useGeneration();
  const busy = status === "running";
  const inactive = disabled || busy;

  return (
    <button
      type="button"
      disabled={inactive}
      onClick={start}
      aria-busy={busy}
      // Spoken as words: the visible "80 45" read as "Generate 80 45"
      aria-label={
        busy
          ? "Generating…"
          : badge
            ? `Generate, ${badge}`
            : `Generate, ${cost} credits${originalCost ? `, was ${originalCost}` : ""}`
      }
      // background-color stays the flat accent (tests and forced-colors read
      // it); the gradient and highlight sit on top as background-image.
      className={`press relative isolate flex w-full items-center justify-center gap-2 overflow-hidden rounded-[var(--radius-control)] px-5 py-3.5 text-base font-semibold text-black ${
        inactive
          ? "cursor-not-allowed bg-hf-accent-muted text-black/60"
          : "glow bg-hf-accent bg-[linear-gradient(180deg,rgb(255_255_255/0.22),rgb(255_255_255/0)_55%),linear-gradient(90deg,var(--color-hf-accent),var(--color-hf-accent-soft))] hover:bg-hf-accent-hover"
      } ${className}`}
    >
      {busy ? (
        // While running, the button breathes (a gradient light pulsing behind
        // the label) and a band of light sweeps across: the render is
        // developing. Both are opacity/transform only.
        <>
          <span
            aria-hidden
            data-generate-pulse
            className="pointer-events-none absolute inset-0 -z-10 animate-glow-pulse bg-[radial-gradient(ellipse_at_50%_120%,color-mix(in_srgb,var(--color-hf-accent-soft)_90%,transparent),transparent_70%),linear-gradient(90deg,var(--color-hf-accent),var(--color-hf-accent-soft),var(--color-hf-accent))]"
          />
          <span aria-hidden className="pointer-events-none absolute inset-y-0 left-0 -z-10 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-white/45 to-transparent" />
        </>
      ) : null}
      {busy ? "Generating…" : "Generate"}
      {busy ? null : badge ? (
        <span className="flex items-center gap-1.5 rounded bg-black/20 px-1.5 py-0.5 text-[11px] font-bold">
          <Sparkles className="size-3" aria-hidden strokeWidth={2.5} />
          {badge}
        </span>
      ) : (
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="size-4" aria-hidden strokeWidth={2} />
          {/* Full opacity: at 50% the struck price fell to 2.6:1 */}
          {originalCost ? <s>{originalCost}</s> : null}
          {cost}
        </span>
      )}
    </button>
  );
}
