"use client";

import { useState } from "react";
import { Icon } from "../Icon";
import { useField } from "../state";
import type { IconName } from "@/lib/workspace/types";

export function PromptField({
  id,
  label,
  placeholder,
  chips,
  maxLength,
  optional,
}: {
  id: string;
  label?: string;
  placeholder: string;
  chips?: { icon: IconName; label: string }[];
  maxLength?: number;
  optional?: boolean;
}) {
  const [value, setValue] = useField<string>(id, "");
  const [audioOn, setAudioOn] = useState(true);

  const onChip = (chipLabel: string) => {
    if (chipLabel === "On" || chipLabel === "Off") {
      setAudioOn((prev) => !prev);
      return;
    }
    // "@ Elements" inserts the mention token so the next keystroke continues it
    setValue(`${value}${value.endsWith(" ") || value === "" ? "" : " "}@`);
  };

  return (
    <div className="rounded-xl border border-hf-border bg-hf-surface-2 p-3 focus-within:border-hf-lime/40">
      {label ? (
        <div className="flex items-start justify-between gap-2">
          <label htmlFor={id} className="text-sm font-medium text-white">
            {label}
          </label>
          {optional ? (
            <span className="rounded-md bg-hf-surface-4 px-1.5 py-0.5 text-[10px] text-hf-dim">
              Optional
            </span>
          ) : null}
        </div>
      ) : null}

      <textarea
        id={id}
        rows={3}
        value={value}
        maxLength={maxLength}
        placeholder={placeholder}
        onChange={(event) => setValue(event.target.value)}
        className="mt-1.5 w-full resize-none bg-transparent text-sm leading-relaxed text-white placeholder:text-hf-dim focus:outline-none"
      />

      {chips || maxLength ? (
        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5">
            {chips?.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => onChip(chip.label === "On" ? (audioOn ? "On" : "Off") : chip.label)}
                aria-pressed={chip.label === "On" ? audioOn : undefined}
                className={`flex items-center gap-1.5 rounded-lg px-2 py-1 text-xs transition-colors ${
                  chip.label === "On" && audioOn
                    ? "bg-hf-lime/15 text-hf-lime"
                    : "bg-hf-surface-4 text-hf-muted hover:text-white"
                }`}
              >
                <Icon name={chip.icon} className="size-3.5" />
                {chip.label === "On" ? (audioOn ? "On" : "Off") : chip.label}
              </button>
            ))}
          </div>
          {maxLength ? (
            <span className="shrink-0 text-[11px] text-hf-dim tabular-nums">
              {value.length}/{maxLength}
            </span>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
