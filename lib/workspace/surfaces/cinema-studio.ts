import type { Surface } from "../types";

export const cinemaStudio: Surface = {
  id: "cinema-studio",
  label: "Cinema Studio",
  navLabel: "Cinema Studio",
  layout: "dock",
  fields: [],
  dock: {
    placeholder: "Describe your scene - use @ to add characters & locations",
    rail: [
      { label: "Image", icon: "image" },
      { label: "Video", icon: "video" },
    ],
    setup: [
      { label: "References", value: "0/50", icon: "plus" },
      { label: "Film setup", value: "Auto", icon: "film" },
      { label: "Camera", value: "Auto", icon: "camera" },
      { label: "Color palette", value: "Auto", icon: "palette" },
      { label: "Lighting", value: "Auto", icon: "lighting" },
    ],
    pills: [
      { icon: "model", label: "Cinema Studio 4.0" },
      { icon: "quality", label: "1080p" },
      { icon: "ratio", label: "16:9" },
      { icon: "clock", label: "5s" },
      { icon: "volume", label: "On" },
    ],
    stepper: "1/4",
  },
  generate: { cost: 45, originalCost: 80 },
  content: {
    kind: "hero",
    headline: "Bring your stories to life",
    sub: "Set the film look, camera, palette and lighting, then write the scene.",
    tiles: 3,
  },
  result: {
    kind: "video",
    src: "/media/results/result.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Model", value: "Cinema Studio 4.0" },
      { label: "Resolution", value: "1080p" },
      { label: "Duration", value: "5s" },
    ],
  },
};
