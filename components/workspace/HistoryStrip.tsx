"use client";

import { useSyncExternalStore } from "react";
import Image from "next/image";
import Link from "next/link";
import { Play } from "lucide-react";
import {
  getGeneratedServerSnapshot,
  getGeneratedSnapshot,
  subscribeGenerated,
} from "@/lib/assets/store";

const SHOWN = 8;

/**
 * Your last few generations under the prompt bar, so you can compare takes
 * without leaving the studio. Height is reserved even when empty: history
 * only exists client-side, and a strip that appeared after hydration would
 * push the prompt bar up.
 */
export function HistoryStrip() {
  const assets = useSyncExternalStore(subscribeGenerated, getGeneratedSnapshot, getGeneratedServerSnapshot);
  const recent = assets.slice(0, SHOWN);

  return (
    <div className="mt-2.5 flex h-12 items-center gap-2 overflow-x-auto [scrollbar-width:none]">
      <span className="shrink-0 pr-1 text-[11px] font-medium text-hf-dim">Recent</span>
      {recent.length === 0 ? (
        <span className="text-xs text-hf-dim/80">Your generations will line up here.</span>
      ) : (
        <ul aria-label="Recent generations" className="flex gap-2">
          {recent.map((asset) => (
            <li key={asset.id}>
              <Link
                href="/assets"
                title={asset.prompt}
                aria-label={`${asset.title}: ${asset.prompt}`}
                className="hover-glow relative block size-12 overflow-hidden rounded-lg border border-hf-border"
              >
                {asset.poster || asset.kind === "image" ? (
                  <Image src={asset.poster ?? asset.src} alt="" fill sizes="48px" className="object-cover" />
                ) : (
                  <span className="absolute inset-0 bg-hf-surface-4" />
                )}
                {asset.kind === "video" ? (
                  <Play
                    className="absolute right-1 bottom-1 size-3 text-white drop-shadow"
                    aria-hidden
                    fill="currentColor"
                    strokeWidth={0}
                  />
                ) : null}
              </Link>
            </li>
          ))}
        </ul>
      )}
      <Link href="/assets" className="ml-auto shrink-0 px-2 text-xs text-hf-muted transition-colors hover:text-white">
        All assets
      </Link>
    </div>
  );
}
