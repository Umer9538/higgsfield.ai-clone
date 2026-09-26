"use client";

import Link from "next/link";
import { Heart, Play, Wand2 } from "lucide-react";
import type { FeedItem } from "@/lib/explore/content";
import { useFavorites } from "@/lib/favorites";
import { useToast } from "@/components/ui/Toast";
import { FeedMedia } from "./FeedMedia";

/**
 * One generation in the feed. Remix normally opens the video studio with the
 * prompt; on the home page `onRemix` loads it into the composer instead.
 */
/**
 * Saves the card to your favourites in the backend. Visible without hover
 * once saved, so you can see what you kept at a glance.
 */
function FavoriteButton({ item }: { item: FeedItem }) {
  const { isFavorite, isPending, toggle, ready } = useFavorites();
  const { toast } = useToast();
  const saved = isFavorite(item.id);

  return (
    <button
      type="button"
      data-favorite={item.id}
      aria-pressed={saved}
      // One label; aria-pressed carries the state (swapping both read as
      // "Remove from favorites, pressed")
      aria-label={`Favorite ${item.model} by ${item.author}`}
      // Not \`disabled\` while saving: disabling the focused button blurs it and
      // drops a keyboard user's place. The click handler ignores repeats.
      disabled={!ready}
      aria-disabled={isPending(item.id) || undefined}
      onClick={async () => {
        // A repeat click while saving is ignored here, before toggle(), which
        // would report it as a failed save
        if (isPending(item.id)) return;
        const result = await toggle(item.id, `${item.model} · ${item.author}`);
        if (result === null) toast("Couldn't save that — check your connection", "info");
        else toast(result ? "Saved to favorites" : "Removed from favorites");
      }}
      className={`press absolute top-2 right-2 z-10 flex min-h-8 items-center gap-1 rounded-full px-2.5 text-[11px] backdrop-blur transition-opacity max-md:min-h-11 motion-reduce:transition-none ${
        saved
          ? "bg-hf-accent text-black"
          : "bg-black/65 text-white md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100"
      }`}
    >
      <Heart className="size-3" aria-hidden fill={saved ? "currentColor" : "none"} strokeWidth={saved ? 0 : 2} />
      {item.likes + (saved ? 1 : 0)}
    </button>
  );
}

export function FeedCard({
  item,
  onRemix,
  index = 0,
}: {
  item: FeedItem;
  onRemix?: (item: FeedItem) => void;
  /** Position in its grid, for the staggered entry */
  index?: number;
}) {
  const remixClass =
    "pointer-events-auto mt-2.5 flex min-h-11 w-full items-center justify-center gap-1.5 rounded-lg bg-hf-accent px-3 py-2 text-xs font-semibold text-black transition-colors hover:bg-hf-accent-hover md:min-h-0";
  return (
    <article
      style={{ gridRowEnd: `span ${item.span}`, "--i": index } as React.CSSProperties}
      className="hover-glow animate-rise group relative block overflow-hidden rounded-[var(--radius-media)] border border-hf-border"
    >
      <div className="relative size-full">
        <FeedMedia item={item} />
      </div>

      {/* Author + likes, revealed on hover like the real cards */}
      <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-2 transition-opacity md:opacity-0 md:group-hover:opacity-100 md:group-focus-within:opacity-100 motion-reduce:transition-none">
        <span className="flex items-center gap-1.5 rounded-full bg-black/65 py-1 pr-2.5 pl-1 text-[11px] text-white backdrop-blur">
          <span className="flex size-5 items-center justify-center rounded-full bg-hf-accent text-[9px] font-bold text-black uppercase">
            {item.author.slice(0, 1)}
          </span>
          {item.author}
        </span>
      </div>

      <FavoriteButton item={item} />

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

        {onRemix ? (
          <button type="button" onClick={() => onRemix(item)} className={`press ${remixClass}`}>
            <Wand2 className="size-3.5" aria-hidden strokeWidth={2} />
            Remix
          </button>
        ) : (
          <Link href={`/ai/video?prompt=${encodeURIComponent(item.prompt)}`} className={remixClass}>
            <Wand2 className="size-3.5" aria-hidden strokeWidth={2} />
            Remix
          </Link>
        )}
      </div>
    </article>
  );
}
