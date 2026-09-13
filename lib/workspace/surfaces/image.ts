import type { Surface } from "../types";

/**
 * Image is the one surface that does NOT use the left control panel.
 * The real product centres the content and docks a prompt bar at the bottom
 * with the model and output settings inline as pills.
 */
export const image: Surface = {
  id: "image",
  label: "Create Image",
  navLabel: "Image",
  layout: "dock",
  fields: [],
  dock: {
    placeholder: "Describe the scene you imagine",
    pills: [
      { icon: "model", label: "GPT Image 2" },
      { icon: "frame", label: "Auto" },
      { icon: "quality", label: "High" },
      { icon: "ratio", label: "2K" },
      { icon: "sparkles", label: "Auto" },
    ],
    stepper: "1/4",
  },
  generate: { cost: 6.5, originalCost: 8.5 },
  content: {
    kind: "hero",
    headline: "Start creating with",
    highlight: "Higgsfield Soul Cinema",
    sub: "Describe a scene, character, mood, or style — and watch it come to life",
    tiles: 4,
  },
  result: {
    kind: "image",
    src: "/media/results/image.jpg",
    meta: [
      { label: "Model", value: "GPT Image 2" },
      { label: "Quality", value: "High" },
      { label: "Resolution", value: "2K" },
    ],
  },
};
