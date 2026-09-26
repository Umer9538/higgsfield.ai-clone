"use client";

import { useCallback, useRef, useState } from "react";
import { Activity, Link2, Plus, Trash2 } from "lucide-react";
import { INITIAL, NODE_TYPES, defaults, typeOf, type CanvasNode, type NodeType } from "@/lib/canvas/nodes";
import { NodeCard } from "./canvas/NodeCard";
import { useToast } from "@/components/ui/Toast";
import { useCables, type CableStats } from "./useCables";

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
            className="flex items-center gap-1.5 rounded-lg bg-hf-accent px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-hf-accent-hover"
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

        {nodes.map((node) => (
          <NodeCard
            key={node.id}
            node={node}
            type={typeOf(node.type)}
            selected={selected === node.id}
            dragging={dragging === node.id}
            linking={linkFrom !== null}
            inputs={edges.filter(([, to]) => to === node.id).length}
            hasOut={edges.some(([from]) => from === node.id)}
            nodeRef={nodeRef(node.id)}
            onPress={() => (linkFrom !== null ? startLink(node.id) : setSelected(node.id))}
            onBeginDrag={(event) => beginDrag(event, node)}
            onDragEnd={() => setDragging(null)}
            onNudge={(dx, dy) => nudge(node.id, dx, dy)}
            onDelete={() => deleteNode(node.id)}
            onParam={(key, value) => setParam(node.id, key, value)}
          />
        ))}
      </div>

      <p className="mt-3 text-xs text-hf-dim">
        Drag a node by its header, or focus its handle and use the arrow keys. Edit parameters inline; connections
        update live.
      </p>
    </div>
  );
}
