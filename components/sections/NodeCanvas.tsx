"use client";

import { useCallback, useRef, useState } from "react";
import { Activity, GripVertical, Link2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { useCables, type CableStats } from "./useCables";

type NodeTypeId = "text-prompt" | "image-input" | "video-output";

interface ParamSpec {
  key: string;
  label: string;
  kind: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
}

interface NodeType {
  id: NodeTypeId;
  label: string;
  kind: string;
  params: ParamSpec[];
}

const NODE_TYPES: NodeType[] = [
  {
    id: "text-prompt",
    label: "Text Prompt",
    kind: "Prompt",
    params: [
      { key: "text", label: "Prompt", kind: "textarea", placeholder: "Describe the shot…" },
    ],
  },
  {
    id: "image-input",
    label: "Image Input",
    kind: "Reference",
    params: [
      { key: "source", label: "Source", kind: "text", placeholder: "Paste a URL or asset id" },
      { key: "weight", label: "Weight", kind: "select", options: ["0.25", "0.5", "0.75", "1.0"] },
    ],
  },
  {
    id: "video-output",
    label: "Video Output",
    kind: "Seedance 2.5",
    params: [
      { key: "duration", label: "Duration", kind: "select", options: ["5s", "8s", "10s", "15s"] },
      { key: "ratio", label: "Ratio", kind: "select", options: ["16:9", "9:16", "1:1"] },
    ],
  },
];

interface CanvasNode {
  id: string;
  type: NodeTypeId;
  x: number;
  y: number;
  params: Record<string, string>;
}

function defaults(type: NodeType): Record<string, string> {
  return Object.fromEntries(
    type.params.map((param) => [param.key, param.kind === "select" ? (param.options?.[0] ?? "") : ""]),
  );
}

const typeOf = (id: NodeTypeId) => NODE_TYPES.find((t) => t.id === id)!;

/**
 * Credit estimate for an output node, from the Video studio's published rate
 * (45 credits for 5 seconds). Labelled "est." in the UI: it is arithmetic on
 * the pricing config, not a measurement.
 */
const CREDITS_PER_SECOND = 9;
const estimateCredits = (duration: string) => Math.round((parseInt(duration, 10) || 5) * CREDITS_PER_SECOND);

const INITIAL: CanvasNode[] = [
  { id: "n-text", type: "text-prompt", x: 6, y: 12, params: { text: "Neon alley, rain slick" } },
  { id: "n-image", type: "image-input", x: 6, y: 52, params: { source: "asset-3", weight: "0.5" } },
  { id: "n-video", type: "video-output", x: 58, y: 30, params: { duration: "5s", ratio: "16:9" } },
];

export function NodeCanvas() {
  const boardRef = useRef<HTMLDivElement>(null);
  const nextId = useRef(0);
  const [nodes, setNodes] = useState<CanvasNode[]>(INITIAL);
  const [edges, setEdges] = useState<[string, string][]>([
    ["n-text", "n-video"],
    ["n-image", "n-video"],
  ]);
  const [dragging, setDragging] = useState<string | null>(null);
  const [selected, setSelected] = useState<string>(INITIAL[0].id);
  const [linkFrom, setLinkFrom] = useState<string | null>(null);
  const [picker, setPicker] = useState(false);
  const { toast } = useToast();
  const statsRef = useRef<HTMLSpanElement>(null);

  // Live readout, written to the DOM directly so measuring does not itself
  // cause a React render every frame.
  const onStats = useCallback((stats: CableStats) => {
    const el = statsRef.current;
    if (!el) return;
    el.dataset.running = String(stats.running);
    el.textContent = stats.running
      ? `${stats.workMs.toFixed(2)} ms/frame · ${stats.fps} fps${stats.dropped ? ` · ${stats.dropped} dropped` : ""}`
      : `Settled · last ${stats.workMs.toFixed(2)} ms/frame`;
  }, []);

  const { nodeRef, pathRef } = useCables({ board: boardRef, edges, onStats, deps: nodes });

  // Pointer events can fire several times per frame; apply at most one move
  // per animation frame.
  const pending = useRef<{ id: string; x: number; y: number } | null>(null);
  const scheduled = useRef<number | null>(null);
  // Where inside the node the pointer took hold, in board %, so the node
  // travels with the pointer instead of jumping to re-anchor under it.
  const grab = useRef({ dx: 0, dy: 0 });
  const move = useCallback((id: string, clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.min(74, Math.max(0, ((clientX - rect.left) / rect.width) * 100 - grab.current.dx));
    const y = Math.min(66, Math.max(0, ((clientY - rect.top) / rect.height) * 100 - grab.current.dy));
    pending.current = { id, x, y };
    if (scheduled.current !== null) return;
    scheduled.current = requestAnimationFrame(() => {
      scheduled.current = null;
      const next = pending.current;
      if (!next) return;
      setNodes((prev) => prev.map((node) => (node.id === next.id ? { ...node, x: next.x, y: next.y } : node)));
    });
  }, []);

  /** The whole header is the drag handle; the delete button is excluded. */
  const beginDrag = (event: React.PointerEvent<HTMLElement>, node: CanvasNode) => {
    if (linkFrom !== null || event.button !== 0) return;
    if ((event.target as HTMLElement).closest("[data-node-delete]")) return;
    const rect = boardRef.current?.getBoundingClientRect();
    if (!rect) return;
    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    grab.current = {
      dx: ((event.clientX - rect.left) / rect.width) * 100 - node.x,
      dy: ((event.clientY - rect.top) / rect.height) * 100 - node.y,
    };
    setDragging(node.id);
    setSelected(node.id);
  };

  const nudge = (id: string, dx: number, dy: number) =>
    setNodes((prev) =>
      prev.map((node) =>
        node.id === id
          ? { ...node, x: Math.min(74, Math.max(0, node.x + dx)), y: Math.min(66, Math.max(0, node.y + dy)) }
          : node,
      ),
    );

  const addNode = (type: NodeType) => {
    // Everything the updater needs is computed up front so it stays pure.
    nextId.current += 1;
    const node: CanvasNode = {
      id: `n-added-${nextId.current}`,
      type: type.id,
      x: 30 + (nextId.current % 3) * 6,
      y: 60,
      params: defaults(type),
    };
    setNodes((prev) => [...prev, node]);
    const id = node.id;
    setSelected(id);
    setPicker(false);
    toast(`${type.label} node added`);
  };

  const deleteNode = (id: string) => {
    setNodes((prev) => prev.filter((node) => node.id !== id));
    setEdges((prev) => prev.filter(([a, b]) => a !== id && b !== id));
    toast("Node deleted");
  };

  const startLink = (id: string) => {
    if (linkFrom === null) {
      setLinkFrom(id);
      toast("Pick a second node to connect", "info");
      return;
    }
    if (linkFrom === id) {
      setLinkFrom(null);
      return;
    }
    setEdges((prev) => {
      const exists = prev.some(([a, b]) => (a === linkFrom && b === id) || (a === id && b === linkFrom));
      return exists
        ? prev.filter(([a, b]) => !((a === linkFrom && b === id) || (a === id && b === linkFrom)))
        : [...prev, [linkFrom, id] as [string, string]];
    });
    toast("Connection updated");
    setLinkFrom(null);
  };

  const setParam = (id: string, key: string, value: string) =>
    setNodes((prev) =>
      prev.map((node) => (node.id === id ? { ...node, params: { ...node.params, [key]: value } } : node)),
    );

  return (
    <div>
      <div className="mb-3 flex flex-wrap items-center gap-2">
        <div className="relative">
          <button
            type="button"
            aria-expanded={picker}
            aria-haspopup="menu"
            onClick={() => setPicker((prev) => !prev)}
            className="flex items-center gap-1.5 rounded-lg bg-hf-accent px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-hf-accent-deep"
          >
            <Plus className="size-4" aria-hidden strokeWidth={2.5} />
            Add node
          </button>

          {picker ? (
            <ul
              role="menu"
              aria-label="Node type"
              className="absolute top-full left-0 z-40 mt-1 w-52 overflow-hidden rounded-2xl border border-hf-border bg-hf-surface-3 py-1 shadow-lg"
            >
              {NODE_TYPES.map((type) => (
                <li key={type.id}>
                  <button
                    type="button"
                    role="menuitem"
                    onClick={() => addNode(type)}
                    className="flex min-h-11 w-full flex-col items-start px-3 py-2 text-left transition-colors hover:bg-hf-surface-4"
                  >
                    <span className="text-sm text-white">{type.label}</span>
                    <span className="text-[11px] text-hf-dim">{type.kind}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>

        <button
          type="button"
          onClick={() => startLink(selected)}
          aria-pressed={linkFrom !== null}
          className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 text-sm transition-colors ${
            linkFrom ? "border-hf-accent bg-hf-accent/10 text-hf-accent-soft" : "border-hf-border text-white hover:border-hf-accent/50"
          }`}
        >
          <Link2 className="size-4" aria-hidden strokeWidth={1.75} />
          {linkFrom ? "Pick target" : "Connect"}
        </button>

        <button
          type="button"
          onClick={() => deleteNode(selected)}
          disabled={nodes.length <= 1}
          className="flex items-center gap-1.5 rounded-lg border border-hf-border px-3 py-2 text-sm text-white transition-colors hover:border-hf-danger hover:text-hf-danger disabled:opacity-40"
        >
          <Trash2 className="size-4" aria-hidden strokeWidth={1.75} />
          Delete
        </button>

        <span aria-live="polite" className="ml-auto text-xs text-hf-dim">
          {nodes.length} nodes · {edges.length} connections
        </span>
        <span className="flex items-center gap-1.5 rounded-full border border-hf-border px-2.5 py-1 font-mono text-[11px] text-hf-muted">
          <Activity className="size-3 text-hf-cyan" aria-hidden strokeWidth={2} />
          <span ref={statsRef} data-cable-stats>
            Measuring…
          </span>
        </span>
      </div>

      <div
        ref={boardRef}
        onPointerMove={(event) => dragging && move(dragging, event.clientX, event.clientY)}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        className="relative h-[520px] w-full touch-none overflow-hidden rounded-3xl border border-hf-border bg-hf-surface"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        {/* Paths are drawn by useCables; React only mounts them. Two layers per
            cable: a soft base, and a dashed layer that flows source → target. */}
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {edges.map(([from, to]) => {
            const key = `${from}->${to}`;
            return (
              <g key={key} data-cable={key}>
                <path ref={pathRef(key, 0)} fill="none" stroke="var(--color-hf-cyan)" strokeOpacity={0.3} strokeWidth={3} />
                <path
                  ref={pathRef(key, 1)}
                  fill="none"
                  stroke="var(--color-hf-cyan)"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeDasharray="2 10"
                  className="animate-cable-flow"
                />
              </g>
            );
          })}
        </svg>

        {nodes.map((node) => {
          const type = typeOf(node.type);
          const isSelected = selected === node.id;
          const inputs = edges.filter(([, to]) => to === node.id).length;
          const hasIn = inputs > 0;
          const hasOut = edges.some(([from]) => from === node.id);
          return (
            <div
              key={node.id}
              ref={nodeRef(node.id)}
              data-node={node.id}
              onPointerDown={() => {
                if (linkFrom !== null) startLink(node.id);
                else setSelected(node.id);
              }}
              className={`absolute w-52 rounded-2xl border bg-hf-surface-2 transition-shadow ${
                isSelected ? "border-hf-cyan" : "border-hf-border"
              } ${dragging === node.id ? "z-10 shadow-[0_24px_48px_-12px_rgb(0_0_0/0.8)]" : ""}`}
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
                onPointerDown={(event) => beginDrag(event, node)}
                onLostPointerCapture={() => setDragging(null)}
                className={`flex touch-none items-center gap-1.5 border-b border-hf-border px-2 py-1.5 select-none ${
                  linkFrom !== null ? "cursor-pointer" : dragging === node.id ? "cursor-grabbing" : "cursor-grab"
                }`}
              >
                {/* Keyboard handle: focus it and use the arrow keys */}
                <button
                  type="button"
                  aria-label={`Move ${type.label} node`}
                  onKeyDown={(event) => {
                    const step = 3;
                    if (event.key === "ArrowLeft") nudge(node.id, -step, 0);
                    else if (event.key === "ArrowRight") nudge(node.id, step, 0);
                    else if (event.key === "ArrowUp") nudge(node.id, 0, -step);
                    else if (event.key === "ArrowDown") nudge(node.id, 0, step);
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
                  onClick={() => deleteNode(node.id)}
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
                          onChange={(event) => setParam(node.id, param.key, event.target.value)}
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
                          onChange={(event) => setParam(node.id, param.key, event.target.value)}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="w-full resize-none rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white placeholder:text-hf-dim focus:border-hf-accent focus:outline-none"
                        />
                      ) : (
                        <input
                          id={id}
                          type="text"
                          value={node.params[param.key] ?? ""}
                          placeholder={param.placeholder}
                          onChange={(event) => setParam(node.id, param.key, event.target.value)}
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
        })}
      </div>

      <p className="mt-3 text-xs text-hf-dim">
        Drag a node by its header, or focus its handle and use the arrow keys. Edit parameters inline; connections
        update live.
      </p>
    </div>
  );
}
