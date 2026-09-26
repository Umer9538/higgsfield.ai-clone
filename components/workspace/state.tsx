"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Surface } from "@/lib/workspace/types";

export type FieldValue = string | boolean;

interface WorkspaceContextValue {
  values: Record<string, FieldValue>;
  setValue: (id: string, value: FieldValue) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/** Keys for the prompt-bar and inspector state of dock-configured studios. */
export const dockKey = {
  prompt: "prompt",
  mode: "mode",
  count: "count",
  pill: (index: number) => `pill:${index}`,
  setup: (label: string) => `setup:${label}`,
  slot: (name: string) => `slot:${name}`,
};

/** Seed state from whatever defaults the surface config declares. */
function initialValues(surface: Surface): Record<string, FieldValue> {
  const { fields, dock } = surface;
  const seed: Record<string, FieldValue> = {};
  if (dock) {
    seed[dockKey.prompt] = "";
    // Start in the mode whose model the composer already shows
    const model = dock.pills.find((pill) => pill.icon === "model")?.label;
    const matching = Object.entries(dock.modeModels ?? {}).find(([, value]) => value === model)?.[0];
    seed[dockKey.mode] = matching ?? dock.rail?.[0]?.label ?? "";
    seed[dockKey.count] = dock.stepper?.split("/")[0] ?? "1";
    dock.pills.forEach((pill, index) => (seed[dockKey.pill(index)] = pill.label));
    dock.setup?.forEach((entry) => (seed[dockKey.setup(entry.label)] = entry.value));
    dock.slots?.forEach((slot) => (seed[dockKey.slot(slot)] = false));
  }
  for (const field of fields) {
    if (field.kind === "segmented") seed[field.id] = field.defaultValue;
    if (field.kind === "toggle") {
      seed[field.id] = field.defaultOn;
      if (field.segmented?.[0]) seed[`${field.id}:mode`] = field.segmented[0].value;
    }
    if (field.kind === "prompt") seed[field.id] = "";
    if (field.kind === "promptToggle") seed[field.id] = field.defaultOn;
  }
  return seed;
}

export function WorkspaceProvider({
  surface,
  children,
}: {
  surface: Surface;
  children: React.ReactNode;
}) {
  // Remix and the home composer arrive as ?prompt=... — seed the prompt with it.
  const searchParams = useSearchParams();
  const incomingPrompt = searchParams.get("prompt");

  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const seed = initialValues(surface);
    if (incomingPrompt) {
      const target = surface.fields.find((field) => field.kind === "prompt");
      if (target) seed[target.id] = incomingPrompt;
      else if (surface.dock) seed[dockKey.prompt] = incomingPrompt;
    }
    return seed;
  });

  const setValue = useCallback((id: string, value: FieldValue) => {
    setValues((prev) => ({ ...prev, [id]: value }));
  }, []);

  const context = useMemo(() => ({ values, setValue }), [values, setValue]);

  return <WorkspaceContext.Provider value={context}>{children}</WorkspaceContext.Provider>;
}

export function useWorkspace(): WorkspaceContextValue {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used inside a WorkspaceProvider");
  return context;
}

export function useField<T extends FieldValue>(id: string, fallback: T): [T, (value: T) => void] {
  const { values, setValue } = useWorkspace();
  const current = (values[id] ?? fallback) as T;
  return [current, (value: T) => setValue(id, value)];
}
