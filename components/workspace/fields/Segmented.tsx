"use client";

import { Icon } from "../Icon";
import { useField } from "../state";
import type { Option } from "@/lib/workspace/types";

export function Segmented({
  id,
  options,
  defaultValue,
}: {
  id: string;
  options: Option[];
  defaultValue: string;
}) {
  const [value, setValue] = useField<string>(id, defaultValue);

  return (
    <div role="tablist" className="flex gap-1 rounded-xl bg-hf-surface-3 p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => setValue(option.value)}
            className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
              active
                ? "bg-hf-surface-4 text-hf-lime ring-1 ring-hf-lime/60 ring-inset"
                : "text-hf-muted hover:text-white"
            }`}
          >
            {option.icon ? <Icon name={option.icon} className="size-4" /> : null}
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
