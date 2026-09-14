"use client";

import { useState } from "react";
import { Clock, Layers, PlayCircle } from "lucide-react";
import { MediaTile, RailHeading, tile } from "./Shared";
import { ACADEMY } from "@/lib/sections/content";
import { Modal } from "@/components/ui/Modal";
import { useToast } from "@/components/ui/Toast";

export function CourseGrid() {
  const [category, setCategory] = useState<string>("All");
  const [detail, setDetail] = useState<(typeof ACADEMY.courses)[number] | null>(null);
  const { toast } = useToast();

  const categories = ["All", ...ACADEMY.categories];
  const courses =
    category === "All"
      ? ACADEMY.courses
      : ACADEMY.courses.filter((course) => course.category === category);

  return (
    <>
      <section className="mt-14">
        <RailHeading title={ACADEMY.categoriesTitle} />
        <div role="tablist" aria-label="Course category" className="mt-4 flex flex-wrap gap-1">
          {categories.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item)}
                className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <ul className="mt-4 grid gap-4 sm:grid-cols-3">
          {ACADEMY.categories.map((item, index) => (
            <li key={item}>
              <button type="button" onClick={() => setCategory(item)} className="block w-full text-left">
                <MediaTile src={tile(index + 2)} label={item} />
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14">
        <RailHeading title={ACADEMY.coursesTitle} />
        <p aria-live="polite" className="mt-1 text-xs text-hf-dim">
          {courses.length} courses
        </p>

        <ul className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((course, index) => (
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
                    onClick={() => toast(`Enrolled in “${course.title}”`)}
                    className="flex items-center gap-1.5 rounded-lg bg-hf-lime px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-hf-lime-deep"
                  >
                    <PlayCircle className="size-3.5" aria-hidden strokeWidth={2} />
                    Start now for free
                  </button>
                  <button
                    type="button"
                    onClick={() => setDetail(course)}
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

      <Modal open={detail !== null} onClose={() => setDetail(null)} title={detail?.title ?? ""}>
        {detail ? (
          <>
            <p className="text-sm leading-relaxed text-hf-muted">{detail.body}</p>
            <dl className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Category", detail.category],
                ["Level", detail.level],
                ["Modules", String(detail.modules)],
                ["Runtime", `${detail.minutes} min`],
              ].map(([term, value]) => (
                <div key={term} className="rounded-lg bg-hf-surface-2 px-3 py-2">
                  <dt className="text-xs text-hf-dim">{term}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
            <button
              type="button"
              onClick={() => {
                toast(`Enrolled in “${detail.title}”`);
                setDetail(null);
              }}
              className="mt-5 w-full rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              Start now for free
            </button>
          </>
        ) : null}
      </Modal>
    </>
  );
}
