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
  templates: {
    title: "Explore templates",
    categories: ["All", "Product shot", "Motion", "UGC", "Ads", "Posters", "Marketplace"],
    items: [
      { id: "t1", title: "Serum on wet stone", category: "Product shot", kind: "Images", image: "/media/effects/1.jpg" },
      { id: "t2", title: "Bottle rotation loop", category: "Motion", kind: "Videos", image: "/media/effects/2.jpg" },
      { id: "t3", title: "Kitchen unboxing", category: "UGC", kind: "Videos", image: "/media/effects/3.jpg" },
      { id: "t4", title: "Seasonal sale banner", category: "Ads", kind: "Images", image: "/media/effects/4.jpg" },
      { id: "t5", title: "Typographic poster", category: "Posters", kind: "Images", image: "/media/effects/5.jpg" },
      { id: "t6", title: "Marketplace hero tile", category: "Marketplace", kind: "Images", image: "/media/effects/6.jpg" },
      { id: "t7", title: "Macro texture pour", category: "Product shot", kind: "Videos", image: "/media/effects/7.jpg" },
      { id: "t8", title: "Creator testimonial", category: "UGC", kind: "Videos", image: "/media/effects/8.jpg" },
      { id: "t9", title: "Split-screen comparison", category: "Ads", kind: "Videos", image: "/media/effects/9.jpg" },
      { id: "t10", title: "Minimal studio still", category: "Product shot", kind: "Images", image: "/media/effects/10.jpg" },
      { id: "t11", title: "Kinetic type burst", category: "Motion", kind: "Videos", image: "/media/effects/11.jpg" },
      { id: "t12", title: "Listing carousel set", category: "Marketplace", kind: "Images", image: "/media/effects/12.jpg" },
    ],
  },
};
