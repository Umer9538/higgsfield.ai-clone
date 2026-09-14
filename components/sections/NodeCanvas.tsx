"use client";

import { useCallback, useRef, useState } from "react";
import { CANVAS } from "@/lib/sections/content";

interface Point {
  x: number;
  y: number;
}

/**
 * Node board. Positions are percentages of the board so the graph stays
 * proportional across breakpoints, and edges are drawn in an SVG underlay.
 */
export function NodeCanvas() {
  const boardRef = useRef<HTMLDivElement>(null);
  const [positions, setPositions] = useState<Record<string, Point>>(
    Object.fromEntries(CANVAS.nodes.map((node) => [node.id, { x: node.x, y: node.y }])),
  );
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(CANVAS.nodes[0].id);

  const move = useCallback(
    (id: string, clientX: number, clientY: number) => {
      const board = boardRef.current;
      if (!board) return;
      const rect = board.getBoundingClientRect();
      const x = Math.min(88, Math.max(0, ((clientX - rect.left) / rect.width) * 100 - 6));
      const y = Math.min(82, Math.max(0, ((clientY - rect.top) / rect.height) * 100 - 8));
      setPositions((prev) => ({ ...prev, [id]: { x, y } }));
    },
    [],
  );

  /** Keyboard nudging keeps the board usable without a pointer. */
  const nudge = (id: string, dx: number, dy: number) =>
    setPositions((prev) => ({
      ...prev,
      [id]: {
        x: Math.min(88, Math.max(0, prev[id].x + dx)),
        y: Math.min(82, Math.max(0, prev[id].y + dy)),
      },
    }));

  return (
    <div>
      <div
        ref={boardRef}
        onPointerMove={(event) => dragging && move(dragging, event.clientX, event.clientY)}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        className="relative h-[420px] w-full touch-none overflow-hidden rounded-2xl border border-hf-border bg-hf-surface"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {CANVAS.edges.map(([from, to]) => {
            const a = positions[from];
            const b = positions[to];
            if (!a || !b) return null;
            const x1 = `${a.x + 6}%`;
            const y1 = `${a.y + 8}%`;
            const x2 = `${b.x + 6}%`;
            const y2 = `${b.y + 8}%`;
            return (
              <line
                key={`${from}-${to}`}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke="#d1fe17"
                strokeWidth={2}
                strokeOpacity={0.6}
              />
            );
          })}
        </svg>

        {CANVAS.nodes.map((node) => {
          const pos = positions[node.id];
          const isSelected = selected === node.id;
          return (
            <button
              key={node.id}
              type="button"
              aria-label={`${node.label} node. Drag or use arrow keys to move.`}
              onPointerDown={(event) => {
                event.currentTarget.setPointerCapture(event.pointerId);
                setDragging(node.id);
                setSelected(node.id);
              }}
              onKeyDown={(event) => {
                const step = 3;
                if (event.key === "ArrowLeft") nudge(node.id, -step, 0);
                else if (event.key === "ArrowRight") nudge(node.id, step, 0);
                else if (event.key === "ArrowUp") nudge(node.id, 0, -step);
                else if (event.key === "ArrowDown") nudge(node.id, 0, step);
                else return;
                event.preventDefault();
              }}
              className={`absolute w-40 cursor-grab rounded-xl border bg-hf-surface-2 p-3 text-left transition-colors active:cursor-grabbing ${
                isSelected ? "border-hf-lime" : "border-hf-border hover:border-hf-lime/40"
              }`}
              style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
            >
              <span className="block text-[10px] tracking-wide text-hf-dim uppercase">
                {node.kind}
              </span>
              <span className="mt-0.5 block truncate text-sm font-medium text-white">
                {node.label}
              </span>
              <span className="mt-2 flex items-center gap-1.5">
                <span className="size-1.5 rounded-full bg-hf-lime" aria-hidden />
                <span className="text-[10px] text-hf-dim">connected</span>
              </span>
            </button>
          );
        })}
      </div>

      <p className="mt-3 text-xs text-hf-dim">
        Drag a node, or focus one and use the arrow keys. Connections update live.
      </p>
    </div>
  );
}
