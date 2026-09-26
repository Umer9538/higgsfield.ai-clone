"use client";

import { useRef, useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { inspectorSections, type InspectorEntry } from "@/lib/workspace/inspector";
import { SETUP_OPTIONS } from "@/lib/workspace/options";
import type { Surface } from "@/lib/workspace/types";
import { FieldRenderer } from "./FieldRenderer";
import { dockKey, useWorkspace } from "./state";
import { DockPill, SetupPicker } from "./inspector/controls";
import { useCloseOutsideMedia, useDialogFocus, useExclusiveOverlay, useScrollLock } from "@/components/ui/overlay";

/**
 * How the output is made, in one column that reads the same in every studio.
 * A static panel on desktop (collapsible), a bottom sheet on phones. It stays
 * mounted while hidden so field state survives toggling it.
 */
export function Inspector({
  surface,
  collapsed,
  sheetOpen,
  onCloseSheet,
}: {
  surface: Surface;
  collapsed: boolean;
  sheetOpen: boolean;
  onCloseSheet: () => void;
}) {
  const sections = inspectorSections(surface);
  // Only the phone sheet is an overlay; the desktop panel never locks the page
  useScrollLock(sheetOpen);
  useExclusiveOverlay("settings-sheet", sheetOpen, onCloseSheet);
  // As a phone sheet it behaves as a dialog: focus in, Tab contained, Escape
  const asideRef = useRef<HTMLElement>(null);
  useDialogFocus(asideRef, sheetOpen, onCloseSheet);
  useCloseOutsideMedia("(max-width: 1023.98px)", sheetOpen, onCloseSheet);
  const { values, setValue } = useWorkspace();
  const { toast } = useToast();

  // Only real pickers count as configured; References is a counter.
  const pickers = (surface.dock?.setup ?? []).filter((entry) => SETUP_OPTIONS[entry.label]);
  const customised = pickers.filter((entry) => values[dockKey.setup(entry.label)] !== "Auto").length;

  const resetAll = () => {
    pickers.forEach((entry) => setValue(dockKey.setup(entry.label), "Auto"));
    toast("Parameters reset to Auto", "info");
  };

  return (
    <>
      {sheetOpen ? (
        <button
          type="button"
          aria-label="Close settings"
          tabIndex={-1}
          onClick={onCloseSheet}
          className="fixed inset-0 z-[60] bg-black/70 backdrop-blur-sm lg:hidden"
        />
      ) : null}

      <aside
        ref={asideRef}
        id="studio-settings"
        aria-modal={sheetOpen || undefined}
        role={sheetOpen ? "dialog" : undefined}
        aria-label="Settings"
        className={`flex-col bg-hf-surface ${
          sheetOpen
            ? "animate-sheet fixed inset-x-0 bottom-0 z-[70] flex max-h-[85dvh] rounded-t-[var(--radius-panel)] border-t border-hf-border"
            : "hidden"
        } lg:static lg:z-auto lg:max-h-none lg:w-[340px] lg:shrink-0 lg:rounded-none lg:border-t-0 lg:border-l lg:border-hf-border ${
          collapsed ? "lg:hidden" : "lg:flex"
        }`}
      >
        <div className="flex min-h-14 items-center justify-between gap-2 border-b border-hf-border px-4">
          <p className="text-sm font-medium text-white">Settings</p>
          <div className="flex items-center gap-1">
            {customised > 0 ? (
              <button
                type="button"
                onClick={resetAll}
                className="flex min-h-11 items-center rounded-[var(--radius-control)] px-3 text-xs text-hf-cyan transition-colors hover:bg-hf-cyan/10"
              >
                Reset {customised}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onCloseSheet}
              className="flex min-h-11 items-center gap-1 rounded-[var(--radius-control)] px-3 text-sm font-medium text-hf-accent-soft lg:hidden"
            >
              <X className="size-4" aria-hidden strokeWidth={2} />
              Done
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-3">
          {sections.map((section) => (
            <Section key={section.name} name={section.name}>
              {section.entries.map((entry) => (
                <Entry key={entryKey(entry)} entry={entry} />
              ))}
            </Section>
          ))}
        </div>
      </aside>
    </>
  );
}

function entryKey(entry: InspectorEntry): string {
  if (entry.type === "field") return entry.field.id;
  if (entry.type === "pill") return `pill-${entry.index}`;
  return `setup-${entry.label}`;
}

function Section({ name, children }: { name: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  const id = `inspector-${name.toLowerCase()}`;

  return (
    <section role="group" aria-label={name} className="border-b border-hf-border/60 py-2 last:border-b-0">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((prev) => !prev)}
        className="flex min-h-11 w-full items-center justify-between rounded-lg px-1 text-xs font-medium text-hf-dim transition-colors hover:text-white"
      >
        {name}
        <ChevronDown
          className={`size-4 transition-transform ${open ? "" : "-rotate-90"}`}
          aria-hidden
          strokeWidth={1.75}
        />
      </button>
      <div id={id} className={`space-y-2.5 pt-1 pb-2 ${open ? "" : "hidden"}`}>
        {children}
      </div>
    </section>
  );
}

function Entry({ entry }: { entry: InspectorEntry }) {
  if (entry.type === "field") return <FieldRenderer field={entry.field} />;
  if (entry.type === "pill") return <DockPill index={entry.index} icon={entry.icon} label={entry.label} />;
  return <SetupPicker label={entry.label} icon={entry.icon} fallback={entry.value} />;
}
