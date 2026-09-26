"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { SETUP_OPTIONS, nextPillValue } from "@/lib/workspace/options";
import type { IconName } from "@/lib/workspace/types";
import { Icon } from "../Icon";
import { dockKey, useField } from "../state";

/** A dock pill as an inspector row: tap to cycle, name stays stable. */
export function DockPill({ index, icon, label }: { index: number; icon: IconName; label: string }) {
  const [value, setValue] = useField<string>(dockKey.pill(index), label);

  return (
    <button
      type="button"
      aria-label={`${label} setting, currently ${value}`}
      onClick={() => setValue(nextPillValue(value))}
      className="press flex min-h-11 w-full items-center gap-2.5 rounded-2xl border border-hf-border bg-hf-surface-2 px-3.5 text-left text-sm text-white transition-colors hover:border-hf-accent/40 hover:bg-hf-surface-3"
    >
      <Icon name={icon} className="size-4 text-hf-dim" />
      {value}
    </button>
  );
}

/** Picker tile with its options as an inline chip grid (no floating popover). */
export function SetupPicker({
  label,
  icon,
  fallback,
}: {
  label: string;
  icon: IconName;
  fallback: string;
}) {
  const [value, setValue] = useField<string>(dockKey.setup(label), fallback);
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const options = SETUP_OPTIONS[label];
  const configured = Boolean(options) && value !== "Auto";

  return (
    <div>
      <button
        type="button"
        aria-expanded={options ? open : undefined}
        aria-haspopup={options ? "listbox" : undefined}
        onClick={() => {
          if (!options) {
            toast(`${label} picker opened`, "info");
            return;
          }
          setOpen((prev) => !prev);
        }}
        className={`press flex min-h-11 w-full items-center gap-2.5 rounded-2xl px-3 py-2 text-left transition-colors ${
          configured
            ? "bg-hf-cyan/10 ring-1 ring-hf-cyan/60 ring-inset"
            : "bg-hf-surface-3 hover:bg-hf-surface-4"
        }`}
      >
        <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-hf-muted">
          <Icon name={icon} className="size-3.5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-[11px] text-hf-dim">{label}</span>
          <span className="block truncate text-sm font-medium text-white">{value}</span>
        </span>
        {options ? (
          <ChevronDown
            className={`size-4 text-hf-dim transition-transform ${open ? "rotate-180" : ""}`}
            aria-hidden
            strokeWidth={1.75}
          />
        ) : null}
      </button>

      {open && options ? (
        <ul role="listbox" aria-label={label} className="animate-reveal mt-1.5 grid grid-cols-2 gap-1.5">
          {options.map((option) => {
            const chosen = value === option;
            return (
              <li key={option}>
                <button
                  type="button"
                  role="option"
                  aria-selected={chosen}
                  onClick={() => {
                    setValue(option);
                    setOpen(false);
                    toast(`${label}: ${option}`);
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
  );
}
