import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ExploreFeed } from "@/components/explore/ExploreFeed";

export const metadata: Metadata = {
  title: "Explore — Higgsfield",
  description: "Browse premium AI video and image generations from the Higgsfield community.",
};

export default function ExplorePage() {
  return (
    <>
      <AppHeader activeNav="explore" />
      <main className="mx-auto max-w-[1600px] px-4 pb-16">
        <ExploreFeed />
      </main>
      <SiteFooter />
    </>
  );
}
