import { FOOTER, FOOTER_COLUMNS } from "@/lib/marketing/content";
import { SmartLink } from "@/components/ui/SmartLink";
import { routeFor } from "@/lib/routes";

/**
 * Quiet on purpose. The reference ends every page on a full-bleed accent
 * block; here the footer sits on the same obsidian as the chrome, so the
 * largest coloured area on any page is the work, never the furniture.
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

            <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-3 lg:grid-cols-6">
              {FOOTER_COLUMNS.map((column) => (
                <div key={column.title}>
                  <h3 className="text-sm font-medium text-hf-dim">{column.title}</h3>
                  <ul className="mt-3 space-y-2.5">
                    {column.links.map((link) => (
                      <li key={link}>
                        <SmartLink
                          label={link}
                          href={routeFor(link)}
                          className="inline-flex min-h-11 items-center text-sm text-hf-muted transition-colors hover:text-white md:min-h-0"
                        />
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-between gap-4 text-sm">
            <p className="text-hf-muted">{FOOTER.address}</p>
            <ul className="flex flex-wrap items-center gap-5">
              {FOOTER.socials.map((social) => (
                <li key={social}>
                  <SmartLink
                    label={social}
                    className="inline-flex min-h-11 items-center text-hf-muted transition-colors hover:text-hf-accent-soft md:min-h-0"
                  />
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
                <SmartLink
                  label={item}
                  href={routeFor(item)}
                  className="inline-flex min-h-11 items-center font-medium transition-colors hover:text-white md:min-h-0"
                />
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
