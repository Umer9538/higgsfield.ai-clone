import type { Surface } from "../types";

export const genjutsu: Surface = {
  id: "genjutsu",
  label: "Higgsfield Genjutsu",
  navLabel: "Genjutsu",
  layout: "panel",
  fields: [
    {
      kind: "preset",
      id: "preset",
      image: "/media/presets/3.jpg",
      label: "Higgsfield Genjutsu",
      sublabel: "Reality manipulation",
    },
    {
      kind: "segmented",
      id: "mode",
      defaultValue: "motion",
      options: [
        { value: "motion", label: "Motion transfer", icon: "video" },
        { value: "objects", label: "Objects swap", icon: "image" },
      ],
    },
    {
      kind: "dropzone",
      id: "reference",
      title: "Add a reference video to extract motion",
      subtitle: "Video duration: 4–30 seconds",
      accepts: ["video"],
    },
    {
      kind: "dropzone",
      id: "subjects",
      title: "Add your characters, products, or clothes",
      subtitle: "Up to 49 images",
      accepts: ["character", "product", "image"],
    },
    { kind: "promptToggle", id: "prompt-enabled", label: "Prompt", defaultOn: false },
    { kind: "select", id: "model", label: "Model", value: "Higgsfield Genjutsu" },
    { kind: "select", id: "quality", label: "Quality", value: "720p" },
  ],
  generate: { cost: 12 },
  content: {
    kind: "library",
    headline: "Turn one video into many",
    sub: "Take the motion and recast it with your characters, locations, and products, or swap specific elements while keeping the rest untouched.",
    sectionTitle: "Motion library",
    count: 5,
  },
  result: {
    kind: "video",
    src: "/media/results/result-2.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Model", value: "Higgsfield Genjutsu" },
      { label: "Quality", value: "720p" },
    ],
  },
};
