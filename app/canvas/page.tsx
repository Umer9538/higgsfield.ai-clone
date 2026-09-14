import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { NodeCanvas } from "@/components/sections/NodeCanvas";
import { PageHeading, RailHeading } from "@/components/sections/Shared";
import { CANVAS } from "@/lib/sections/content";

export const metadata: Metadata = {
  title: "Canvas — Higgsfield",
  description: CANVAS.sub,
};

export default function CanvasPage() {
  return (
    <>
      <AppHeader activeNav="canvas" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <PageHeading title={CANVAS.headline} sub={CANVAS.sub} cta={CANVAS.cta} />

        <section className="mt-10">
          <NodeCanvas />
        </section>

        <section className="mt-14">
          <RailHeading title={CANVAS.stepsTitle} />
          <ol className="mt-4 grid gap-4 sm:grid-cols-3">
            {CANVAS.steps.map((step) => (
              <li key={step.title} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
                <span className="text-xs text-hf-lime">{step.step}</span>
                <h3 className="mt-2 text-sm font-semibold text-white">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-hf-muted">{step.body}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mt-14 rounded-2xl border border-hf-border bg-hf-surface p-6 sm:p-8">
          <h2 className="font-display text-xl font-bold tracking-tight text-white uppercase">
            {CANVAS.featureTitle}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-hf-muted">
            {CANVAS.featureBody}
          </p>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
