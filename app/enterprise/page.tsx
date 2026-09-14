import type { Metadata } from "next";
import { Check, Lock, ShieldCheck, Users } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { ContactSales } from "@/components/enterprise/ContactSales";
import { EnterpriseFaq } from "@/components/enterprise/EnterpriseFaq";
import {
  CAPABILITIES,
  ENTERPRISE_HERO,
  IMPACT_STATS,
  PILLARS,
  TRUST_LINE,
  WORKSPACE_GROUPS,
} from "@/lib/enterprise/content";

export const metadata: Metadata = {
  title: "Enterprise — Higgsfield",
  description: "The AI-native creative suite built for enterprise.",
};

const PILLAR_ICONS = [Lock, ShieldCheck, Users];

export default function EnterprisePage() {
  return (
    <>
      <AppHeader activeNav="enterprise" />

      <main className="mx-auto max-w-6xl px-4 pb-16">
        {/* Hero */}
        <section className="pt-14 text-center">
          <p className="text-xs tracking-widest text-hf-muted uppercase">
            {ENTERPRISE_HERO.eyebrow}
          </p>
          <h1 className="mx-auto mt-4 max-w-3xl font-display text-3xl leading-tight font-bold tracking-tight text-white uppercase sm:text-4xl lg:text-5xl">
            {ENTERPRISE_HERO.headline}
          </h1>
          <p className="mt-4 text-sm text-hf-lime">{ENTERPRISE_HERO.proof}</p>
          <p className="mt-2 text-sm text-hf-muted">{ENTERPRISE_HERO.sub}</p>

          <a
            href="#contact-sales"
            className="mt-7 inline-block rounded-xl bg-hf-lime px-6 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            {ENTERPRISE_HERO.cta}
          </a>

          <ul className="mx-auto mt-12 grid max-w-3xl gap-4 sm:grid-cols-3">
            {IMPACT_STATS.map((stat) => (
              <li key={stat.label} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
                <p className="font-display text-3xl font-bold tracking-tight text-hf-lime">
                  {stat.value}
                </p>
                <p className="mt-1 text-xs text-hf-muted">{stat.label}</p>
              </li>
            ))}
          </ul>

          <p className="mt-6 text-xs text-hf-dim">{TRUST_LINE}</p>
        </section>

        {/* Security pillars */}
        <section className="mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            Premium. Secure. Enterprise.
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-3">
            {PILLARS.map((pillar, index) => {
              const PillarIcon = PILLAR_ICONS[index];
              return (
                <li key={pillar.id} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
                  <span className="flex size-9 items-center justify-center rounded-lg bg-hf-lime/15 text-hf-lime">
                    <PillarIcon className="size-4" aria-hidden strokeWidth={1.75} />
                  </span>
                  <h3 className="mt-4 text-sm font-semibold text-white">{pillar.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-hf-muted">{pillar.body}</p>
                </li>
              );
            })}
          </ul>
        </section>

        {/* Workspace */}
        <section className="mt-24">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
              Enterprise-level workspace
            </h2>
            <a
              href="#contact-sales"
              className="rounded-xl border border-hf-border px-4 py-2 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
            >
              Contact Sales
            </a>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {WORKSPACE_GROUPS.map((group) => (
              <div key={group.title} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
                <h3 className="text-sm font-semibold text-white">{group.title}</h3>
                <ul className="mt-3 space-y-2.5">
                  {group.items.map((item) => (
                    <li key={item} className="flex items-start gap-2.5 text-sm text-hf-muted">
                      <Check
                        className="mt-0.5 size-4 shrink-0 text-hf-lime"
                        aria-hidden
                        strokeWidth={2.5}
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* Capabilities */}
        <section className="mt-24">
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            Purpose-built for the modern creative enterprise
          </h2>
          <ul className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CAPABILITIES.map((item) => (
              <li key={item.id} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
                <h3 className="font-display text-sm font-bold tracking-tight text-hf-lime uppercase">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm font-medium text-white">{item.lead}</p>
                <p className="mt-2 text-sm leading-relaxed text-hf-muted">{item.body}</p>
              </li>
            ))}
          </ul>
        </section>

        <ContactSales />
        <EnterpriseFaq />
      </main>

      <SiteFooter />
    </>
  );
}
