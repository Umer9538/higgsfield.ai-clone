"use client";

import { Icon } from "../Icon";
import { useField } from "../state";
import type { Option } from "@/lib/workspace/types";

export function ToggleRow({
  id,
  label,
  defaultOn,
  segmented,
  description,
}: {
  id: string;
  label: string;
  defaultOn: boolean;
  segmented?: Option[];
  description?: string;
}) {
  const [on, setOn] = useField(id, defaultOn);
  const [mode, setMode] = useField<string>(`${id}:mode`, segmented?.[0]?.value ?? "");

  return (
    <div className="rounded-xl border border-hf-border bg-hf-surface-2 p-3.5">
      <div className="flex items-center justify-between gap-3">
        <span className="text-sm font-medium text-white">{label}</span>
        <button
          type="button"
          role="switch"
          aria-checked={on}
          aria-label={label}
          onClick={() => setOn(!on)}
          className={`relative h-6 w-11 shrink-0 rounded-full transition-colors ${
            on ? "bg-hf-lime" : "bg-hf-surface-4"
          }`}
        >
          <span
            className={`absolute top-0.5 size-5 rounded-full bg-white transition-[left] ${
              on ? "left-[22px]" : "left-0.5"
            }`}
          />
        </button>
      </div>

      {on && segmented ? (
        <div className="mt-3 flex gap-1 rounded-lg bg-hf-surface-3 p-1">
          {segmented.map((option) => {
            const active = option.value === mode;
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setMode(option.value)}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md px-3 py-1.5 text-sm transition-colors ${
                  active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                }`}
              >
                {option.icon ? <Icon name={option.icon} className="size-3.5" /> : null}
                {option.label}
              </button>
            );
          })}
        </div>
      ) : null}

      {description ? (
        <p className="mt-2.5 text-xs leading-relaxed text-hf-dim">{description}</p>
      ) : null}
    </div>
  );
}
