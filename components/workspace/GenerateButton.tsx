import { Sparkles } from "lucide-react";
import type { GenerateAction } from "@/lib/workspace/types";

export function GenerateButton({ action, className = "" }: { action: GenerateAction; className?: string }) {
  const { cost, originalCost, disabled } = action;

  return (
    <button
      type="button"
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-2 rounded-xl px-5 py-3.5 text-base font-semibold text-black transition-colors ${
        disabled
          ? "cursor-not-allowed bg-hf-lime-muted text-black/60"
          : "bg-hf-lime hover:bg-hf-lime-deep"
      } ${className}`}
    >
      Generate
      <span className="flex items-center gap-1.5 text-sm font-medium">
        <Sparkles className="size-4" aria-hidden strokeWidth={2} />
        {originalCost ? <s className="opacity-50">{originalCost}</s> : null}
        {cost}
      </span>
    </button>
  );
}
