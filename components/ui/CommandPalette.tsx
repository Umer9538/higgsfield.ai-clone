"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Copy, CornerDownLeft, Search } from "lucide-react";
import { COMMANDS, matches, type CommandItem } from "@/lib/commands/registry";
import { useExclusiveOverlay, useScrollLock } from "./overlay";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "./Toast";
import { clearGeneratedAssets } from "@/lib/assets/store";
import { useStudioContext } from "@/lib/commands/studio-context";
import { JsonView } from "./JsonView";
import { Modal } from "./Modal";
import { toggleHud } from "./PerfHud";

export const OPEN_PALETTE_EVENT = "hf:open-palette";

export function openCommandPalette() {
  window.dispatchEvent(new Event(OPEN_PALETTE_EVENT));
}

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const router = useRouter();
  const closePalette = useCallback(() => setOpen(false), []);
  useExclusiveOverlay("command-palette", open, closePalette);
  useScrollLock(open);
  const { isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();
  const studio = useStudioContext();
  const [inspecting, setInspecting] = useState<Record<string, unknown> | null>(null);

  // In a studio, its own commands come first: they act on what is on screen.
  const studioCommands = useMemo<CommandItem[]>(() => {
    if (!studio) return [];
    return [
      {
        id: "studio-copy-prompt",
        label: "Copy prompt",
        group: "Studio",
        keywords: "clipboard text",
        run: () => {
          const text = studio.prompt().trim();
          if (!text) {
            toast("The prompt is empty", "info");
            return;
          }
          navigator.clipboard
            .writeText(text)
            .then(() => toast("Prompt copied"))
            .catch(() => toast("Copy blocked by the browser", "info"));
        },
      },
      {
        id: "studio-inspect",
        label: "Inspect generation JSON",
        group: "Studio",
        keywords: "metadata json settings debug developer",
        run: () => setInspecting(studio.metadata()),
      },
      ...studio.looks.map<CommandItem>((look) => ({
        id: `studio-look-${look.name}`,
        label: `Apply look: ${look.name}`,
        group: "Studio",
        keywords: "preset style camera lighting palette",
        run: () => {
          look.apply();
          toast(`${look.name} look applied`);
        },
      })),
    ];
  }, [studio, toast]);

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
          const root = document.documentElement;
          const next = !root.classList.contains("reduce-motion");
          root.classList.toggle("reduce-motion", next);
          toast(next ? "Reduced motion on" : "Reduced motion off", "info");
          break;
        }
      }
    },
    [router, signOut, toast],
  );

  const inspector = (
    <Modal open={inspecting !== null} onClose={() => setInspecting(null)} title="Generation metadata">
      <p className="mb-3 text-sm text-hf-muted">
        Exactly what is configured in {studio?.label ?? "this studio"} right now — the body a real
        render request would carry.
      </p>
      {inspecting ? <JsonView value={inspecting} /> : null}
      <button
        type="button"
        onClick={() =>
          navigator.clipboard
            .writeText(JSON.stringify(inspecting, null, 2))
            .then(() => toast("JSON copied"))
            .catch(() => toast("Copy blocked by the browser", "info"))
        }
        className="press mt-3 flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-hf-border px-4 text-sm text-white hover:border-hf-accent/50"
      >
        <Copy className="size-4" aria-hidden strokeWidth={1.75} />
        Copy JSON
      </button>
    </Modal>
  );

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
        role="dialog"
        aria-modal="true"
        aria-label="Command palette"
        className="glass animate-reveal relative z-10 w-full max-w-lg overflow-hidden rounded-[var(--radius-panel)] shadow-[0_40px_120px_-20px_color-mix(in_srgb,var(--color-hf-accent)_35%,transparent)]"
      >
        <div className="flex items-center gap-2.5 border-b border-hf-border px-4">
          <Search className="size-4 shrink-0 text-hf-dim" aria-hidden strokeWidth={1.75} />
          <input
            autoFocus
            role="combobox"
            aria-expanded
            aria-controls="command-results"
            aria-label="Search commands"
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
              } else if (event.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search routes, tools and actions"
            className="h-14 w-full bg-transparent text-sm text-white placeholder:text-hf-dim focus:outline-none"
          />
          <kbd className="shrink-0 rounded border border-hf-border px-1.5 py-0.5 text-[10px] text-hf-dim">
            ESC
          </kbd>
        </div>

        <ul id="command-results" ref={listRef} role="listbox" className="max-h-[52vh] overflow-y-auto p-2">
          {results.length === 0 ? (
            <li className="px-3 py-6 text-center text-sm text-hf-muted">No matches</li>
          ) : (
            Object.entries(grouped).map(([group, items]) => (
              <li key={group}>
                <p className="px-3 pt-3 pb-1 text-[10px] text-hf-dim">
                  {group}
                </p>
                <ul>
                  {items.map((item) => {
                    cursor += 1;
                    const index = cursor;
                    const selected = index === active;
                    return (
                      <li key={item.id}>
                        <button
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
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))
          )}
        </ul>
      </div>
    </div>
    </>
  );
}
