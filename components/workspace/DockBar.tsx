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
  const { placeholder, pills, stepper, setup, rail, slots } = surface.dock;

  return (
    <div className="sticky bottom-0 px-4 pb-4">
      {/* Setting tiles above the composer, as in Cinema Studio */}
      {setup ? (
        <div className="mx-auto mb-2.5 flex max-w-4xl flex-wrap gap-2 rounded-2xl border border-hf-border bg-hf-surface-2 p-2">
          {setup.map((item) => (
            <button
              key={item.label}
              type="button"
              className="flex flex-1 items-center gap-2 rounded-xl bg-hf-surface-3 px-3 py-2 text-left transition-colors hover:bg-hf-surface-4"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-hf-muted">
                <Icon name={item.icon} className="size-3.5" />
              </span>
              <span className="min-w-0">
                <span className="block text-[10px] text-hf-dim">{item.label}</span>
                <span className="block truncate text-xs font-medium text-white">{item.value}</span>
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-4xl items-stretch gap-2.5">
        {/* Mode rail beside the composer */}
        {rail ? (
          <div className="flex shrink-0 flex-col gap-1 rounded-2xl border border-hf-border bg-hf-surface-2 p-1.5">
            {rail.map((mode, index) => (
              <button
                key={mode.label}
                type="button"
                className={`flex w-16 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] transition-colors ${
                  index === 0 ? "bg-hf-surface-4 text-white" : "text-hf-muted hover:text-white"
                }`}
              >
                <Icon name={mode.icon} className="size-4" />
                {mode.label}
              </button>
            ))}
          </div>
        ) : null}

      <div className="min-w-0 flex-1 rounded-2xl border border-hf-border bg-hf-surface-2 p-3">
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

          {slots ? (
            <span className="ml-auto flex gap-2">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  className="flex w-24 flex-col items-center gap-1 rounded-xl border border-hf-border bg-hf-surface-3 px-3 py-2 text-[10px] tracking-wide text-hf-muted uppercase transition-colors hover:text-white"
                >
                  <Plus className="size-3.5" aria-hidden strokeWidth={2} />
                  {slot}
                </button>
              ))}
            </span>
          ) : null}

          <GenerateButton
            action={surface.generate}
            className={`${slots ? "" : "ml-auto"} w-auto px-6 py-2.5 text-sm`}
          />
        </div>
      </div>
      </div>
    </div>
  );
}
