"use client";

import Image from "next/image";
import { MEDIUMS, type MediumId } from "@/lib/onboarding/sandbox";

/** Step 1: one click picks the medium and moves on. */
export function MediumStep({ mediumId, chooseMedium }: { mediumId: MediumId | null; chooseMedium: (id: MediumId) => void }) {
  return (
    <>
      <h1 className="text-center font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
        What are you creating today?
      </h1>
      <p className="mt-2 text-center text-sm text-hf-muted">
        Pick one. You&apos;ll make a test frame in the next minute.
      </p>
      <div role="radiogroup" aria-label="What are you creating today?" className="mt-8 grid gap-3 sm:grid-cols-2">
        {MEDIUMS.map((item) => {
          const selected = item.id === mediumId;
          return (
            <button
              key={item.id}
              type="button"
              role="radio"
              aria-checked={selected}
              onClick={() => chooseMedium(item.id)}
              className={`press group relative overflow-hidden rounded-[var(--radius-panel)] border text-left ${
                selected
                  ? "border-hf-accent shadow-[0_0_0_1px_var(--color-hf-accent),0_18px_48px_-18px_color-mix(in_srgb,var(--color-hf-accent)_70%,transparent)]"
                  : "border-hf-border hover:border-hf-accent/50"
              }`}
            >
              <span className="relative block aspect-[16/9]">
                <Image src={item.still} alt="" fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover" />
                <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
              </span>
              <span className="absolute inset-x-0 bottom-0 p-4">
                <span className="block font-display text-lg font-bold tracking-[-0.02em] text-white">{item.label}</span>
                <span className="mt-0.5 block text-xs text-white/75">{item.description}</span>
                <span className="mt-2 block text-[11px] text-hf-accent-soft">Opens in {item.studioLabel}</span>
              </span>
            </button>
          );
        })}
      </div>
    </>
  );
}
