"use client";

import type { Surface } from "@/lib/workspace/types";
import { ContentPane } from "./ContentPane";
import { GeneratingState } from "./GeneratingState";
import { ResultCard } from "./ResultCard";
import { useGeneration } from "./generation";

/** Swaps the content pane between the idle promo, the run, and the result. */
export function WorkspaceContent({ surface }: { surface: Surface }) {
  const { status } = useGeneration();

  if (status === "running") return <GeneratingState />;
  if (status === "done" && surface.result) return <ResultCard result={surface.result} />;
  return <ContentPane content={surface.content} />;
}
