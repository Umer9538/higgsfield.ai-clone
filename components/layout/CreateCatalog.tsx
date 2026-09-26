"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CATALOG, type NavBadge } from "@/lib/nav";

function Badge({ tone }: { tone: NavBadge }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
        tone === "New" ? "bg-hf-accent text-black" : "bg-hf-accent/15 text-hf-accent-soft"
      }`}
    >
      {tone}
    </span>
  );
}

/**
 * Every generator, studio and app, grouped by what it is. Rendered in the
 * desktop rail's flyout and the mobile Create sheet.
 */
export function CreateCatalog({
  onNavigate,
  columns = true,
}: {
  onNavigate: () => void;
  /** Three columns on desktop; one stacked list in the mobile sheet. */
  columns?: boolean;
}) {
  const pathname = usePathname();

  return (
    <div className={columns ? "grid grid-cols-3 gap-6" : "space-y-5"}>
      {CATALOG.map((group) => (
        <section key={group.name} aria-labelledby={`catalog-${group.name}`}>
          <h2 id={`catalog-${group.name}`} className="px-2 text-xs font-medium text-hf-dim">
            {group.name}
          </h2>
          <ul className="mt-2 space-y-0.5">
            {group.links.map((link) => {
              const active = pathname === link.href;
              return (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={onNavigate}
                    aria-current={active ? "page" : undefined}
                    className={`group flex min-h-11 flex-col justify-center rounded-[var(--radius-control)] px-2 py-1.5 transition-colors ${
                      active ? "bg-hf-surface-3" : "hover:bg-hf-surface-3"
                    }`}
                  >
                    <span
                      className={`flex items-center gap-1.5 text-sm ${
                        active ? "font-medium text-hf-accent-soft" : "text-white"
                      }`}
                    >
                      {link.label}
                      {link.badge ? <Badge tone={link.badge} /> : null}
                    </span>
                    {link.description ? (
                      <span className="text-xs text-hf-dim">{link.description}</span>
                    ) : null}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      ))}
    </div>
  );
}
