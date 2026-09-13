"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import type { GenerationResult } from "@/lib/workspace/types";

export type GenerationStatus = "idle" | "running" | "done";

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
}

const GenerationContext = createContext<GenerationContextValue | null>(null);

export function GenerationProvider({
  kind,
  children,
}: {
  kind: GenerationResult["kind"];
  children: React.ReactNode;
}) {
  const [status, setStatus] = useState<GenerationStatus>("idle");
  const [progress, setProgress] = useState(0);
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
      }
    }, TICK_MS);
  }, [clear]);

  const reset = useCallback(() => {
    clear();
    setStatus("idle");
    setProgress(0);
  }, [clear]);

  useEffect(() => clear, [clear]);

  const stageIndex = Math.min(stages.length - 1, Math.floor((progress / 100) * stages.length));

  const value = useMemo(
    () => ({ status, progress, stage: stages[stageIndex], stages, stageIndex, start, reset }),
    [status, progress, stages, stageIndex, start, reset],
  );

  return <GenerationContext.Provider value={value}>{children}</GenerationContext.Provider>;
}

export function useGeneration(): GenerationContextValue {
  const context = useContext(GenerationContext);
  if (!context) throw new Error("useGeneration must be used inside a GenerationProvider");
  return context;
}
