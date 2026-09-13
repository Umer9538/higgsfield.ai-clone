import { ArrowRight } from "lucide-react";
import { PRODUCT_TILES, PROMO_PANEL } from "@/lib/marketing/content";

const BADGE_TONES: Record<"top" | "new" | "free", string> = {
  top: "bg-hf-pink text-white",
  new: "bg-hf-lime text-black",
  free: "bg-hf-lime/15 text-hf-lime",
};

export function ProductRail() {
  return (
    <section id="products" aria-label="Products" className="scroll-mt-20 px-4 pt-10">
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Promo panel */}
        <div className="relative flex min-h-64 flex-col justify-between overflow-hidden rounded-2xl border border-hf-border p-6 sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[#3a1d5c] via-hf-surface-3 to-hf-black" />
          <div className="relative">
            <h2 className="font-display text-2xl leading-tight font-bold tracking-tight uppercase sm:text-3xl">
              <span className="text-white">{PROMO_PANEL.headline}</span>
              <br />
              <span className="text-hf-lime">{PROMO_PANEL.highlight}</span>
            </h2>
            <p className="mt-3 max-w-sm text-sm text-hf-muted">{PROMO_PANEL.sub}</p>
          </div>

          <div className="relative mt-6">
            <button
              type="button"
              className="rounded-full bg-hf-lime px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              {PROMO_PANEL.cta}
            </button>
            <p className="mt-2.5">
              <span className="rounded-full bg-hf-pink px-2.5 py-1 text-[11px] font-medium text-white">
                {PROMO_PANEL.note}
              </span>
            </p>
          </div>
        </div>

        {/* Six product tiles, 3 x 2 on desktop */}
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PRODUCT_TILES.map((tile) => (
            <li key={tile.id}>
              <a
                href="#"
                className="flex h-full flex-col justify-between gap-4 rounded-2xl border border-hf-border bg-hf-surface p-4 transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
              >
                <div className="flex items-start justify-between gap-2">
                  <span className="size-6 rounded-md bg-hf-surface-4" aria-hidden />
                  {tile.kind ? (
                    <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-[10px] text-hf-muted">
                      {tile.kind}
                    </span>
                  ) : null}
                </div>
                <div>
                  <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
                    {tile.title}
                    {tile.badge ? (
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${BADGE_TONES[tile.badge.tone]}`}
                      >
                        {tile.badge.label}
                      </span>
                    ) : null}
                  </p>
                  <p className="mt-1 text-xs leading-relaxed text-hf-muted">{tile.description}</p>
                </div>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

export function SectionHeading({
  title,
  sub,
  cta,
}: {
  title: string;
  sub: string;
  cta?: string;
}) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div>
        <h2 className="font-display text-2xl font-bold tracking-tight text-hf-lime uppercase sm:text-3xl">
          {title}
        </h2>
        <p className="mt-2 max-w-xl text-sm text-hf-muted">{sub}</p>
      </div>
      {cta ? (
        <a
          href="#"
          className="flex shrink-0 items-center gap-1.5 rounded-full border border-hf-border px-4 py-2 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          {cta}
          <ArrowRight className="size-4" aria-hidden strokeWidth={1.75} />
        </a>
      ) : null}
    </div>
  );
}
