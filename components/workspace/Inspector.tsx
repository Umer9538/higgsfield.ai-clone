"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { inspectorSections, type InspectorEntry } from "@/lib/workspace/inspector";
import { SETUP_OPTIONS, nextPillValue } from "@/lib/workspace/options";
import type { IconName, Surface } from "@/lib/workspace/types";
import { FieldRenderer } from "./FieldRenderer";
import { Icon } from "./Icon";
import { dockKey, useField, useWorkspace } from "./state";
import { useExclusiveOverlay, useScrollLock } from "@/components/ui/overlay";

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
        id="studio-settings"
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

/** A dock pill as an inspector row: tap to cycle, name stays stable. */
function DockPill({ index, icon, label }: { index: number; icon: IconName; label: string }) {
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
function SetupPicker({
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
