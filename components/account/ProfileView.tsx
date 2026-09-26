"use client";

import { useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Pencil, Play } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { getGeneratedServerSnapshot, getGeneratedSnapshot, subscribeGenerated } from "@/lib/assets/store";
import { SANDBOX_KEY, mediumById, studioUrl, type SandboxAnswers } from "@/lib/onboarding/sandbox";
import { useToast } from "@/components/ui/Toast";
import { useFavorites } from "@/lib/favorites";
import { SignedOut } from "./SignedOut";

let presetRaw: string | null | undefined;
let presetValue: SandboxAnswers | null = null;
/** The onboarding preset, read through useSyncExternalStore like the other stores. */
function readPreset(): SandboxAnswers | null {
  let raw: string | null = null;
  try {
    raw = window.localStorage.getItem(SANDBOX_KEY);
  } catch {
    // blocked storage
  }
  if (raw === presetRaw) return presetValue;
  presetRaw = raw;
  try {
    const parsed = raw ? JSON.parse(raw) : null;
    // Profiles written by the old quiz have no medium; ignore them
    presetValue = parsed?.medium ? (parsed as SandboxAnswers) : null;
  } catch {
    presetValue = null;
  }
  return presetValue;
}
const noopSubscribe = () => () => {};

export function ProfileView() {
  const { user, updateProfile } = useAuth();
  const { toast } = useToast();
  const generations = useSyncExternalStore(subscribeGenerated, getGeneratedSnapshot, getGeneratedServerSnapshot);
  const preset = useSyncExternalStore(noopSubscribe, readPreset, () => null);
  const favorites = useFavorites();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (!user) return <SignedOut page="profile" />;

  const name = user.displayName ?? user.handle;
  const medium = preset ? mediumById(preset.medium) : null;
  const videos = generations.filter((asset) => asset.kind === "video").length;

  return (
    <div className="mx-auto max-w-4xl py-10">
      <section className="flex flex-wrap items-center gap-5">
        <span
          aria-hidden
          className="flex size-20 items-center justify-center rounded-full bg-hf-surface-4 font-display text-3xl font-bold text-hf-accent-soft uppercase ring-2 ring-hf-accent"
        >
          {name.slice(0, 1)}
        </span>
        <div className="min-w-0 flex-1">
          {editing ? (
            <form
              onSubmit={(event) => {
                event.preventDefault();
                updateProfile({ displayName: draft });
                setEditing(false);
                toast("Profile updated");
              }}
              className="flex flex-wrap items-center gap-2"
            >
              <label className="min-w-0 flex-1">
                <span className="sr-only">Display name</span>
                <input
                  autoFocus
                  value={draft}
                  maxLength={40}
                  onChange={(event) => setDraft(event.target.value)}
                  placeholder={user.handle}
                  className="min-h-11 w-full rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-2 px-3 text-lg text-white focus:border-hf-accent/50 focus:outline-none"
                />
              </label>
              <button type="submit" className="press min-h-11 rounded-[var(--radius-control)] bg-hf-accent px-4 text-sm font-semibold text-black">
                Save
              </button>
              <button type="button" onClick={() => setEditing(false)} className="min-h-11 px-3 text-sm text-hf-muted hover:text-white">
                Cancel
              </button>
            </form>
          ) : (
            <h1 className="flex items-center gap-2 font-display text-3xl font-bold tracking-[-0.03em] text-white">
              {name}
              <button
                type="button"
                aria-label="Edit display name"
                onClick={() => {
                  setDraft(user.displayName ?? "");
                  setEditing(true);
                }}
                className="flex size-9 items-center justify-center rounded-full text-hf-dim transition-colors hover:bg-hf-surface-3 hover:text-white"
              >
                <Pencil className="size-4" aria-hidden strokeWidth={1.75} />
              </button>
            </h1>
          )}
          <p className="mt-1 text-sm text-hf-muted">
            @{user.handle} · {user.email}
          </p>
        </div>
        <Link
          href="/settings"
          className="press flex min-h-11 items-center rounded-full border border-hf-border px-4 text-sm text-white hover:border-hf-accent/50"
        >
          Settings
        </Link>
      </section>

      <dl className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Generations", value: generations.length },
          { label: "Videos", value: videos },
          { label: "Images", value: generations.length - videos },
          { label: "Favorites", value: favorites.count },
        ].map((stat) => (
          <div key={stat.label} className="rounded-[var(--radius-media)] border border-hf-border bg-hf-surface p-4">
            <dt className="text-xs text-hf-dim">{stat.label}</dt>
            <dd data-stat={stat.label} className="mt-1 font-display text-2xl font-bold text-white tabular-nums">
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
      <p className="mt-2 text-xs text-hf-dim">
        Generations are counted on this device; favourites come from your account in the database.
      </p>

      <section aria-labelledby="favorites-title" className="mt-10">
        <h2 id="favorites-title" className="font-display text-xl font-bold tracking-[-0.025em] text-white">
          Favorites
        </h2>
        {!favorites.ready ? (
          <p className="mt-3 text-sm text-hf-dim">Loading…</p>
        ) : favorites.count === 0 ? (
          <p className="mt-3 rounded-[var(--radius-panel)] border border-dashed border-hf-border p-6 text-center text-sm text-hf-muted">
            Tap the heart on anything in{" "}
            <Link href="/explore" className="text-hf-accent-soft underline-offset-2 hover:underline">
              Explore
            </Link>{" "}
            to keep it here.
          </p>
        ) : (
          <ul aria-label="Favorites" className="mt-3 flex flex-wrap gap-2">
            {favorites.items.map((item) => (
              <li key={item.itemId} className="rounded-full border border-hf-border bg-hf-surface px-3 py-1.5 text-sm text-white">
                {item.title}
              </li>
            ))}
          </ul>
        )}
      </section>

      <section aria-labelledby="preset-title" className="mt-10">
        <h2 id="preset-title" className="font-display text-xl font-bold tracking-[-0.025em] text-white">
          Your starting preset
        </h2>
        {preset && medium ? (
          <div className="gradient-border mt-3 rounded-[var(--radius-panel)] p-5">
            <p className="text-xs text-hf-dim">
              {medium.label} · opens in {medium.studioLabel}
            </p>
            <p className="mt-1.5 text-base leading-relaxed text-white">{preset.prompt}</p>
            {preset.settings.length > 0 ? (
              <ul aria-label="Preset settings" className="mt-3 flex flex-wrap gap-1.5">
                {preset.settings.map(([key, value]) => (
                  <li key={key} className="rounded-md bg-hf-surface-4 px-2 py-1 font-mono text-[11px] text-hf-muted">
                    {key} <span className="text-white">{value}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            <div className="mt-4 flex flex-wrap gap-2">
              <Link
                href={studioUrl(medium, preset.prompt, preset.settings)}
                className="press glow flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] bg-hf-accent px-4 text-sm font-semibold text-black hover:bg-hf-accent-hover"
              >
                Open this preset
                <ArrowRight className="size-4" aria-hidden strokeWidth={2.25} />
              </Link>
              <Link
                href="/welcome-quiz"
                className="press flex min-h-11 items-center rounded-[var(--radius-control)] border border-hf-border px-4 text-sm text-white hover:border-hf-accent/50"
              >
                Make a new one
              </Link>
            </div>
          </div>
        ) : (
          <div className="mt-3 rounded-[var(--radius-panel)] border border-dashed border-hf-border p-6 text-center">
            <p className="text-sm text-hf-muted">You haven&apos;t made a starting preset yet.</p>
            <Link
              href="/welcome-quiz"
              className="press mt-3 inline-flex min-h-11 items-center rounded-full bg-hf-accent px-5 text-sm font-semibold text-black hover:bg-hf-accent-hover"
            >
              Make your first frame
            </Link>
          </div>
        )}
      </section>

      <section aria-labelledby="recent-title" className="mt-10">
        <div className="flex items-center justify-between">
          <h2 id="recent-title" className="font-display text-xl font-bold tracking-[-0.025em] text-white">
            Recent generations
          </h2>
          <Link href="/assets" className="text-sm text-hf-muted transition-colors hover:text-white">
            All assets
          </Link>
        </div>
        {generations.length === 0 ? (
          <p className="mt-3 rounded-[var(--radius-panel)] border border-dashed border-hf-border p-6 text-center text-sm text-hf-muted">
            Nothing yet. Run a generation in any studio and it appears here.
          </p>
        ) : (
          <ul aria-label="Recent generations" className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {generations.slice(0, 8).map((asset, index) => (
              <li
                key={asset.id}
                style={{ "--i": index } as React.CSSProperties}
                className="hover-glow animate-rise relative aspect-video overflow-hidden rounded-[var(--radius-media)] border border-hf-border bg-hf-surface-3"
                title={asset.prompt}
              >
                {asset.poster || asset.kind === "image" ? (
                  <Image src={asset.poster ?? asset.src} alt="" fill sizes="220px" className="object-cover" />
                ) : null}
                <span className="absolute inset-x-0 bottom-0 flex items-center gap-1.5 bg-gradient-to-t from-black/85 to-transparent p-2 text-[11px] text-white">
                  {asset.kind === "video" ? <Play className="size-3" aria-hidden fill="currentColor" strokeWidth={0} /> : null}
                  <span className="truncate">{asset.model}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
