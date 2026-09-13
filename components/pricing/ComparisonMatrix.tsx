"use client";

import { useState } from "react";
import { Check, ChevronDown, X, Zap } from "lucide-react";
import { COMPARISON, PLANS } from "@/lib/pricing/content";
import { BillingToggle, type Billing } from "./BillingToggle";

function Cell({ value }: { value: string | boolean }) {
  if (value === true) {
    return <Check className="size-4 text-hf-lime" aria-label="Included" strokeWidth={2.5} />;
  }
  if (value === false) {
    return <X className="size-4 text-hf-dim" aria-label="Not included" strokeWidth={2.5} />;
  }
  return <span className="text-xs text-hf-muted">{value}</span>;
}

export function ComparisonMatrix() {
  const [expanded, setExpanded] = useState(false);
  const [billing, setBilling] = useState<Billing>("annual");

  // Collapsed shows the first group only, matching the faded cut-off on the real page.
  const groups = expanded ? COMPARISON : COMPARISON.slice(0, 1);

  return (
    <section id="compare" className="mt-20 scroll-mt-20">
      <h2 className="font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Compare features
      </h2>
      <p className="mt-2 text-sm text-hf-muted">See in details what plan suits you best</p>

      <div className="mt-6 overflow-hidden rounded-2xl border border-hf-border">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px] border-collapse text-left">
            <caption className="sr-only">Feature comparison across Basic, Pro and Max plans</caption>

            <thead>
              <tr className="border-b border-hf-border">
                <th scope="row" className="w-[30%] p-5 align-middle">
                  <BillingToggle value={billing} onChange={setBilling} discountLabel="54% OFF" />
                </th>

                {PLANS.map((plan) => {
                  const price = billing === "annual" ? plan.annual : plan.monthly;
                  return (
                    <th key={plan.id} scope="col" className="p-5 align-top">
                      <div className="flex items-center gap-2">
                        <span className="font-display text-lg font-bold tracking-tight text-white">
                          {plan.name}
                        </span>
                        {plan.bestValue ? (
                          <span className="flex items-center gap-1 rounded bg-[#9ce6f3] px-1.5 py-0.5 text-[10px] font-semibold text-black">
                            <Zap className="size-2.5" aria-hidden fill="currentColor" strokeWidth={0} />
                            BEST VALUE
                          </span>
                        ) : null}
                      </div>

                      <p className="mt-2 text-xs text-white">${price}/month</p>
                      <p className="text-xs text-hf-dim">
                        Billed {billing === "annual" ? "annually" : "monthly"}
                      </p>

                      <button
                        type="button"
                        className={`mt-3 w-full rounded-lg px-4 py-2 text-xs font-semibold transition-colors ${
                          plan.bestValue
                            ? "bg-hf-lime text-black hover:bg-hf-lime-deep"
                            : "bg-hf-surface-4 text-white hover:bg-hf-border"
                        }`}
                      >
                        Get Plan
                      </button>
                    </th>
                  );
                })}
              </tr>
            </thead>

            {groups.map((group) => (
              <tbody key={group.title}>
                <tr>
                  <th
                    scope="colgroup"
                    colSpan={4}
                    className="bg-hf-surface-2 px-5 py-3 text-sm font-semibold text-white"
                  >
                    {group.title}
                  </th>
                </tr>

                {group.rows.map((row) => (
                  <tr key={`${group.title}-${row.label}`} className="border-b border-hf-border/60">
                    <th scope="row" className="px-5 py-3.5 font-normal">
                      <span className="block text-xs text-white">{row.label}</span>
                      {row.note ? (
                        <span className="mt-0.5 block text-[11px] text-hf-dim">{row.note}</span>
                      ) : null}
                    </th>
                    {row.values.map((value, index) => (
                      <td key={`${row.label}-${PLANS[index].id}`} className="px-5 py-3.5">
                        <Cell value={value} />
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            ))}
          </table>
        </div>

        {/* Fade hint that more rows exist, mirroring the real page's cut-off */}
        {expanded ? null : (
          <div className="pointer-events-none h-16 bg-gradient-to-t from-hf-black to-transparent" />
        )}
      </div>

      <div className="mt-6 flex justify-center">
        <button
          type="button"
          aria-expanded={expanded}
          aria-controls="compare"
          onClick={() => setExpanded((prev) => !prev)}
          className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface px-4 py-2 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          {expanded ? "Hide comparison" : "Compare Features"}
          <ChevronDown
            className={`size-4 transition-transform ${expanded ? "rotate-180" : ""}`}
            aria-hidden
            strokeWidth={1.75}
          />
        </button>
      </div>
    </section>
  );
}
