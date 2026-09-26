"use client";

import { useEffect, useState } from "react";

interface Readings {
  fps: number;
  frameMs: number;
  worstMs: number;
  longTasks: number;
  longTaskMs: number;
  lcp: number | null;
  cls: number;
  slowestInteraction: number | null;
  api: { path: string; ms: number }[];
  heapMb: number | null;
  network: string | null;
}

const EMPTY: Readings = {
  fps: 0,
  frameMs: 0,
  worstMs: 0,
  longTasks: 0,
  longTaskMs: 0,
  lcp: null,
  cls: 0,
  slowestInteraction: null,
  api: [],
  heapMb: null,
  network: null,
};

/** The GPU the browser renders with, as WebGL reports it. Read once. */
function readGpu(): string {
  try {
    const canvas = document.createElement("canvas");
    const gl = canvas.getContext("webgl");
    if (!gl) return "WebGL unavailable";
    const info = gl.getExtension("WEBGL_debug_renderer_info");
    const name = String(gl.getParameter(info ? info.UNMASKED_RENDERER_WEBGL : gl.RENDERER));
    gl.getExtension("WEBGL_lose_context")?.loseContext();
    // "ANGLE (Apple, ANGLE Metal Renderer: Apple M2, Unspecified Version)" → the useful part
    return name.replace(/^ANGLE \((.*)\)$/, "$1").replace(/, Unspecified Version$/, "");
  } catch {
    return "Unknown";
  }
}

/**
 * Live browser measurements for the HUD, collected only while `active`:
 * frame timing from requestAnimationFrame, long tasks, LCP, CLS and the
 * slowest interaction from PerformanceObserver, /api latency from Resource
 * Timing, JS heap and network where exposed, and the GPU from WebGL.
 */
export function usePerfReadings(active: boolean): { readings: Readings; gpu: string } {
  const [readings, setReadings] = useState<Readings>(EMPTY);
  const [gpu, setGpu] = useState("");

  useEffect(() => {
    if (!active) return;

    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGpu((prev) => prev || readGpu());
    const acc = { ...EMPTY, api: [] as Readings["api"] };
    const observers: PerformanceObserver[] = [];
    const observe = (type: string, onEntries: (entries: PerformanceEntry[]) => void, extra: object = {}) => {
      try {
        const observer = new PerformanceObserver((list) => onEntries(list.getEntries()));
        observer.observe({ type, buffered: true, ...extra } as PerformanceObserverInit);
        observers.push(observer);
      } catch {
        // entry type not supported in this browser
      }
    };

    observe("longtask", (entries) => {
      acc.longTasks += entries.length;
      acc.longTaskMs += entries.reduce((sum, e) => sum + e.duration, 0);
    });
    observe("largest-contentful-paint", (entries) => {
      const lastEntry = entries.at(-1);
      if (lastEntry) acc.lcp = lastEntry.startTime;
    });
    observe("layout-shift", (entries) => {
      for (const e of entries as (PerformanceEntry & { value: number; hadRecentInput: boolean })[]) {
        if (!e.hadRecentInput) acc.cls += e.value;
      }
    });
    observe(
      "event",
      (entries) => {
        for (const e of entries) acc.slowestInteraction = Math.max(acc.slowestInteraction ?? 0, e.duration);
      },
      { durationThreshold: 16 },
    );
    observe("resource", (entries) => {
      for (const e of entries) {
        const url = new URL(e.name, window.location.href);
        if (url.origin === window.location.origin && url.pathname.startsWith("/api/")) {
          acc.api = [{ path: url.pathname, ms: e.duration }, ...acc.api].slice(0, 4);
        }
      }
    });

    // Frame timing, sampled every animation frame, published twice a second
    let frame = 0;
    let lastTs = 0;
    let frames = 0;
    let total = 0;
    let worst = 0;
    let windowStart = performance.now();
    const loop = (ts: number) => {
      if (lastTs) {
        const delta = ts - lastTs;
        frames += 1;
        total += delta;
        worst = Math.max(worst, delta);
      }
      lastTs = ts;
      if (ts - windowStart >= 500) {
        const memory = (performance as Performance & { memory?: { usedJSHeapSize: number } }).memory;
        const connection = (navigator as Navigator & { connection?: { effectiveType?: string; rtt?: number } }).connection;
        setReadings({
          ...acc,
          api: [...acc.api],
          fps: Math.round((frames * 1000) / (ts - windowStart)),
          frameMs: frames ? total / frames : 0,
          worstMs: worst,
          heapMb: memory ? memory.usedJSHeapSize / 1048576 : null,
          network: connection?.effectiveType
            ? `${connection.effectiveType}${connection.rtt ? ` · ${connection.rtt} ms rtt` : ""}`
            : null,
        });
        frames = 0;
        total = 0;
        worst = 0;
        windowStart = ts;
      }
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      observers.forEach((observer) => observer.disconnect());
    };
  }, [active]);

  return { readings, gpu };
}
