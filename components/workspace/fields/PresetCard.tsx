"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Pencil } from "lucide-react";

const PRESETS = ["General", "Floating fall", "High flip", "Burning man", "Studio slide", "Incline"];

export function PresetCard({
  label,
  sublabel,
  image,
}: {
  label: string;
  sublabel: string;
  image: string;
}) {
  const [current, setCurrent] = useState(label);
  const [open, setOpen] = useState(false);

  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-hf-border">
      <Image src={image} alt="" fill sizes="390px" className="object-cover" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />

      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        className="absolute top-2.5 right-2.5 z-10 flex items-center gap-1.5 rounded-lg bg-black/60 px-2.5 py-1.5 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-black/80"
      >
        <Pencil className="size-3.5" aria-hidden strokeWidth={1.75} />
        Change
      </button>

      <div className="absolute right-3 bottom-3 left-3">
        <p className="font-display text-lg leading-none font-bold tracking-tight text-hf-lime uppercase">
          {current}
        </p>
        <p className="mt-1.5 truncate text-xs text-hf-muted">{sublabel}</p>
      </div>

      {open ? (
        <ul
          role="listbox"
          aria-label="Preset"
          className="absolute inset-x-2 top-12 z-20 max-h-40 overflow-y-auto rounded-xl border border-hf-border bg-hf-surface-3 py-1 shadow-lg"
        >
          {PRESETS.map((preset) => (
            <li key={preset}>
              <button
                type="button"
                role="option"
                aria-selected={preset.toUpperCase() === current.toUpperCase()}
                onClick={() => {
                  setCurrent(preset);
                  setOpen(false);
                }}
                className="flex w-full items-center justify-between gap-2 px-3 py-2 text-left text-xs text-white transition-colors hover:bg-hf-surface-4"
              >
                {preset}
                {preset.toUpperCase() === current.toUpperCase() ? (
                  <Check className="size-3 text-hf-lime" aria-hidden strokeWidth={3} />
                ) : null}
              </button>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
