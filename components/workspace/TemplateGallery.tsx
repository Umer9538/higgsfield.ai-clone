"use client";

import { useMemo, useState } from "react";
import Image from "next/image";
import { useToast } from "@/components/ui/Toast";
import type { Surface } from "@/lib/workspace/types";

type Kind = "All" | "Images" | "Videos";

export function TemplateGallery({ templates }: { templates: NonNullable<Surface["templates"]> }) {
  const [category, setCategory] = useState("All");
  const [kind, setKind] = useState<Kind>("All");
  const { toast } = useToast();

  const shown = useMemo(
    () =>
      templates.items
        .filter((item) => category === "All" || item.category === category)
        .filter((item) => kind === "All" || item.kind === kind),
    [templates.items, category, kind],
  );

  return (
    <section className="mt-14">
      <h2 className="font-display text-lg font-bold tracking-tight text-white uppercase sm:text-xl">
        {templates.title}
      </h2>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div role="tablist" aria-label="Template category" className="flex flex-wrap gap-1">
          {templates.categories.map((item) => {
            const active = category === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setCategory(item)}
                className={`flex min-h-11 items-center rounded-lg px-3.5 text-sm font-medium transition-colors md:min-h-0 md:py-2 ${
                  active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>

        <div role="tablist" aria-label="Template media type" className="ml-auto flex gap-1 rounded-lg border border-hf-border p-1">
          {(["All", "Images", "Videos"] as Kind[]).map((item) => {
            const active = kind === item;
            return (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => setKind(item)}
                className={`flex min-h-11 items-center rounded-md px-3 text-sm transition-colors md:min-h-0 md:py-1.5 ${
                  active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                }`}
              >
                {item}
              </button>
            );
          })}
        </div>
      </div>

      <p aria-live="polite" className="mt-3 text-xs text-hf-dim">
        Showing {shown.length} {category === "All" ? "all" : category.toLowerCase()} templates
        {kind === "All" ? "" : ` · ${kind.toLowerCase()} only`}
      </p>

      {shown.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-hf-border bg-hf-surface p-10 text-center text-sm text-hf-muted">
          No templates match that combination.
        </p>
      ) : (
        <ul aria-label="Templates" className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {shown.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => toast(`“${item.title}” loaded into the composer`)}
                className="group block w-full overflow-hidden rounded-xl border border-hf-border bg-hf-surface text-left transition-colors hover:border-hf-lime/40"
              >
                <span className="relative block aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 25vw"
                    className="object-cover"
                  />
                </span>
                <span className="block p-3">
                  <span className="block truncate text-xs font-medium text-white">{item.title}</span>
                  <span className="mt-1 flex items-center gap-1.5 text-[11px] text-hf-dim">
                    <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-hf-lime">
                      {item.category}
                    </span>
                    {item.kind}
                  </span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
