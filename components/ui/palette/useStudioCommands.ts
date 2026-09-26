"use client";

import { useMemo } from "react";
import { useToast } from "@/components/ui/Toast";
import type { CommandItem } from "@/lib/commands/registry";
import { useStudioContext } from "@/lib/commands/studio-context";

/**
 * Commands for the studio on screen, listed first in the palette: copy the
 * prompt, inspect the generation JSON, apply a look. Empty outside a studio.
 */
export function useStudioCommands(onInspect: (metadata: Record<string, unknown>) => void): CommandItem[] {
  const studio = useStudioContext();
  const { toast } = useToast();
  return useMemo<CommandItem[]>(() => {
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
        run: () => onInspect(studio.metadata()),
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
  }, [studio, toast, onInspect]);
}
