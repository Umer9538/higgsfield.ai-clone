"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Heart, Play, Search, Wand2 } from "lucide-react";
import { CATEGORIES, FEATURE_TAGS, RAILS, SORTS, TRENDING_PROMPTS, type FeedItem } from "@/lib/explore/content";
import { FeedMedia } from "./FeedMedia";

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <article
      style={{ gridRowEnd: `span ${item.span}` }}
      className="group relative block overflow-hidden rounded-xl border border-hf-border"
    >
      <div className="relative size-full">
        <FeedMedia item={item} />
      </div>

      {/* Author + likes, revealed on hover like the real cards */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 motion-reduce:transition-none">
        <span className="flex items-center gap-1.5 rounded-full bg-black/65 py-1 pr-2.5 pl-1 text-[11px] text-white backdrop-blur">
          <span className="flex size-5 items-center justify-center rounded-full bg-hf-lime text-[9px] font-bold text-black uppercase">
            {item.author.slice(0, 1)}
          </span>
          {item.author}
        </span>
        <span className="flex items-center gap-1 rounded-full bg-black/65 px-2 py-1 text-[11px] text-white backdrop-blur">
          <Heart className="size-3" aria-hidden fill="currentColor" strokeWidth={0} />
          {item.likes}
        </span>
      </div>

      {/* Prompt, model badge, spec and Remix */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/95 via-black/70 to-transparent p-3 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 motion-reduce:transition-none">
        <p className="line-clamp-3 text-[11px] leading-relaxed text-white">{item.prompt}</p>

        <div className="mt-2 flex flex-wrap items-center gap-1.5">
          <span className="rounded bg-white/15 px-1.5 py-0.5 text-[10px] font-medium text-white backdrop-blur">
            {item.model}
          </span>
          <span className="flex items-center gap-1 rounded bg-white/15 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
            {item.kind === "video" ? (
              <Play className="size-2.5" aria-hidden fill="currentColor" strokeWidth={0} />
            ) : null}
            {item.spec}
          </span>
        </div>

        <Link
          href={`/ai/video?prompt=${encodeURIComponent(item.prompt)}`}
          className="pointer-events-auto mt-2.5 flex min-h-11 items-center justify-center gap-1.5 rounded-lg bg-hf-lime px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-hf-lime-deep md:min-h-0"
        >
          <Wand2 className="size-3.5" aria-hidden strokeWidth={2} />
          Remix
        </Link>
      </div>
    </article>
  );
}

export function ExploreFeed() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(SORTS[0].id);
  const [tag, setTag] = useState<string | null>(null);
  // Set by a rail's "View all" pill: focuses the feed on one model.
  const [focused, setFocused] = useState<string | null>(null);

  const rails = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return RAILS.filter((rail) => category === "All" || rail.category === category)
      .map((rail) => ({
        ...rail,
        items: rail.items
          .filter(
            (item) =>
              !needle ||
              item.prompt.toLowerCase().includes(needle) ||
              item.model.toLowerCase().includes(needle) ||
              item.author.toLowerCase().includes(needle),
          )
          .slice()
          .sort((a, b) =>
            sort === "most-liked"
              ? b.likes - a.likes
              : sort === "newest"
                ? a.id.localeCompare(b.id)
                : b.likes - a.likes || a.id.localeCompare(b.id),
          ),
      }))
      .filter((rail) => rail.items.length > 0)
      .filter((rail) => focused === null || rail.id === focused);
  }, [category, query, sort, focused]);

  const total = rails.reduce((sum, rail) => sum + rail.items.length, 0);

  return (
    <>
      {/* Toolbar */}
      <div className="sticky top-header z-40 -mx-4 border-b border-hf-border bg-hf-black/95 px-4 py-3 backdrop-blur">
        <div className="flex flex-wrap items-center gap-3">
          <div role="tablist" aria-label="Category" className="flex flex-wrap gap-1">
            {CATEGORIES.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
                  }`}
                >
                  {item}
                </button>
              );
            })}
          </div>

          <label className="relative ml-auto">
            <span className="sr-only">Search the feed</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hf-dim"
              aria-hidden
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search prompts, models, creators"
              className="w-full rounded-lg border border-hf-border bg-hf-surface py-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none sm:w-72"
            />
          </label>

          <label>
            <span className="sr-only">Sort the feed</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort the feed"
              className="rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white focus:border-hf-lime/50 focus:outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </div>

        {/* Trending prompt chips */}
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {TRENDING_PROMPTS.map((prompt) => {
            const active = tag === prompt;
            return (
              <li key={prompt}>
                <button
                  type="button"
                  aria-pressed={active}
                  onClick={() => {
                    setTag(active ? null : prompt);
                    setQuery(active ? "" : prompt.split(",")[0]);
                  }}
                  className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                    active
                      ? "border-hf-lime/60 bg-hf-lime/10 text-hf-lime"
                      : "border-hf-border text-hf-muted hover:text-white"
                  }`}
                >
                  {prompt}
                </button>
              </li>
            );
          })}
        </ul>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <p aria-live="polite" className="text-xs text-hf-dim">
          {total} generations
          {focused ? ` in ${RAILS.find((rail) => rail.id === focused)?.title}` : ""}
        </p>
        {focused ? (
          <button
            type="button"
            onClick={() => setFocused(null)}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-hf-lime/50 px-3 text-xs text-hf-lime transition-colors hover:bg-hf-lime/10 md:min-h-0 md:py-1.5"
          >
            Back to all models
          </button>
        ) : null}
      </div>

      {rails.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-hf-border bg-hf-surface p-10 text-center text-sm text-hf-muted">
          Nothing matches that search.
        </p>
      ) : (
        rails.map((rail) => (
          <section key={rail.id} className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-bold tracking-tight text-hf-lime uppercase sm:text-2xl">
                  {rail.title}
                </h2>
                <p className="mt-1.5 text-sm text-hf-muted">{rail.sub}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/ai/effects"
                  className="flex min-h-11 items-center rounded-lg bg-hf-lime px-4 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep md:min-h-0 md:py-2"
                >
                  {rail.cta ?? "Try free"}
                </Link>
                <Link
                  href="/academy"
                  className="flex min-h-11 items-center rounded-lg bg-white px-4 text-sm font-medium text-black transition-opacity hover:opacity-90 md:min-h-0 md:py-2"
                >
                  Learn more
                </Link>
              </div>
            </div>

            {/* Masonry clamped to a whole number of rows so the grid terminates
                deliberately instead of slicing a card mid-frame. */}
            <div className={`relative mt-4 ${rail.items.length > 6 && focused === null ? "pb-7" : ""}`}>
              <div
                className={`grid auto-rows-[12px] grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 ${
                  rail.items.length > 6 && focused === null ? "max-h-[32rem] overflow-hidden" : ""
                }`}
              >
                {rail.items.map((item) => (
                  <FeedCard key={item.id} item={item} />
                ))}
              </div>

              {rail.items.length > 6 && focused === null ? (
                <>
                  {/* Taper into the page background. Non-interactive so the
                      Remix buttons underneath stay clickable. */}
                  <div
                    data-rail-fade
                    aria-hidden
                    className="pointer-events-none absolute inset-x-0 bottom-7 h-40 bg-gradient-to-t from-hf-black via-hf-black/80 to-transparent"
                  />

                  <div className="absolute inset-x-0 bottom-0 flex justify-center">
                    <button
                      type="button"
                      data-rail-cta
                      onClick={() => {
                        setFocused(rail.id);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                      className="flex min-h-11 items-center gap-1.5 rounded-full bg-hf-lime px-5 text-sm font-semibold text-black shadow-lg transition-colors hover:bg-hf-lime-deep"
                    >
                      View all {rail.title}
                      <ArrowUpRight className="size-4" aria-hidden strokeWidth={2.5} />
                    </button>
                  </div>
                </>
              ) : null}
            </div>
          </section>
        ))
      )}

      <section className="mt-20 text-center">
        <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          Explore more AI features
        </h2>
        <ul className="mx-auto mt-6 flex max-w-4xl flex-wrap justify-center gap-2">
          {FEATURE_TAGS.map((item) => (
            <li key={item}>
              <button
                type="button"
                onClick={() => {
                  setFocused(null);
                  setCategory("All");
                  setQuery(item);
                  window.scrollTo({ top: 0, behavior: "smooth" });
                }}
                className="inline-flex min-h-11 items-center rounded-lg bg-hf-surface-3 px-3 py-2 text-sm text-white transition-colors hover:bg-hf-surface-4 hover:text-hf-lime md:min-h-0"
              >
                {item}
              </button>
            </li>
          ))}
        </ul>
      </section>
    </>
  );
}
