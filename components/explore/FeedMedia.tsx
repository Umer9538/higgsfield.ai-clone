"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import type { FeedItem } from "@/lib/explore/content";

/**
 * Concurrency cap. A browser opens ~6 connections per host, and a streaming
 * video holds one open for as long as it plays. Letting every visible card
 * stream starved page navigations: measured 231ms to leave a page without
 * video versus 23.5s to leave the feed. Four at a time keeps the grid alive
 * while leaving connections free for everything else.
 */
const MAX_CONCURRENT = 4;

/**
 * Cards that are currently on screen, in the order they appeared. The first
 * MAX_CONCURRENT of them stream; the rest hold their poster. Recomputing the
 * whole set on every enter and exit keeps it self-healing — an earlier queue
 * of callbacks went stale on fast scrolls and left nothing playing.
 */
interface Entry {
  el: HTMLElement;
  setStreaming: (on: boolean) => void;
}

const visible = new Map<string, Entry>();

/**
 * Grant the slots to the topmost cards on screen. Registration order is the
 * order IntersectionObserver happens to fire, which left the first and most
 * prominent card showing a still while cards further down played.
 */
function sync() {
  const ranked = [...visible.values()]
    .map((entry) => ({ entry, box: entry.el.getBoundingClientRect() }))
    .sort((a, b) =>
      // Reading order. Cards in the same row share a top, so without the
      // left tie-break the sort is a no-op and registration order decides —
      // which left the leftmost, most prominent card showing a still.
      Math.abs(a.box.top - b.box.top) > 4 ? a.box.top - b.box.top : a.box.left - b.box.left,
    );
  ranked.forEach(({ entry }, index) => entry.setStreaming(index < MAX_CONCURRENT));
}

function enter(id: string, entry: Entry) {
  visible.set(id, entry);
  sync();
}

function exit(id: string) {
  // Tell the leaving card to stop before dropping it: sync() only walks the
  // entries that remain, so a deleted card would otherwise keep its source.
  const entry = visible.get(id);
  visible.delete(id);
  entry?.setStreaming(false);
  sync();
}

export function FeedMedia({ item }: { item: FeedItem }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const wrapRef = useRef<HTMLDivElement>(null);
  const [streaming, setStreaming] = useState(false);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || !item.video) return;

    const id = item.id;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const observer = new IntersectionObserver(
      ([entry]) =>
        entry.isIntersecting ? enter(id, { el: node, setStreaming }) : exit(id),
      { rootMargin: "0px", threshold: 0.25 },
    );

    observer.observe(node);
    return () => {
      observer.disconnect();
      exit(id);
    };
  }, [item.video, item.id]);

  // Play when a slot is granted; drop the source when it is taken away so the
  // connection and decoder are handed back.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (streaming) {
      void video.play().catch(() => {});
    } else {
      video.pause();
      video.removeAttribute("src");
      video.load();
    }
  }, [streaming]);

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
        ref={videoRef}
        data-feed-video
        poster={item.poster}
        src={streaming ? item.video : undefined}
        muted
        loop
        playsInline
        preload="none"
        aria-label={item.prompt}
        className="size-full object-cover"
      />
    </div>
  );
}
