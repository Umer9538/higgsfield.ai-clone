"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { PROMO_BAR } from "@/lib/marketing/content";
import { useToast } from "@/components/ui/Toast";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function PromoBar() {
  // Seeded from config so server and client render the same first frame.
  const [remaining, setRemaining] = useState(PROMO_BAR.durationSeconds);
  const [dismissed, setDismissed] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const timer = setInterval(() => {
      setRemaining((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  if (dismissed) return null;

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <div className="relative bg-gradient-to-r from-hf-lime via-[#e8ff4d] to-hf-lime text-black">
      <div className="flex items-center gap-3 px-4 py-2.5 pr-10 sm:justify-center">
        <span className="hidden shrink-0 items-center gap-2 sm:flex">
          <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-semibold text-white uppercase">
            {PROMO_BAR.label}
          </span>
          <span className="font-mono text-sm tabular-nums">
            {pad(hours)} <span className="opacity-60">h</span> {pad(minutes)}{" "}
            <span className="opacity-60">m</span> {pad(seconds)} <span className="opacity-60">s</span>
          </span>
        </span>

        <p className="min-w-0 flex-1 truncate text-sm sm:flex-none">
          <span className="font-bold">{PROMO_BAR.lead}</span>{" "}
          <span className="hidden sm:inline">{PROMO_BAR.rest} </span>
          <span className="font-bold">{PROMO_BAR.emphasis}</span>
        </p>

        <button
          type="button"
          onClick={() => toast("54% discount applied at checkout")}
          className="hidden shrink-0 rounded-full bg-black px-4 py-2 text-xs font-semibold text-white transition-opacity hover:opacity-85 lg:block"
        >
          {PROMO_BAR.cta}
        </button>
      </div>

      <button
        type="button"
        onClick={() => setDismissed(true)}
        aria-label="Dismiss offer"
        className="absolute top-1/2 right-3 -translate-y-1/2 text-black/70 hover:text-black"
      >
        <X className="size-4" aria-hidden strokeWidth={2} />
      </button>
    </div>
  );
}
