"use client";

import { useState } from "react";
import { Minus, Plus } from "lucide-react";
import { SETUP_GROUPS, SETUP_OPTIONS, nextPillValue } from "@/lib/workspace/options";
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
  const [setupValues, setSetupValues] = useState<Record<string, string>>(() =>
    Object.fromEntries((dock?.setup ?? []).map((item) => [item.label, item.value])),
  );
  const [openSetup, setOpenSetup] = useState<string | null>(null);
  // Parameters used to be hidden outright below sm; now they fold away instead.
  const [paramsOpen, setParamsOpen] = useState(false);
  const customised = Object.entries(setupValues).filter(
    ([key, value]) => SETUP_OPTIONS[key] && value !== "Auto",
  ).length;
  const [prompt, setPrompt] = useState("");
  const { toast } = useToast();

  if (!dock) return null;
  const { placeholder, pills, stepper, setup, rail, slots } = dock;
  const stepperMax = Number(stepper?.split("/")[1] ?? 4);

  return (
    // Sticky only from sm up: on a phone an open parameter sheet is taller than
    // the space left, and a pinned dock would sit on top of the scene.
    <div className="relative px-4 pb-4 sm:sticky sm:bottom-0">
      {/* Setting tiles above the composer, as in Cinema Studio */}
      {setup ? (
        <button
          type="button"
          aria-expanded={paramsOpen}
          aria-controls="studio-parameters"
          onClick={() => setParamsOpen((prev) => !prev)}
          className="press glass mx-auto mb-2 flex min-h-11 w-full max-w-4xl items-center justify-between rounded-[var(--radius-control)] px-4 text-sm text-white sm:hidden"
        >
          <span>Parameters</span>
          <span className={customised > 0 ? "text-hf-cyan" : "text-hf-dim"}>
            {customised > 0 ? `${customised} set` : "All auto"}
          </span>
        </button>
      ) : null}

      {setup ? (
        <div
          id="studio-parameters"
          className={`glass mx-auto mb-2.5 max-w-4xl flex-col gap-3 rounded-[var(--radius-panel)] p-3 sm:flex sm:flex-row sm:flex-wrap sm:items-center sm:gap-4 ${
            paramsOpen ? "flex" : "hidden"
          }`}
        >
          {SETUP_GROUPS.map((group) => {
            const items = setup.filter((entry) => group.labels.includes(entry.label));
            if (items.length === 0) return null;
            return (
              <div
                key={group.name}
                role="group"
                aria-label={group.name}
                className="flex min-w-0 flex-1 flex-col gap-1.5 sm:flex-row sm:items-center"
              >
                <span className="px-1 text-[11px] font-medium text-hf-dim sm:w-9 sm:shrink-0">
                  {group.name}
                </span>
                <div className="grid min-w-0 flex-1 grid-cols-2 gap-2 sm:flex">
                  {items.map((item) => (
                  <div key={item.label} className="relative flex-1">
                    <button
                      type="button"
                      aria-expanded={openSetup === item.label}
                      aria-haspopup={SETUP_OPTIONS[item.label] ? "listbox" : undefined}
                      onClick={() => {
                        if (!SETUP_OPTIONS[item.label]) {
                          toast(`${item.label} picker opened`, "info");
                          return;
                        }
                        setOpenSetup((prev) => (prev === item.label ? null : item.label));
                      }}
                      className={`flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-left transition-colors ${
                        SETUP_OPTIONS[item.label] && setupValues[item.label] !== "Auto"
                          ? "bg-hf-cyan/10 ring-1 ring-hf-cyan/60 ring-inset"
                          : "bg-hf-surface-3 hover:bg-hf-surface-4"
                      }`}
                    >
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-hf-muted">
                        <Icon name={item.icon} className="size-3.5" />
                      </span>
                      <span className="min-w-0">
                        <span className="block text-[10px] text-hf-dim">{item.label}</span>
                        <span className="block truncate text-xs font-medium text-white">
                          {setupValues[item.label] ?? item.value}
                        </span>
                      </span>
                    </button>

                    {openSetup === item.label && SETUP_OPTIONS[item.label] ? (
                      <ul
                        role="listbox"
                        aria-label={item.label}
                        className="glass absolute bottom-full left-0 z-40 mb-2 grid w-64 grid-cols-2 gap-1.5 rounded-2xl p-2 shadow-lg"
                      >
                        {SETUP_OPTIONS[item.label].map((option) => {
                          const chosen = setupValues[item.label] === option;
                          return (
                            <li key={option}>
                              <button
                                type="button"
                                role="option"
                                aria-selected={chosen}
                                onClick={() => {
                                  setSetupValues((prev) => ({ ...prev, [item.label]: option }));
                                  setOpenSetup(null);
                                  toast(`${item.label}: ${option}`);
                                }}
                                className={`flex min-h-11 w-full items-center justify-center rounded-xl px-2 text-center text-xs transition-colors ${
                                  chosen
                                    ? "bg-hf-cyan/15 text-white ring-1 ring-hf-cyan ring-inset"
                                    : "bg-hf-surface-3 text-hf-muted hover:bg-hf-surface-4 hover:text-white"
                                }`}
                              >
                                {option}
                              </button>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </div>
          
                  ))}
                </div>
              </div>
            );
          })}

          {customised > 0 ? (
            <button
              type="button"
              onClick={() => {
                setSetupValues((prev) =>
                  Object.fromEntries(
                    Object.keys(prev).map((key) => [key, SETUP_OPTIONS[key] ? "Auto" : prev[key]]),
                  ),
                );
                toast("Parameters reset to Auto", "info");
              }}
              className="flex min-h-11 shrink-0 items-center rounded-xl px-3 text-xs text-hf-cyan transition-colors hover:bg-hf-cyan/10"
            >
              Reset {customised}
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="mx-auto flex max-w-4xl flex-col items-stretch gap-2.5 sm:flex-row">
        {/* Mode rail beside the composer */}
        {rail ? (
          <div className="flex shrink-0 flex-row gap-1 rounded-3xl border border-hf-border bg-hf-surface-2 p-1.5 sm:flex-col">
            {rail.map((item) => (
              <button
                key={item.label}
                type="button"
                aria-pressed={mode === item.label}
                onClick={() => {
                  setMode(item.label);
                  const nextModel = dock.modeModels?.[item.label];
                  if (nextModel) {
                    const modelIndex = pills.findIndex((pill) => pill.icon === "model");
                    if (modelIndex >= 0) {
                      setPillValues((prev) =>
                        prev.map((value, i) => (i === modelIndex ? nextModel : value)),
                      );
                    }
                    toast(`Switched to ${item.label.toLowerCase()} — ${nextModel}`);
                  }
                }}
                className={`flex flex-1 flex-col items-center gap-1 rounded-2xl px-2 py-2.5 text-[11px] transition-colors sm:w-16 sm:flex-none ${
                  mode === item.label ? "bg-hf-surface-4 text-hf-accent-soft" : "text-hf-muted hover:text-white"
                }`}
              >
                <Icon name={item.icon} className="size-4" />
                {item.label}
              </button>
            ))}
          </div>
        ) : null}

      <div className="gradient-border min-w-0 flex-1 rounded-[var(--radius-panel)] p-3 shadow-[0_24px_60px_-24px_color-mix(in_srgb,var(--color-hf-accent)_40%,transparent)]">
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
              className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white transition-colors hover:border-hf-accent/40 hover:bg-hf-surface-4"
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
                  className={`flex w-24 flex-col items-center gap-1 rounded-2xl border px-3 py-2 text-[10px] tracking-wide uppercase transition-colors ${
                    filled.includes(slot)
                      ? "border-hf-accent/60 bg-hf-accent/10 text-hf-accent-soft"
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
