import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ContestBoard } from "@/components/sections/ContestBoard";

export const metadata: Metadata = {
  title: "Contests — Higgsfield",
  description: "Creative challenges with live prize pools and deadlines.",
};

export default function ContestsPage() {
  return (
    <>
      <AppHeader activeNav="contests" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="mb-6 font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Contests
        </h1>
        <ContestBoard />
      </main>
      <SiteFooter />
    </>
  );
}
