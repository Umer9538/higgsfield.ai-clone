import { SETUP_GROUPS } from "./options";
import type { Field, IconName, Surface } from "./types";

/**
 * Splits a surface's config between the two halves of the studio: the prompt
 * bar (what you write) and the inspector (how it is made).
 *
 * The reference product used two unrelated layouts — a left form for Video
 * and friends, a bottom dock for Image and Cinema. Both configs now feed the
 * same sections, so every studio reads Model → Inputs → Look → Lens → Output.
 */

export type SectionName = "Model" | "Inputs" | "Look" | "Lens" | "Output";

export type InspectorEntry =
  | { type: "field"; field: Field }
  /** A cycling dock pill, e.g. 1080p → 4K → 720p */
  | { type: "pill"; index: number; icon: IconName; label: string }
  /** A picker tile, e.g. Camera → 35mm */
  | { type: "setup"; label: string; value: string; icon: IconName };

export interface InspectorSection {
  name: SectionName;
  entries: InspectorEntry[];
}

const ORDER: SectionName[] = ["Model", "Inputs", "Look", "Lens", "Output"];

/** The prompt that belongs in the prompt bar: the first one, if any. */
export function primaryPrompt(surface: Surface): Extract<Field, { kind: "prompt" }> | undefined {
  return surface.fields.find((field): field is Extract<Field, { kind: "prompt" }> => field.kind === "prompt");
}

function sectionForField(field: Field): SectionName {
  switch (field.kind) {
    case "preset":
    case "linkRow":
      return "Model";
    case "select":
      return field.label === "Model" ? "Model" : "Output";
    case "segmented":
    case "dropzone":
    case "dropzoneRow":
    case "prompt":
    case "promptToggle":
    case "accordion":
      return "Inputs";
    case "pills":
    case "valueRow":
    case "stepper":
    case "toggle":
      return "Output";
    default: {
      const exhaustive: never = field;
      return exhaustive;
    }
  }
}

export function inspectorSections(surface: Surface): InspectorSection[] {
  const buckets = new Map<SectionName, InspectorEntry[]>(ORDER.map((name) => [name, []]));
  const push = (name: SectionName, entry: InspectorEntry) => buckets.get(name)!.push(entry);

  const prompt = primaryPrompt(surface);
  for (const field of surface.fields) {
    if (field === prompt) continue;
    push(sectionForField(field), { type: "field", field });
  }

  if (surface.dock) {
    surface.dock.pills.forEach((pill, index) =>
      push(pill.icon === "model" ? "Model" : "Output", { type: "pill", index, ...pill }),
    );
    for (const entry of surface.dock.setup ?? []) {
      const group = SETUP_GROUPS.find((item) => item.labels.includes(entry.label));
      push(group?.name === "Lens" ? "Lens" : "Look", { type: "setup", ...entry });
    }
  }

  return ORDER.map((name) => ({ name, entries: buckets.get(name)! })).filter(
    (section) => section.entries.length > 0,
  );
}
