import type { Metadata } from "next";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PluginDirectory } from "@/components/sections/PluginDirectory";

export const metadata: Metadata = {
  title: "Plugins — Higgsfield",
  description: "Higgsfield inside Adobe, Figma, Blender, DaVinci Resolve and your agent.",
};

export default function PluginsPage() {
  return (
    <>
      <main className="mx-auto max-w-6xl px-4 py-10">
        <PluginDirectory />
      </main>
      <SiteFooter />
    </>
  );
}
