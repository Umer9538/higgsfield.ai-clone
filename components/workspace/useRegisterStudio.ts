"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import { setStudioContext } from "@/lib/commands/studio-context";
import { primaryPrompt } from "@/lib/workspace/inspector";
import { LOOKS, SETUP_OPTIONS } from "@/lib/workspace/options";
import type { Surface } from "@/lib/workspace/types";
import { useGeneration } from "./generation";
import { dockKey, useWorkspace, type FieldValue } from "./state";

/** Publishes this studio to the palette and HUD while it is mounted. */
export function useRegisterStudio(surface: Surface) {
  const { values, setValue } = useWorkspace();
  const { status, saved } = useGeneration();
  const live = useRef({ values, status, saved });

  useLayoutEffect(() => {
    live.current = { values, status, saved };
  });

  useEffect(() => {
    const promptKey = primaryPrompt(surface)?.id ?? (surface.dock ? dockKey.prompt : null);
    const pickers = (surface.dock?.setup ?? []).filter((entry) => SETUP_OPTIONS[entry.label]);

    setStudioContext({
      surfaceId: surface.id,
      label: surface.label,
      prompt: () => (promptKey ? String(live.current.values[promptKey] ?? "") : ""),
      metadata: () => metadataFor(surface, live.current.values, live.current.status, live.current.saved),
      looks:
        pickers.length > 0
          ? LOOKS.map((look) => ({
              name: look.name,
              apply: () =>
                Object.entries(look.values).forEach(([label, value]) => {
                  if (pickers.some((entry) => entry.label === label)) setValue(dockKey.setup(label), value);
                }),
            }))
          : [],
    });
    return () => setStudioContext(null);
  }, [surface, setValue]);
}

/** A plain-JSON description of the generation as currently configured. */
function metadataFor(surface: Surface, values: Record<string, FieldValue>, status: string, saved: string) {
  const dock = surface.dock;
  const promptKey = primaryPrompt(surface)?.id ?? (dock ? dockKey.prompt : null);
  const output = dock
    ? Object.fromEntries(dock.pills.map((pill, i) => [pill.icon, values[dockKey.pill(i)] ?? pill.label]))
    : Object.fromEntries((surface.result?.meta ?? []).map((m) => [m.label.toLowerCase(), m.value]));
  const parameters = dock?.setup
    ? Object.fromEntries(dock.setup.map((entry) => [entry.label, values[dockKey.setup(entry.label)] ?? entry.value]))
    : Object.fromEntries(Object.entries(values).filter(([key, value]) => key !== promptKey && value !== ""));

  return {
    studio: surface.id,
    label: surface.label,
    prompt: promptKey ? String(values[promptKey] ?? "") : null,
    ...(dock?.rail ? { mode: values[dockKey.mode] } : {}),
    ...(dock?.stepper ? { batch: Number(values[dockKey.count] ?? 1) } : {}),
    parameters,
    output,
    cost: { credits: surface.generate.cost, ...(surface.generate.originalCost ? { was: surface.generate.originalCost } : {}) },
    run: { status, persistence: saved, endpoint: "POST /api/generations" },
  };
}
