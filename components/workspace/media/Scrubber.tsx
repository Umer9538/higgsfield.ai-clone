"use client";

import { useRef, useState } from "react";
import type { Filmstrip } from "./useFilmstrip";
import { timecode } from "./timing";

const PREVIEW_W = 144;

/**
 * The seek bar: a native range input for input and accessibility, drawn over
 * a custom track with scene markers and a thumbnail preview on hover.
 */
export function Scrubber({
  current,
  duration,
  fps,
  strip,
  onSeek,
}: {
  current: number;
  duration: number;
  fps: number;
  strip: Filmstrip;
  onSeek: (time: number) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<{ x: number; time: number; width: number } | null>(null);
  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const previewIndex =
    hover && duration > 0 ? Math.min(strip.frames - 1, Math.floor((hover.time / duration) * strip.frames)) : 0;
  const previewScale = PREVIEW_W / strip.frameWidth;

  return (
    <div
      ref={trackRef}
      className="relative h-5 rounded-full has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-hf-cyan"
      onPointerMove={(event) => {
        const rect = trackRef.current?.getBoundingClientRect();
        if (!rect || !duration) return;
        const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
        setHover({ x: ratio * rect.width, time: ratio * duration, width: rect.width });
      }}
      onPointerLeave={() => setHover(null)}
    >
      <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25">
        <div className="h-full rounded-full bg-hf-cyan" style={{ width: `${progress}%` }} />
      </div>

      {duration > 0
        ? strip.markers.map((time) => (
            <span
              key={time}
              data-keyframe
              title={`Scene change at ${timecode(time, fps)}`}
              className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80"
              style={{ left: `${(time / duration) * 100}%` }}
            />
          ))
        : null}

      <span
        aria-hidden
        className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-hf-cyan)_45%,transparent)]"
        style={{ left: `${progress}%` }}
      />

      <input
        type="range"
        data-seek
        min={0}
        max={duration || 0}
        step={1 / fps}
        value={current}
        aria-label="Seek"
        aria-valuetext={timecode(current, fps)}
        onChange={(event) => onSeek(Number(event.target.value))}
        className="absolute inset-0 size-full cursor-pointer opacity-0"
      />

      {hover ? (
        <div
          data-scrub-preview
          aria-hidden
          className="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2 overflow-hidden rounded-lg border border-white/15 bg-black shadow-xl"
          style={{ left: Math.min(Math.max(hover.x, PREVIEW_W / 2), hover.width - PREVIEW_W / 2) }}
        >
          <div
            className="bg-hf-surface-3"
            style={{
              width: PREVIEW_W,
              height: strip.frameHeight * previewScale,
              backgroundImage: strip.sprite ? `url(${strip.sprite})` : undefined,
              backgroundSize: `${strip.frameWidth * strip.frames * previewScale}px ${strip.frameHeight * previewScale}px`,
              backgroundPosition: `-${previewIndex * PREVIEW_W}px 0`,
            }}
          />
          <p className="px-2 py-1 text-center font-mono text-[10px] text-white tabular-nums">
            {timecode(hover.time, fps)}
          </p>
        </div>
      ) : null}
    </div>
  );
}
