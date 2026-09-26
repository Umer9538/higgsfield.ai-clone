"use client";

import Image from "next/image";
import { useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { downloadAsset } from "@/lib/ui/download";
import { Columns2, Download, RotateCcw, Share2, Sparkles, Wand2 } from "lucide-react";
import type { GenerationResult } from "@/lib/workspace/types";
import { useGeneration } from "./generation";
import { CompareLayer } from "./media/CompareLayer";
import { VideoStage } from "./media/VideoStage";

/** Image result with the same preview-vs-final comparison as video. */
function ImageStage({ src }: { src: string }) {
  const imageRef = useRef<HTMLImageElement>(null);
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(50);

  return (
    <div className="relative overflow-hidden rounded-2xl border border-hf-border">
      <Image
        ref={imageRef}
        src={src}
        alt="Generated result"
        width={1280}
        height={720}
        className="aspect-video w-full object-cover"
        priority
      />
      {compare ? <CompareLayer source={imageRef} split={split} onSplit={setSplit} /> : null}
      <button
        type="button"
        aria-pressed={compare}
        onClick={() => setCompare((prev) => !prev)}
        className={`absolute right-3 bottom-3 flex h-8 items-center gap-1.5 rounded-md px-2 text-xs backdrop-blur transition-colors ${
          compare ? "bg-hf-cyan/25 text-hf-cyan" : "bg-black/60 text-white hover:bg-black/75"
        }`}
      >
        <Columns2 className="size-4" aria-hidden strokeWidth={1.75} />
        Compare
      </button>
    </div>
  );
}

const BADGE: Record<string, { label: string; tone: string }> = {
  saving: { label: "Saving…", tone: "border-hf-border text-hf-dim" },
  firestore: { label: "Synced to cloud", tone: "border-hf-cyan/50 bg-hf-cyan/10 text-hf-cyan" },
  memory: { label: "Saved · session", tone: "border-hf-cyan/40 text-hf-cyan" },
  local: { label: "Saved on device", tone: "border-hf-border text-hf-muted" },
};

/** Tells the user where their output actually landed, not just that it finished. */
function PersistenceBadge({ state }: { state: string }) {
  const badge = BADGE[state];
  if (!badge) return null;
  return (
    <span
      data-persistence={state}
      role="status"
      className={`rounded-full border px-2 py-0.5 text-[10px] font-medium tracking-wide uppercase ${badge.tone}`}
    >
      {badge.label}
    </span>
  );
}

const ACTIONS = [
  { label: "Download", icon: Download },
  { label: "Upscale", icon: Wand2 },
  { label: "Variations", icon: Sparkles },
  { label: "Share", icon: Share2 },
] as const;

export function ResultCard({ result }: { result: GenerationResult }) {
  const { reset, saved } = useGeneration();
  const { toast } = useToast();
  const [busy, setBusy] = useState<string | null>(null);

  const runAction = async (label: (typeof ACTIONS)[number]["label"]) => {
    if (label === "Download") {
      setBusy(label);
      const filename = result.src.split("/").pop() ?? "higgsfield-result";
      const ok = await downloadAsset(result.src, filename);
      setBusy(null);
      toast(ok ? `Downloaded ${filename}` : `Opened ${filename} in a new tab`);
      return;
    }
    if (label === "Share") {
      try {
        await navigator.clipboard.writeText(window.location.href);
        toast("Link copied to clipboard");
      } catch {
        toast("Copy blocked by the browser", "info");
      }
      return;
    }
    if (label === "Upscale") {
      toast("Upscaling queued \u2014 4K ready in about 40s", "info");
      return;
    }
    toast("Queued 4 variations", "info");
  };

  return (
    // On desktop the studio column has a fixed height, and at laptop heights a
    // full-width 16:9 player put its own controls under the prompt bar. Width
    // is capped by the height left over (~26rem of chrome), so the whole
    // player — scrubber included — stays on screen.
    <div className="mx-auto w-full max-w-3xl lg:max-w-[min(48rem,calc((100dvh-26rem)*16/9))]">
      <div className="flex items-center justify-between gap-4">
        <p className="flex flex-wrap items-center gap-2 text-sm font-medium text-white">
          <span className="size-1.5 rounded-full bg-hf-accent" aria-hidden />
          Generation complete
          <PersistenceBadge state={saved} />
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full border border-hf-border px-3 py-1.5 text-xs text-white transition-colors hover:border-hf-accent/50 hover:text-hf-accent-soft"
        >
          <RotateCcw className="size-3.5" aria-hidden strokeWidth={1.75} />
          New generation
        </button>
      </div>

      <div className="mt-3 animate-reveal">
        {result.kind === "video" ? (
          <VideoStage src={result.src} poster={result.poster} />
        ) : (
          <ImageStage src={result.src} />
        )}
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {ACTIONS.map(({ label, icon: ActionIcon }) => (
          <button
            key={label}
            type="button"
            onClick={() => void runAction(label)}
            disabled={busy === label}
            className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white transition-colors hover:bg-hf-surface-3 disabled:opacity-60"
          >
            <ActionIcon className="size-4 text-hf-dim" aria-hidden strokeWidth={1.75} />
            {busy === label ? "Working\u2026" : label}
          </button>
        ))}
      </div>

      <dl className="mt-4 flex flex-wrap gap-2">
        {result.meta.map((item) => (
          <div
            key={item.label}
            className="rounded-lg bg-hf-surface-2 px-3 py-2 text-xs"
          >
            <dt className="text-hf-dim">{item.label}</dt>
            <dd className="mt-0.5 font-medium text-white">{item.value}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
