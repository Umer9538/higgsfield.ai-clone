"use client";

import { useState } from "react";
import { Check, ChevronRight, Info, Lock, Sparkles, X, Zap } from "lucide-react";
import type { FeatureRow, Plan, PlanId } from "@/lib/pricing/content";
import type { Billing } from "./BillingToggle";

/**
 * Per-plan theming. Lime carries Pro (the recommended plan), magenta carries
 * Max, and Basic stays neutral — mirroring how the real page ranks them.
 */
const THEME: Record<PlanId, { shell: string; cta: string; name: string }> = {
  basic: {
    shell: "border-hf-border bg-hf-surface",
    cta: "bg-white text-black hover:bg-white/90",
    name: "text-white",
  },
  pro: {
    shell: "border-hf-lime/25 bg-gradient-to-b from-[#161c07] to-hf-surface",
    cta: "bg-hf-lime text-black hover:bg-hf-lime-deep",
    name: "text-white",
  },
  max: {
    shell: "border-hf-pink/30 bg-gradient-to-b from-[#2a0a1d] to-hf-surface",
    cta: "bg-gradient-to-r from-hf-magenta to-hf-pink text-white hover:opacity-90",
    name: "text-white",
  },
};

const BADGE_TONE = {
  lime: "bg-hf-lime/15 text-hf-lime",
  pink: "bg-hf-pink text-white",
  neutral: "bg-hf-surface-4 text-hf-muted",
  green: "bg-[#1a4d1a] text-[#6ee76e]",
};

function Row({ row, dimmed }: { row: FeatureRow; dimmed?: boolean }) {
  return (
    <li className="flex items-center gap-2 py-1.5 text-xs">
      {row.included ? (
        <Check className="size-3.5 shrink-0 text-hf-lime" aria-hidden strokeWidth={2.5} />
      ) : (
        <X className="size-3.5 shrink-0 text-hf-dim" aria-hidden strokeWidth={2.5} />
      )}
      <span className={row.included && !dimmed ? "text-white" : "text-hf-dim"}>{row.label}</span>

      <span className="ml-auto flex shrink-0 items-center gap-1">
        {row.badges?.map((badge) => (
          <span
            key={badge.label}
            className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${BADGE_TONE[badge.tone]}`}
          >
            {badge.label}
          </span>
        ))}
        {row.note ? <span className="text-[10px] text-hf-dim">{row.note}</span> : null}
      </span>
    </li>
  );
}

export function PlanCard({
  plan,
  billing,
  onSelect,
}: {
  plan: Plan;
  billing: Billing;
  onSelect?: (plan: Plan) => void;
}) {
  const steps = plan.credits.steps ?? [];
  const [stepIndex, setStepIndex] = useState(0);
  const [showMore, setShowMore] = useState(false);
  const theme = THEME[plan.id];

  const price = billing === "annual" ? plan.annual : plan.monthly;
  const showStrike = billing === "annual" && plan.monthly !== plan.annual;
  const yearlySaving = (plan.monthly - plan.annual) * 12;

  const credits = plan.credits.fixed ?? steps[stepIndex] ?? plan.credits.min ?? 0;
  const locked = plan.id === "basic";

  return (
    <article role="listitem" className={`flex flex-col rounded-2xl border p-5 ${theme.shell}`}>
      <header>
        <div className="flex flex-wrap items-center gap-2">
          <h3 className={`font-display text-xl font-bold tracking-tight uppercase ${theme.name}`}>
            {plan.name}
          </h3>
          {plan.discountLabel ? (
            <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-semibold text-white">
              {plan.discountLabel}
            </span>
          ) : null}
          {plan.bestValue ? (
            <span className="flex items-center gap-1 rounded bg-[#9ce6f3] px-1.5 py-0.5 text-[10px] font-semibold text-black">
              <Zap className="size-2.5" aria-hidden fill="currentColor" strokeWidth={0} />
              BEST VALUE
            </span>
          ) : null}
        </div>
        <p className="mt-1 text-xs text-hf-muted">{plan.tagline}</p>
      </header>

      {/* Credits */}
      <div className="mt-4 rounded-xl border border-hf-border bg-black/35 p-3.5">
        <p className="flex items-center gap-1.5 text-sm font-semibold text-white">
          <Sparkles className="size-3.5 text-hf-lime" aria-hidden strokeWidth={2} />
          {credits.toLocaleString()} credits/mo.
        </p>
        <ul className="mt-2 space-y-1">
          {plan.credits.approximations.map((line) => (
            <li key={line} className="text-[11px] text-hf-dim">
              {line}
            </li>
          ))}
        </ul>

        {steps.length > 1 ? (
          <div className="mt-3">
            <input
              type="range"
              min={0}
              max={steps.length - 1}
              step={1}
              value={stepIndex}
              aria-label={`${plan.name} monthly credits`}
              onChange={(event) => setStepIndex(Number(event.target.value))}
              className="h-1 w-full cursor-pointer appearance-none rounded-full accent-hf-lime"
              style={{
                background: `linear-gradient(to right, #d1fe17 ${(stepIndex / (steps.length - 1)) * 100}%, #292b2c ${(stepIndex / (steps.length - 1)) * 100}%)`,
              }}
            />
            <div className="mt-2 flex justify-between">
              {steps.map((step, index) => (
                <span
                  key={step}
                  className={`text-[11px] tabular-nums ${index === stepIndex ? "text-white" : "text-hf-dim"}`}
                >
                  {step.toLocaleString()}
                </span>
              ))}
            </div>
          </div>
        ) : plan.credits.fixedNote ? (
          <p className="mt-3 flex items-center gap-1.5 border-t border-hf-border pt-2.5 text-[11px] text-hf-muted">
            <Check className="size-3 text-hf-muted" aria-hidden strokeWidth={2.5} />
            {plan.credits.fixedNote}
          </p>
        ) : null}
      </div>

      {/* Price */}
      <div className="mt-5 flex flex-wrap items-baseline gap-2">
        {showStrike ? (
          <s className="font-display text-2xl font-bold text-hf-pink">${plan.monthly}</s>
        ) : null}
        <span className="font-display text-3xl font-bold tracking-tight text-white">${price}</span>
        <span className="text-xs text-hf-muted">
          per month, billed {billing === "annual" ? "annually" : "monthly"}
        </span>
      </div>

      <button
        type="button"
        onClick={() => onSelect?.(plan)}
        className={`mt-4 w-full rounded-xl px-5 py-3 text-sm font-semibold transition-colors ${theme.cta}`}
      >
        Get {plan.name}
      </button>

      <p className="mt-2.5 rounded-lg bg-black/30 py-2 text-center text-[11px] text-hf-muted">
        {yearlySaving > 0 && billing === "annual" ? (
          <>
            <span className="font-semibold text-white">Save ${yearlySaving}</span> compared to monthly
          </>
        ) : (
          "No difference compared to monthly"
        )}
      </p>

      {/* Unlimited */}
      <section className="mt-5 rounded-xl border border-hf-border p-3.5">
        <h4 className="flex items-center gap-1.5 text-[11px] font-semibold tracking-wide text-hf-muted uppercase">
          <Lock className="size-3" aria-hidden strokeWidth={2} />
          Unlimited & free gens
          <Info className="ml-auto size-3.5 text-hf-dim" aria-hidden strokeWidth={1.75} />
        </h4>
        <ul className="mt-2">
          {plan.unlimited.map((row) => (
            <Row key={row.label} row={row} dimmed={locked} />
          ))}
        </ul>
        {plan.unlimitedMore ? (
          <button
            type="button"
            onClick={() => setShowMore((prev) => !prev)}
            aria-expanded={showMore}
            className="mt-1.5 flex min-h-11 w-full items-center gap-1 text-[11px] font-medium text-hf-lime md:min-h-0"
          >
            {showMore ? "\u2212" : "+"} {plan.unlimitedMore}
            <ChevronRight
              className={`ml-auto size-3.5 transition-transform ${showMore ? "rotate-90" : ""}`}
              aria-hidden
              strokeWidth={2}
            />
          </button>
        ) : null}
        {showMore ? (
          <ul className="mt-2 space-y-1 border-t border-hf-border pt-2">
            {["Wan 3.0", "Grok Imagine 1.5", "MiniMax H3", "Seedream 5.0", "Recraft V4.1", "FLUX.2", "Z-Image"].map(
              (model) => (
                <li key={model} className="text-[11px] text-hf-muted">
                  {model}
                </li>
              ),
            )}
          </ul>
        ) : null}
      </section>

      {/* Seedance */}
      <section
        className={`mt-3 rounded-xl border p-3.5 ${
          plan.seedance.available ? "border-[#1d4ed8]/40 bg-[#0b1c3d]" : "border-hf-border"
        }`}
      >
        <h4 className="text-[11px] font-semibold tracking-wide uppercase">
          <span className={plan.seedance.available ? "text-white" : "text-hf-muted"}>
            {plan.seedance.heading}
          </span>
        </h4>
        <p className="mt-0.5 text-[11px] text-hf-dim">{plan.seedance.sub}</p>
        <ul className="mt-2">
          {plan.seedance.rows.map((row) => (
            <Row key={row.label} row={row} />
          ))}
        </ul>
      </section>

      <ul className="mt-4">
        {plan.capabilities.map((row) => (
          <Row key={row.label} row={row} />
        ))}
      </ul>
    </article>
  );
}
