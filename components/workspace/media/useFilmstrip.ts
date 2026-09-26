"use client";

import { useEffect, useState } from "react";

export interface Filmstrip {
  /** One JPEG sprite, frames laid left to right */
  sprite: string | null;
  frames: number;
  /** Width and height of one frame inside the sprite, in px */
  frameWidth: number;
  frameHeight: number;
  /** Timestamps (s) where the picture changes most — likely cuts or keyframes */
  markers: number[];
}

const FRAMES = 24;
const W = 160;
const H = 90;

/**
 * Samples a video into a thumbnail sprite for hover previews, and finds its
 * scene changes on the way.
 *
 * A hidden second <video> seeks to FRAMES evenly spaced points; each frame is
 * drawn into the sprite and, at 16×9, compared with the previous sample by
 * mean luminance difference. Samples that differ far more than typical
 * (mean + 1.5σ) become markers. It all happens once per source, after the
 * page is idle, and the hidden video is released afterwards.
 */
export function useFilmstrip(src: string): Filmstrip {
  const [strip, setStrip] = useState<Filmstrip>({
    sprite: null,
    frames: FRAMES,
    frameWidth: W,
    frameHeight: H,
    markers: [],
  });

  useEffect(() => {
    let cancelled = false;
    const video = document.createElement("video");
    video.muted = true;
    video.preload = "auto";
    video.playsInline = true;

    const once = (event: string) =>
      new Promise<void>((resolve, reject) => {
        const done = () => {
          video.removeEventListener(event, done);
          video.removeEventListener("error", fail);
          resolve();
        };
        const fail = () => {
          video.removeEventListener(event, done);
          reject(new Error(`video ${event} failed`));
        };
        video.addEventListener(event, done);
        video.addEventListener("error", fail);
      });

    const run = async () => {
      video.src = src;
      await once("loadeddata");
      const duration = video.duration;
      if (!Number.isFinite(duration) || duration <= 0) return;

      const sprite = document.createElement("canvas");
      sprite.width = W * FRAMES;
      sprite.height = H;
      const spriteCtx = sprite.getContext("2d");
      const probe = document.createElement("canvas");
      probe.width = 16;
      probe.height = 9;
      const probeCtx = probe.getContext("2d", { willReadFrequently: true });
      if (!spriteCtx || !probeCtx) return;

      const diffs: number[] = [];
      const times: number[] = [];
      let previous: Uint8ClampedArray | null = null;

      for (let i = 0; i < FRAMES; i++) {
        if (cancelled) return;
        const time = ((i + 0.5) / FRAMES) * duration;
        video.currentTime = time;
        await once("seeked");
        spriteCtx.drawImage(video, i * W, 0, W, H);
        probeCtx.drawImage(video, 0, 0, 16, 9);
        const pixels = probeCtx.getImageData(0, 0, 16, 9).data;
        if (previous) {
          let sum = 0;
          for (let p = 0; p < pixels.length; p += 4) {
            const luma = 0.299 * pixels[p] + 0.587 * pixels[p + 1] + 0.114 * pixels[p + 2];
            const prev = 0.299 * previous[p] + 0.587 * previous[p + 1] + 0.114 * previous[p + 2];
            sum += Math.abs(luma - prev);
          }
          diffs.push(sum / (pixels.length / 4));
          times.push(time);
        }
        previous = pixels;
      }

      const mean = diffs.reduce((a, b) => a + b, 0) / Math.max(diffs.length, 1);
      const sd = Math.sqrt(diffs.reduce((a, b) => a + (b - mean) ** 2, 0) / Math.max(diffs.length, 1));
      const markers = diffs
        .map((diff, i) => ({ diff, time: times[i] }))
        .filter(({ diff }) => diff > mean + 1.5 * sd && diff > 6)
        .sort((a, b) => b.diff - a.diff)
        .slice(0, 6)
        .map(({ time }) => time)
        .sort((a, b) => a - b);

      if (!cancelled) {
        setStrip({ sprite: sprite.toDataURL("image/jpeg", 0.72), frames: FRAMES, frameWidth: W, frameHeight: H, markers });
      }
    };

    // Wait for the page to settle; the preview is a nicety, not the job.
    const start = () => void run().catch(() => {});
    const hasIdle = typeof window.requestIdleCallback === "function";
    const idle = hasIdle ? window.requestIdleCallback(start, { timeout: 1500 }) : window.setTimeout(start, 300);

    return () => {
      cancelled = true;
      if (hasIdle) window.cancelIdleCallback(idle);
      else window.clearTimeout(idle);
      video.removeAttribute("src");
      video.load();
    };
  }, [src]);

  return strip;
}
