import Link from "next/link";
import { FOOTER, FOOTER_COLUMNS } from "@/lib/marketing/content";

/**
 * Quiet on purpose. The reference ends every page on a full-bleed accent
 * block; here the footer sits on the same obsidian as the chrome, so the
 * largest coloured area on any page is the work, never the furniture.
 * Every entry is a real link — see FOOTER_COLUMNS for what was cut.
 */
export function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="border-t border-hf-border bg-hf-surface text-white">
        <div className="px-4 py-12 sm:py-16">
          <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,3fr)]">
            <h2 className="font-display text-4xl leading-[0.95] font-bold tracking-[-0.025em] sm:text-5xl">
              {FOOTER.wordmark[0]}
              <br />
              <span className="text-hf-accent-soft">{FOOTER.wordmark[1]}</span>
            </h2>

            <nav aria-label="Footer" className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-medium text-hf-dim">{column.title}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          href={link.href}
                          className="inline-flex min-h-11 items-center text-sm text-hf-muted transition-colors hover:text-white md:min-h-0"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </div>

          <p className="mt-12 text-sm text-hf-muted">{FOOTER.address}</p>
        </div>
      </div>

      <div className="bg-hf-black px-4 py-4">
        <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-hf-muted">
          <p>{FOOTER.copyright}</p>
          <ul className="flex flex-wrap items-center gap-4">
            {FOOTER.legal.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center font-medium transition-colors hover:text-white md:min-h-0"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
