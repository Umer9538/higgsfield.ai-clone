"use client";

import { useEffect, useState } from "react";

const FALLBACK_FPS = 30;

/** HH:MM:SS:FF — frames, not hundredths, because editors think in frames. */
export function timecode(seconds: number, fps: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const whole = Math.floor(seconds);
  const frames = Math.floor((seconds - whole) * fps + 1e-6);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(Math.floor(whole / 3600))}:${pad(Math.floor((whole % 3600) / 60))}:${pad(whole % 60)}:${pad(frames)}`;
}

/**
 * Measures the real frame rate from presented frames (mediaTime deltas via
 * requestVideoFrameCallback) instead of assuming one; median of recent
 * deltas, so a dropped frame does not skew it.
 */
export function useMeasuredFps(video: React.RefObject<HTMLVideoElement | null>) {
  const [fps, setFps] = useState(FALLBACK_FPS);
  useEffect(() => {
    const el = video.current;
    if (!el || !("requestVideoFrameCallback" in el)) return;
    const deltas: number[] = [];
    let previous = -1;
    let handle = 0;
    const onFrame: VideoFrameRequestCallback = (_now, meta) => {
      if (previous >= 0 && meta.mediaTime > previous) deltas.push(meta.mediaTime - previous);
      previous = meta.mediaTime;
      if (deltas.length >= 12) {
        const sorted = [...deltas].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        if (median > 0) setFps(Math.round(1 / median));
        return; // measured; stop listening
      }
      handle = el.requestVideoFrameCallback(onFrame);
    };
    handle = el.requestVideoFrameCallback(onFrame);
    return () => el.cancelVideoFrameCallback(handle);
  }, [video]);
  return fps;
}
