import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SuperComposer } from "@/components/sections/SuperComposer";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const metadata: Metadata = {
  title: "Supercomputer — Higgsfield",
  description: "One superagent for your entire creative stack.",
};

export default function SupercomputerPage() {
  return (
    <>
      <AppHeader activeNav="supercomputer" />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-center font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          What are we creating today?
        </h1>

        <SuperComposer />

      </main>

      <SiteFooter />
    </>
  );
}
