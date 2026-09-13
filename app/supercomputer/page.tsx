import type { Metadata } from "next";
import { ArrowUp, Plus, Sparkles, Wrench } from "lucide-react";
import Image from "next/image";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export const metadata: Metadata = {
  title: "Supercomputer — Higgsfield",
  description: "One superagent for your entire creative stack.",
};

const FILTERS = ["All", "Marketing", "Explainer videos", "Apps", "Games"];

export default function SupercomputerPage() {
  return (
    <>
      <AppHeader activeNav="supercomputer" />

      <main className="mx-auto max-w-5xl px-4 py-16">
        <h1 className="text-center font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          What are we creating today?
        </h1>

        {/* Composer */}
        <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-hf-border bg-hf-surface-2 p-3">
          <input
            type="text"
            aria-label="Ask Supercomputer"
            placeholder="Turn my podcast into 9:16"
            className="w-full bg-transparent px-1 py-2 text-sm text-white placeholder:text-hf-dim focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              aria-label="Add attachment"
              className="flex size-8 items-center justify-center rounded-full bg-hf-surface-4 text-white transition-colors hover:bg-hf-border"
            >
              <Plus className="size-4" aria-hidden strokeWidth={2} />
            </button>

            <span className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white">
              Auto
              <span className="font-semibold text-hf-lime">Free</span>
            </span>

            <span className="ml-auto flex items-center gap-2">
              <span className="rounded-lg border border-hf-border px-2.5 py-1.5 text-xs text-hf-muted">
                Ask mode
              </span>
              <button
                type="button"
                aria-label="Send"
                className="flex size-8 items-center justify-center rounded-full bg-hf-lime text-black transition-colors hover:bg-hf-lime-deep"
              >
                <ArrowUp className="size-4" aria-hidden strokeWidth={2.5} />
              </button>
            </span>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-hf-border pt-3 text-xs text-hf-muted">
            <span>No project</span>
            <span className="flex items-center gap-1.5">
              <Sparkles className="size-3.5" aria-hidden strokeWidth={1.75} />
              Skills
            </span>
            <span>Connectors</span>
            <span className="ml-auto flex items-center gap-1.5">
              <Wrench className="size-3.5" aria-hidden strokeWidth={1.75} />
              Try MCP
            </span>
          </div>
        </div>

        <h2 className="mt-20 text-center font-display text-xl leading-tight font-bold tracking-tight text-white uppercase sm:text-2xl">
          Build, generate, and market anything with skills,
          <br />
          connectors, and automation
        </h2>

        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {FILTERS.map((filter, index) => (
            <button
              key={filter}
              type="button"
              className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
                index === 0
                  ? "bg-hf-surface-4 text-white"
                  : "text-hf-muted hover:text-white"
              }`}
            >
              {filter}
            </button>
          ))}
        </div>

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
