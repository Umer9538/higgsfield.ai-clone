import type { Surface } from "../types";
import { VIDEO_TABS } from "./video";

export const motionControl: Surface = {
  id: "motion-control",
  label: "Motion Control",
  navLabel: "Motion Control",
  layout: "panel",
  tabGroup: VIDEO_TABS,
  fields: [
    { kind: "preset", id: "preset", label: "MOTION CONTROL", sublabel: "Control motion with video references" },
    {
      kind: "dropzoneRow",
      id: "inputs",
      items: [
        { id: "motion", title: "Add motion to copy", subtitle: "Video duration: 3–30 seconds", icon: "video" },
        { id: "character", title: "Add your character", subtitle: "Image with visible face and body", icon: "plus" },
      ],
    },
    { kind: "select", id: "model", label: "Model", value: "Kling 3.0 Motion Control" },
    { kind: "select", id: "quality", label: "Quality", value: "720p" },
    {
      kind: "toggle",
      id: "scene-control",
      label: "Scene control mode",
      defaultOn: true,
      segmented: [
        { value: "video", label: "Video", icon: "video" },
        { value: "image", label: "Image", icon: "image" },
      ],
      description: "Choose where the background should come from: the character image or the motion video",
    },
    { kind: "accordion", id: "advanced", label: "Advanced settings" },
  ],
  generate: { cost: 7 },
  content: {
    kind: "library",
    headline: "Recreate any",
    highlight: "motion",
    sub: "Copy motion from any video and place your character into the same movement",
    sectionTitle: "Start by copying motion from library",
    count: 5,
  },
};
