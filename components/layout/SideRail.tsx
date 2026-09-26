"use client";

import { useRef } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { SECTIONS, sectionFor } from "@/lib/nav";
import { useCloseOutsideMedia, useDialogFocus, useExclusiveOverlay, useRouteScopedOpen, useScrollLock } from "@/components/ui/overlay";
import { CreateCatalog } from "./CreateCatalog";
import { Logo } from "./Logo";
import { SectionIcon } from "./SectionIcon";

const ITEM =
  "press relative flex w-14 flex-col items-center gap-1 rounded-[var(--radius-control)] py-2 text-[11px] font-medium transition-colors";

/**
 * Desktop navigation: five sections in a 72px rail. Create opens the full
 * catalog of models, studios and apps beside it; Explore and Pricing reveal
 * their secondary pages on hover or keyboard focus.
 *
 * Deliberately not glass: a backdrop-filter would make this the containing
 * block for the absolutely positioned catalog and clip it to the rail.
 */
export function SideRail() {
  const pathname = usePathname();
  const current = sectionFor(pathname);
  // Scoped to the route: following any link — a rail item, the catalog, the
  // palette, the browser's back button — closes the catalog by construction.
  const { open: catalogOpen, toggle: toggleCatalog, close: closeCatalog } = useRouteScopedOpen();
  const panelRef = useRef<HTMLDivElement>(null);

  useExclusiveOverlay("create-catalog", catalogOpen, closeCatalog);
  useScrollLock(catalogOpen);

  // Focus moves into the catalog, Tab stays inside, Escape closes and returns
  // focus to Create
  useDialogFocus(panelRef, catalogOpen, closeCatalog);
  useCloseOutsideMedia("(min-width: 768px)", catalogOpen, closeCatalog);

  return (
    <nav
      aria-label="Main"
      className="fixed inset-y-0 left-0 z-50 hidden w-rail flex-col items-center border-r border-hf-border bg-hf-surface py-3 md:flex"
    >
      <Link
        href="/"
        onClick={closeCatalog}
        aria-label="Higgsfield home"
        className="press mb-4 flex size-11 items-center justify-center rounded-[var(--radius-control)] text-white transition-colors hover:bg-hf-surface-3"
      >
        <Logo />
      </Link>

      <ul className="flex flex-col items-center gap-1">
        {SECTIONS.map((section) => {
          const active = current === section.key;
          const tone = active
            ? "bg-hf-surface-3 text-hf-accent-soft"
            : "text-hf-muted hover:bg-hf-surface-3 hover:text-white";
          const marker = active ? (
            <span aria-hidden className="absolute top-2 bottom-2 -left-2 w-0.5 rounded-full bg-hf-accent" />
          ) : null;

          if (!section.href) {
            return (
              <li key={section.key}>
                <button
                  type="button"
                  aria-expanded={catalogOpen}
                  aria-controls="create-catalog"
                  data-active={active || undefined}
                  onClick={toggleCatalog}
                  className={`${ITEM} ${catalogOpen ? "bg-hf-surface-4 text-white" : tone}`}
                >
                  {marker}
                  <SectionIcon section={section.key} />
                  {section.label}
                </button>
              </li>
            );
          }

          return (
            <li key={section.key} className="group relative">
              <Link
                href={section.href}
                // Also covers clicking the section you are already on, where
                // the route does not change
                onClick={closeCatalog}
                aria-current={pathname === section.href ? "page" : undefined}
                data-active={active || undefined}
                className={`${ITEM} ${tone}`}
              >
                {marker}
                <SectionIcon section={section.key} />
                {section.label}
              </Link>

              {section.children ? (
                <ul
                  aria-label={`More in ${section.label}`}
                  className="invisible absolute top-0 left-full z-10 ml-2 w-44 rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-2 p-1.5 opacity-0 shadow-xl transition-opacity group-focus-within:visible group-focus-within:opacity-100 group-hover:visible group-hover:opacity-100"
                >
                  {section.children.map((child) => (
                    <li key={child.href}>
                      <Link
                        href={child.href}
                        onClick={closeCatalog}
                        aria-current={pathname === child.href ? "page" : undefined}
                        className={`flex min-h-10 items-center rounded-lg px-3 text-sm transition-colors ${
                          pathname === child.href
                            ? "bg-hf-surface-4 text-hf-accent-soft"
                            : "text-hf-muted hover:bg-hf-surface-3 hover:text-white"
                        }`}
                      >
                        {child.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              ) : null}
            </li>
          );
        })}
      </ul>

      {/* The one promo that survives: small, in the chrome, never over content */}
      <Link
        href="/pricing"
        onClick={closeCatalog}
        aria-label="54% off Personal — see plans"
        className="press mt-auto flex w-14 flex-col items-center rounded-[var(--radius-control)] bg-hf-accent/15 px-1 py-2 text-center text-[10px] leading-tight font-semibold text-hf-accent-soft transition-colors hover:bg-hf-accent/25"
      >
        <span className="text-sm font-bold">−54%</span>
        Personal
      </Link>

      {catalogOpen ? (
        <>
          <button
            type="button"
            aria-label="Close catalog"
            tabIndex={-1}
            onClick={closeCatalog}
            className="fixed inset-0 left-rail z-0 cursor-default bg-black/50"
          />
          <div
            ref={panelRef}
            id="create-catalog"
            role="dialog"
            aria-label="Create"
            className="animate-flyout absolute top-0 left-full z-10 flex h-full w-[42rem] flex-col border-r border-hf-border bg-hf-surface p-6 shadow-[24px_0_60px_-30px_rgb(0_0_0/0.8)]"
          >
            <p className="font-display text-xl font-bold tracking-[-0.025em] text-white">
              What are you making?
            </p>
            <p className="mt-1 mb-6 text-sm text-hf-muted">
              Every model, studio and app. Press <kbd className="rounded bg-hf-surface-4 px-1.5 text-xs">⌘K</kbd> to jump by name.
            </p>
            <CreateCatalog onNavigate={closeCatalog} />
          </div>
        </>
      ) : null}
    </nav>
  );
}
