import type { Surface } from "../types";

export const audio: Surface = {
  id: "audio",
  label: "Text to Speech",
  navLabel: "Audio",
  layout: "panel",
  fields: [
    {
      kind: "prompt",
      id: "script",
      model: "Seed Audio 1.0",
      label: "Script",
      placeholder: "Type your script here. Describe how it should sound and who is speaking.",
      maxLength: 2000,
    },
    { kind: "select", id: "model", label: "Model", value: "Seed Audio 1.0" },
    { kind: "stepper", id: "batch", label: "Batch size", value: "1/4" },
    {
      kind: "prompt",
      id: "voice",
      label: "Voice details",
      optional: true,
      placeholder: "e.g. Young female voice with british accent, soft and loud. Excited, giggling",
      maxLength: 500,
    },
    { kind: "accordion", id: "advanced", label: "Advanced settings", icon: "sliders" },
  ],
  // Disabled until a script is entered — matches the muted button in the real product.
  generate: { cost: 1, disabled: true },
  content: {
    kind: "steps",
    headline: "Turn text into speech",
    sub: "Generate natural narration from any script — ready for your projects",
    steps: [
      { title: "Write the script", caption: "Type or paste what you want spoken" },
      { title: "Describe the voice", caption: "Accent, tone, pace and delivery" },
      { title: "Generate", caption: "Get multi-speaker audio ready to drop into an edit" },
    ],
  },
};
