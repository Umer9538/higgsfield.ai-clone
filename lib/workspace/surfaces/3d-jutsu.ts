import type { Surface } from "../types";

export const threeDJutsu: Surface = {
  id: "3d-jutsu",
  label: "3D Jutsu",
  navLabel: "3D Jutsu",
  layout: "dock",
  fields: [],
  dock: {
    placeholder: "Describe the scene you want to block out...",
    pills: [
      { icon: "model", label: "Auto" },
      { icon: "clock", label: "15s" },
      { icon: "ratio", label: "16:9" },
    ],
  },
  generate: { cost: 0, badge: "Free" },
  content: {
    kind: "hero",
    headline: "Prompt your 3D scene",
    sub: "Adjust props and cameras, then turn your scene into a video",
    tiles: 4,
  },
  result: {
    kind: "video",
    src: "/media/results/result-2.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Model", value: "Higgsfield 3D Jutsu" },
      { label: "Duration", value: "15s" },
      { label: "Ratio", value: "16:9" },
    ],
  },
};
