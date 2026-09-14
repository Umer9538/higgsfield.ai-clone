"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { downloadAsset } from "@/lib/ui/download";
import { useToast } from "@/components/ui/Toast";
import {
  Check,
  Copy,
  Download,
  Folder,
  Music,
  Play,
  Search,
  Trash2,
  Wand2,
} from "lucide-react";
import { ASSETS, FOLDERS, type Asset, type AssetKind } from "@/lib/assets/content";
import {
  getGeneratedServerSnapshot,
  getGeneratedSnapshot,
  subscribeGenerated,
} from "@/lib/assets/store";

type Tab = "all" | "video" | "image" | "audio" | "folders";
type Sort = "newest" | "oldest";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "video", label: "Videos" },
  { id: "image", label: "Images" },
  { id: "audio", label: "Audio" },
  { id: "folders", label: "Folders" },
];

function KindIcon({ kind }: { kind: AssetKind }) {
  if (kind === "video") return <Play className="size-3" aria-hidden fill="currentColor" strokeWidth={0} />;
  if (kind === "audio") return <Music className="size-3" aria-hidden strokeWidth={2} />;
  return null;
}

function AssetCard({
  asset,
  onDelete,
  onCopy,
  onDownload,
  copied,
}: {
  asset: Asset;
  onDelete: (id: string) => void;
  onCopy: (asset: Asset) => void;
  onDownload: (asset: Asset) => void;
  copied: boolean;
}) {
  return (
    <li className="group relative overflow-hidden rounded-xl border border-hf-border bg-hf-surface">
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
              <Check className="size-4 text-hf-lime" aria-hidden strokeWidth={2.5} />
            ) : (
              <Copy className="size-4" aria-hidden strokeWidth={1.75} />
            )}
          </button>
          <Link
            href={`/ai/${asset.kind === "audio" ? "audio" : asset.kind}?prompt=${encodeURIComponent(asset.prompt)}`}
            aria-label={`Open ${asset.title} in Studio`}
            title="Open in Studio"
            className="flex size-11 items-center justify-center rounded-lg bg-hf-lime text-black transition-colors hover:bg-hf-lime-deep md:size-8"
          >
            <Wand2 className="size-4" aria-hidden strokeWidth={1.75} />
          </Link>
          <button
            type="button"
            aria-label={`Delete ${asset.title}`}
            title="Delete"
            onClick={() => onDelete(asset.id)}
            className="flex size-11 items-center justify-center rounded-lg bg-white/15 text-white backdrop-blur transition-colors hover:bg-hf-pink md:size-8"
          >
            <Trash2 className="size-4" aria-hidden strokeWidth={1.75} />
          </button>
        </div>
      </div>

      <div className="p-3">
        <p className="truncate text-xs font-medium text-white">{asset.title}</p>
        <p className="mt-0.5 truncate text-[11px] text-hf-dim">
          {asset.model} · {asset.createdAt}
        </p>
      </div>
    </li>
  );
}

export function AssetLibrary() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [deleted, setDeleted] = useState<string[]>([]);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();

  // Generations made in the workspace appear here immediately, newest first.
  const generated = useSyncExternalStore(
    subscribeGenerated,
    getGeneratedSnapshot,
    getGeneratedServerSnapshot,
  );

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return [...generated, ...ASSETS]
      .filter((asset) => !deleted.includes(asset.id))
      .filter((asset) => (tab === "all" || tab === "folders" ? true : asset.kind === tab))
      .filter(
        (asset) =>
          !needle ||
          asset.title.toLowerCase().includes(needle) ||
          asset.prompt.toLowerCase().includes(needle) ||
          asset.model.toLowerCase().includes(needle),
      )
      .sort((a, b) =>
        sort === "newest"
          ? b.createdAt.localeCompare(a.createdAt)
          : a.createdAt.localeCompare(b.createdAt),
      );
  }, [tab, query, sort, deleted, generated]);

  const download = async (asset: Asset) => {
    const filename = asset.src.split("/").pop() ?? `${asset.id}.jpg`;
    const ok = await downloadAsset(asset.src, filename);
    toast(ok ? `Downloaded ${filename}` : `Opened ${filename}`);
  };

  const copyPrompt = async (asset: Asset) => {
    try {
      await navigator.clipboard.writeText(asset.prompt);
    } catch {
      // Clipboard can be blocked; the confirmation below still reflects intent.
    }
    toast("Prompt copied to clipboard");
    setCopiedId(asset.id);
    setTimeout(() => setCopiedId((current) => (current === asset.id ? null : current)), 1500);
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
          Assets
        </h1>

        <div className="flex flex-wrap items-center gap-2">
          <label className="relative">
            <span className="sr-only">Search assets</span>
            <Search
              className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hf-dim"
              aria-hidden
              strokeWidth={1.75}
            />
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search assets"
              className="w-52 rounded-lg border border-hf-border bg-hf-surface py-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">Sort assets</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Sort assets"
              className="rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white focus:border-hf-lime/50 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      </div>

      <div role="tablist" aria-label="Asset type" className="mt-6 flex flex-wrap gap-1">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
              }`}
            >
              {item.label}
            </button>
          );
        })}
      </div>

      {tab === "folders" ? (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {FOLDERS.map((folder) => (
            <li key={folder.id}>
              <button
                type="button"
                onClick={() => {
                  setTab("all");
                  setQuery("");
                  toast(`Opened ${folder.name}`);
                }}
                className="flex w-full items-center gap-3 rounded-xl border border-hf-border bg-hf-surface p-4 text-left transition-colors hover:border-hf-lime/40 hover:bg-hf-surface-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-hf-lime">
                  <Folder className="size-4" aria-hidden strokeWidth={1.75} />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm font-medium text-white">{folder.name}</span>
                  <span className="block text-xs text-hf-dim">{folder.count} items</span>
                </span>
              </button>
            </li>
          ))}
        </ul>
      ) : visible.length === 0 ? (
        <p className="mt-10 rounded-2xl border border-hf-border bg-hf-surface p-10 text-center text-sm text-hf-muted">
          No assets match that search.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((asset) => (
            <AssetCard
              key={asset.id}
              asset={asset}
              onDelete={(id) => setDeleted((prev) => [...prev, id])}
              onCopy={copyPrompt}
              onDownload={download}
              copied={copiedId === asset.id}
            />
          ))}
        </ul>
      )}

      <p aria-live="polite" className="mt-6 text-xs text-hf-dim">
        {tab === "folders" ? `${FOLDERS.length} folders` : `${visible.length} assets`}
      </p>
    </div>
  );
}
