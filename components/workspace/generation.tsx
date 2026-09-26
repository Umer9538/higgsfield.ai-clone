"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GenerationResult, Surface } from "@/lib/workspace/types";
import { addGeneratedAsset } from "@/lib/assets/store";
import { useWorkspace } from "./state";

export type GenerationStatus = "idle" | "running" | "done";

/** Where the finished output was persisted, surfaced as a live badge. */
export type SaveState = "idle" | "saving" | "firestore" | "memory" | "local";

/** Stage labels per output kind, so the status text reads like real work. */
const STAGES: Record<GenerationResult["kind"], string[]> = {
  video: [
    "Queued",
    "Preparing references",
    "Sampling keyframes",
    "Interpolating motion",
    "Upscaling",
    "Finalising",
  ],
  image: ["Queued", "Encoding prompt", "Diffusing latents", "Refining detail", "Upscaling"],
};

const RUN_MS = 6000;
const TICK_MS = 80;

interface GenerationContextValue {
  status: GenerationStatus;
  progress: number;
  stage: string;
  stages: string[];
  stageIndex: number;
  start: () => void;
  reset: () => void;
  saved: SaveState;
}

const GenerationContext = createContext<GenerationContextValue | null>(null);

export function GenerationProvider({
  kind,
  surface,
  children,
}: {
  kind: GenerationResult["kind"];
  surface?: Surface;
  children: React.ReactNode;
}) {
  const { values } = useWorkspace();
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
  const [saved, setSaved] = useState<SaveState>("idle");
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  const stages = STAGES[kind];

  const clear = useCallback(() => {
    if (timer.current) {
      clearInterval(timer.current);
      timer.current = null;
    }
  }, []);

  const start = useCallback(() => {
    clear();
    setStatus("running");
    setProgress(0);

    const started = Date.now();
    timer.current = setInterval(() => {
      const elapsed = Date.now() - started;
      const next = Math.min(100, (elapsed / RUN_MS) * 100);
      setProgress(next);
      if (next >= 100) {
        clear();
        setStatus("done");
        // Persist the output so it appears in the asset library immediately.
        const result = surface?.result;
        if (result) {
          const promptField = surface?.fields.find((field) => field.kind === "prompt");
          const prompt = promptField ? String(values[promptField.id] ?? "") : "";
          const model = result.meta.find((m) => m.label === "Model")?.value ?? surface.label;
          const spec = result.meta
            .filter((m) => m.label !== "Model")
            .map((m) => m.value)
            .join(" · ");

          // Local store first so the library updates instantly, then persist.
          addGeneratedAsset({ kind: result.kind, model, prompt, src: result.src, poster: result.poster, spec });

          setSaved("saving");
          void fetch("/api/generations", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              prompt: prompt || "Untitled generation",
              model,
              surface: surface.id,
              kind: result.kind,
              src: result.src,
              poster: result.poster,
              spec,
            }),
          })
            .then((response) => (response.ok ? response.json() : Promise.reject(response.status)))
            .then((data: { source?: string }) =>
              setSaved(data.source === "firestore" ? "firestore" : "memory"),
            )
            .catch(() => {
              // Offline or no backend: the local store already has it.
              setSaved("local");
            });
        }
      }
    }, TICK_MS);
  }, [clear, surface, values]);

  const reset = useCallback(() => {
    clear();
    setStatus("idle");
    setProgress(0);
    setSaved("idle");
  }, [clear]);

  useEffect(() => clear, [clear]);

  const stageIndex = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));

  const value = useMemo(
    () => ({ status, progress, stage: stages[stageIndex], stages, stageIndex, start, reset, saved }),
    [status, progress, stages, stageIndex, start, reset, saved],
  );

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

export function useGeneration(): GenerationContextValue {
  const context = useContext(GenerationContext);
  if (!context) throw new Error("useGeneration must be used inside a GenerationProvider");
  return context;
}
