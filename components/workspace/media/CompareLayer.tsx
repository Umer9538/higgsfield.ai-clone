"use client";

import { useEffect, useRef } from "react";

/** Downscale factor for the preview pass: each drawn pixel covers 8×8. */
const DRAFT_SCALE = 8;

type Source = HTMLVideoElement | HTMLImageElement;

const sizeOf = (el: Source) =>
  el instanceof HTMLVideoElement
    ? { w: el.videoWidth, h: el.videoHeight }
    : { w: el.naturalWidth, h: el.naturalHeight };

/**
 * Split-screen "preview pass vs final render".
 *
 * The left side is a canvas holding the current frame at 1/8 resolution,
 * scaled back up with `image-rendering: pixelated` — so the browser does the
 * upscale for free and there is only one video decode. For video, it redraws
 * on requestVideoFrameCallback, i.e. exactly once per presented frame, never
 * on a timer; it also redraws on seek. The divider is a real slider: drag it,
 * tap anywhere on the handle line, or use the arrow keys.
 */
export function CompareLayer({
  source,
  split,
  onSplit,
}: {
  source: React.RefObject<Source | null>;
  split: number;
  onSplit: (value: number) => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const hostRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = source.current;
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!el || !canvas || !ctx) return;

    const draw = () => {
      const { w, h } = sizeOf(el);
      if (!w || !h) return;
      const cw = Math.max(1, Math.round(w / DRAFT_SCALE));
      const ch = Math.max(1, Math.round(h / DRAFT_SCALE));
      if (canvas.width !== cw) canvas.width = cw;
      if (canvas.height !== ch) canvas.height = ch;
      ctx.filter = "saturate(0.7) contrast(0.92)";
      ctx.drawImage(el, 0, 0, cw, ch);
    };

    draw();
    if (!(el instanceof HTMLVideoElement)) {
      el.addEventListener("load", draw);
      return () => el.removeEventListener("load", draw);
    }

    // Once per presented video frame where supported; timeupdate otherwise
    let handle = 0;
    const onFrame = () => {
      draw();
      handle = el.requestVideoFrameCallback(onFrame);
    };
    const hasRvfc = typeof el.requestVideoFrameCallback === "function";
    if (hasRvfc) handle = el.requestVideoFrameCallback(onFrame);
    el.addEventListener("seeked", draw);
    el.addEventListener("loadeddata", draw);
    if (!hasRvfc) el.addEventListener("timeupdate", draw);
    return () => {
      if (hasRvfc) el.cancelVideoFrameCallback(handle);
      el.removeEventListener("seeked", draw);
      el.removeEventListener("loadeddata", draw);
      el.removeEventListener("timeupdate", draw);
    };
  }, [source]);

  const fromPointer = (clientX: number) => {
    const rect = hostRef.current?.getBoundingClientRect();
    if (!rect) return;
    onSplit(Math.min(100, Math.max(0, ((clientX - rect.left) / rect.width) * 100)));
  };

  return (
    <div ref={hostRef} className="pointer-events-none absolute inset-0" data-compare>
      <canvas
        ref={canvasRef}
        aria-hidden
        className="absolute inset-0 size-full [image-rendering:pixelated]"
        style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
      />

      <span className="absolute top-3 left-3 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
        Preview pass
      </span>
      <span className="absolute top-3 right-3 rounded-md bg-black/65 px-2 py-1 text-[11px] font-medium text-white backdrop-blur">
        Final render
      </span>

      <div
        role="slider"
        tabIndex={0}
        aria-label="Comparison split"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(split)}
        aria-valuetext={`${Math.round(split)}% preview`}
        onPointerDown={(event) => {
          event.stopPropagation();
          event.currentTarget.setPointerCapture(event.pointerId);
          fromPointer(event.clientX);
        }}
        onPointerMove={(event) => {
          if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event.clientX);
        }}
        onClick={(event) => event.stopPropagation()}
        onKeyDown={(event) => {
          const step = event.shiftKey ? 10 : 2;
          const next =
            event.key === "ArrowLeft" ? split - step
            : event.key === "ArrowRight" ? split + step
            : event.key === "Home" ? 0
            : event.key === "End" ? 100
            : null;
          if (next === null) return;
          event.preventDefault();
          event.stopPropagation();
          onSplit(Math.min(100, Math.max(0, next)));
        }}
        // A 44px-wide hit area around a 2px line
        className="pointer-events-auto absolute inset-y-0 w-11 -translate-x-1/2 cursor-ew-resize touch-none"
        style={{ left: `${split}%` }}
      >
        <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 bg-white shadow-[0_0_12px_rgb(0_0_0/0.6)]" />
        <span className="absolute top-1/2 left-1/2 flex size-8 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-[10px] font-bold text-black shadow-lg">
          ⇆
        </span>
      </div>
    </div>
  );
}
