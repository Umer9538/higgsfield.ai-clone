"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { CornerDownLeft, Search } from "lucide-react";
import { COMMANDS, matches, type CommandItem } from "@/lib/commands/registry";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "./Toast";
import { clearGeneratedAssets } from "@/lib/assets/store";

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const listRef = useRef<HTMLUListElement>(null);

  const router = useRouter();
  const { isAuthenticated, signOut } = useAuth();
  const { toast } = useToast();

  const results = useMemo(() => {
    const available = COMMANDS.filter((item) =>
      item.action === "signout" ? isAuthenticated : true,
    );
    return available.filter((item) => matches(item, query));
  }, [query, isAuthenticated]);

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
    window.addEventListener("keydown", onKey);
    // Marks the shortcut as live, so tests can wait for hydration instead of
    // racing it with a fixed delay.
    document.documentElement.dataset.paletteReady = "true";
    return () => {
      window.removeEventListener("keydown", onKey);
      delete document.documentElement.dataset.paletteReady;
    };
  }, []);

  const run = useCallback(
    (item: CommandItem) => {
      setOpen(false);
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

  if (!open) return null;

  const grouped = results.reduce<Record<string, CommandItem[]>>((acc, item) => {
    (acc[item.group] ??= []).push(item);
    return acc;
  }, {});
  let cursor = -1;

  return (
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
        className="relative z-10 w-full max-w-lg overflow-hidden rounded-2xl border border-hf-border bg-hf-surface shadow-2xl"
      >
        <div className="flex items-center gap-2.5 border-b border-hf-border px-4">
          <Search className="size-4 shrink-0 text-hf-dim" aria-hidden strokeWidth={1.75} />
          <input
            autoFocus
            role="combobox"
            aria-expanded
            aria-controls="command-results"
            aria-label="Search commands"
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
                <p className="px-3 pt-3 pb-1 text-[10px] tracking-widest text-hf-dim uppercase">
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
                            selected ? "bg-hf-surface-4 text-hf-lime" : "text-white hover:bg-hf-surface-3"
                          }`}
                        >
                          {item.label}
                          {item.href ? (
                            <span className="ml-auto truncate text-[11px] text-hf-dim">{item.href}</span>
                          ) : null}
                          {selected ? (
                            <CornerDownLeft className="size-3.5 shrink-0 text-hf-lime" aria-hidden strokeWidth={2} />
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
  );
}
