import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { SURFACES, SURFACE_IDS } from "@/lib/workspace";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-dvh max-w-2xl flex-col justify-center px-4 py-16">
      <p className="font-mono text-xs tracking-widest text-hf-lime uppercase">In progress</p>
      <h1 className="mt-3 font-display text-3xl leading-tight font-bold tracking-tight sm:text-4xl">
        Generate workspace
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-hf-muted">
        One shell, five surfaces, driven from config. The homepage comes next.
      </p>

      <ul className="mt-8 space-y-2">
        {SURFACE_IDS.map((id) => {
          const surface = SURFACES[id];
          return (
            <li key={id}>
              <Link
                href={`/ai/${id}`}
                className="group flex items-center justify-between gap-3 rounded-xl border border-hf-border bg-hf-surface px-4 py-3.5 transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
              >
                <span>
                  <span className="block text-sm font-medium text-white">{surface.label}</span>
                  <span className="mt-0.5 block text-xs text-hf-dim">
                    {surface.layout === "dock" ? "Docked prompt bar" : "Left control panel"}
                  </span>
                </span>
                <ArrowRight
                  className="size-4 shrink-0 text-hf-dim transition-colors group-hover:text-hf-lime"
                  aria-hidden
                  strokeWidth={1.75}
                />
              </Link>
            </li>
          );
        })}
      </ul>
    </main>
  );
}
