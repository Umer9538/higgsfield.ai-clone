"use client";

import { Check, ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { choicesFor, nextPillValue } from "@/lib/workspace/options";
import { Icon } from "../Icon";
import type { IconName } from "@/lib/workspace/types";

export function SelectRow({ label, value }: { label: string; value: string }) {
  const [current, setCurrent] = useState(value);
  const [open, setOpen] = useState(false);
  const options = choicesFor(label, current);

  return (
    <div className="relative">
      <button
        type="button"
        aria-expanded={open}
        aria-haspopup="listbox"
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3 text-left transition-colors hover:bg-hf-surface-3"
      >
        <span className="min-w-0">
          <span className="block text-xs text-hf-dim">{label}</span>
          <span className="mt-0.5 block truncate text-sm font-medium text-white">{current}</span>
        </span>
        <ChevronRight
          className={`size-4 shrink-0 text-hf-dim transition-transform ${open ? "rotate-90" : ""}`}
          aria-hidden
          strokeWidth={1.75}
        />
      </button>

      {open ? (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute inset-x-0 top-full z-30 mt-1 overflow-hidden rounded-xl border border-hf-border bg-hf-surface-3 py-1 shadow-lg"
        >
          {options.map((option) => (
            <li key={option}>
              <button
                type="button"
                role="option"
                aria-selected={option === current}
                onClick={() => {
                  setCurrent(option);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3.5 py-2 text-left text-sm text-white transition-colors hover:bg-hf-surface-4"
              >
                {option}
                {option === current ? (
                  <Check className="size-3.5 text-hf-lime" aria-hidden strokeWidth={3} />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function ValueRow({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  const [current, setCurrent] = useState(value);
  return (
    <button
      type="button"
      onClick={() => setCurrent(nextPillValue(current))}
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3 transition-colors hover:bg-hf-surface-3"
    >
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`text-sm font-medium ${accent ? "text-hf-lime" : "text-hf-muted"}`}>
          {current}
        </span>
        <ChevronRight className="size-4 text-hf-dim" aria-hidden strokeWidth={1.75} />
      </span>
    </button>
  );
}

export function PillRow({ items }: { items: { icon: IconName; label: string }[] }) {
  const [values, setValues] = useState(() => items.map((item) => item.label));

  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <button
          key={item.label}
          type="button"
          aria-label={`${item.label} setting, currently ${values[index]}`}
          onClick={() =>
            setValues((prev) =>
              prev.map((value, i) => (i === index ? nextPillValue(value) : value)),
            )
          }
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hf-border bg-hf-surface-2 px-3 py-2.5 text-sm text-white transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
        >
          <Icon name={item.icon} className="size-3.5 text-hf-dim" />
          {values[index]}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ label, value }: { label: string; value: string }) {
  // Values arrive as "1/4" — the numerator is what steps.
  const [max] = useState(() => Number(value.split("/")[1] ?? 4));
  const [count, setCount] = useState(() => Number(value.split("/")[0] ?? 1));

  return (
    <div className="flex items-center justify-between rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-2.5">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          onClick={() => setCount((prev) => Math.max(1, prev - 1))}
          className="text-hf-dim transition-colors hover:text-white disabled:opacity-40"
          disabled={count <= 1}
        >
          <Minus className="size-4" aria-hidden strokeWidth={2} />
        </button>
        <span className="text-sm text-white tabular-nums">
          {count}/{max}
        </span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          onClick={() => setCount((prev) => Math.min(max, prev + 1))}
          className="text-hf-dim transition-colors hover:text-white disabled:opacity-40"
          disabled={count >= max}
        >
          <Plus className="size-4" aria-hidden strokeWidth={2} />
        </button>
      </span>
    </div>
  );
}

export function Accordion({ label, icon }: { label: string; icon?: IconName }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-xl border border-hf-border bg-hf-surface-2">
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="flex w-full items-center justify-between gap-3 px-3.5 py-3"
      >
        <span className="flex items-center gap-2 text-sm font-medium text-white">
          {icon ? <Icon name={icon} className="size-4 text-hf-dim" /> : null}
          {label}
        </span>
        <ChevronDown
          className={`size-4 text-hf-dim transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
          strokeWidth={1.75}
        />
      </button>
      {open ? (
        <p className="border-t border-hf-border px-3.5 py-3 text-xs leading-relaxed text-hf-dim">
          Seed, negative prompt and sampler controls appear here.
        </p>
      ) : null}
    </div>
  );
}
