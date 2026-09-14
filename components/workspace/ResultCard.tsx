"use client";

import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";
import { useToast } from "@/components/ui/Toast";
import { downloadAsset } from "@/lib/ui/download";
import {
  Download,
  Maximize2,
  Pause,
  Play,
  RotateCcw,
  Share2,
  Sparkles,
  Volume2,
  VolumeX,
  Wand2,
} from "lucide-react";
import type { GenerationResult } from "@/lib/workspace/types";
import { useGeneration } from "./generation";

function formatTime(seconds: number) {
  if (!Number.isFinite(seconds)) return "0:00";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

function VideoPlayer({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      void video.play();
    } else {
      video.pause();
    }
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => setDuration(video.duration);

    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const progress = duration > 0 ? (current / duration) * 100 : 0;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-hf-border bg-black">
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        preload="metadata"
        loop
        playsInline
        className="aspect-video w-full"
        onClick={toggle}
      />

      {!playing ? (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-hf-lime text-black">
            <Play className="size-6 translate-x-0.5" aria-hidden fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 to-transparent p-3">
        <input
          type="range"
          min={0}
          max={duration || 0}
          step={0.01}
          value={current}
          aria-label="Seek"
          onChange={(event) => {
            const video = videoRef.current;
            if (!video) return;
            video.currentTime = Number(event.target.value);
            setCurrent(Number(event.target.value));
          }}
          className="h-1 w-full cursor-pointer appearance-none rounded-full bg-white/25 accent-hf-lime"
          style={{
            background: `linear-gradient(to right, #d1fe17 ${progress}%, rgba(255,255,255,0.25) ${progress}%)`,
          }}
        />

        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="text-white transition-opacity hover:opacity-80"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="size-4" aria-hidden fill="currentColor" strokeWidth={0} />
            )}
          </button>

          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="text-white transition-opacity hover:opacity-80"
          >
            {muted ? (
              <VolumeX className="size-4" aria-hidden strokeWidth={1.75} />
            ) : (
              <Volume2 className="size-4" aria-hidden strokeWidth={1.75} />
            )}
          </button>

          <span className="text-xs text-white/85 tabular-nums">
            {formatTime(current)} / {formatTime(duration)}
          </span>

          <button
            type="button"
            onClick={() => void videoRef.current?.requestFullscreen?.()}
            aria-label="Fullscreen"
            className="ml-auto text-white transition-opacity hover:opacity-80"
          >
            <Maximize2 className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}

const ACTIONS = [
  { label: "Download", icon: Download },
  { label: "Upscale", icon: Wand2 },
  { label: "Variations", icon: Sparkles },
  { label: "Share", icon: Share2 },
] as const;

export function ResultCard({ result }: { result: GenerationResult }) {
  const { reset } = useGeneration();
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
    <div className="mx-auto max-w-3xl">
      <div className="flex items-center justify-between gap-4">
        <p className="flex items-center gap-2 text-sm font-medium text-white">
          <span className="size-1.5 rounded-full bg-hf-lime" aria-hidden />
          Generation complete
        </p>
        <button
          type="button"
          onClick={reset}
          className="flex items-center gap-1.5 rounded-full border border-hf-border px-3 py-1.5 text-xs text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          <RotateCcw className="size-3.5" aria-hidden strokeWidth={1.75} />
          New generation
        </button>
      </div>

      <div className="mt-3">
        {result.kind === "video" ? (
          <VideoPlayer src={result.src} poster={result.poster} />
        ) : (
          <div className="overflow-hidden rounded-xl border border-hf-border">
            <Image
              src={result.src}
              alt="Generated result"
              width={1280}
              height={720}
              className="aspect-video w-full object-cover"
              priority
            />
          </div>
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
