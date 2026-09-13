import type { Surface } from "../types";

export const marketingStudio: Surface = {
  id: "marketing-studio",
  label: "Marketing Studio",
  navLabel: "Marketing Studio",
  layout: "dock",
  fields: [],
  dock: {
    placeholder: "Describe what you want to create...",
    rail: [
      { label: "Image", icon: "image" },
      { label: "Video", icon: "video" },
    ],
    slots: ["Avatar", "Product"],
    pills: [
      { icon: "model", label: "Marketing Studio Image" },
      { icon: "camera", label: "Closeup" },
      { icon: "ratio", label: "3:4" },
    ],
    stepper: "1/4",
  },
  generate: { cost: 4 },
  content: {
    kind: "hero",
    headline: "Turn any product",
    highlight: "into ready to post content",
    sub: "Product shots, UGC, ads, posters and marketplace assets from one brief.",
    tiles: 4,
  },
  result: {
    kind: "image",
    src: "/media/results/image.jpg",
    meta: [
      { label: "Model", value: "Marketing Studio Image" },
      { label: "Framing", value: "Closeup" },
      { label: "Ratio", value: "3:4" },
    ],
  },
};
