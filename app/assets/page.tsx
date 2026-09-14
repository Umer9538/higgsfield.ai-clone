import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { AssetLibrary } from "@/components/assets/AssetLibrary";

export const metadata: Metadata = {
  title: "Assets — Higgsfield",
  description: "Every image, video and audio file your team has generated, in one library.",
};

export default function AssetsPage() {
  return (
    <>
      <AppHeader activeNav="assets" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <AssetLibrary />
      </main>
      <SiteFooter />
    </>
  );
}
