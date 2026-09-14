"use client";

import { useEffect } from "react";
import Link from "next/link";
import { Bell, Diamond, Search, Sparkles, X } from "lucide-react";

export interface MobileNavItem {
  key: string;
  label: string;
  href?: string;
  badge?: "New" | "Free";
}

export function MobileNav({
  open,
  onClose,
  items,
  activeNav,
}: {
  open: boolean;
  onClose: () => void;
  items: MobileNavItem[];
  activeNav?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    // Stop the page scrolling behind the drawer
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[80] md:hidden">
      <button
        type="button"
        aria-label="Close menu"
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="absolute inset-y-0 right-0 flex w-[88%] max-w-sm flex-col bg-hf-surface"
      >
        <div className="flex items-center justify-between border-b border-hf-border px-4 py-3">
          <span className="text-sm font-medium text-white">Menu</span>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex size-11 items-center justify-center rounded-lg text-hf-muted transition-colors hover:bg-hf-surface-3 hover:text-white"
          >
            <X className="size-5" aria-hidden strokeWidth={2} />
          </button>
        </div>

        <div className="border-b border-hf-border p-4">
          <label className="relative block">
            <span className="sr-only">Search Higgsfield</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hf-dim"
              aria-hidden
              strokeWidth={1.75}
            />
            <input
              type="search"
              placeholder="Search models and presets"
              className="h-11 w-full rounded-lg border border-hf-border bg-hf-surface-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
            />
          </label>
        </div>

        <nav aria-label="Mobile" className="flex-1 overflow-y-auto p-2">
          <ul>
            {items.map((item) => {
              const active = item.key === activeNav;
              const content = (
                <>
                  <span>{item.label}</span>
                  {item.badge ? (
                    <span
                      className={`ml-auto rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
                        item.badge === "New" ? "bg-hf-lime text-black" : "bg-hf-lime/15 text-hf-lime"
                      }`}
                    >
                      {item.badge}
                    </span>
                  ) : null}
                </>
              );

              return (
                <li key={item.key}>
                  {item.href ? (
                    <Link
                      href={item.href}
                      onClick={onClose}
                      aria-current={active ? "page" : undefined}
                      className={`flex min-h-11 items-center gap-2 rounded-lg px-3 py-2.5 text-sm transition-colors ${
                        active ? "bg-hf-surface-3 font-medium text-hf-lime" : "text-white hover:bg-hf-surface-3"
                      }`}
                    >
                      {content}
                    </Link>
                  ) : (
                    <span className="flex min-h-11 items-center gap-2 px-3 py-2.5 text-sm text-hf-dim">
                      {content}
                    </span>
                  )}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="space-y-2 border-t border-hf-border p-4">
          <Link
            href="/pricing"
            onClick={onClose}
            className="flex min-h-11 items-center justify-center gap-2 rounded-lg border border-hf-border text-sm font-medium text-white"
          >
            <Diamond className="size-4" aria-hidden strokeWidth={1.75} />
            Pricing
            <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-bold text-white">
              54% OFF
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/enterprise"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-hf-border text-sm text-white"
            >
              <Sparkles className="size-4" aria-hidden strokeWidth={1.75} />
              Enterprise
            </Link>
            <Link
              href="/assets"
              onClick={onClose}
              className="flex min-h-11 items-center justify-center gap-1.5 rounded-lg border border-hf-border text-sm text-white"
            >
              <span className="size-4 rounded bg-hf-lime/70" aria-hidden />
              Assets
            </Link>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-hf-surface-3 text-sm text-white"
          >
            <Bell className="size-4" aria-hidden strokeWidth={1.75} />
            Notifications
          </button>
        </div>
      </div>
    </div>
  );
}
