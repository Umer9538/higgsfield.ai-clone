"use client";

import { Check, Loader2, X } from "lucide-react";
import { useGeneration } from "./generation";

export function GeneratingState() {
  const { progress, stages, stageIndex, reset } = useGeneration();
  const percent = Math.round(progress);

  return (
    <div className="mx-auto max-w-xl">
      <div className="relative rounded-3xl border border-hf-border bg-hf-surface p-6 sm:p-8">
        {/* Ambient edge light that brightens as the run nears completion.
            Squared, so it stays quiet early and gathers at the end. Only its
            opacity changes; the glow itself is static. */}
        <div
          aria-hidden
          data-progress-glow
          className="pointer-events-none absolute -inset-px rounded-3xl shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hf-cyan)_70%,transparent),0_0_48px_-6px_color-mix(in_srgb,var(--color-hf-cyan)_55%,transparent)] transition-opacity duration-300"
          style={{ opacity: (progress / 100) ** 2 }}
        />
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <Loader2
                className="size-4 animate-spin text-hf-accent-soft motion-reduce:animate-none"
                aria-hidden
                strokeWidth={2}
              />
              Generating
            </p>
            <p className="mt-1 text-xs text-hf-dim">This usually takes under a minute.</p>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label="Cancel generation"
            className="rounded-lg p-1.5 text-hf-dim transition-colors hover:bg-hf-surface-3 hover:text-white"
          >
            <X className="size-4" aria-hidden strokeWidth={2} />
          </button>
        </div>

        <div
          aria-hidden
          className="relative mt-6 aspect-video w-full overflow-hidden rounded-[var(--radius-media)] border border-hf-border bg-hf-black"
        >
          {/* Exposure rises with progress: the frame develops as the render runs */}
          <div
            className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,color-mix(in_srgb,var(--color-hf-accent)_45%,transparent),transparent_70%)] transition-opacity duration-300"
            style={{ opacity: 0.15 + (progress / 100) * 0.85 }}
          />
          <div className="absolute inset-y-0 left-0 w-1/3 animate-sweep bg-gradient-to-r from-transparent via-hf-accent-soft/35 to-transparent" />
          <span
            data-frame-counter
            className="absolute right-3 bottom-3 rounded-md bg-black/60 px-2 py-1 font-mono text-[11px] text-white tabular-nums backdrop-blur"
          >
            Frame {String(Math.max(1, Math.round((progress / 100) * 120))).padStart(3, "0")} / 120
          </span>
        </div>

        <div className="mt-5">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-white">{stages[stageIndex]}</span>
            <span className="text-hf-muted tabular-nums">{percent}%</span>
          </div>
          <div
            role="progressbar"
            aria-valuenow={percent}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Generation progress"
            className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-hf-surface-4"
          >
            <div
              // scaleX, not width: a width change relayouts every tick
              className="h-full origin-left rounded-full bg-hf-accent transition-transform duration-100 ease-linear"
              style={{ transform: `scaleX(${percent / 100})` }}
            />
          </div>
        </div>

        <ol className="mt-6 space-y-2.5">
          {stages.map((stage, index) => {
            const complete = index < stageIndex;
            const active = index === stageIndex;
            return (
              <li key={stage} className="flex items-center gap-2.5 text-sm">
                <span
                  className={`flex size-5 shrink-0 items-center justify-center rounded-full border ${
                    complete
                      ? "border-hf-accent bg-hf-accent text-black"
                      : active
                        ? "border-hf-accent text-hf-accent-soft"
                        : "border-hf-border text-hf-dim"
                  }`}
                >
                  {complete ? <Check className="size-3" aria-hidden strokeWidth={3} /> : null}
                </span>
                <span className={complete || active ? "text-white" : "text-hf-dim"}>{stage}</span>
              </li>
            );
          })}
        </ol>
      </div>
    </div>
  );
}
