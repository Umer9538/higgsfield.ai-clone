"use client";

import { GripVertical, X } from "lucide-react";
import { estimateCredits, type CanvasNode, type NodeType } from "@/lib/canvas/nodes";

/**
 * One node on the canvas: a draggable header with ports, badges for output
 * nodes, and its parameters edited inline. All state lives in NodeCanvas;
 * this renders it and reports intent.
 */
export function NodeCard({
  node,
  type,
  selected,
  dragging,
  linking,
  inputs,
  hasOut,
  nodeRef,
  onPress,
  onBeginDrag,
  onDragEnd,
  onNudge,
  onDelete,
  onParam,
}: {
  node: CanvasNode;
  type: NodeType;
  selected: boolean;
  dragging: boolean;
  /** A connection is being picked, so the header selects instead of dragging */
  linking: boolean;
  inputs: number;
  hasOut: boolean;
  nodeRef: (el: HTMLElement | null) => void;
  onPress: () => void;
  onBeginDrag: (event: React.PointerEvent<HTMLElement>) => void;
  onDragEnd: () => void;
  onNudge: (dx: number, dy: number) => void;
  onDelete: () => void;
  onParam: (key: string, value: string) => void;
}) {
  const hasIn = inputs > 0;
  return (
    <div
      ref={nodeRef}
      data-node={node.id}
      onPointerDown={onPress}
      className={`absolute w-52 rounded-2xl border bg-hf-surface-2 transition-shadow ${
        selected ? "border-hf-cyan" : "border-hf-border"
      } ${dragging ? "z-10 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)]" : ""}`}
      style={{ left: `${node.x}%`, top: `${node.y}%` }}
    >
      {/* Ports, on the header's centre line where cables attach */}
      <span
        aria-hidden
        className={`absolute top-[18px] -left-1 size-2 rounded-full border ${hasIn ? "border-hf-cyan bg-hf-cyan" : "border-hf-border bg-hf-surface"}`}
      />
      <span
        aria-hidden
        className={`absolute top-[18px] -right-1 size-2 rounded-full border ${hasOut ? "border-hf-cyan bg-hf-cyan" : "border-hf-border bg-hf-surface"}`}
      />
      <div
        data-node-header
        onPointerDown={(event) => onBeginDrag(event)}
        onLostPointerCapture={onDragEnd}
        className={`flex touch-none items-center gap-1.5 border-b border-hf-border px-2 py-1.5 select-none ${
          linking ? "cursor-pointer" : dragging ? "cursor-grabbing" : "cursor-grab"
        }`}
      >
        {/* Keyboard handle: focus it and use the arrow keys */}
        <button
          type="button"
          aria-label={`Move ${type.label} node`}
          onKeyDown={(event) => {
            const step = 3;
            if (event.key === "ArrowLeft") onNudge(-step, 0);
            else if (event.key === "ArrowRight") onNudge(step, 0);
            else if (event.key === "ArrowUp") onNudge(0, -step);
            else if (event.key === "ArrowDown") onNudge(0, step);
            else return;
            event.preventDefault();
          }}
          className="-m-1 flex size-6 shrink-0 items-center justify-center rounded text-hf-dim hover:text-white"
        >
          <GripVertical className="size-3.5" aria-hidden strokeWidth={2} />
        </button>

        <span className="min-w-0 flex-1">
          <span className="block truncate text-[10px] tracking-wide text-hf-dim uppercase">
            {type.kind}
          </span>
          <span className="block truncate text-xs font-medium text-white">{type.label}</span>
        </span>

        <button
          type="button"
          aria-label={`Delete ${type.label} node`}
          data-node-delete
          onClick={() => onDelete()}
          className="text-hf-dim transition-colors hover:text-hf-danger"
        >
          <X className="size-3.5" aria-hidden strokeWidth={2} />
        </button>
      </div>

      {node.type === "video-output" ? (
        <div data-node-badges className="flex flex-wrap gap-1 border-b border-hf-border px-2 py-1.5 font-mono text-[10px]">
          <span className={`rounded px-1.5 py-0.5 ${hasIn ? "bg-hf-cyan/15 text-hf-cyan" : "bg-hf-surface-4 text-hf-dim"}`}>
            {inputs} {inputs === 1 ? "input" : "inputs"}
          </span>
          <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-hf-muted">
            est. {estimateCredits(node.params.duration ?? "5s")} cr
          </span>
        </div>
      ) : null}

      <div className="space-y-2 p-2">
        {type.params.map((param) => {
          const id = `${node.id}-${param.key}`;
          return (
            <label key={param.key} htmlFor={id} className="block">
              <span className="mb-1 block text-[10px] text-hf-dim">{param.label}</span>
              {param.kind === "select" ? (
                <select
                  id={id}
                  value={node.params[param.key] ?? ""}
                  onChange={(event) => onParam(param.key, event.target.value)}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="w-full rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white focus:border-hf-accent focus:outline-none"
                >
                  {param.options?.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </select>
              ) : param.kind === "textarea" ? (
                <textarea
                  id={id}
                  rows={2}
                  value={node.params[param.key] ?? ""}
                  placeholder={param.placeholder}
                  onChange={(event) => onParam(param.key, event.target.value)}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="w-full resize-none rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white placeholder:text-hf-dim focus:border-hf-accent focus:outline-none"
                />
              ) : (
                <input
                  id={id}
                  type="text"
                  value={node.params[param.key] ?? ""}
                  placeholder={param.placeholder}
                  onChange={(event) => onParam(param.key, event.target.value)}
                  onPointerDown={(event) => event.stopPropagation()}
                  className="w-full rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white placeholder:text-hf-dim focus:border-hf-accent focus:outline-none"
                />
              )}
            </label>
          );
        })}
      </div>
    </div>
  );
}
