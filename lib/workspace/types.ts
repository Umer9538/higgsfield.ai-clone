/**
 * Config types for the generate workspace.
 *
 * Every generate surface on higgsfield.ai is the same shell with a different
 * field set, so the shell is written once and driven entirely from config.
 * Two layouts exist in the real product:
 *   - "panel": fixed left control panel + content pane (Video, Audio, Edit, Motion Control)
 *   - "dock":  centred content + bottom-docked prompt bar (Image)
 */

export type SurfaceId = "video" | "image" | "audio" | "edit" | "motion-control";

export type IconName =
  | "image"
  | "video"
  | "audio"
  | "sparkles"
  | "at"
  | "volume"
  | "clock"
  | "ratio"
  | "quality"
  | "bitrate"
  | "sliders"
  | "plus"
  | "pencil"
  | "model"
  | "frame";

export interface Option {
  value: string;
  label: string;
  icon?: IconName;
}

export type Field =
  /** Preset thumbnail with a lime label, e.g. GENERAL / Seedance 2.5 */
  | { kind: "preset"; id: string; label: string; sublabel: string; image: string }
  | { kind: "segmented"; id: string; options: Option[]; defaultValue: string }
  | { kind: "dropzone"; id: string; title: string; subtitle?: string; accepts: IconName[] }
  /** Side-by-side upload tiles, as in Motion Control */
  | { kind: "dropzoneRow"; id: string; items: { id: string; title: string; subtitle: string; icon: IconName }[] }
  | {
      kind: "prompt";
      id: string;
      label?: string;
      placeholder: string;
      chips?: { icon: IconName; label: string }[];
      maxLength?: number;
      optional?: boolean;
    }
  /** Label over value with a chevron, e.g. Model / Seedance 2.5 */
  | { kind: "select"; id: string; label: string; value: string }
  /** Inline pill row, e.g. 5s · 16:9 · 1080p */
  | { kind: "pills"; id: string; items: { icon: IconName; label: string }[] }
  /** Single row with the value on the right, e.g. Bitrate — High */
  | { kind: "valueRow"; id: string; label: string; value: string; accent?: boolean }
  | { kind: "stepper"; id: string; label: string; value: string }
  | {
      kind: "toggle";
      id: string;
      label: string;
      defaultOn: boolean;
      segmented?: Option[];
      description?: string;
    }
  | { kind: "accordion"; id: string; label: string; icon?: IconName };

export type Content =
  | {
      kind: "steps";
      headline: string;
      sub: string;
      steps: { title: string; caption: string }[];
      footer?: { title: string; sub: string };
    }
  | { kind: "carousel"; headline: string; sub: string; slides: { title: string; caption: string }[] }
  | { kind: "library"; headline: string; highlight?: string; sub: string; sectionTitle: string; count: number }
  | { kind: "hero"; headline: string; highlight?: string; sub: string; tiles?: number };

export interface GenerationResult {
  kind: "video" | "image";
  src: string;
  poster?: string;
  /** Shown as chips under the result, e.g. Model / Seedance 2.5 */
  meta: { label: string; value: string }[];
}

export interface GenerateAction {
  cost: number;
  /** Struck-through original price, as the real site shows on discount */
  originalCost?: number;
  /** Disabled until required inputs are filled */
  disabled?: boolean;
}

export interface Surface {
  id: SurfaceId;
  label: string;
  /** Nav label shown in the header */
  navLabel: string;
  layout: "panel" | "dock";
  /** Sibling tabs rendered above the panel, e.g. Create Video / Edit Video / Motion Control */
  tabGroup?: { id: SurfaceId; label: string }[];
  fields: Field[];
  dock?: {
    placeholder: string;
    pills: { icon: IconName; label: string }[];
    stepper?: string;
  };
  generate: GenerateAction;
  content: Content;
  /** Mock output revealed after a generation run. Omitted where Generate is disabled. */
  result?: GenerationResult;
}
