"use client";

import { useMemo, useState } from "react";
import { Check, Info, Plus, X } from "lucide-react";
import { CALCULATOR, PLANS } from "@/lib/pricing/content";
import { BillingToggle, type Billing } from "./BillingToggle";

/** Cheapest plan whose monthly credit ceiling covers the estimate. */
function recommendPlan(credits: number) {
  const ordered = [...PLANS].sort((a, b) => a.annual - b.annual);
  const fit = ordered.find((plan) => {
    const ceiling = plan.credits.fixed ?? plan.credits.max ?? 0;
    return ceiling >= credits;
  });
  return fit ?? ordered[ordered.length - 1];
}

export function Calculator() {
  const [goals, setGoals] = useState<string[]>(["social"]);
  const [counts, setCounts] = useState<Record<string, number>>(
    Object.fromEntries(CALCULATOR.sliders.map((slider) => [slider.id, slider.defaultValue])),
  );
  const [features, setFeatures] = useState<string[]>(CALCULATOR.features.map((f) => f.id));
  const [billing, setBilling] = useState<Billing>("annual");

  const credits = useMemo(
    () =>
      CALCULATOR.sliders.reduce(
        (total, slider) => total + (counts[slider.id] ?? 0) * slider.creditsEach,
        0,
      ),
    [counts],
  );

  const plan = recommendPlan(credits);
  const ceiling = plan.credits.fixed ?? plan.credits.max ?? 1;
  const usage = Math.min(100, (credits / ceiling) * 100);
  const price = billing === "annual" ? plan.annual : plan.monthly;
  const saving = (plan.monthly - plan.annual) * 12;

  const toggle = (list: string[], id: string) =>
    list.includes(id) ? list.filter((item) => item !== id) : [...list, id];

  return (
    <section id="calculator" className="mt-16 scroll-mt-20">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Find the best plan for you
      </h2>
      <p className="mt-2 text-sm text-hf-muted">{CALCULATOR.intro}</p>

      <div className="mt-4 grid gap-4 rounded-2xl border border-hf-border bg-hf-surface p-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)] sm:p-6">
        {/* Steps */}
        <div className="space-y-8">
          <div>
            <h3 className="flex items-baseline gap-2 text-sm font-semibold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-hf-surface-4 text-[11px] text-hf-muted">
                1
              </span>
              What are you here to make?
            </h3>
            <p className="mt-1 ml-7 text-xs text-hf-dim">Multiple options can be selected</p>

            <div className="mt-3 ml-7 grid gap-2 sm:grid-cols-2">
              {CALCULATOR.goals.map((goal) => {
                const active = goals.includes(goal.id);
                return (
                  <button
                    key={goal.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setGoals((prev) => toggle(prev, goal.id))}
                    className={`flex items-center justify-between gap-2 rounded-xl border px-3 py-2.5 text-left text-xs transition-colors ${
                      active
                        ? "border-hf-lime/60 bg-hf-lime/10 text-white"
                        : "border-hf-border bg-hf-surface-2 text-hf-muted hover:text-white"
                    }`}
                  >
                    {goal.label}
                    <span
                      className={`flex size-4 shrink-0 items-center justify-center rounded border ${
                        active ? "border-hf-lime bg-hf-lime text-black" : "border-hf-border"
                      }`}
                    >
                      {active ? <Check className="size-3" aria-hidden strokeWidth={3} /> : null}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="flex items-baseline gap-2 text-sm font-semibold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-hf-surface-4 text-[11px] text-hf-muted">
                2
              </span>
              How many content items per month?
            </h3>

            <div className="mt-3 ml-7 space-y-6">
              {CALCULATOR.sliders.map((slider) => {
                const value = counts[slider.id] ?? 0;
                const percent = (value / slider.max) * 100;
                return (
                  <div key={slider.id}>
                    <p className="text-[11px] text-hf-dim">{slider.note}</p>
                    <input
                      type="range"
                      min={0}
                      max={slider.max}
                      value={value}
                      aria-label={slider.label}
                      onChange={(event) =>
                        setCounts((prev) => ({ ...prev, [slider.id]: Number(event.target.value) }))
                      }
                      className="mt-2 h-1 w-full cursor-pointer appearance-none rounded-full accent-hf-lime"
                      style={{
                        background: `linear-gradient(to right, #d1fe17 ${percent}%, #292b2c ${percent}%)`,
                      }}
                    />
                    <div className="mt-1.5 flex items-center justify-between text-[11px]">
                      <span className="text-white">
                        ~{value} {slider.label}{" "}
                        <span className="text-hf-dim">
                          {(value * slider.creditsEach).toLocaleString()} credits
                        </span>
                      </span>
                      <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-hf-dim">
                        {slider.max}+
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="flex items-baseline gap-2 text-sm font-semibold text-white">
              <span className="flex size-5 items-center justify-center rounded-md bg-hf-surface-4 text-[11px] text-hf-muted">
                3
              </span>
              Features &amp; capabilities
              <span className="ml-auto flex items-center gap-1.5 rounded-lg bg-hf-surface-4 px-2.5 py-1 text-[11px] text-white">
                <Plus className="size-3" aria-hidden strokeWidth={2.5} />
                Add features
                <span className="rounded-full bg-hf-lime px-1.5 text-[10px] font-semibold text-black">
                  {features.length}
                </span>
              </span>
            </h3>
            <p className="mt-1 ml-7 text-xs text-hf-dim">Add anything else you&apos;ll need</p>

            <div className="mt-3 ml-7 flex flex-wrap gap-2">
              {CALCULATOR.features
                .filter((feature) => features.includes(feature.id))
                .map((feature) => (
                  <span
                    key={feature.id}
                    className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-2 px-2.5 py-1.5 text-xs text-white"
                  >
                    {feature.tier ? (
                      <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-[10px] text-hf-dim">
                        {feature.tier}
                      </span>
                    ) : null}
                    {feature.label}
                    <button
                      type="button"
                      aria-label={`Remove ${feature.label}`}
                      onClick={() => setFeatures((prev) => toggle(prev, feature.id))}
                      className="text-hf-dim transition-colors hover:text-white"
                    >
                      <X className="size-3" aria-hidden strokeWidth={2.5} />
                    </button>
                  </span>
                ))}
            </div>
          </div>
        </div>

        {/* Recommendation */}
        <aside className="rounded-2xl border border-hf-border bg-hf-black p-5">
          <p className="text-center text-xs text-hf-muted">We recommend {plan.name} plan</p>
          <p className="mt-2 text-center">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-hf-lime/15 px-2.5 py-1 text-[11px] font-medium text-hf-lime">
              See why
              <Info className="size-3" aria-hidden strokeWidth={2} />
            </span>
          </p>

          <div className="mt-5 rounded-2xl border border-hf-lime/25 bg-gradient-to-b from-[#161c07] to-hf-surface p-4">
            <div className="flex items-center gap-2">
              <h3 className="font-display text-lg font-bold tracking-tight text-white uppercase">
                {plan.name}
              </h3>
              {plan.discountLabel ? (
                <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-semibold text-white">
                  {plan.discountLabel}
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-xs text-hf-muted">{plan.tagline}</p>

            <div className="mt-4">
              <div className="flex items-center justify-between text-[11px]">
                <span className="text-hf-muted">Expected monthly usage</span>
                <span className="text-hf-lime tabular-nums">
                  {credits.toLocaleString()}/{ceiling.toLocaleString()} credits
                </span>
              </div>
              <div
                role="progressbar"
                aria-valuenow={Math.round(usage)}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label="Expected credit usage"
                className="mt-2 h-1.5 overflow-hidden rounded-full bg-hf-surface-4"
              >
                <div className="h-full rounded-full bg-hf-lime" style={{ width: `${usage}%` }} />
              </div>
            </div>

            <ul className="mt-4 space-y-1.5">
              {plan.capabilities.slice(0, 3).map((row) => (
                <li key={row.label} className="flex items-center gap-2 text-[11px] text-white">
                  <Check className="size-3 shrink-0 text-hf-lime" aria-hidden strokeWidth={3} />
                  {row.label}
                </li>
              ))}
            </ul>

            <div className="mt-4 flex flex-wrap items-baseline gap-2">
              {billing === "annual" && plan.monthly !== plan.annual ? (
                <s className="font-display text-xl font-bold text-hf-pink">${plan.monthly}</s>
              ) : null}
              <span className="font-display text-2xl font-bold text-white">${price}</span>
              <span className="text-[11px] text-hf-muted">
                /month, billed {billing === "annual" ? "annually" : "monthly"}
              </span>
            </div>

            <button
              type="button"
              className="mt-3 w-full rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              Get {plan.name}
            </button>

            {saving > 0 && billing === "annual" ? (
              <p className="mt-2 rounded-lg bg-black/30 py-2 text-center text-[11px] text-hf-muted">
                <span className="font-semibold text-white">Save ${saving}</span> compared to monthly
              </p>
            ) : null}
          </div>

          <div className="mt-4 flex justify-center">
            <BillingToggle value={billing} onChange={setBilling} discountLabel="54% OFF" />
          </div>
        </aside>
      </div>
    </section>
  );
}
