"use client";

import Image from "next/image";
import Link from "next/link";
import { Check, Copy, Download, Music, Play, Trash2, Wand2 } from "lucide-react";
import type { Asset, AssetKind } from "@/lib/assets/content";

function KindIcon({ kind }: { kind: AssetKind }) {
  if (kind === "video") return <Play className="size-3" aria-hidden fill="currentColor" strokeWidth={0} />;
  if (kind === "audio") return <Music className="size-3" aria-hidden strokeWidth={2} />;
  return null;
}

export function AssetCard({
  asset,
  onDelete,
  onCopy,
  onDownload,
  copied,
  index,
}: {
  index: number;
  asset: Asset;
  onDelete: (asset: Asset) => void;
  onCopy: (asset: Asset) => void;
  onDownload: (asset: Asset) => void;
  copied: boolean;
}) {
  return (
    <li
      style={{ "--i": index } as React.CSSProperties}
      className="hover-glow animate-rise group relative overflow-hidden rounded-2xl border border-hf-border bg-hf-surface"
    >
      <div className="relative aspect-video w-full bg-hf-surface-3">
        {asset.kind === "audio" ? (
          <span className="flex h-full items-center justify-center text-hf-dim">
            <Music className="size-7" aria-hidden strokeWidth={1.5} />
          </span>
        ) : (
          <Image
            src={asset.kind === "video" ? (asset.poster ?? asset.src) : asset.src}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover"
          />
        )}

        <span className="absolute top-2 left-2 flex items-center gap-1 rounded bg-black/70 px-1.5 py-0.5 text-[10px] text-white backdrop-blur">
          <KindIcon kind={asset.kind} />
          {asset.meta}
        </span>

        {/* Hover actions */}
        <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/65 transition-opacity md:pointer-events-none md:opacity-0 md:group-hover:pointer-events-auto md:group-hover:opacity-100 md:group-focus-within:pointer-events-auto md:group-focus-within:opacity-100 motion-reduce:transition-none">
          <button
            type="button"
            aria-label={`Download ${asset.title}`}
            title="Download"
            onClick={() => onDownload(asset)}
            className="flex size-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 md:size-8"
          >
            <Download className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
          <button
            type="button"
            aria-label={`Copy prompt for ${asset.title}`}
            title="Copy Prompt"
            onClick={() => onCopy(asset)}
            className="flex size-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25 md:size-8"
          >
            {copied ? (
              <Check className="size-4 text-hf-accent-soft" aria-hidden strokeWidth={2.5} />
            ) : (
              <Copy className="size-4" aria-hidden strokeWidth={1.75} />
            )}
          </button>
          <Link
            href={`/ai/${asset.kind === "audio" ? "audio" : asset.kind}?prompt=${encodeURIComponent(asset.prompt)}`}
            aria-label={`Open ${asset.title} in Studio`}
            title="Open in Studio"
            className="flex size-11 items-center justify-center rounded-lg bg-hf-accent text-black transition-colors hover:bg-hf-accent-hover md:size-8"
          >
            <Wand2 className="size-4" aria-hidden strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${asset.title}`}
            title="Delete"
            onClick={() => onDelete(asset)}
            className="flex size-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-colors hover:bg-hf-danger md:size-8"
          >
            <Trash2 className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-medium text-white">{asset.title}</p>
        {/* What you asked for is how you find it again */}
        <p className="mt-0.5 truncate text-[11px] text-hf-muted" title={asset.prompt}>
          {asset.prompt}
        </p>
        <p className="mt-0.5 truncate text-[11px] text-hf-dim">
          {asset.model} · {asset.createdAt}
        </p>
      </div>
    </li>
  );
}
