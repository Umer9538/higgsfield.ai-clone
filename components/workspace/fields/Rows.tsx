"use client";

import { ChevronDown, ChevronRight, Minus, Plus } from "lucide-react";
import { useState } from "react";
import { Icon } from "../Icon";
import type { IconName } from "@/lib/workspace/types";

export function SelectRow({ label, value }: { label: string; value: string }) {
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3 text-left transition-colors hover:border-hf-border hover:bg-hf-surface-3"
    >
      <span className="min-w-0">
        <span className="block text-xs text-hf-dim">{label}</span>
        <span className="mt-0.5 block truncate text-sm font-medium text-white">{value}</span>
      </span>
      <ChevronRight className="size-4 shrink-0 text-hf-dim" aria-hidden strokeWidth={1.75} />
    </button>
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
  return (
    <button
      type="button"
      className="flex w-full items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-3 transition-colors hover:bg-hf-surface-3"
    >
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="flex items-center gap-1.5">
        <span className={`text-sm font-medium ${accent ? "text-hf-lime" : "text-hf-muted"}`}>
          {value}
        </span>
        <ChevronRight className="size-4 text-hf-dim" aria-hidden strokeWidth={1.75} />
      </span>
    </button>
  );
}

export function PillRow({ items }: { items: { icon: IconName; label: string }[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {items.map((item) => (
        <button
          key={item.label}
          type="button"
          className="flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-hf-border bg-hf-surface-2 px-3 py-2.5 text-sm text-white transition-colors hover:bg-hf-surface-3"
        >
          <Icon name={item.icon} className="size-3.5 text-hf-dim" />
          {item.label}
        </button>
      ))}
    </div>
  );
}

export function Stepper({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-xl border border-hf-border bg-hf-surface-2 px-3.5 py-2.5">
      <span className="text-sm font-medium text-white">{label}</span>
      <span className="flex items-center gap-3">
        <button
          type="button"
          aria-label={`Decrease ${label}`}
          className="text-hf-dim transition-colors hover:text-white"
        >
          <Minus className="size-4" aria-hidden strokeWidth={2} />
        </button>
        <span className="text-sm text-white tabular-nums">{value}</span>
        <button
          type="button"
          aria-label={`Increase ${label}`}
          className="text-hf-dim transition-colors hover:text-white"
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
