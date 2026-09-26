"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { COMMANDS, matches, type CommandItem } from "@/lib/commands/registry";
import { useDialogFocus, useExclusiveOverlay, useRouteChanged, useScrollLock } from "./overlay";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "./Toast";
import { clearGeneratedAssets } from "@/lib/assets/store";
import { useStudioContext } from "@/lib/commands/studio-context";
import { JsonInspector } from "./palette/JsonInspector";
import { useStudioCommands } from "./palette/useStudioCommands";
import { toggleHud } from "./PerfHud";
import { setPreference } from "@/lib/ui/preferences";

const OPEN_PALETTE_EVENT = "hf:open-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  const router = useRouter();
  const closePalette = useCallback(() => setOpen(false), []);
  useExclusiveOverlay("command-palette", open, closePalette);
  useScrollLock(open);
  const { isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  const studio = useStudioContext();
  const [inspecting, setInspecting] = useState<Record<string, unknown> | null>(null);
  const dialogRef = useRef<HTMLDivElement>(null);
  // Focus in, Tab contained, Escape from anywhere inside, focus back to the opener
  useDialogFocus(dialogRef, open, closePalette);

  // It lives in the root layout, so navigation does not unmount it: close it,
  // and the inspector, in the render the route changes
  if (useRouteChanged()) {
    if (open) setOpen(false);
    if (inspecting) setInspecting(null);
  }

  const inspect = useCallback((metadata: Record<string, unknown>) => setInspecting(metadata), []);
  const closeInspector = useCallback(() => setInspecting(null), []);
  // In a studio, its own commands come first: they act on what is on screen.
  const studioCommands = useStudioCommands(inspect);

  const results = useMemo(() => {
    const available = [...studioCommands, ...COMMANDS].filter((item) =>
      item.action === "signout" ? isAuthenticated : true,
    );
    return available.filter((item) => matches(item, query));
  }, [query, isAuthenticated, studioCommands]);

  // Global shortcut
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        // Never on top of a form dialog: one Escape would close both and
        // lose what was typed into it
        if (document.querySelector("[data-modal]")) return;
        setOpen((prev) => !prev);
        setQuery("");
        setActive(0);
      }
    };
    // The top bar's search field opens the palette rather than a second search
    const onOpen = () => {
      setOpen(true);
      setQuery("");
      setActive(0);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener(OPEN_PALETTE_EVENT, onOpen);
    // Marks the shortcut as live, so tests can wait for hydration instead of
    // racing it with a fixed delay.
    document.documentElement.dataset.paletteReady = "true";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener(OPEN_PALETTE_EVENT, onOpen);
      delete document.documentElement.dataset.paletteReady;
    };
  }, []);

  // Keep the highlighted option in view while arrowing through a long list
  useEffect(() => {
    listRef.current?.querySelector('[aria-selected="true"]')?.scrollIntoView({ block: "nearest" });
  }, [active, open]);

  const run = useCallback(
    (item: CommandItem) => {
      setOpen(false);
      if (item.run) {
        item.run();
        return;
      }
      if (item.href) {
        router.push(item.href);
        return;
      }
      switch (item.action) {
        case "signout":
          signOut();
          toast("Signed out");
          break;
        case "copy-link":
          navigator.clipboard
            .writeText(window.location.href)
            .then(() => toast("Link copied to clipboard"))
            .catch(() => toast("Copy blocked by the browser", "info"));
          break;
        case "clear-generations":
          clearGeneratedAssets();
          toast("Saved generations cleared");
          break;
        case "toggle-hud":
          toggleHud();
          break;
        case "toggle-motion": {
          const next = !document.documentElement.classList.contains("reduce-motion");
          setPreference("reducedMotion", next);
          toast(next ? "Reduced motion on" : "Reduced motion off", "info");
          break;
        }
      }
    },
    [router, signOut, toast],
  );

  const inspector = <JsonInspector data={inspecting} label={studio?.label} onClose={closeInspector} />;

  if (!open) return inspector;

  const grouped = results.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});
  let cursor = -1;

  return (
    <>
    {inspector}
    <div className="fixed inset-0 z-[95] flex items-start justify-center px-4 pt-[12vh]">
      <button
        type="button"
        aria-label="Close command palette"
        onClick={() => setOpen(false)}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="glass animate-reveal relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-panel)] shadow-[0_40px_120px_-20px_color-mix(in_srgb,var(--color-hf-accent)_35%,transparent)]"
      >
        <div className="flex items-center gap-2.5 border-b border-hf-border px-4">
          <Search className="size-4 shrink-0 text-hf-dim" aria-hidden strokeWidth={1.75} />
          {/* No autoFocus: React applies it before effects run, so the dialog
              hook recorded this input, not the opener, and focus could not be
              returned on close. The hook focuses it as the first control. */}
          <input
            role="combobox"
            aria-expanded
            aria-controls="command-results"
            aria-label="Search commands"
            // Screen readers announce the highlighted option as it moves
            aria-activedescendant={results[active] ? `command-option-${results[active].id}` : undefined}
            data-palette-input
            value={query}
            onChange={(event) => {
              setQuery(event.target.value);
              setActive(0);
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowDown") {
                event.preventDefault();
                setActive((prev) => Math.min(results.length - 1, prev + 1));
              } else if (event.key === "ArrowUp") {
                event.preventDefault();
                setActive((prev) => Math.max(0, prev - 1));
              } else if (event.key === "Enter") {
                event.preventDefault();
                if (results[active]) run(results[active]);
              }
            }}
            placeholder="Search routes, tools and actions"
            className="h-14 w-full bg-transparent text-sm text-white placeholder:text-hf-dim focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-hf-border px-1.5 py-0.5 text-[10px] text-hf-dim">
            ESC
          </kbd>
        </div>

        {/* listbox > group > option, per the ARIA listbox pattern: no list
            items in between (axe flagged the old ul/li nesting as critical) */}
        <div
          id="command-results"
          ref={listRef}
          role="listbox"
          aria-label="Commands"
          className="max-h-[52vh] overflow-y-auto p-2"
        >
          {results.length === 0 ? (
            <p className="px-3 py-6 text-center text-sm text-hf-muted">No matches</p>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <div key={group} role="group" aria-labelledby={`command-group-${group}`}>
                <p id={`command-group-${group}`} className="px-3 pt-3 pb-1 text-[10px] text-hf-dim">
                  {group}
                </p>
                {items.map((item) => {
                  cursor += 1;
                  const index = cursor;
                  const selected = index === active;
                  return (
                    <button
                      key={item.id}
                      id={`command-option-${item.id}`}
                      type="button"
                      role="option"
                      aria-selected={selected}
                      onMouseEnter={() => setActive(index)}
                      onClick={() => run(item)}
                      className={`flex min-h-11 w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-sm transition-colors ${
                        selected ? "bg-hf-surface-4 text-hf-accent-soft" : "text-white hover:bg-hf-surface-3"
                      }`}
                    >
                      {item.label}
                      {item.href || item.hint ? (
                        <span className="ml-auto truncate text-[11px] text-hf-dim">{item.href ?? item.hint}</span>
                      ) : null}
                      {selected ? (
                        <CornerDownLeft className="size-3.5 shrink-0 text-hf-accent-soft" aria-hidden strokeWidth={2} />
                      ) : null}
                    </button>
                  );
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
    </>
  );
}
