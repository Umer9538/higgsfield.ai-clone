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
  const { cost, originalCost, disabled } = action;
  const { status, start } = useGeneration();
  const busy = status === "running";
  const inactive = disabled || busy;

  return (
    <button
      type="button"
      disabled={inactive}
      onClick={start}
      aria-busy={busy}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold text-black transition-colors ${
        inactive
          ? "cursor-not-allowed bg-hf-lime-muted text-black/60"
          : "bg-hf-lime hover:bg-hf-lime-deep"
      } ${className}`}
    >
      {busy ? "Generating…" : "Generate"}
      {busy ? null : (
        <span className="flex items-center gap-1.5 text-sm font-medium">
          <Sparkles className="size-4" aria-hidden strokeWidth={2} />
          {originalCost ? <s className="opacity-50">{originalCost}</s> : null}
          {cost}
        </span>
      )}
    </button>
  );
}
