import type { Surface } from "@/lib/workspace/types";
import { FieldRenderer } from "./FieldRenderer";
import { GenerateButton } from "./GenerateButton";
import { SurfaceTabs } from "./SurfaceTabs";

/**
 * Fixed-width control column. ~390px on desktop, full width when stacked.
 */
export function ControlPanel({ surface }: { surface: Surface }) {
  return (
    <aside className="flex w-full shrink-0 flex-col border-hf-border lg:h-[calc(100dvh-var(--spacing-header))] lg:w-[390px] lg:border-r">
      {surface.tabGroup ? <SurfaceTabs tabs={surface.tabGroup} activeId={surface.id} /> : null}

      <div className="flex-1 space-y-2.5 overflow-y-auto p-4">
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
