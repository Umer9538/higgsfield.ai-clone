"use client";

import { useState } from "react";
import { useToast } from "./Toast";
import { downloadAsset } from "@/lib/ui/download";

type Variant = "lime" | "outline" | "ghost" | "white";

const VARIANTS: Record<Variant, string> = {
  lime: "bg-hf-lime text-black hover:bg-hf-lime-deep font-semibold",
  outline: "border border-hf-border text-white hover:border-hf-lime/50 hover:text-hf-lime",
  ghost: "text-hf-muted hover:text-white",
  white: "bg-white text-black hover:bg-white/90 font-medium",
};

/**
 * Button for actions with no backend behind them. Every click produces
 * explicit feedback — a toast, a toggled label, or a real file download.
 */
export function ActionButton({
  children,
  message,
  variant = "lime",
  className = "",
  toggleLabel,
  download,
  ariaLabel,
}: {
  children: React.ReactNode;
  message: string;
  variant?: Variant;
  className?: string;
  /** When set, the label swaps to this after activation and stays */
  toggleLabel?: string;
  /** { url, filename } triggers a real download from public/media */
  download?: { url: string; filename: string };
  ariaLabel?: string;
}) {
  const { toast } = useToast();
  const [done, setDone] = useState(false);

  return (
    <button
      type="button"
      aria-label={ariaLabel}
      aria-pressed={toggleLabel ? done : undefined}
      onClick={async () => {
        if (download) {
          const ok = await downloadAsset(download.url, download.filename);
          toast(ok ? `Downloaded ${download.filename}` : `Opened ${download.filename}`);
        } else {
          toast(message, "info");
        }
        if (toggleLabel) setDone((prev) => !prev);
      }}
      className={`rounded-xl px-5 py-3 text-sm transition-colors ${VARIANTS[variant]} ${className}`}
    >
      {done && toggleLabel ? toggleLabel : children}
    </button>
  );
}
