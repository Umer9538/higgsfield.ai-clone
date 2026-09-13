"use client";

import { useEffect, useState } from "react";
import { Hourglass, Tag } from "lucide-react";
import { PRICING_PROMO } from "@/lib/pricing/content";

function Segment({ value, unit }: { value: number; unit: string }) {
  return (
    <div className="min-w-[68px] rounded-xl bg-black/45 px-3 py-2 text-center">
      <p className="font-display text-xl leading-none font-bold text-white tabular-nums">
        {value.toString().padStart(2, "0")}
      </p>
      <p className="mt-1 text-[10px] text-white/50">{unit}</p>
    </div>
  );
}

export function PricingPromo() {
  const [remaining, setRemaining] = useState(PRICING_PROMO.durationSeconds);

  useEffect(() => {
    const timer = setInterval(() => setRemaining((prev) => (prev > 0 ? prev - 1 : 0)), 1000);
    return () => clearInterval(timer);
  }, []);

  const hours = Math.floor(remaining / 3600);
  const minutes = Math.floor((remaining % 3600) / 60);
  const seconds = remaining % 60;

  return (
    <section className="relative overflow-hidden rounded-2xl border border-hf-border">
      <div className="absolute inset-0 bg-gradient-to-r from-[#2a0d1f] via-[#3d1030] to-[#5c1038]" />

      <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
        <div className="min-w-0">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-hf-pink px-2.5 py-1 text-[11px] font-semibold text-white uppercase">
            <Tag className="size-3" aria-hidden strokeWidth={2} />
            {PRICING_PROMO.badge}
          </span>

          <h2 className="mt-4 font-display text-2xl leading-tight font-bold tracking-tight uppercase sm:text-3xl lg:text-4xl">
            <span className="text-hf-pink">{PRICING_PROMO.headline}</span>
            <br />
            <span className="text-white">{PRICING_PROMO.subheadline}</span>
          </h2>

          <p className="mt-4 text-xs text-white/55 sm:text-sm">{PRICING_PROMO.note}</p>
        </div>

        <div className="shrink-0 rounded-2xl border border-hf-pink/40 bg-black/30 p-4">
          <p className="flex items-center gap-1.5 text-xs text-white/70">
            <Hourglass className="size-3.5 text-hf-pink" aria-hidden strokeWidth={1.75} />
            {PRICING_PROMO.countdownLabel}
          </p>
          <div className="mt-3 flex gap-2">
            <Segment value={hours} unit="hours" />
            <Segment value={minutes} unit="minutes" />
            <Segment value={seconds} unit="seconds" />
          </div>
        </div>
      </div>
    </section>
  );
}
