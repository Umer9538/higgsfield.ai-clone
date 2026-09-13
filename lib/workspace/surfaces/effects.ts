import type { Surface } from "../types";

export const effects: Surface = {
  id: "effects",
  label: "Higgsfield Effects",
  navLabel: "Effects",
  layout: "panel",
  fields: [
    {
      kind: "preset",
      id: "preset",
      image: "/media/effects/1.jpg",
      label: "Floating fall",
      sublabel: "Visual effect preset",
    },
    {
      kind: "dropzoneRow",
      id: "inputs",
      items: [
        { id: "character", title: "Character", subtitle: "Select a PNG or JPG from your device", icon: "character" },
        { id: "location", title: "Location", subtitle: "Select a PNG or JPG from your device", icon: "location" },
      ],
    },
    {
      kind: "dropzone",
      id: "products",
      title: "Products",
      subtitle: "Select a PNG or JPG from your device",
      accepts: ["product"],
    },
    { kind: "promptToggle", id: "prompt-enabled", label: "Prompt", defaultOn: false },
    {
      kind: "pills",
      id: "output",
      items: [
        { icon: "quality", label: "720p" },
        { icon: "ratio", label: "9:16" },
      ],
    },
    { kind: "promptToggle", id: "free-gens", label: "Use free gens", defaultOn: true, badge: "1" },
    { kind: "linkRow", id: "chatgpt", label: "Try in ChatGPT", icon: "chatgpt" },
  ],
  generate: { cost: 0, badge: "1 FREE LEFT" },
  content: {
    kind: "steps",
    headline: "Upload image",
    sub: "Select a PNG or JPG from your device.",
    steps: [
      { title: "Pick a preset", caption: "Choose from 250+ big-budget visual effects" },
      { title: "Add your subject", caption: "Character, location and products are optional" },
      { title: "Generate", caption: "Get a finished effect shot in seconds" },
    ],
  },
  result: {
    kind: "video",
    src: "/media/results/result.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Preset", value: "Floating fall" },
      { label: "Resolution", value: "720p" },
      { label: "Ratio", value: "9:16" },
    ],
  },
};
