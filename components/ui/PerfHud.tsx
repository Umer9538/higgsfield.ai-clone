"use client";

import { useEffect, useState } from "react";
import { Activity, X } from "lucide-react";
import { useStudioContext } from "@/lib/commands/studio-context";

const TOGGLE_EVENT = "hf:toggle-hud";
const STORAGE_KEY = "hf.hud";

export function toggleHud() {
  window.dispatchEvent(new Event(TOGGLE_EVENT));
}

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

const isTyping = (target: EventTarget | null) =>
  target instanceof HTMLElement &&
  (target.isContentEditable || ["INPUT", "TEXTAREA", "SELECT"].includes(target.tagName));

/**
 * Developer HUD, toggled with Shift+D or from ⌘K.
 *
 * Every number under "Measured" comes from the browser while the panel is
 * open: frame timing from requestAnimationFrame, long tasks, LCP, CLS and the
 * slowest interaction from PerformanceObserver, /api latency from Resource
 * Timing, the GPU from WebGL. Nothing is estimated. "Studio" is the active
 * surface's configuration, labelled as such. Nothing runs while it is closed.
 */
export function PerfHud() {
  const [open, setOpen] = useState(false);
  const [readings, setReadings] = useState<Readings>(EMPTY);
  const [gpu, setGpu] = useState("");
  const studio = useStudioContext();

  useEffect(() => {
    try {
      // Restore a per-viewer preference once the client is up
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (window.localStorage.getItem(STORAGE_KEY) === "1") setOpen(true);
    } catch {
      // storage blocked: default closed
    }
    const flip = () => setOpen((prev) => !prev);
    const onKey = (event: KeyboardEvent) => {
      if (event.key !== "D" || !event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
      if (isTyping(event.target)) return; // Shift+D types a capital D
      event.preventDefault();
      flip();
    };
    window.addEventListener(TOGGLE_EVENT, flip);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener(TOGGLE_EVENT, flip);
      window.removeEventListener("keydown", onKey);
    };
  }, []);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, open ? "1" : "0");
    } catch {
      // storage blocked: preference just won't persist
    }
    if (!open) return;

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
  }, [open]);

  if (!open) return null;

  const meta = studio?.metadata();
  const output = (meta?.output ?? {}) as Record<string, string>;
  const r = readings;
  const tone = (good: boolean) => (good ? "text-hf-cyan" : "text-hf-danger");

  return (
    <aside
      role="complementary"
      aria-label="Performance HUD"
      // Near-opaque on purpose: glass at the usual 72% let panels behind it bleed
      // through the numbers, and a readout has to be readable first.
      className="fixed right-4 bottom-[calc(var(--spacing-tabbar)+0.75rem)] border border-white/10 bg-hf-black/[0.94] backdrop-blur-xl z-[90] w-[min(20rem,calc(100vw-2rem))] rounded-[var(--radius-control)] font-mono text-[11px] text-hf-muted shadow-[0_0_48px_-12px_color-mix(in_srgb,var(--color-hf-cyan)_45%,transparent)] md:bottom-4"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-3 py-2">
        <span className="flex items-center gap-1.5 text-white">
          <Activity className="size-3.5 text-hf-cyan" aria-hidden strokeWidth={2} />
          HUD
          <kbd className="rounded bg-white/10 px-1 text-[10px] text-hf-dim">⇧D</kbd>
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          aria-label="Close HUD"
          className="flex size-7 items-center justify-center rounded text-hf-dim hover:text-white"
        >
          <X className="size-3.5" aria-hidden strokeWidth={2} />
        </button>
      </div>

      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1 px-3 py-2.5">
        <dt className="col-span-2 pb-0.5 text-[10px] tracking-wide text-hf-dim uppercase">Measured</dt>
        <dt>frame</dt>
        <dd data-hud="fps" className={`text-right ${tone(r.fps >= 50)}`}>
          {r.fps} fps · {r.frameMs.toFixed(1)} ms <span className="text-hf-dim">↑{r.worstMs.toFixed(0)}</span>
        </dd>
        <dt>long tasks</dt>
        <dd className={`text-right ${tone(r.longTasks === 0)}`}>
          {r.longTasks} · {r.longTaskMs.toFixed(0)} ms
        </dd>
        <dt>LCP</dt>
        <dd className={`text-right ${r.lcp === null ? "text-hf-dim" : tone(r.lcp < 2500)}`}>
          {r.lcp === null ? "—" : `${(r.lcp / 1000).toFixed(2)} s`}
        </dd>
        <dt>CLS</dt>
        <dd data-hud="cls" className={`text-right ${tone(r.cls < 0.1)}`}>{r.cls.toFixed(3)}</dd>
        <dt>slowest input</dt>
        <dd className={`text-right ${r.slowestInteraction === null ? "text-hf-dim" : tone(r.slowestInteraction < 200)}`}>
          {r.slowestInteraction === null ? "—" : `${r.slowestInteraction.toFixed(0)} ms`}
        </dd>
        <dt>api</dt>
        <dd data-hud="api" className="text-right text-white">
          {r.api.length === 0 ? (
            <span className="text-hf-dim">no calls yet</span>
          ) : (
            r.api.map((call, i) => (
              <span key={i} className="block truncate">
                {call.path.replace("/api/", "")} <span className="text-hf-cyan">{call.ms.toFixed(0)} ms</span>
              </span>
            ))
          )}
        </dd>
        <dt>gpu</dt>
        <dd data-hud="gpu" className="truncate text-right text-white" title={gpu}>{gpu}</dd>
        {r.heapMb !== null ? (
          <>
            <dt>js heap</dt>
            <dd className="text-right text-white">{r.heapMb.toFixed(1)} MB</dd>
          </>
        ) : null}
        {r.network ? (
          <>
            <dt>network</dt>
            <dd className="text-right text-white">{r.network}</dd>
          </>
        ) : null}
        <dt>viewport</dt>
        <dd className="text-right text-white">
          {typeof window === "undefined" ? "" : `${window.innerWidth}×${window.innerHeight} @${window.devicePixelRatio}x`}
        </dd>

        {studio && meta ? (
          <>
            <dt className="col-span-2 pt-2 pb-0.5 text-[10px] tracking-wide text-hf-dim uppercase">
              Studio · config
            </dt>
            <dt>surface</dt>
            <dd data-hud="studio" className="truncate text-right text-white">{studio.label}</dd>
            {Object.entries(output).map(([key, value]) => (
              <span key={key} className="contents">
                <dt>{key}</dt>
                <dd className="truncate text-right text-white">{String(value)}</dd>
              </span>
            ))}
            <dt>run</dt>
            <dd className="text-right text-white">
              {String((meta.run as { status: string }).status)}
            </dd>
          </>
        ) : null}
      </dl>
    </aside>
  );
}
