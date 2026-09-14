"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import type { Surface } from "@/lib/workspace/types";
import { FieldRenderer } from "./FieldRenderer";
import { GenerateButton } from "./GenerateButton";
import { SurfaceTabs } from "./SurfaceTabs";

/**
 * Fixed-width control column. ~390px on desktop, full width when stacked.
 */
export function ControlPanel({ surface }: { surface: Surface }) {
  // Stacked on small screens, so the field list collapses to keep the
  // content pane reachable without a long scroll.
  const [open, setOpen] = useState(false);

  return (
    <aside className="flex w-full shrink-0 flex-col border-b border-hf-border lg:h-[calc(100dvh-var(--spacing-header))] lg:w-[390px] lg:border-r lg:border-b-0">
      {surface.tabGroup ? <SurfaceTabs tabs={surface.tabGroup} activeId={surface.id} /> : null}

      <button
        type="button"
        aria-expanded={open}
        aria-controls="control-fields"
        onClick={() => setOpen((prev) => !prev)}
        className="flex items-center justify-between gap-2 border-b border-hf-border px-4 py-3 text-sm font-medium text-white lg:hidden"
      >
        {open ? "Hide settings" : "Show settings"}
        <ChevronDown
          className={`size-4 text-hf-dim transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden
          strokeWidth={1.75}
        />
      </button>

      <div
        id="control-fields"
        className={`flex-1 space-y-2.5 overflow-y-auto p-4 ${open ? "" : "hidden"} lg:block`}
      >
        {surface.fields.map((field) => (
          <FieldRenderer key={field.id} field={field} />
        ))}
      </div>

      <div className="border-t border-hf-border bg-hf-surface p-4">
        <GenerateButton action={surface.generate} />
      </div>
    </aside>
  );
}
