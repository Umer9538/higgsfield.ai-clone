"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { X } from "lucide-react";
import { SECTIONS, sectionFor } from "@/lib/nav";
import { useCloseOutsideMedia, useDialogFocus, useExclusiveOverlay, useRouteScopedOpen, useScrollLock } from "@/components/ui/overlay";
import { CreateCatalog } from "./CreateCatalog";
import { SectionIcon } from "./SectionIcon";

const TAB = "press flex min-h-14 flex-1 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors";

/**
 * Phone navigation: the rail's five sections as a thumb-reach tab bar.
 * Create opens the catalog as a sheet; secondary pages sit at its foot.
 */
export function TabBar() {
  const pathname = usePathname();
  const current = sectionFor(pathname);
  const { open: sheetOpen, setOpen: setSheetOpen, close } = useRouteScopedOpen();
  useExclusiveOverlay("create-sheet", sheetOpen, close);
  useScrollLock(sheetOpen);

  const sheetRef = useRef<HTMLDivElement>(null);
  useDialogFocus(sheetRef, sheetOpen, close);
  useCloseOutsideMedia("(max-width: 767.98px)", sheetOpen, close);
  const secondary = SECTIONS.flatMap((section) => section.children ?? []);

  return (
    <>
      <nav
        aria-label="Sections"
        className="fixed inset-x-0 bottom-0 z-50 flex h-tabbar border-t border-hf-border bg-hf-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden"
      >
        {SECTIONS.map((section) => {
          const active = current === section.key;
          const tone = active ? "text-hf-accent-soft" : "text-hf-muted";
          return section.href ? (
            <Link
              key={section.key}
              href={section.href}
              aria-current={pathname === section.href ? "page" : undefined}
              className={`${TAB} ${tone}`}
            >
              <SectionIcon section={section.key} />
              {section.label}
            </Link>
          ) : (
            <button
              key={section.key}
              type="button"
              aria-expanded={sheetOpen}
              aria-controls="create-sheet"
              onClick={() => setSheetOpen(true)}
              className={`${TAB} ${tone}`}
            >
              <SectionIcon section={section.key} />
              {section.label}
            </button>
          );
        })}
      </nav>

      {sheetOpen ? (
        <div className="fixed inset-0 z-[80] md:hidden">
          <button
            type="button"
            aria-label="Close create menu"
            tabIndex={-1}
            onClick={close}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm"
          />
          <div
            id="create-sheet"
            ref={sheetRef}
            role="dialog"
            aria-modal="true"
            aria-label="Create"
            className="animate-sheet absolute inset-x-0 bottom-0 flex max-h-[88dvh] flex-col rounded-t-[var(--radius-panel)] border-t border-hf-border bg-hf-surface"
          >
            <div className="flex items-center justify-between px-4 pt-3 pb-2">
              <p className="font-display text-lg font-bold tracking-[-0.025em] text-white">
                What are you making?
              </p>
              <button
                type="button"
                onClick={close}
                aria-label="Close"
                className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-hf-muted hover:text-white"
              >
                <X className="size-5" aria-hidden strokeWidth={2} />
              </button>
            </div>

            <div className="overflow-y-auto px-2 pb-6">
              <CreateCatalog onNavigate={close} columns={false} />

              <section aria-labelledby="sheet-more" className="mt-5">
                <h2 id="sheet-more" className="px-2 text-xs font-medium text-hf-dim">
                  More
                </h2>
                <ul className="mt-2 grid grid-cols-2 gap-1">
                  {secondary.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        onClick={close}
                        className="flex min-h-11 items-center rounded-[var(--radius-control)] px-2 text-sm text-white hover:bg-hf-surface-3"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
