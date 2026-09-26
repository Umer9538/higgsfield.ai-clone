import type { Metadata } from "next";
import { SuperComposer } from "@/components/sections/SuperComposer";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const metadata: Metadata = {
  title: "Supercomputer — Higgsfield",
  description: "One superagent for your entire creative stack.",
};

export default function SupercomputerPage() {
  return (
    <>

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-center font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">
          What are we creating today?
        </h1>

        <SuperComposer />

      </main>

      <SiteFooter />
    </>
  );
}
