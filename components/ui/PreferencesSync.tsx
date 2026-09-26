"use client";

import { useEffect } from "react";
import { usePreferences } from "@/lib/ui/preferences";

/** Applies saved preferences to the document, on every page and after reloads. */
export function PreferencesSync() {
  const { reducedMotion } = usePreferences();
  useEffect(() => {
    document.documentElement.classList.toggle("reduce-motion", reducedMotion);
  }, [reducedMotion]);
  return null;
}
