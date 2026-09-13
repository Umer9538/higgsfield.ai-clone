import { HERO_CARDS } from "@/lib/marketing/content";

export function Hero() {
  return (
    <section aria-label="Featured releases" className="px-4 pt-5">
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {HERO_CARDS.map((card) => (
          <li key={card.id}>
            <a href="#" className="group block">
              <div className="relative aspect-[4/3] w-full overflow-hidden rounded-xl border border-hf-border">
                {/* Placeholder standing in for the autoplay video on the live site */}
                <div className="absolute inset-0 bg-gradient-to-br from-hf-surface-4 via-hf-surface-3 to-hf-black transition-transform duration-500 group-hover:scale-105 motion-reduce:transition-none motion-reduce:group-hover:scale-100" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              <h2 className="mt-3 font-display text-sm font-bold tracking-tight text-white uppercase">
                {card.title}
              </h2>
              <p className="mt-1 text-sm leading-relaxed text-hf-muted">{card.description}</p>
            </a>
          </li>
        ))}
      </ul>
    </section>
  );
}
