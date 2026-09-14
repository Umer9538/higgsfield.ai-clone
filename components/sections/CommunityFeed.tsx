"use client";

import { useState } from "react";
import { MediaTile, RailHeading, tile } from "./Shared";
import { COMMUNITY } from "@/lib/sections/content";

export function CommunityFeed() {
  const [tab, setTab] = useState(COMMUNITY.tabs[0]);
  const [following, setFollowing] = useState<string[]>([]);
  const rails = tab === "Explore" ? COMMUNITY.rails : COMMUNITY.rails.filter((r) => r.title.toLowerCase().includes(tab.toLowerCase()) || tab === "Projects");

  return (
    <>
      <div role="tablist" aria-label="Community view" className="flex flex-wrap gap-1">
        {COMMUNITY.tabs.map((item) => {
          const active = tab === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      {/* Contest banner */}
      <section className="mt-6 overflow-hidden rounded-2xl border border-hf-border">
        <div className="relative bg-gradient-to-r from-[#1a1405] via-[#2a2208] to-hf-black p-6 sm:p-8">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hf-lime/15 px-2.5 py-1 text-[11px] font-semibold text-hf-lime">
            <span className="size-1.5 rounded-full bg-hf-lime" aria-hidden />
            {COMMUNITY.banner.label}
          </span>
          <p className="mt-4 font-display text-3xl font-bold tracking-tight text-hf-lime sm:text-4xl">
            {COMMUNITY.banner.prize}
          </p>
          <h2 className="mt-1 font-display text-xl font-bold tracking-tight text-white uppercase">
            {COMMUNITY.banner.title}
          </h2>
          <p className="mt-2 max-w-xl text-sm text-hf-muted">{COMMUNITY.banner.body}</p>
          <p className="mt-3 text-xs text-hf-dim">{COMMUNITY.banner.dates}</p>
          <a
            href="/contests"
            className="mt-5 inline-block rounded-xl bg-hf-lime px-5 py-2.5 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            {COMMUNITY.banner.cta}
          </a>
        </div>
      </section>

      {rails.map((rail, railIndex) => (
        <section key={rail.id} className="mt-12">
          <RailHeading title={rail.title} link={rail.link} />
          <ul className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5">
            {Array.from({ length: 5 }).map((_, index) => (
              <li key={index}>
                <MediaTile
                  src={tile(railIndex * 5 + index)}
                  label={`Project ${railIndex * 5 + index + 1}`}
                  caption={`by ${COMMUNITY.creators[index % COMMUNITY.creators.length].handle}`}
                  className={rail.id === "shots" ? "aspect-[9/16]" : "aspect-video"}
                />
              </li>
            ))}
          </ul>
        </section>
      ))}

      <section className="mt-14">
        <RailHeading title="Creators to follow" />
        <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {COMMUNITY.creators.map((creator) => (
            <li
              key={creator.handle}
              className="flex items-center gap-3 rounded-xl border border-hf-border bg-hf-surface p-4"
            >
              <span className="flex size-10 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-sm font-semibold text-hf-lime uppercase">
                {creator.handle.slice(0, 1)}
              </span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium text-white">
                  {creator.handle}
                </span>
                <span className="block text-xs text-hf-dim">
                  {creator.role} · {creator.projects} projects
                </span>
              </span>
              <button
                type="button"
                aria-pressed={following.includes(creator.handle)}
                onClick={() =>
                  setFollowing((prev) =>
                    prev.includes(creator.handle)
                      ? prev.filter((h) => h !== creator.handle)
                      : [...prev, creator.handle],
                  )
                }
                className={`shrink-0 rounded-lg border px-3 py-1.5 text-xs transition-colors ${
                  following.includes(creator.handle)
                    ? "border-hf-lime bg-hf-lime/15 text-hf-lime"
                    : "border-hf-border text-white hover:border-hf-lime/50 hover:text-hf-lime"
                }`}
              >
                {following.includes(creator.handle) ? "Following" : "Follow"}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-14 rounded-2xl border border-hf-border bg-hf-surface p-6 text-center">
        <h2 className="font-display text-lg font-bold tracking-tight text-white uppercase">
          Join the conversation
        </h2>
        <ul className="mt-4 flex flex-wrap justify-center gap-2">
          {COMMUNITY.socials.map((social) => (
            <li key={social}>
              <a
                href="#"
                className={`inline-flex min-h-11 items-center rounded-lg px-4 py-2 text-sm transition-colors md:min-h-0 ${
                  social === "Discord"
                    ? "bg-hf-lime font-semibold text-black hover:bg-hf-lime-deep"
                    : "border border-hf-border text-white hover:border-hf-lime/50"
                }`}
              >
                {social}
              </a>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
