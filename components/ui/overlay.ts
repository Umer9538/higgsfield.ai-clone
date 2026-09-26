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
