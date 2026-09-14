import type { Metadata } from "next";
import Link from "next/link";
import { Bell, Play, Trophy } from "lucide-react";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { MediaTile, RailHeading, tile } from "@/components/sections/Shared";
import { ActionButton } from "@/components/ui/ActionButton";
import { ORIGINALS } from "@/lib/sections/content";

export const metadata: Metadata = {
  title: "Originals — Higgsfield",
  description: ORIGINALS.hero.sub,
};

export default function OriginalsPage() {
  return (
    <>
      <AppHeader activeNav="originals" />
      <main className="mx-auto max-w-6xl px-4 py-10">
        {/* Feature hero */}
        <section className="relative overflow-hidden rounded-2xl border border-hf-border">
          <div className="relative aspect-[21/9] w-full bg-gradient-to-br from-hf-surface-4 via-hf-surface-3 to-hf-black">
            <div className="absolute inset-0 flex flex-col justify-end p-6 sm:p-10">
              <h1 className="font-display text-3xl leading-tight font-bold tracking-tight text-white uppercase sm:text-4xl lg:text-5xl">
                {ORIGINALS.hero.title}
              </h1>
              <p className="mt-3 max-w-xl text-sm text-hf-muted">{ORIGINALS.hero.sub}</p>
              <ActionButton
                message="Opening the Originals player"
                className="mt-5 flex w-fit items-center gap-2"
              >
                <Play className="size-4" aria-hidden fill="currentColor" strokeWidth={0} />
                {ORIGINALS.hero.cta}
              </ActionButton>
            </div>
          </div>
        </section>

        {/* Rails */}
        {ORIGINALS.rails.map((rail, railIndex) => (
          <section key={rail.id} className="mt-12">
            <RailHeading title={rail.title} link="See all" />
            <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {ORIGINALS.films.slice(railIndex * 2, railIndex * 2 + 4).map((film, index) => (
                <li key={`${rail.id}-${film}`}>
                  <Link href="/community">
                    <MediaTile
                      src={tile(railIndex * 4 + index + 1)}
                      label={film}
                      caption="Higgsfield Studio"
                    />
                  </Link>
                </li>
              ))}
            </ul>
          </section>
        ))}

        {/* Coming soon */}
        <section className="mt-12">
          <RailHeading title={ORIGINALS.comingSoon.title} />
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-4">
            {ORIGINALS.films.slice(4, 8).map((film, index) => (
              <li key={film} className="rounded-xl border border-hf-border bg-hf-surface p-3">
                <MediaTile src={tile(index + 9)} />
                <p className="mt-2 truncate text-xs font-medium text-white">{film}</p>
                <ActionButton
                  variant="outline"
                  message={`You'll be notified when ${film} is released`}
                  toggleLabel="Notifying"
                  className="mt-2 flex w-full items-center justify-center gap-1.5 !px-2 !py-1.5 !text-[11px]"
                >
                  <Bell className="size-3" aria-hidden strokeWidth={1.75} />
                  {ORIGINALS.comingSoon.cta}
                </ActionButton>
              </li>
            ))}
          </ul>
        </section>

        {/* Winners */}
        <section className="mt-12">
          <RailHeading title={ORIGINALS.winners.title} />
          <ul className="mt-4 grid gap-3 sm:grid-cols-3">
            {ORIGINALS.winners.entries.map((entry, index) => (
              <li
                key={entry.handle}
                className={`rounded-2xl border p-5 ${
                  index === 0 ? "border-hf-lime/40 bg-hf-lime/5" : "border-hf-border bg-hf-surface"
                }`}
              >
                <Trophy
                  className={`size-4 ${index === 0 ? "text-hf-lime" : "text-hf-dim"}`}
                  aria-hidden
                  strokeWidth={1.75}
                />
                <p className="mt-3 font-display text-xl font-bold tracking-tight text-white">
                  {entry.place}
                </p>
                <p className="mt-1 text-sm text-hf-muted">{entry.handle}</p>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-xs text-hf-dim">{ORIGINALS.winners.mentions} · 10 creators</p>
        </section>

        {/* Promo */}
        <section className="mt-12 overflow-hidden rounded-2xl border border-hf-border bg-gradient-to-r from-[#161c07] to-hf-black p-6 sm:p-8">
          <span className="rounded bg-hf-pink px-2 py-0.5 text-[11px] font-semibold text-white">
            {ORIGINALS.promo.badge}
          </span>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight text-white uppercase">
            {ORIGINALS.promo.title}
          </h2>
          <p className="mt-2 text-sm text-hf-muted">{ORIGINALS.promo.sub}</p>
          <ActionButton message="Seedance 2.5 added to your workspace" className="mt-5">
            {ORIGINALS.promo.cta}
          </ActionButton>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
