import Image from "next/image";
import Link from "next/link";
import { EFFECTS } from "@/lib/marketing/content";
import { SectionHeading } from "./ProductRail";

export function EffectsGrid() {
  return (
    <section id="effects" aria-label={EFFECTS.heading} className="scroll-mt-20 px-4 pt-14">
      <SectionHeading title={EFFECTS.heading} sub={EFFECTS.sub} cta={EFFECTS.cta} />

      <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
        {EFFECTS.presets.map((preset) => (
          <li key={preset.name}>
            <Link href="/ai/effects" className="group relative block overflow-hidden rounded-xl border border-hf-border">
              <div className="relative aspect-video w-full overflow-hidden">
                <Image
                  src={preset.image}
                  alt=""
                  fill
                  sizes="(max-width: 768px) 50vw, 33vw"
                  className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/10 to-transparent" />

              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
                <h3 className="font-display text-sm font-bold tracking-tight text-white uppercase sm:text-base">
                  {preset.name}
                </h3>
                {/* Revealed on hover, and always readable for keyboard users */}
                <span className="flex min-h-11 shrink-0 items-center rounded-full bg-hf-lime px-3 py-1 text-[11px] font-semibold text-black transition-opacity md:min-h-0 md:opacity-0 md:group-hover:opacity-100 md:group-focus-visible:opacity-100 motion-reduce:transition-none">
                  Recreate
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex justify-center">
        <Link
          href="/ai/effects"
          className="flex min-h-11 items-center rounded-full border border-hf-border px-5 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          {EFFECTS.footerCta}
        </Link>
      </div>
    </section>
  );
}
