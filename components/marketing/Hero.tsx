import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { HERO_CARDS } from "@/lib/marketing/content";

/**
 * Asymmetric hero: one editorial lead panel with four supporting tiles beside
 * it, rather than the reference's uniform five-across row.
 */
export function Hero() {
  const [lead, ...rest] = HERO_CARDS;

  return (
    <section id="featured" aria-label="Featured releases" className="scroll-mt-20 px-4 pt-6">
      <div className="grid gap-4 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)]">
        {/* Lead */}
        <Link
          href={lead.href}
          className="gradient-border group relative block overflow-hidden rounded-[var(--radius-panel)]"
        >
          <div className="relative aspect-[16/10] h-full w-full lg:aspect-auto lg:min-h-[28rem]">
            <Image
              src={lead.image}
              alt=""
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 58vw"
              className="object-cover transition-transform duration-700 group-hover:scale-[1.03] motion-reduce:transition-none motion-reduce:group-hover:scale-100"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
          </div>

          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hf-accent px-3 py-1 text-xs font-semibold text-black">
              Featured
            </span>
            <h2 className="mt-3 max-w-lg font-display text-2xl leading-tight font-bold tracking-[-0.025em] text-white sm:text-3xl">
              {lead.title}
            </h2>
            <p className="mt-2 max-w-md text-sm text-hf-muted">{lead.description}</p>
            <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-hf-accent-soft">
              Open
              <ArrowUpRight className="size-4" aria-hidden strokeWidth={2} />
            </span>
          </div>
        </Link>

        {/* Supporting tiles */}
        <ul className="grid grid-cols-2 gap-4">
          {rest.map((card) => (
            <li key={card.id}>
              <Link href={card.href} className="group block h-full">
                <div className="hover-glow relative aspect-[4/3] w-full overflow-hidden rounded-[var(--radius-media)] border border-hf-border">
                  <Image
                    src={card.image}
                    alt=""
                    fill
                    sizes="(max-width: 1024px) 50vw, 21vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-transparent" />
                </div>
                <h2 className="mt-3 font-display text-sm font-bold tracking-[-0.025em] text-white">
                  {card.title}
                </h2>
                <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-hf-muted">
                  {card.description}
                </p>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
