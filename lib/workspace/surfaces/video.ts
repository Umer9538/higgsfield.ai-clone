import type { Surface } from "../types";

export const VIDEO_TABS = [
  { id: "video" as const, label: "Create Video" },
  { id: "edit" as const, label: "Edit Video" },
  { id: "motion-control" as const, label: "Motion Control" },
];

export const video: Surface = {
  id: "video",
  label: "Create Video",
  navLabel: "Video",
  layout: "panel",
  tabGroup: VIDEO_TABS,
  fields: [
    { kind: "preset", id: "preset", image: "/media/presets/1.jpg", label: "GENERAL", sublabel: "Seedance 2.5" },
    {
      kind: "segmented",
      id: "mode",
      defaultValue: "references",
      options: [
        { value: "references", label: "References" },
        { value: "extend", label: "Extend Video" },
      ],
    },
    {
      kind: "dropzone",
      id: "references",
      title: "Add references",
      subtitle: "Image, Video or Audio",
      accepts: ["image", "video", "audio"],
    },
    {
      kind: "prompt",
      id: "prompt",
      label: "Prompt",
      placeholder:
        "Describe the visual change you want — e.g., “Make it snow” or “Make it nighttime”. Add reference images or elements using @...",
      chips: [
        { icon: "at", label: "Elements" },
        { icon: "volume", label: "On" },
      ],
    },
    { kind: "select", id: "model", label: "Model", value: "Seedance 2.5" },
    {
      kind: "pills",
      id: "output",
      items: [
        { icon: "clock", label: "5s" },
        { icon: "ratio", label: "16:9" },
        { icon: "quality", label: "1080p" },
      ],
    },
    { kind: "valueRow", id: "bitrate", label: "Bitrate", value: "High", accent: true },
  ],
  generate: { cost: 45, originalCost: 80 },
  content: {
    kind: "steps",
    headline: "Make videos in one click",
    sub: "250+ presets for camera control, framing, and high-quality VFX - or use the general preset for manual control.",
    steps: [
      { title: "Add image", caption: "Upload or generate an image to start your animation" },
      { title: "Choose preset", caption: "Pick a preset to control your image movement" },
      { title: "Get video", caption: "Click generate to create your final animated video!" },
    ],
    footer: { title: "Don't know where to start?", sub: "Go to the Academy and start your journey" },
  },
  result: {
    kind: "video",
    src: "/media/results/result.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Model", value: "Seedance 2.5" },
      { label: "Duration", value: "5s" },
      { label: "Resolution", value: "1080p" },
      { label: "Ratio", value: "16:9" },
    ],
  },
};
