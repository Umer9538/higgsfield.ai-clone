"use client";

import { useCallback, useRef, useState } from "react";
import { GripVertical, Link2, Plus, Trash2, X } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

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

  const move = useCallback((id: string, clientX: number, clientY: number) => {
    const board = boardRef.current;
    if (!board) return;
    const rect = board.getBoundingClientRect();
    const x = Math.min(74, Math.max(0, ((clientX - rect.left) / rect.width) * 100 - 8));
    const y = Math.min(66, Math.max(0, ((clientY - rect.top) / rect.height) * 100 - 5));
    setNodes((prev) => prev.map((node) => (node.id === id ? { ...node, x, y } : node)));
  }, []);

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
            className="flex items-center gap-1.5 rounded-lg bg-hf-lime px-3 py-2 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            <Plus className="size-4" aria-hidden strokeWidth={2.5} />
            Add node
          </button>

          {picker ? (
            <ul
              role="menu"
              aria-label="Node type"
              className="absolute top-full left-0 z-40 mt-1 w-52 overflow-hidden rounded-xl border border-hf-border bg-hf-surface-3 py-1 shadow-lg"
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
            linkFrom ? "border-hf-lime bg-hf-lime/10 text-hf-lime" : "border-hf-border text-white hover:border-hf-lime/50"
          }`}
        >
          <Link2 className="size-4" aria-hidden strokeWidth={1.75} />
          {linkFrom ? "Pick target" : "Connect"}
        </button>

        <button
          type="button"
          onClick={() => deleteNode(selected)}
          disabled={nodes.length <= 1}
          className="flex items-center gap-1.5 rounded-lg border border-hf-border px-3 py-2 text-sm text-white transition-colors hover:border-hf-pink hover:text-hf-pink disabled:opacity-40"
        >
          <Trash2 className="size-4" aria-hidden strokeWidth={1.75} />
          Delete
        </button>

        <span aria-live="polite" className="ml-auto text-xs text-hf-dim">
          {nodes.length} nodes · {edges.length} connections
        </span>
      </div>

      <div
        ref={boardRef}
        onPointerMove={(event) => dragging && move(dragging, event.clientX, event.clientY)}
        onPointerUp={() => setDragging(null)}
        onPointerLeave={() => setDragging(null)}
        className="relative h-[520px] w-full touch-none overflow-hidden rounded-2xl border border-hf-border bg-hf-surface"
        style={{
          backgroundImage: "radial-gradient(circle, rgba(255,255,255,0.10) 1px, transparent 1px)",
          backgroundSize: "22px 22px",
        }}
      >
        <svg className="pointer-events-none absolute inset-0 size-full" aria-hidden>
          {edges.map(([from, to]) => {
            const a = nodes.find((n) => n.id === from);
            const b = nodes.find((n) => n.id === to);
            if (!a || !b) return null;
            return (
              <line
                key={`${from}-${to}`}
                x1={`${a.x + 8}%`}
                y1={`${a.y + 5}%`}
                x2={`${b.x + 8}%`}
                y2={`${b.y + 5}%`}
                stroke="#d1fe17"
                strokeWidth={2}
                strokeOpacity={0.55}
              />
            );
          })}
        </svg>

        {nodes.map((node) => {
          const type = typeOf(node.type);
          const isSelected = selected === node.id;
          return (
            <div
              key={node.id}
              onPointerDown={() => {
                if (linkFrom !== null) startLink(node.id);
                else setSelected(node.id);
              }}
              className={`absolute w-52 rounded-xl border bg-hf-surface-2 ${
                isSelected ? "border-hf-lime" : "border-hf-border"
              }`}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
            >
              <div className="flex items-center gap-1.5 border-b border-hf-border px-2 py-1.5">
                <button
                  type="button"
                  aria-label={`Move ${type.label} node`}
                  onPointerDown={(event) => {
                    if (linkFrom !== null) return;
                    event.stopPropagation();
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
                  className="cursor-grab text-hf-dim active:cursor-grabbing"
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
                  onClick={() => deleteNode(node.id)}
                  className="text-hf-dim transition-colors hover:text-hf-pink"
                >
                  <X className="size-3.5" aria-hidden strokeWidth={2} />
                </button>
              </div>

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
                          className="w-full rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white focus:border-hf-lime focus:outline-none"
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
                          className="w-full resize-none rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white placeholder:text-hf-dim focus:border-hf-lime focus:outline-none"
                        />
                      ) : (
                        <input
                          id={id}
                          type="text"
                          value={node.params[param.key] ?? ""}
                          placeholder={param.placeholder}
                          onChange={(event) => setParam(node.id, param.key, event.target.value)}
                          onPointerDown={(event) => event.stopPropagation()}
                          className="w-full rounded-md border border-hf-border bg-hf-surface-3 px-2 py-1 text-[11px] text-white placeholder:text-hf-dim focus:border-hf-lime focus:outline-none"
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
        Drag by the handle, or focus it and use the arrow keys. Edit parameters inline; connections
        update live.
      </p>
    </div>
  );
}
