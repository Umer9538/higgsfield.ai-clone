"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowRight, ArrowUpRight, Clapperboard, Image as ImageIcon, Video } from "lucide-react";
import { FeedCard } from "@/components/explore/ExploreFeed";
import { useToast } from "@/components/ui/Toast";
import { CATEGORIES, RAILS, type FeedItem } from "@/lib/explore/content";

const MODES = [
  { id: "image", label: "Image", href: "/ai/image", icon: ImageIcon },
  { id: "video", label: "Video", href: "/ai/video", icon: Video },
  { id: "cinema", label: "Cinema", href: "/ai/cinema-studio", icon: Clapperboard },
] as const;

type ModeId = (typeof MODES)[number]["id"];

/** Starting points: each fills the composer and picks the right studio. */
const STARTERS: { label: string; mode: ModeId; prompt: string }[] = [
  { label: "Product ad", mode: "image", prompt: "Product hero shot of a glass serum bottle on wet stone, soft rim light" },
  { label: "Portrait", mode: "image", prompt: "Editorial portrait by a rain-streaked window, 85mm, soft window light" },
  { label: "Motion shot", mode: "video", prompt: "Slow dolly through a neon-lit Tokyo alley after rain, shallow depth of field" },
  { label: "Film scene", mode: "cinema", prompt: "A lone rider crossing a salt flat at dusk, anamorphic lens, golden hour" },
];

const FEED_LIMIT = 20;

/** Every feed item once, tagged with its rail's category. */
const FEED: (FeedItem & { category: string })[] = (() => {
  const seen = new Set<string>();
  return RAILS.flatMap((rail) => rail.items.map((item) => ({ ...item, category: rail.category }))).filter(
    (item) => (seen.has(item.id) ? false : (seen.add(item.id), true)),
  );
})();

/**
 * The home page is where you start making, not a shop window: a composer
 * first, then one feed of what others made. Remix loads a prompt into the
 * composer above rather than navigating away.
 */
export function Launchpad() {
  const router = useRouter();
  const { toast } = useToast();
  const [prompt, setPrompt] = useState("");
  const [mode, setMode] = useState<ModeId>("video");
  const [category, setCategory] = useState("All");
  const composer = useRef<HTMLTextAreaElement>(null);

  const current = MODES.find((item) => item.id === mode)!;
  const matching = useMemo(
    () => FEED.filter((item) => category === "All" || item.category === category),
    [category],
  );

  const submit = () => {
    const text = prompt.trim();
    router.push(text ? `${current.href}?prompt=${encodeURIComponent(text)}` : current.href);
  };

  const remix = (item: FeedItem) => {
    setPrompt(item.prompt);
    setMode(item.kind === "video" ? "video" : "image");
    window.scrollTo({ top: 0, behavior: "smooth" });
    composer.current?.focus({ preventScroll: true });
    toast("Prompt loaded — press Create to open the studio", "info");
  };

  return (
    <>
      <section aria-labelledby="launch-title" className="relative isolate px-1 pt-14 pb-10 sm:pt-20">
        {/* Light source behind the composer */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-80 max-w-3xl bg-[radial-gradient(ellipse_at_center,color-mix(in_srgb,var(--color-hf-accent)_22%,transparent),transparent_70%)]"
        />

        <h1
          id="launch-title"
          className="text-center font-display text-4xl leading-[1.05] font-bold tracking-[-0.035em] text-white sm:text-6xl"
        >
          What do you want to make?
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-center text-balance text-hf-muted">
          Describe it once. We open the right studio with your prompt ready.
        </p>

        <form
          onSubmit={(event) => {
            event.preventDefault();
            submit();
          }}
          className="gradient-border mx-auto mt-8 max-w-3xl rounded-[var(--radius-panel)] p-3 shadow-[0_30px_80px_-30px_color-mix(in_srgb,var(--color-hf-accent)_45%,transparent)]"
        >
          <label htmlFor="launch-prompt" className="sr-only">
            Describe what you want to make
          </label>
          <textarea
            id="launch-prompt"
            ref={composer}
            rows={3}
            value={prompt}
            onChange={(event) => setPrompt(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                submit();
              }
            }}
            placeholder="A fox in fresh snow at dusk, 35mm, breath visible in the cold…"
            className="w-full resize-none bg-transparent px-2 pt-1 text-base leading-relaxed text-white placeholder:text-hf-dim focus:outline-none"
          />

          <div className="mt-2 flex flex-wrap items-center gap-2">
            <div role="group" aria-label="Output" className="flex rounded-[var(--radius-control)] bg-hf-surface-3 p-1">
              {MODES.map((item) => {
                const active = item.id === mode;
                const ModeIcon = item.icon;
                return (
                  <button
                    key={item.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setMode(item.id)}
                    className={`press flex min-h-11 items-center gap-1.5 rounded-lg px-3 text-sm transition-colors sm:min-h-9 ${
                      active ? "bg-hf-surface-4 font-medium text-white" : "text-hf-muted hover:text-white"
                    }`}
                  >
                    <ModeIcon className="size-4" aria-hidden strokeWidth={1.75} />
                    {item.label}
                  </button>
                );
              })}
            </div>

            <span className="ml-auto hidden text-xs text-hf-dim sm:block">Enter to create</span>
            <button
              type="submit"
              className="press glow flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-hf-accent px-5 text-sm font-semibold text-black transition-colors hover:bg-hf-accent-hover max-sm:ml-auto"
            >
              Create
              <ArrowRight className="size-4" aria-hidden strokeWidth={2.25} />
            </button>
          </div>
        </form>

        <ul
          aria-label="Starting points"
          className="-mx-4 mt-4 flex gap-2 overflow-x-auto px-4 [scrollbar-width:none] sm:mx-auto sm:max-w-3xl sm:flex-wrap sm:justify-center sm:overflow-visible sm:px-0"
        >
          {STARTERS.map((starter) => (
            <li key={starter.label} className="shrink-0">
              <button
                type="button"
                onClick={() => {
                  setPrompt(starter.prompt);
                  setMode(starter.mode);
                  composer.current?.focus();
                }}
                className="press flex min-h-11 items-center rounded-full border border-hf-border px-4 text-sm text-hf-muted transition-colors hover:border-hf-accent/50 hover:text-white sm:min-h-9"
              >
                {starter.label}
              </button>
            </li>
          ))}
        </ul>
      </section>

      <section aria-labelledby="feed-title" className="mt-6">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hf-border pb-3">
          <h2 id="feed-title" className="font-display text-xl font-bold tracking-[-0.025em] text-white">
            Made with Higgsfield
          </h2>
          <div role="tablist" aria-label="Feed filter" className="flex gap-1">
            {CATEGORIES.map((item) => (
              <button
                key={item}
                type="button"
                role="tab"
                aria-selected={category === item}
                onClick={() => setCategory(item)}
                className={`flex min-h-11 items-center rounded-lg px-3 text-sm transition-colors sm:min-h-9 ${
                  category === item ? "bg-hf-surface-4 text-hf-accent-soft" : "text-hf-muted hover:text-white"
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-4 grid auto-rows-[12px] grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5">
          {matching.slice(0, FEED_LIMIT).map((item, index) => (
            <FeedCard key={item.id} item={item} onRemix={remix} index={index} />
          ))}
        </div>

        <div className="mt-8 flex justify-center">
          <Link
            href="/explore"
            className="press flex min-h-11 items-center gap-1.5 rounded-full border border-hf-border px-5 text-sm font-medium text-white transition-colors hover:border-hf-accent/50"
          >
            See all {matching.length} in Explore
            <ArrowUpRight className="size-4" aria-hidden strokeWidth={2} />
          </Link>
        </div>
      </section>
    </>
  );
}
