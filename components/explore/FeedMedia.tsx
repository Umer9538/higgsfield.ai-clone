"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FeedItem } from "@/lib/explore/content";

/**
 * Card media. Video items stream a mirrored clip, but only once the card is
 * near the viewport: attaching 45 sources at once would download tens of
 * megabytes and keep as many decoders alive. The poster holds the exact frame
 * the clip starts on, so there is no flash or layout shift when it swaps in.
 */
export function FeedMedia({ item }: { item: FeedItem }) {
  const ref = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [near, setNear] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || !item.video) return;

    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setNear(true);

          const video = ref.current;
          if (!video || reduced) continue;
          if (entry.isIntersecting) {
            // Autoplay can reject (policy, or the element was detached).
            void video.play().catch(() => {});
          } else {
            video.pause();
          }
        }
      },
      // Start fetching slightly before the card scrolls into view.
      { rootMargin: "300px 0px", threshold: 0.01 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [item.video]);

  if (!item.video) {
    return (
      <Image
        src={item.src}
        alt=""
        fill
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
        className="object-cover"
      />
    );
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      <video
        ref={ref}
        data-feed-video
        poster={item.poster}
        src={near ? item.video : undefined}
        muted
        loop
        playsInline
        autoPlay
        preload="metadata"
        aria-label={item.prompt}
        className="size-full object-cover"
      />
    </div>
  );
}
