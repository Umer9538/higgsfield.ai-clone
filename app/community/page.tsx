import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { CommunityFeed } from "@/components/sections/CommunityFeed";

export const metadata: Metadata = {
  title: "Community — Higgsfield",
  description: "Projects, shots and originals from the Higgsfield community.",
};

export default function CommunityPage() {
  return (
    <>
      <AppHeader activeNav="community" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Community
        </h1>
        <CommunityFeed />
      </main>
      <SiteFooter />
    </>
  );
}
