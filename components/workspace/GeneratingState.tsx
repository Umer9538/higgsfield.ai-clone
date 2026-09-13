"use client";

import { Check, Loader2, X } from "lucide-react";
import { useGeneration } from "./generation";

export function GeneratingState() {
  const { progress, stages, stageIndex, reset } = useGeneration();
  const percent = Math.round(progress);

  return (
    <div className="mx-auto max-w-xl">
      <div className="rounded-2xl border border-hf-border bg-hf-surface p-6 sm:p-8">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="flex items-center gap-2 text-sm font-medium text-white">
              <Loader2
                className="size-4 animate-spin text-hf-lime motion-reduce:animate-none"
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

        <div className="mt-6">
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
              className="h-full rounded-full bg-hf-lime transition-[width] duration-100 ease-linear"
              style={{ width: `${percent}%` }}
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
                      ? "border-hf-lime bg-hf-lime text-black"
                      : active
                        ? "border-hf-lime text-hf-lime"
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
