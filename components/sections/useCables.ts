"use client";

import { useCallback, useEffect, useLayoutEffect, useState } from "react";

/**
 * Cable physics for the node canvas.
 *
 * Each connection is a cubic bezier from the source node's output port to
 * the target's input port. The endpoints are exact, but the two control
 * points chase their resting positions on a damped spring, so when a node is
 * dragged the cable bows behind it and settles like a real lead.
 *
 * The engine is a plain class outside React: paths are written straight to
 * the DOM from a requestAnimationFrame loop that runs only while a spring is
 * moving and stops itself at rest, so idle cost is zero. With
 * prefers-reduced-motion the control points snap to rest instead of swinging.
 */

interface Point {
  x: number;
  y: number;
}
interface Spring {
  pos: Point;
  vel: Point;
}

export interface CableStats {
  /** Mean main-thread time spent updating cables per frame, in ms */
  workMs: number;
  /** Frames per second measured from rAF timestamps */
  fps: number;
  /** Frames that overran a 60 Hz budget by more than a quarter */
  dropped: number;
  running: boolean;
}

const STIFFNESS = 180;
const DAMPING = 17;
/** Ports sit on the node header's vertical centre */
const PORT_Y = 22;

const spring = (p: Point): Spring => ({ pos: { ...p }, vel: { x: 0, y: 0 } });

class CableEngine {
  private nodes = new Map<string, HTMLElement>();
  private paths = new Map<string, SVGPathElement[]>();
  private springs = new Map<string, { c1: Spring; c2: Spring }>();
  private edges: [string, string][] = [];
  private frame: number | null = null;
  private last = 0;
  private window = { frames: 0, work: 0, dropped: 0, since: 0 };

  constructor(
    private board: HTMLElement,
    private onStats: (stats: CableStats) => void,
  ) {}

  setEdges(edges: [string, string][]) {
    this.edges = edges;
    this.wake();
  }

  setNode(id: string, el: HTMLElement | null) {
    if (el) this.nodes.set(id, el);
    else this.nodes.delete(id);
  }

  setPath(key: string, layer: number, el: SVGPathElement | null) {
    const list = this.paths.get(key) ?? [];
    if (el) list[layer] = el;
    else delete list[layer];
    this.paths.set(key, list);
  }

  /** Start the loop if it is not already running. */
  wake() {
    if (this.frame !== null) return;
    this.window = { frames: 0, work: 0, dropped: 0, since: performance.now() };
    this.frame = requestAnimationFrame(this.tick);
  }

  dispose() {
    if (this.frame !== null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }

  private tick = (now: number) => {
    const started = performance.now();
    const delta = this.last ? now - this.last : 16.7;
    const dt = Math.min(1 / 30, delta / 1000);
    this.last = now;

    const reduced =
      document.documentElement.classList.contains("reduce-motion") ||
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const origin = this.board.getBoundingClientRect();
    const alive = new Set<string>();
    let moving = false;

    for (const [from, to] of this.edges) {
      const a = this.nodes.get(from)?.getBoundingClientRect();
      const b = this.nodes.get(to)?.getBoundingClientRect();
      if (!a || !b) continue;
      const key = `${from}->${to}`;
      alive.add(key);

      // Leave from whichever side faces the target
      const forward = b.left + b.width / 2 >= a.left + a.width / 2;
      const p1 = { x: (forward ? a.right : a.left) - origin.left, y: a.top - origin.top + PORT_Y };
      const p2 = { x: (forward ? b.left : b.right) - origin.left, y: b.top - origin.top + PORT_Y };
      const reach = Math.max(48, Math.abs(p2.x - p1.x) * 0.5) * (forward ? 1 : -1);
      const t1 = { x: p1.x + reach, y: p1.y };
      const t2 = { x: p2.x - reach, y: p2.y };

      let s = this.springs.get(key);
      if (!s) {
        s = { c1: spring(t1), c2: spring(t2) };
        this.springs.set(key, s);
      }
      for (const [sp, target] of [
        [s.c1, t1],
        [s.c2, t2],
      ] as const) {
        if (reduced) {
          sp.pos = { ...target };
          sp.vel = { x: 0, y: 0 };
          continue;
        }
        // Semi-implicit Euler: stable at 60 Hz and still sane at 30
        sp.vel.x += (STIFFNESS * (target.x - sp.pos.x) - DAMPING * sp.vel.x) * dt;
        sp.vel.y += (STIFFNESS * (target.y - sp.pos.y) - DAMPING * sp.vel.y) * dt;
        sp.pos.x += sp.vel.x * dt;
        sp.pos.y += sp.vel.y * dt;
        const speed = Math.abs(sp.vel.x) + Math.abs(sp.vel.y);
        const gap = Math.abs(target.x - sp.pos.x) + Math.abs(target.y - sp.pos.y);
        if (speed > 0.5 || gap > 0.3) moving = true;
      }

      const d = `M ${p1.x.toFixed(1)} ${p1.y.toFixed(1)} C ${s.c1.pos.x.toFixed(1)} ${s.c1.pos.y.toFixed(1)}, ${s.c2.pos.x.toFixed(1)} ${s.c2.pos.y.toFixed(1)}, ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
      this.paths.get(key)?.forEach((path) => path.setAttribute("d", d));
    }
    for (const key of this.springs.keys()) if (!alive.has(key)) this.springs.delete(key);

    const w = this.window;
    w.frames += 1;
    w.work += performance.now() - started;
    if (delta > 21) w.dropped += 1;
    if (now - w.since > 250 || !moving) {
      const seconds = Math.max((now - w.since) / 1000, 0.001);
      this.onStats({
        workMs: w.work / Math.max(w.frames, 1),
        fps: Math.min(Math.round(w.frames / seconds), 240),
        dropped: w.dropped,
        running: moving,
      });
      this.window = { frames: 0, work: 0, dropped: 0, since: now };
    }

    if (moving) {
      this.frame = requestAnimationFrame(this.tick);
    } else {
      this.frame = null;
      this.last = 0;
    }
  };
}

/** React glue: owns one engine per board and wakes it when nodes move. */
export function useCables({
  board,
  edges,
  onStats,
  deps,
}: {
  board: React.RefObject<HTMLDivElement | null>;
  edges: [string, string][];
  onStats: (stats: CableStats) => void;
  /** Anything that moves nodes; a change wakes the loop */
  deps: unknown;
}) {
  const [engine, setEngine] = useState<CableEngine | null>(null);

  useEffect(() => {
    const host = board.current;
    if (!host) return;
    const instance = new CableEngine(host, onStats);
    // One-time handoff of an imperative object created from a DOM node
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setEngine(instance);
    const observer = new ResizeObserver(() => instance.wake());
    observer.observe(host);
    return () => {
      observer.disconnect();
      instance.dispose();
    };
  }, [board, onStats]);

  useLayoutEffect(() => {
    engine?.setEdges(edges);
  }, [engine, edges, deps]);

  const nodeRef = useCallback((id: string) => (el: HTMLElement | null) => engine?.setNode(id, el), [engine]);
  const pathRef = useCallback(
    (key: string, layer: number) => (el: SVGPathElement | null) => engine?.setPath(key, layer, el),
    [engine],
  );

  return { nodeRef, pathRef };
}
