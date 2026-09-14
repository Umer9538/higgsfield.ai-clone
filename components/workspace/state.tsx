"use client";

import { createContext, useCallback, useContext, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import type { Field } from "@/lib/workspace/types";

export type FieldValue = string | boolean;

interface WorkspaceContextValue {
  values: Record<string, FieldValue>;
  setValue: (id: string, value: FieldValue) => void;
}

const WorkspaceContext = createContext<WorkspaceContextValue | null>(null);

/** Seed state from whatever defaults the surface config declares. */
function initialValues(fields: Field[]): Record<string, FieldValue> {
  const seed: Record<string, FieldValue> = {};
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
  fields,
  children,
}: {
  fields: Field[];
  children: React.ReactNode;
}) {
  // Remix links arrive as /ai/video?prompt=... — seed the first prompt field with it.
  const searchParams = useSearchParams();
  const incomingPrompt = searchParams.get("prompt");

  const [values, setValues] = useState<Record<string, FieldValue>>(() => {
    const seed = initialValues(fields);
    if (incomingPrompt) {
      const target = fields.find((field) => field.kind === "prompt");
      if (target) seed[target.id] = incomingPrompt;
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
