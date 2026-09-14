import type { Metadata } from "next";
import { Clock, Layers, PlayCircle } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MediaTile, PageHeading, RailHeading, tile } from "@/components/sections/Shared";
import { ACADEMY } from "@/lib/sections/content";

export const metadata: Metadata = {
  title: "Academy — Higgsfield",
  description: ACADEMY.sub,
};

export default function AcademyPage() {
  return (
    <>
      <AppHeader activeNav="academy" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <PageHeading
          eyebrow={ACADEMY.eyebrow}
          title={`${ACADEMY.headline[0]} ${ACADEMY.headline[1]}`}
          sub={ACADEMY.sub}
          cta={ACADEMY.cta}
        />

        <section className="mt-14">
          <RailHeading title={ACADEMY.categoriesTitle} />
          <ul className="mt-4 grid gap-4 sm:grid-cols-3">
            {ACADEMY.categories.map((category, index) => (
              <li key={category}>
                <a href="#" className="block">
                  <MediaTile src={tile(index + 2)} label={category} />
                </a>
              </li>
            ))}
          </ul>
        </section>

        <section className="mt-14">
          <RailHeading title={ACADEMY.coursesTitle} link="See all courses" />
          <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {ACADEMY.courses.map((course, index) => (
              <li
                key={course.id}
                className="flex flex-col overflow-hidden rounded-2xl border border-hf-border bg-hf-surface"
              >
                <MediaTile src={tile(index + 6)} />
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="text-sm font-semibold text-white">{course.title}</h3>
                  <p className="mt-2 flex-1 text-xs leading-relaxed text-hf-muted">{course.body}</p>

                  <ul className="mt-4 flex flex-wrap items-center gap-2 text-[11px] text-hf-dim">
                    <li className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-hf-lime">
                      {course.category}
                    </li>
                    <li className="rounded bg-hf-surface-4 px-1.5 py-0.5">{course.level}</li>
                    <li className="flex items-center gap-1">
                      <Layers className="size-3" aria-hidden strokeWidth={2} />
                      {course.modules} modules
                    </li>
                    <li className="flex items-center gap-1">
                      <Clock className="size-3" aria-hidden strokeWidth={2} />
                      {course.minutes} min
                    </li>
                  </ul>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-lg bg-hf-lime px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-hf-lime-deep"
                    >
                      <PlayCircle className="size-3.5" aria-hidden strokeWidth={2} />
                      Start now for free
                    </button>
                    <button
                      type="button"
                      className="rounded-lg border border-hf-border px-3 py-2 text-xs text-white transition-colors hover:border-hf-lime/50"
                    >
                      View details
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
