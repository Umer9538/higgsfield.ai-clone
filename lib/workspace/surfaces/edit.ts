import type { Surface } from "../types";
import { VIDEO_TABS } from "./video";

export const edit: Surface = {
  id: "edit",
  label: "Edit Video",
  navLabel: "Edit",
  layout: "panel",
  tabGroup: VIDEO_TABS,
  fields: [
    { kind: "preset", id: "preset", image: "/media/presets/2.jpg", label: "GENERAL", sublabel: "Seedance 2.5 Edit" },
    {
      kind: "segmented",
      id: "mode",
      defaultValue: "prompt",
      options: [
        { value: "prompt", label: "Prompt", icon: "sparkles" },
        { value: "draw", label: "Draw", icon: "pencil" },
      ],
    },
    { kind: "dropzone", id: "source", title: "Add a video to edit", subtitle: "Up to 30s", accepts: ["video"] },
    {
      kind: "dropzone",
      id: "elements",
      title: "Add elements or references",
      subtitle: "Up to 50 image or audio",
      accepts: ["image", "audio"],
    },
    {
      kind: "prompt",
      id: "prompt",
      label: "Prompt",
      placeholder: "Describe what to change in the video. Add reference images or elements using @...",
      chips: [
        { icon: "at", label: "Elements" },
        { icon: "volume", label: "On" },
      ],
    },
    { kind: "select", id: "model", label: "Model", value: "Seedance 2.5 Edit" },
    {
      kind: "pills",
      id: "output",
      items: [
        { icon: "quality", label: "1080p" },
        { icon: "bitrate", label: "High" },
      ],
    },
  ],
  generate: { cost: 45, originalCost: 80 },
  content: {
    kind: "carousel",
    headline: "Relight & atmosphere",
    sub: "Change daytime to dusk or add cinematic lighting. The model understands 3D geometry to adjust light and shadow",
    slides: [
      { title: "Relight & atmosphere", caption: "Change daytime to dusk or add cinematic lighting" },
      { title: "Object removal", caption: "Erase anything and let the scene close behind it" },
      { title: "Style transfer", caption: "Repaint the shot in a new visual language" },
      { title: "Background swap", caption: "Replace the world while the subject stays put" },
      { title: "Colour grade", caption: "Push the palette toward a film stock" },
      { title: "Season shift", caption: "Turn summer into deep winter in one pass" },
    ],
  },
  result: {
    kind: "video",
    src: "/media/results/result-2.mp4",
    poster: "/media/results/poster.jpg",
    meta: [
      { label: "Model", value: "Seedance 2.5 Edit" },
      { label: "Resolution", value: "1080p" },
      { label: "Bitrate", value: "High" },
    ],
  },
};
