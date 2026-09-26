"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname } from "next/navigation";

/**
 * Lifecycle rules shared by every menu, sheet and flyout:
 *   1. It belongs to the page it was opened on — navigating closes it.
 *   2. Only one is open at a time — opening one closes the others.
 *   3. While it is open the page behind it does not scroll.
 */

/**
 * Open state scoped to the current route. Rather than an effect that resets
 * state after navigation (and can be forgotten, or run a frame late), the
 * menu remembers which pathname it was opened on and is only open there.
 */
export function useRouteScopedOpen() {
  const pathname = usePathname();
  const [openOn, setOpenOn] = useState<string | null>(null);
  const open = openOn === pathname;

  const setOpen = useCallback((next: boolean) => setOpenOn(next ? pathname : null), [pathname]);
  const toggle = useCallback(
    () => setOpenOn((prev) => (prev === pathname ? null : pathname)),
    [pathname],
  );
  const close = useCallback(() => setOpenOn(null), []);

  return { open, setOpen, toggle, close };
}

const OVERLAY_OPENED = "hf:overlay-opened";

/** Announce an overlay opening; every other open overlay closes itself. */
export function useExclusiveOverlay(id: string, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    window.dispatchEvent(new CustomEvent(OVERLAY_OPENED, { detail: id }));
    const onOther = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== id) close();
    };
    window.addEventListener(OVERLAY_OPENED, onOther);
    return () => window.removeEventListener(OVERLAY_OPENED, onOther);
  }, [id, open, close]);
}

/*
 * Counted, so nested overlays (the palette over a sheet) unlock only when the
 * last one closes. The scrollbar's width is padded back so the page does not
 * shift sideways when it disappears.
 */
let locks = 0;
let saved: { overflow: string; paddingRight: string } | null = null;

export function useScrollLock(active: boolean) {
  useEffect(() => {
    if (!active) return;
    if (locks++ === 0) {
      const gap = window.innerWidth - document.documentElement.clientWidth;
      saved = { overflow: document.body.style.overflow, paddingRight: document.body.style.paddingRight };
      document.body.style.overflow = "hidden";
      if (gap > 0) document.body.style.paddingRight = `${gap}px`;
    }
    return () => {
      if (--locks === 0 && saved) {
        document.body.style.overflow = saved.overflow;
        document.body.style.paddingRight = saved.paddingRight;
        saved = null;
      }
    };
  }, [active]);
}

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * Dialog focus behaviour for sheets and flyouts: move focus inside on open,
 * keep Tab cycling within, close on Escape, and hand focus back to whatever
 * opened it on close. Without this a keyboard user could open a sheet and
 * keep tabbing through the page hidden behind it.
 */
export function useDialogFocus(
  container: React.RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const opener = document.activeElement as HTMLElement | null;
    const panel = container.current;
    const items = () => [...(panel?.querySelectorAll<HTMLElement>(FOCUSABLE) ?? [])].filter((el) => el.offsetParent !== null);
    items()[0]?.focus();

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }
      if (event.key !== "Tab" || !panel) return;
      const list = items();
      if (list.length === 0) return;
      const first = list[0];
      const last = list[list.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      } else if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      // Only restore if focus is not already somewhere deliberate (a new page)
      if (opener && document.contains(opener) && (!document.activeElement || document.activeElement === document.body || panel?.contains(document.activeElement))) {
        opener.focus();
      }
    };
  }, [container, open, onClose]);
}

/**
 * Close an overlay when the viewport leaves the range it exists in, e.g. a
 * phone sheet when the window widens past the breakpoint. Otherwise the
 * sheet disappears visually while its scroll lock and modal state remain,
 * and the page looks frozen.
 */
export function useCloseOutsideMedia(query: string, open: boolean, close: () => void) {
  useEffect(() => {
    if (!open) return;
    const media = window.matchMedia(query);
    const onChange = () => {
      if (!media.matches) close();
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, [query, open, close]);
}
