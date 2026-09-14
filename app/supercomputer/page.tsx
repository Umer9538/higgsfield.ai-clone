import type { Metadata } from "next";
import Image from "next/image";
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

        <ul className="mt-8 grid gap-4 sm:grid-cols-3">
          {[1, 2, 3].map((n) => (
            <li key={n} className="overflow-hidden rounded-2xl border border-hf-border">
              <div className="relative aspect-[4/3]">
                <Image
                  src={`/media/steps/${n}.jpg`}
                  alt=""
                  fill
                  sizes="(max-width: 640px) 100vw, 33vw"
                  className="object-cover"
                />
              </div>
            </li>
          ))}
        </ul>
      </main>

      <SiteFooter />
    </>
  );
}
