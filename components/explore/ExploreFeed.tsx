"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { ArrowUpRight, Search } from "lucide-react";
import { CATEGORIES, FEATURE_TAGS, RAILS, SORTS, TRENDING_PROMPTS } from "@/lib/explore/content";
import { FeedVideoToggle } from "./FeedMedia";
import { FeedCard } from "./FeedCard";
import { prefersReducedMotion } from "@/lib/ui/preferences";

export function ExploreFeed() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState(SORTS[0].id);
  const [tag, setTag] = useState<string | null>(null);
  // Set by a rail's "View all" pill: focuses the feed on one model.
  const [focused, setFocused] = useState<string | null>(null);
  const backRef = useRef<HTMLButtonElement>(null);

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
          <div role="group" aria-label="Category" className="flex flex-wrap gap-1">
            {CATEGORIES.map((item) => {
              const active = category === item;
              return (
                <button
                  key={item}
                  type="button"
                  aria-pressed={active}
                  onClick={() => setCategory(item)}
                  className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                    active ? "bg-hf-surface-4 text-hf-accent-soft" : "text-hf-muted hover:text-white"
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
              className="w-full rounded-lg border border-hf-border bg-hf-surface py-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none sm:w-72"
            />
          </label>

          <label>
            <span className="sr-only">Sort the feed</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value)}
              aria-label="Sort the feed"
              className="rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white focus:border-hf-accent/50 focus:outline-none"
            >
              {SORTS.map((option) => (
                <option key={option.id} value={option.id}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <FeedVideoToggle />
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
                      ? "border-hf-accent/60 bg-hf-accent/10 text-hf-accent-soft"
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
            ref={backRef}
            type="button"
            onClick={() => {
              const from = focused;
              setFocused(null);
              // Back to the rail you came from, rather than dropping focus
              requestAnimationFrame(() => document.getElementById(`rail-${from}`)?.focus());
            }}
            className="flex min-h-11 items-center gap-1.5 rounded-full border border-hf-accent/50 px-3 text-xs text-hf-accent-soft transition-colors hover:bg-hf-accent/10 md:min-h-0 md:py-1.5"
          >
            Back to all models
          </button>
        ) : null}
      </div>

      {rails.length === 0 ? (
        <p className="mt-10 rounded-3xl border border-hf-border bg-hf-surface p-10 text-center text-sm text-hf-muted">
          Nothing matches that search.
        </p>
      ) : (
        rails.map((rail) => (
          <section key={rail.id} className="mt-14">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2
                  id={`rail-${rail.id}`}
                  tabIndex={-1}
                  // Clears the top bar and the sticky toolbar when focused
                  className="scroll-mt-44 font-display text-xl font-bold tracking-[-0.025em] text-hf-accent-soft sm:text-2xl"
                >
                  {rail.title}
                </h2>
                <p className="mt-1.5 text-sm text-hf-muted">{rail.sub}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <Link
                  href="/ai/effects"
                  className="flex min-h-11 items-center rounded-lg bg-hf-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-hf-accent-hover md:min-h-0 md:py-2"
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
                {rail.items.map((item, index) => (
                  <FeedCard key={item.id} item={item} index={index} />
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
                        // This button unmounts as the feed narrows. Scroll to the
                        // top, then hand focus to "Back to all models" without
                        // letting focus() scroll it under the two sticky bars.
                        window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
                        requestAnimationFrame(() => backRef.current?.focus({ preventScroll: true }));
                      }}
                      className="flex min-h-11 items-center gap-1.5 rounded-full bg-hf-accent px-5 text-sm font-semibold text-black shadow-lg transition-colors hover:bg-hf-accent-hover"
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
        <h2 className="font-display text-2xl font-bold tracking-[-0.025em] text-white sm:text-3xl">
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
                  window.scrollTo({ top: 0, behavior: prefersReducedMotion() ? "auto" : "smooth" });
                }}
                className="inline-flex min-h-11 items-center rounded-lg bg-hf-surface-3 px-3 py-2 text-sm text-white transition-colors hover:bg-hf-surface-4 hover:text-hf-accent-soft md:min-h-0"
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
