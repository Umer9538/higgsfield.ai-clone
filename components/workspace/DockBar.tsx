import { Minus, Plus } from "lucide-react";
import { Icon } from "./Icon";
import { GenerateButton } from "./GenerateButton";
import type { Surface } from "@/lib/workspace/types";

/**
 * Bottom-docked prompt bar. Used by Image, which has no left control panel —
 * its model and output settings sit inline as pills instead.
 */
export function DockBar({ surface }: { surface: Surface }) {
  if (!surface.dock) return null;
  const { placeholder, pills, stepper } = surface.dock;

  return (
    <div className="sticky bottom-0 px-4 pb-4">
      <div className="mx-auto max-w-4xl rounded-2xl border border-hf-border bg-hf-surface-2 p-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Add reference"
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-white transition-colors hover:bg-hf-border"
          >
            <Plus className="size-4" aria-hidden strokeWidth={2} />
          </button>
          <input
            type="text"
            placeholder={placeholder}
            aria-label={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-hf-dim focus:outline-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {pills.map((pill) => (
            <button
              key={pill.label}
              type="button"
              className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-hf-surface-4"
            >
              <Icon name={pill.icon} className="size-3.5 text-hf-dim" />
              {pill.label}
            </button>
          ))}

          {stepper ? (
            <span className="flex items-center gap-2.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white">
              <Minus className="size-3.5 text-hf-dim" aria-hidden strokeWidth={2} />
              <span className="tabular-nums">{stepper}</span>
              <Plus className="size-3.5 text-hf-dim" aria-hidden strokeWidth={2} />
            </span>
          ) : null}

          <GenerateButton action={surface.generate} className="ml-auto w-auto px-6 py-2.5 text-sm" />
        </div>
      </div>
    </div>
  );
}
