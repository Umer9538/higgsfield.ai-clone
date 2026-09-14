"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { nextPillValue } from "@/lib/workspace/options";
import { useToast } from "@/components/ui/Toast";
import { Icon } from "./Icon";
import { GenerateButton } from "./GenerateButton";
import type { Surface } from "@/lib/workspace/types";

/**
 * Bottom-docked prompt bar. Used by Image, which has no left control panel —
 * its model and output settings sit inline as pills instead.
 */
export function DockBar({ surface }: { surface: Surface }) {
  const dock = surface.dock;
  const [mode, setMode] = useState(dock?.rail?.[0]?.label ?? "");
  const [pillValues, setPillValues] = useState(() => dock?.pills.map((p) => p.label) ?? []);
  const [count, setCount] = useState(() => Number(dock?.stepper?.split("/")[0] ?? 1));
  const [filled, setFilled] = useState<string[]>([]);
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  if (!dock) return null;
  const { placeholder, pills, stepper, setup, rail, slots } = dock;
  const stepperMax = Number(stepper?.split("/")[1] ?? 4);

  return (
    <div className="sticky bottom-0 px-4 pb-4">
      {/* Setting tiles above the composer, as in Cinema Studio */}
      {setup ? (
        <div className="mx-auto mb-2.5 hidden max-w-4xl flex-wrap gap-2 rounded-2xl border border-hf-border bg-hf-surface-2 p-2 sm:flex">
          {setup.map((item) => (
            <button
              key={item.label}
              type="button"
              onClick={() => toast(`${item.label} settings opened`, "info")}
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

      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-2.5 sm:flex-row">
        {/* Mode rail beside the composer */}
        {rail ? (
          <div className="flex shrink-0 flex-row gap-1 rounded-2xl border border-hf-border bg-hf-surface-2 p-1.5 sm:flex-col">
            {rail.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={mode === item.label}
                onClick={() => setMode(item.label)}
                className={`flex flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2.5 text-[11px] transition-colors sm:w-16 sm:flex-none ${
                  mode === item.label ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

      <div className="min-w-0 flex-1 rounded-2xl border border-hf-border bg-hf-surface-2 p-3">
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            aria-label="Add reference"
            onClick={() => toast("Reference picker opened", "info")}
            className="flex size-9 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-white transition-colors hover:bg-hf-border"
          >
            <Plus className="size-4" aria-hidden strokeWidth={2} />
          </button>
          <input
            type="text"
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            placeholder={placeholder}
            aria-label={placeholder}
            className="min-w-0 flex-1 bg-transparent text-sm text-white placeholder:text-hf-dim focus:outline-none"
          />
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-2">
          {pills.map((pill, index) => (
            <button
              key={pill.label}
              type="button"
              aria-label={`${pill.label} setting, currently ${pillValues[index]}`}
              onClick={() =>
                setPillValues((prev) =>
                  prev.map((value, i) => (i === index ? nextPillValue(value) : value)),
                )
              }
              className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-4"
            >
              <Icon name={pill.icon} className="size-3.5 text-hf-dim" />
              {pillValues[index]}
            </button>
          ))}

          {stepper ? (
            <span className="flex items-center gap-2.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white">
              <button
                type="button"
                aria-label="Decrease batch size"
                onClick={() => setCount((prev) => Math.max(1, prev - 1))}
                className="text-hf-dim transition-colors hover:text-white"
              >
                <Minus className="size-3.5" aria-hidden strokeWidth={2} />
              </button>
              <span className="tabular-nums">
                {count}/{stepperMax}
              </span>
              <button
                type="button"
                aria-label="Increase batch size"
                onClick={() => setCount((prev) => Math.min(stepperMax, prev + 1))}
                className="text-hf-dim transition-colors hover:text-white"
              >
                <Plus className="size-3.5" aria-hidden strokeWidth={2} />
              </button>
            </span>
          ) : null}

          {slots ? (
            <span className="flex w-full gap-2 sm:ml-auto sm:w-auto">
              {slots.map((slot) => (
                <button
                  key={slot}
                  type="button"
                  aria-pressed={filled.includes(slot)}
                  onClick={() =>
                    setFilled((prev) =>
                      prev.includes(slot) ? prev.filter((s) => s !== slot) : [...prev, slot],
                    )
                  }
                  className={`flex w-24 flex-col items-center gap-1 rounded-xl border px-3 py-2 text-[10px] tracking-wide uppercase transition-colors ${
                    filled.includes(slot)
                      ? "border-hf-lime/60 bg-hf-lime/10 text-hf-lime"
                      : "border-hf-border bg-hf-surface-3 text-hf-muted hover:text-white"
                  }`}
                >
                  <Plus className="size-3.5" aria-hidden strokeWidth={2} />
                  {filled.includes(slot) ? "Added" : slot}
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
