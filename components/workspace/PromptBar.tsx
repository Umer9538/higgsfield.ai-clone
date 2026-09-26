"use client";

import { Minus, Plus } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { primaryPrompt } from "@/lib/workspace/inspector";
import type { Surface } from "@/lib/workspace/types";
import { PromptField } from "./fields/PromptField";
import { GenerateButton } from "./GenerateButton";
import { Icon } from "./Icon";
import { dockKey, useField, useWorkspace } from "./state";

/**
 * What you write, and the button that runs it. Pinned under the canvas in
 * every studio so Generate never scrolls out of reach; everything about how
 * the output is made lives in the inspector instead.
 */
export function PromptBar({ surface }: { surface: Surface }) {
  const prompt = primaryPrompt(surface);

  return (
    <div className="gradient-border rounded-[var(--radius-panel)] p-3 shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--color-hf-accent)_40%,transparent)]">
      {surface.dock ? (
        <DockComposer surface={surface} />
      ) : (
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="min-w-0 flex-1">
            {prompt ? (
              <PromptField
                bare
                id={prompt.id}
                label={prompt.label}
                placeholder={prompt.placeholder}
                chips={prompt.chips}
                maxLength={prompt.maxLength}
                optional={prompt.optional}
                model={prompt.model}
              />
            ) : (
              <div className="px-1 py-1.5">
                <p className="text-sm font-medium text-white">{surface.label}</p>
                <p className="mt-0.5 text-xs text-hf-dim">
                  No prompt needed. Add your inputs in Settings, then generate.
                </p>
              </div>
            )}
          </div>
          <GenerateButton action={surface.generate} className="py-3 text-sm sm:w-auto sm:shrink-0 sm:px-6" />
        </div>
      )}
    </div>
  );
}

/** Free-text composer for dock-configured studios (Image, Cinema, Marketing…). */
function DockComposer({ surface }: { surface: Surface }) {
  const dock = surface.dock!;
  const { values, setValue } = useWorkspace();
  const [text, setText] = useField<string>(dockKey.prompt, "");
  const [mode, setMode] = useField<string>(dockKey.mode, dock.rail?.[0]?.label ?? "");
  const [count, setCount] = useField<string>(dockKey.count, "1");
  const { toast } = useToast();
  const max = Number(dock.stepper?.split("/")[1] ?? 4);
  const n = Number(count);

  const switchMode = (label: string) => {
    setMode(label);
    const nextModel = dock.modeModels?.[label];
    const modelIndex = dock.pills.findIndex((pill) => pill.icon === "model");
    if (nextModel && modelIndex >= 0) {
      setValue(dockKey.pill(modelIndex), nextModel);
      toast(`Switched to ${label.toLowerCase()} — ${nextModel}`);
    }
  };

  return (
    <>
      <div className="flex items-center gap-2.5">
        <button
          type="button"
          aria-label="Add reference"
          onClick={() => toast("Reference picker opened", "info")}
          className="press flex size-11 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-white transition-colors hover:bg-hf-border sm:size-9"
        >
          <Plus className="size-4" aria-hidden strokeWidth={2} />
        </button>
        <input
          type="text"
          value={text}
          onChange={(event) => setText(event.target.value)}
          placeholder={dock.placeholder}
          maxLength={2000}
          aria-label={dock.placeholder}
          className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-hf-dim focus:outline-none"
        />
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        {dock.rail ? (
          <div role="group" aria-label="Output type" className="flex rounded-[var(--radius-control)] bg-hf-surface-3 p-1">
            {dock.rail.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={mode === item.label}
                onClick={() => switchMode(item.label)}
                className={`press flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-xs transition-colors sm:min-h-8 ${
                  mode === item.label ? "bg-hf-surface-4 font-medium text-hf-accent-soft" : "text-hf-muted hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="size-3.5" />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

        {dock.stepper ? (
          <span className="flex items-center gap-1 rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-3 px-1 text-xs text-white">
            <button
              type="button"
              aria-label="Decrease batch size"
              onClick={() => setCount(String(Math.max(1, n - 1)))}
              className="flex size-11 items-center justify-center text-hf-dim transition-colors hover:text-white sm:size-8"
            >
              <Minus className="size-3.5" aria-hidden strokeWidth={2} />
            </button>
            <span className="tabular-nums">
              {n}/{max}
            </span>
            <button
              type="button"
              aria-label="Increase batch size"
              onClick={() => setCount(String(Math.min(max, n + 1)))}
              className="flex size-11 items-center justify-center text-hf-dim transition-colors hover:text-white sm:size-8"
            >
              <Plus className="size-3.5" aria-hidden strokeWidth={2} />
            </button>
          </span>
        ) : null}

        {dock.slots?.map((slot) => {
          const filled = values[dockKey.slot(slot)] === true;
          return (
            <button
              key={slot}
              type="button"
              aria-pressed={filled}
              onClick={() => setValue(dockKey.slot(slot), !filled)}
              className={`press flex min-h-11 items-center gap-1.5 rounded-[var(--radius-control)] border px-3 text-xs transition-colors sm:min-h-9 ${
                filled
                  ? "border-hf-accent/60 bg-hf-accent/10 text-hf-accent-soft"
                  : "border-hf-border bg-hf-surface-3 text-hf-muted hover:text-white"
              }`}
            >
              <Plus className="size-3.5" aria-hidden strokeWidth={2} />
              {filled ? `${slot} added` : slot}
            </button>
          );
        })}

        <GenerateButton action={surface.generate} className="py-2.5 text-sm sm:ml-auto sm:w-auto sm:px-6" />
      </div>
    </>
  );
}
