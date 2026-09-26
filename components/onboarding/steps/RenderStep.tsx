"use client";

import { motion } from "motion/react";
import { ArrowLeft, ArrowRight, RotateCcw } from "lucide-react";
import type { Medium, Picks } from "@/lib/onboarding/sandbox";
import { RenderPreview } from "../RenderPreview";
import { SPRING } from "./motion";

/** Steps 3 and 4: the three-second test render, then open the studio. */
export function RenderStep({
  medium,
  picks,
  prompt,
  runId,
  rendered,
  reduce,
  onRendered,
  onOpen,
  onEdit,
  onRerender,
}: {
  medium: Medium;
  picks: Picks;
  prompt: string;
  runId: number;
  rendered: boolean;
  reduce: boolean;
  onRendered: () => void;
  onOpen: () => void;
  onEdit: () => void;
  onRerender: () => void;
}) {
  return (
    <>
      <h1 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
        {rendered ? "Your first frame" : "Rendering…"}
      </h1>
      <p className="mt-2 text-sm text-hf-muted">
        {rendered
          ? `Graded and framed from your tags. Open ${medium.studioLabel} to generate the real thing.`
          : "Three seconds. Watch it develop."}
      </p>

      <div className="mt-6">
        <RenderPreview still={medium.still} picks={picks} runId={runId} onDone={onRendered} />
      </div>

      <p className="mt-4 text-sm leading-relaxed text-white">{prompt}</p>

      {rendered ? (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={reduce ? { duration: 0 } : SPRING}
          className="mt-6 space-y-3"
        >
          <button
            type="button"
            onClick={onOpen}
            className="press glow flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-hf-accent text-sm font-semibold text-black hover:bg-hf-accent-hover"
          >
            Open Workspace with This Preset
            <ArrowRight className="size-4" aria-hidden strokeWidth={2.25} />
          </button>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onEdit}
              className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hf-border text-sm text-white hover:border-hf-accent/50"
            >
              <ArrowLeft className="size-4" aria-hidden strokeWidth={2} />
              Edit prompt
            </button>
            <button
              type="button"
              onClick={onRerender}
              className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hf-border text-sm text-white hover:border-hf-accent/50"
            >
              <RotateCcw className="size-4" aria-hidden strokeWidth={2} />
              Render again
            </button>
          </div>
        </motion.div>
      ) : null}
    </>
  );
}
