/** The node canvas's model: node types and their parameters, the starting graph, and the credit estimate shown on output nodes. */

type NodeTypeId = "text-prompt" | "image-input" | "video-output";

interface ParamSpec {
  key: string;
  label: string;
  kind: "text" | "textarea" | "select";
  options?: string[];
  placeholder?: string;
}

export interface NodeType {
  id: NodeTypeId;
  label: string;
  kind: string;
  params: ParamSpec[];
}

export const NODE_TYPES: NodeType[] = [
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

export interface CanvasNode {
  id: string;
  type: NodeTypeId;
  x: number;
  y: number;
  params: Record<string, string>;
}

export function defaults(type: NodeType): Record<string, string> {
  return Object.fromEntries(
    type.params.map((param) => [param.key, param.kind === "select" ? (param.options?.[0] ?? "") : ""]),
  );
}

export const typeOf = (id: NodeTypeId) => NODE_TYPES.find((t) => t.id === id)!;

/**
 * Credit estimate for an output node, from the Video studio's published rate
 * (45 credits for 5 seconds). Labelled "est." in the UI: it is arithmetic on
 * the pricing config, not a measurement.
 */
const CREDITS_PER_SECOND = 9;
export const estimateCredits = (duration: string) => Math.round((parseInt(duration, 10) || 5) * CREDITS_PER_SECOND);

export const INITIAL: CanvasNode[] = [
  { id: "n-text", type: "text-prompt", x: 6, y: 12, params: { text: "Neon alley, rain slick" } },
  { id: "n-image", type: "image-input", x: 6, y: 52, params: { source: "asset-3", weight: "0.5" } },
  { id: "n-video", type: "video-output", x: 58, y: 30, params: { duration: "5s", ratio: "16:9" } },
];
