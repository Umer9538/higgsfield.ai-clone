"use client";

import { useEffect, useRef } from "react";
import { STYLE_GRADE, type Picks } from "@/lib/onboarding/sandbox";

const RUN_MS = 3000;
const FRAMES = 120;
const W = 640;
const H = 360;

/** Camera moves per camera tag: scale and pan as a function of progress 0→1. */
function cameraAt(camera: string | undefined, p: number, still: boolean) {
  if (still) return { scale: 1.08, x: 0, y: 0 };
  switch (camera) {
    case "drone":
      return { scale: 1.3, x: 0.1 - 0.2 * p, y: 0.04 - 0.06 * p };
    case "push-in":
      return { scale: 1 + 0.2 * p, x: 0, y: 0.02 * p };
    case "handheld":
      return { scale: 1.14, x: Math.sin(p * 21) * 0.012, y: Math.cos(p * 17) * 0.01 };
    default:
      return { scale: 1.06, x: 0, y: 0 };
  }
}

/** How the motion tag reshapes time for the camera move. */
function motionCurve(motion: string | undefined, t: number) {
  switch (motion) {
    case "hyperlapse":
      return Math.min(1, t * 1.7);
    case "slowmo":
      return t * 0.45;
    case "loop":
      return 0.5 - Math.cos(t * Math.PI * 2) / 2;
    case "whip":
      return t < 0.75 ? t * 0.3 : 0.225 + ((t - 0.75) / 0.25) ** 2 * 0.775;
    default:
      return t;
  }
}

/**
 * The onboarding "first generation": a three-second test render drawn on a
 * canvas. The frame develops from 32 px blocks to full resolution (the same
 * preview-pass idea as the studio's compare view), is graded by the chosen
 * style, and moves the way the chosen camera and motion tags describe. The
 * frame counter, progress and edge glow are written through refs, so a
 * 60 fps loop does not re-render React. With reduced motion the camera holds
 * still; the frame still develops.
 */
export function RenderPreview({
  still,
  picks,
  runId,
  onDone,
}: {
  still: string;
  picks: Picks;
  /** Changing it restarts the render */
  runId: number;
  onDone: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const glowRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const doneRef = useRef(onDone);

  useEffect(() => {
    doneRef.current = onDone;
  });

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (!canvas || !ctx) return;
    const reduced =
      document.documentElement.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const small = document.createElement("canvas");
    const smallCtx = small.getContext("2d");
    const image = new window.Image();
    let frame = 0;
    let started = 0;
    let finished = false;

    const draw = (t: number) => {
      const cam = cameraAt(picks.camera, motionCurve(picks.motion, t), reduced);
      const dw = W * cam.scale;
      const dh = H * cam.scale;
      const dx = (W - dw) / 2 + cam.x * W;
      const dy = (H - dh) / 2 + cam.y * H;
      // Develop: coarse blocks resolve to full detail by 85% of the run
      const develop = Math.min(1, t / 0.85);
      const block = Math.max(1, Math.round(32 * (1 - develop) ** 2));

      if (block > 1 && smallCtx) {
        small.width = Math.ceil(W / block);
        small.height = Math.ceil(H / block);
        smallCtx.imageSmoothingEnabled = true;
        smallCtx.drawImage(image, dx / block, dy / block, dw / block, dh / block);
        ctx.imageSmoothingEnabled = false;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(small, 0, 0, small.width * block, small.height * block);
      } else {
        ctx.imageSmoothingEnabled = true;
        ctx.clearRect(0, 0, W, H);
        ctx.drawImage(image, dx, dy, dw, dh);
      }

      const count = Math.max(1, Math.round(t * FRAMES));
      if (counterRef.current) counterRef.current.textContent = `Rendering test frame ${String(count).padStart(3, "0")}/${FRAMES}…`;
      if (glowRef.current) glowRef.current.style.opacity = String(t ** 2);
      if (barRef.current) barRef.current.style.transform = `scaleX(${t})`;
      canvas.dataset.progress = String(Math.round(t * 100));
    };

    const loop = (now: number) => {
      if (!started) started = now;
      const t = Math.min(1, (now - started) / RUN_MS);
      draw(t);
      if (t < 1) {
        frame = requestAnimationFrame(loop);
      } else if (!finished) {
        finished = true;
        if (counterRef.current) counterRef.current.textContent = `Test frame ${FRAMES}/${FRAMES} · done`;
        canvas.dataset.done = "true";
        doneRef.current();
      }
    };

    image.onload = () => {
      frame = requestAnimationFrame(loop);
    };
    image.src = still;
    delete canvas.dataset.done;

    return () => {
      cancelAnimationFrame(frame);
      image.onload = null;
    };
  }, [still, picks.camera, picks.motion, runId]);

  const grade = picks.style ? STYLE_GRADE[picks.style] : undefined;

  return (
    <div>
      <div className="relative">
      <div
        ref={glowRef}
        aria-hidden
        data-render-glow
        className="pointer-events-none absolute -inset-px rounded-[var(--radius-media)] opacity-0 shadow-[0_0_0_1px_color-mix(in_srgb,var(--color-hf-cyan)_70%,transparent),0_0_56px_-8px_color-mix(in_srgb,var(--color-hf-cyan)_60%,transparent)]"
      />
      <div className="relative overflow-hidden rounded-[var(--radius-media)] border border-hf-border bg-hf-black">
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          data-render-preview
          aria-label="Test frame preview"
          role="img"
          className="block aspect-video w-full"
          style={{ filter: grade?.filter }}
        />
        {grade?.tint ? (
          <div aria-hidden className="pointer-events-none absolute inset-0 mix-blend-overlay" style={{ background: grade.tint }} />
        ) : null}
        <span
          ref={counterRef}
          data-render-counter
          aria-live="off"
          className="absolute bottom-3 left-3 rounded-md bg-black/65 px-2 py-1 font-mono text-[11px] text-white tabular-nums backdrop-blur"
        >
          Rendering test frame 001/{FRAMES}…
        </span>
      </div>
      </div>
      <div className="mt-3 h-1 overflow-hidden rounded-full bg-hf-surface-4">
        {/* Inline transform only: Tailwind's scale-x-* sets the separate
            `scale` property, which would multiply with it and pin it at 0 */}
        <div ref={barRef} data-render-bar className="h-full origin-left rounded-full bg-hf-cyan" style={{ transform: "scaleX(0)" }} />
      </div>
    </div>
  );
}
