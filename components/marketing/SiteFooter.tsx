import { FOOTER, FOOTER_COLUMNS } from "@/lib/marketing/content";

/**
 * Full-bleed lime block with black text. This inversion is the site's single
 * biggest visual signature and the one place lime is used as a surface rather
 * than an accent.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="bg-hf-lime text-black">
        <div className="px-4 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
            <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-tight uppercase sm:text-5xl">
              {FOOTER.wordmark[0]}
              <br />
              {FOOTER.wordmark[1]}
            </h2>

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-medium text-black/45">{column.title}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link}>
                        <a href="#" className="inline-flex min-h-11 items-center text-sm font-medium hover:underline md:min-h-0">
                          {link}
                        </a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm">
            <p className="font-medium">{FOOTER.address}</p>
            <ul className="flex flex-wrap items-center gap-5">
              {FOOTER.socials.map((social) => (
                <li key={social}>
                  <a
                    href="#"
                    className="inline-flex min-h-11 items-center font-medium hover:underline md:min-h-0"
                  >
                    {social}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      <div className="bg-hf-black px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-hf-muted">
          <p>{FOOTER.copyright}</p>
          <ul className="flex flex-wrap items-center gap-4">
            {FOOTER.legal.map((item) => (
              <li key={item}>
                <a href="#" className="inline-flex min-h-11 items-center font-medium transition-colors hover:text-white md:min-h-0">
                  {item}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
