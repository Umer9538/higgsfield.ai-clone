"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { Pause, Play } from "lucide-react";
import type { FeedItem } from "@/lib/explore/content";
import { setPreference, usePreferences } from "@/lib/ui/preferences";

/**
 * Concurrency cap. Streaming video competes with navigation for the
 * connection: letting every visible card stream measured 23.5s to leave the
 * feed against 231ms for a page without video. Four at a time keeps the grid
 * alive; clips are also 6-second loops (~0.3MB) so each stream is short.
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
  if (Date.now() < suspendedUntil) {
    visible.forEach((entry) => entry.setStreaming(false));
    return;
  }
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

/**
 * Navigation intent. Even four streams can crowd out the next page on a slow
 * link: measured on the deployment, leaving the home feed took 17.6s against
 * 117ms from a page without video. So the moment a press lands on something
 * that navigates, every stream is aborted and the navigation gets the whole
 * connection. If nothing navigates, streaming resumes shortly after.
 */
const RESUME_AFTER_MS = 3000;
let suspendedUntil = 0;
let listening = false;

const NAVIGATES = 'a[href]:not([href^="#"]):not([target="_blank"]), button[type="submit"]';

function suspend() {
  suspendedUntil = Date.now() + RESUME_AFTER_MS;
  visible.forEach((entry) => entry.setStreaming(false));
  window.setTimeout(sync, RESUME_AFTER_MS + 50);
}

function listenForIntent() {
  if (listening) return;
  listening = true;
  const target = (event: Event) => event.target as Element | null;
  // Mouse and pen: suspend on press, the earliest signal. Touch: a press is
  // also how every scroll swipe begins, and suspending then froze the feed
  // while scrolling on phones, so touch waits for click (a real tap), which
  // still runs, in capture, before the link's own navigation handler.
  document.addEventListener(
    "pointerdown",
    (event) => {
      if (event.pointerType !== "touch" && target(event)?.closest?.(NAVIGATES)) suspend();
    },
    true,
  );
  document.addEventListener(
    "click",
    (event) => {
      if (target(event)?.closest?.(NAVIGATES)) suspend();
    },
    true,
  );
  document.addEventListener(
    "keydown",
    (event) => {
      if (event.key !== "Enter") return;
      const el = target(event);
      // Links and submits, a composer's Enter-to-create, and the ⌘K palette
      if (el?.closest?.(`${NAVIGATES}, form, [role="dialog"]`)) suspend();
    },
    true,
  );
}

function enter(id: string, entry: Entry) {
  listenForIntent();
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
  const { reducedMotion, pauseVideo } = usePreferences();
  // Until the still (image or poster) has loaded, a glass shimmer holds the
  // card; the still then fades in over it and the shimmer is removed, so no
  // infinite animation keeps running under loaded cards.
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (!item.poster) return;
    // The browser shares this request with the <video>'s own poster fetch
    const probe = new window.Image();
    probe.onload = probe.onerror = () => setReady(true);
    probe.src = item.poster;
    return () => {
      probe.onload = probe.onerror = null;
    };
  }, [item.poster]);

  useEffect(() => {
    const node = wrapRef.current;
    if (!node || !item.video) return;

    const id = item.id;
    // Stills only when the OS or the in-app setting asks for less motion, or
    // the viewer paused feed video
    const still = reducedMotion || pauseVideo || window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (still) return;

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
  }, [item.video, item.id, reducedMotion, pauseVideo]);

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

  const skeleton = ready ? null : <div aria-hidden data-skeleton className="skeleton absolute inset-0 overflow-hidden" />;
  const fade = `transition-opacity duration-300 ${ready ? "opacity-100" : "opacity-0"}`;

  if (!item.video) {
    return (
      <>
        {skeleton}
        <Image
          src={item.src}
          alt=""
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          onLoad={() => setReady(true)}
          className={`object-cover ${fade}`}
        />
      </>
    );
  }

  return (
    <div ref={wrapRef} className="absolute inset-0">
      {skeleton}
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
        className={`relative size-full object-cover ${fade}`}
      />
    </div>
  );
}

/**
 * Pause or resume every feed video; the choice is remembered. One label with
 * aria-pressed carrying the state. Hidden when reduced motion is on (either
 * setting), where the feed already shows stills and it would do nothing.
 */
export function FeedVideoToggle() {
  const { pauseVideo, reducedMotion } = usePreferences();
  if (reducedMotion) return null;
  return (
    <button
      type="button"
      aria-pressed={pauseVideo}
      onClick={() => setPreference("pauseVideo", !pauseVideo)}
      className="press flex min-h-11 items-center gap-1.5 rounded-lg border border-hf-border px-3 text-sm text-hf-muted transition-colors hover:text-white motion-reduce:hidden sm:min-h-9"
    >
      {pauseVideo ? <Play className="size-3.5" aria-hidden fill="currentColor" strokeWidth={0} /> : <Pause className="size-3.5" aria-hidden fill="currentColor" strokeWidth={0} />}
      Pause videos
    </button>
  );
}
