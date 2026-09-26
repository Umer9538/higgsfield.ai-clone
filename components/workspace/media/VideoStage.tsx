"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Columns2, Maximize2, Pause, Play, StepBack, StepForward, Volume2, VolumeX } from "lucide-react";
import { CompareLayer } from "./CompareLayer";
import { Scrubber } from "./Scrubber";
import { timecode, useMeasuredFps } from "./timing";
import { useFilmstrip } from "./useFilmstrip";

export function VideoStage({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(50);
  const [loaded, setLoaded] = useState(false);
  const fps = useMeasuredFps(videoRef);
  const strip = useFilmstrip(src);

  const toggle = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play();
    else video.pause();
  }, []);

  const seek = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video) return;
    const clamped = Math.min(Math.max(0, time), video.duration || 0);
    video.currentTime = clamped;
    setCurrent(clamped);
  }, []);

  /** Pause and move by whole frames, landing just inside the frame. */
  const stepFrames = useCallback(
    (delta: number) => {
      const video = videoRef.current;
      if (!video) return;
      video.pause();
      const frame = Math.round(video.currentTime * fps) + delta;
      seek(Math.max(0, frame) / fps + 0.001);
    },
    [fps, seek],
  );

  const jumpMarker = useCallback(
    (direction: 1 | -1) => {
      const now = videoRef.current?.currentTime ?? 0;
      const list = direction > 0 ? strip.markers : [...strip.markers].reverse();
      const target = list.find((t) => (direction > 0 ? t > now + 0.05 : t < now - 0.05));
      if (target !== undefined) seek(target);
    },
    [seek, strip.markers],
  );

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrent(video.currentTime);
    const onMeta = () => {
      setDuration(video.duration);
      setLoaded(true);
    };
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("seeked", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    // Metadata may already be in by the time this runs
    if (video.readyState >= 1) queueMicrotask(onMeta);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeked", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const overlayHidden = playing || compare;

  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-hf-border bg-black"
      // Editor keys while focus is anywhere in the player
      onKeyDown={(event) => {
        if (event.key === ",") stepFrames(-1);
        else if (event.key === ".") stepFrames(1);
        else if (event.key === "[") jumpMarker(-1);
        else if (event.key === "]") jumpMarker(1);
        else return;
        event.preventDefault();
      }}
    >
      <div className="relative">
        <video
          ref={videoRef}
          src={src}
          poster={poster}
          muted={muted}
          preload="metadata"
          loop
          playsInline
          className="aspect-video w-full"
          onClick={toggle}
        />
        {compare ? <CompareLayer source={videoRef} split={split} onSplit={setSplit} /> : null}
      </div>

      {!loaded ? <div aria-hidden data-skeleton className="skeleton absolute inset-0 overflow-hidden" /> : null}

      {/* Always mounted so it can fade and settle rather than pop; while
          hidden it leaves the accessibility tree and the tab order. */}
      <button
        type="button"
        onClick={toggle}
        aria-label="Play"
        aria-hidden={overlayHidden || undefined}
        tabIndex={overlayHidden ? -1 : undefined}
        data-play-overlay={overlayHidden ? "hidden" : "shown"}
        className={`absolute inset-0 flex items-center justify-center bg-black/30 transition-opacity duration-200 ${
          overlayHidden ? "pointer-events-none opacity-0" : "opacity-100"
        }`}
      >
        <span
          className={`flex size-14 items-center justify-center rounded-full bg-hf-accent text-black transition-transform duration-300 ease-[var(--ease-lift)] ${
            overlayHidden ? "scale-75" : "scale-100"
          }`}
        >
          <Play className="size-6 translate-x-0.5" aria-hidden fill="currentColor" strokeWidth={0} />
        </span>
      </button>

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pt-8 pb-3">
        <Scrubber current={current} duration={duration} fps={fps} strip={strip} onSeek={seek} />

        <div className="mt-1.5 flex items-center gap-1">
          <button
            type="button"
            onClick={toggle}
            aria-label={playing ? "Pause" : "Play"}
            className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            {playing ? (
              <Pause className="size-4" aria-hidden fill="currentColor" strokeWidth={0} />
            ) : (
              <Play className="size-4" aria-hidden fill="currentColor" strokeWidth={0} />
            )}
          </button>
          <button
            type="button"
            onClick={() => stepFrames(-1)}
            aria-label="Previous frame"
            title="Previous frame ( , )"
            className="hidden size-8 sm:flex items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            <StepBack className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => stepFrames(1)}
            aria-label="Next frame"
            title="Next frame ( . )"
            className="hidden size-8 sm:flex items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            <StepForward className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => {
              const video = videoRef.current;
              if (!video) return;
              video.muted = !video.muted;
              setMuted(video.muted);
            }}
            aria-label={muted ? "Unmute" : "Mute"}
            className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            {muted ? (
              <VolumeX className="size-4" aria-hidden strokeWidth={1.75} />
            ) : (
              <Volume2 className="size-4" aria-hidden strokeWidth={1.75} />
            )}
          </button>

          <span data-timecode className="ml-1 font-mono text-[11px] text-white/85 tabular-nums">
            {timecode(current, fps)}
            {/* Phones: the row fits 358px only without the duration and frame
                steps, which the , and . keys still cover */}
            <span className="hidden text-white/70 sm:inline"> / {timecode(duration, fps)}</span>
          </span>
          <span className="ml-1.5 hidden rounded bg-white/10 px-1.5 py-0.5 font-mono text-[10px] text-white/70 sm:inline" title="Measured from presented frames">
            {fps} fps
          </span>

          <button
            type="button"
            aria-pressed={compare}
            onClick={() => {
              setCompare((prev) => !prev);
              videoRef.current?.pause();
            }}
            className={`ml-auto flex h-8 items-center gap-1.5 rounded-md px-2 text-xs transition-colors ${
              compare ? "bg-hf-cyan/20 text-hf-cyan" : "text-white hover:bg-white/10"
            }`}
          >
            <Columns2 className="size-4" aria-hidden strokeWidth={1.75} />
            Compare
          </button>
          <button
            type="button"
            onClick={() => void videoRef.current?.requestFullscreen?.()}
            aria-label="Fullscreen"
            className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            <Maximize2 className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
        </div>
      </div>
    </div>
  );
}
