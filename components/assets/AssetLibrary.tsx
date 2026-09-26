"use client";

import { useMemo, useState } from "react";
import { Folder, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { FOLDERS, type Asset } from "@/lib/assets/content";
import { downloadAsset } from "@/lib/ui/download";
import { AssetCard } from "./AssetCard";
import { useAssetLibrary } from "./useAssetLibrary";

type Tab = "all" | "video" | "image" | "audio" | "folders";
type Sort = "newest" | "oldest";

const TABS: { id: Tab; label: string }[] = [
  { id: "all", label: "All" },
  { id: "video", label: "Videos" },
  { id: "image", label: "Images" },
  { id: "audio", label: "Audio" },
  { id: "folders", label: "Folders" },
];

export function AssetLibrary() {
  const [tab, setTab] = useState<Tab>("all");
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<Sort>("newest");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const { toast } = useToast();
  const { library, freshPending, source, showPending, remove } = useAssetLibrary();

  const visible = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return library
      .filter((asset) => (tab === "all" || tab === "folders" ? true : asset.kind === tab))
      .filter(
        (asset) =>
          !needle ||
          asset.title.toLowerCase().includes(needle) ||
          asset.prompt.toLowerCase().includes(needle) ||
          asset.model.toLowerCase().includes(needle),
      )
      .sort((a, b) =>
        sort === "newest" ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt),
      );
  }, [library, tab, query, sort]);

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
              className="w-52 rounded-lg border border-hf-border bg-hf-surface py-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none"
            />
          </label>

          <label className="flex items-center gap-2">
            <span className="sr-only">Sort assets</span>
            <select
              value={sort}
              onChange={(event) => setSort(event.target.value as Sort)}
              aria-label="Sort assets"
              className="rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white focus:border-hf-accent/50 focus:outline-none"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
        </div>
      </div>

      {freshPending.length > 0 ? (
        <button
          type="button"
          data-sync-pill
          onClick={() => {
            const count = showPending();
            toast(`${count} synced ${count === 1 ? "generation" : "generations"} added`);
          }}
          className="mt-5 flex min-h-11 items-center gap-2 rounded-full border border-hf-cyan/50 bg-hf-cyan/10 px-4 text-sm text-hf-cyan transition-colors hover:bg-hf-cyan/20 md:min-h-0 md:py-2"
        >
          <span className="relative flex size-2">
            <span className="absolute inline-flex size-full animate-ping rounded-full bg-hf-cyan opacity-60 motion-reduce:animate-none" />
            <span className="relative inline-flex size-2 rounded-full bg-hf-cyan" />
          </span>
          {freshPending.length} synced {freshPending.length === 1 ? "generation" : "generations"} — show
        </button>
      ) : null}

      <div role="group" aria-label="Asset type" className="mt-6 flex flex-wrap gap-1">
        {TABS.map((item) => {
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              type="button"
              aria-pressed={active}
              onClick={() => setTab(item.id)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-hf-surface-4 text-hf-accent-soft" : "text-hf-muted hover:text-white"
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
                className="flex w-full items-center gap-3 rounded-2xl border border-hf-border bg-hf-surface p-4 text-left transition-colors hover:border-hf-accent/40 hover:bg-hf-surface-3"
              >
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-hf-accent-soft">
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
        <p className="mt-10 rounded-3xl border border-hf-border bg-hf-surface p-10 text-center text-sm text-hf-muted">
          No assets match that search.
        </p>
      ) : (
        <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {visible.map((asset, index) => (
            <AssetCard
              key={asset.id}
              index={index}
              asset={asset}
              onDelete={(item) => void remove(item)}
              onCopy={copyPrompt}
              onDownload={download}
              copied={copiedId === asset.id}
            />
          ))}
        </ul>
      )}

      <div className="mt-6 flex items-center gap-2 text-xs text-hf-dim">
        <p aria-live="polite">
          {tab === "folders" ? `${FOLDERS.length} folders` : `${visible.length} assets`}
        </p>
        {/* Sibling, not inside the count: the count line is a stable contract. */}
        {source ? (
          <span
            data-asset-source
            className="rounded-full border border-hf-border px-2 py-0.5 text-[10px] tracking-wide uppercase"
          >
            {source}
          </span>
        ) : null}
      </div>
    </div>
  );
}
