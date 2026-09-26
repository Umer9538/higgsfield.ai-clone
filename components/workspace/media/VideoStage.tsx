"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Columns2, Maximize2, Pause, Play, StepBack, StepForward, Volume2, VolumeX } from "lucide-react";
import { CompareLayer } from "./CompareLayer";
import { useFilmstrip } from "./useFilmstrip";

const FALLBACK_FPS = 30;

/** HH:MM:SS:FF — frames, not hundredths, because editors think in frames. */
export function timecode(seconds: number, fps: number) {
  if (!Number.isFinite(seconds) || seconds < 0) seconds = 0;
  const whole = Math.floor(seconds);
  const frames = Math.floor((seconds - whole) * fps + 1e-6);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${pad(Math.floor(whole / 3600))}:${pad(Math.floor((whole % 3600) / 60))}:${pad(whole % 60)}:${pad(frames)}`;
}

/**
 * Measures the real frame rate from presented frames (mediaTime deltas via
 * requestVideoFrameCallback) instead of assuming one; median of recent
 * deltas, so a dropped frame does not skew it.
 */
function useMeasuredFps(video: React.RefObject<HTMLVideoElement | null>) {
  const [fps, setFps] = useState(FALLBACK_FPS);
  useEffect(() => {
    const el = video.current;
    if (!el || !("requestVideoFrameCallback" in el)) return;
    const deltas: number[] = [];
    let previous = -1;
    let handle = 0;
    const onFrame: VideoFrameRequestCallback = (_now, meta) => {
      if (previous >= 0 && meta.mediaTime > previous) deltas.push(meta.mediaTime - previous);
      previous = meta.mediaTime;
      if (deltas.length >= 12) {
        const sorted = [...deltas].sort((a, b) => a - b);
        const median = sorted[Math.floor(sorted.length / 2)];
        if (median > 0) setFps(Math.round(1 / median));
        return; // measured; stop listening
      }
      handle = el.requestVideoFrameCallback(onFrame);
    };
    handle = el.requestVideoFrameCallback(onFrame);
    return () => el.cancelVideoFrameCallback(handle);
  }, [video]);
  return fps;
}

export function VideoStage({ src, poster }: { src: string; poster?: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(true);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hover, setHover] = useState<{ x: number; time: number; width: number } | null>(null);
  const [compare, setCompare] = useState(false);
  const [split, setSplit] = useState(50);
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
    const onMeta = () => setDuration(video.duration);
    video.addEventListener("play", onPlay);
    video.addEventListener("pause", onPause);
    video.addEventListener("timeupdate", onTime);
    video.addEventListener("seeked", onTime);
    video.addEventListener("loadedmetadata", onMeta);
    return () => {
      video.removeEventListener("play", onPlay);
      video.removeEventListener("pause", onPause);
      video.removeEventListener("timeupdate", onTime);
      video.removeEventListener("seeked", onTime);
      video.removeEventListener("loadedmetadata", onMeta);
    };
  }, []);

  const progress = duration > 0 ? (current / duration) * 100 : 0;
  const previewIndex =
    hover && duration > 0 ? Math.min(strip.frames - 1, Math.floor((hover.time / duration) * strip.frames)) : 0;
  const PREVIEW_W = 144;
  const previewScale = PREVIEW_W / strip.frameWidth;

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

      {!playing && !compare ? (
        <button
          type="button"
          onClick={toggle}
          aria-label="Play"
          className="absolute inset-0 flex items-center justify-center bg-black/30"
        >
          <span className="flex size-14 items-center justify-center rounded-full bg-hf-accent text-black">
            <Play className="size-6 translate-x-0.5" aria-hidden fill="currentColor" strokeWidth={0} />
          </span>
        </button>
      ) : null}

      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/90 via-black/60 to-transparent px-3 pt-8 pb-3">
        {/* Scrubber: a native range for input and accessibility, drawn over a
            custom track with scene markers and a thumbnail preview. */}
        <div
          ref={trackRef}
          className="relative h-5 rounded-full has-[input:focus-visible]:outline-2 has-[input:focus-visible]:outline-offset-2 has-[input:focus-visible]:outline-hf-cyan"
          onPointerMove={(event) => {
            const rect = trackRef.current?.getBoundingClientRect();
            if (!rect || !duration) return;
            const ratio = Math.min(1, Math.max(0, (event.clientX - rect.left) / rect.width));
            setHover({ x: ratio * rect.width, time: ratio * duration, width: rect.width });
          }}
          onPointerLeave={() => setHover(null)}
        >
          <div className="absolute inset-x-0 top-1/2 h-1 -translate-y-1/2 rounded-full bg-white/25">
            <div className="h-full rounded-full bg-hf-cyan" style={{ width: `${progress}%` }} />
          </div>

          {duration > 0
            ? strip.markers.map((time) => (
                <span
                  key={time}
                  data-keyframe
                  title={`Scene change at ${timecode(time, fps)}`}
                  className="pointer-events-none absolute top-1/2 h-3 w-0.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80"
                  style={{ left: `${(time / duration) * 100}%` }}
                />
              ))
            : null}

          <span
            aria-hidden
            className="pointer-events-none absolute top-1/2 size-3.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-[0_0_0_3px_color-mix(in_srgb,var(--color-hf-cyan)_45%,transparent)]"
            style={{ left: `${progress}%` }}
          />

          <input
            type="range"
            data-seek
            min={0}
            max={duration || 0}
            step={1 / fps}
            value={current}
            aria-label="Seek"
            aria-valuetext={timecode(current, fps)}
            onChange={(event) => seek(Number(event.target.value))}
            className="absolute inset-0 size-full cursor-pointer opacity-0"
          />

          {hover ? (
            <div
              data-scrub-preview
              aria-hidden
              className="pointer-events-none absolute bottom-full mb-3 -translate-x-1/2 overflow-hidden rounded-lg border border-white/15 bg-black shadow-xl"
              style={{ left: Math.min(Math.max(hover.x, PREVIEW_W / 2), hover.width - PREVIEW_W / 2) }}
            >
              <div
                className="bg-hf-surface-3"
                style={{
                  width: PREVIEW_W,
                  height: strip.frameHeight * previewScale,
                  backgroundImage: strip.sprite ? `url(${strip.sprite})` : undefined,
                  backgroundSize: `${strip.frameWidth * strip.frames * previewScale}px ${strip.frameHeight * previewScale}px`,
                  backgroundPosition: `-${previewIndex * PREVIEW_W}px 0`,
                }}
              />
              <p className="px-2 py-1 text-center font-mono text-[10px] text-white tabular-nums">
                {timecode(hover.time, fps)}
              </p>
            </div>
          ) : null}
        </div>

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
            className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-80"
          >
            <StepBack className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
          <button
            type="button"
            onClick={() => stepFrames(1)}
            aria-label="Next frame"
            title="Next frame ( . )"
            className="flex size-8 items-center justify-center text-white transition-opacity hover:opacity-80"
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
            <span className="text-white/45"> / {timecode(duration, fps)}</span>
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
