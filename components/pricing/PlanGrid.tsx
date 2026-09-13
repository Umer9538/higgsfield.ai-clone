"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { PLANS, PLAN_FOOTNOTES } from "@/lib/pricing/content";
import { BillingToggle, type Billing } from "./BillingToggle";
import { PlanCard } from "./PlanCard";

export function PlanGrid() {
  const [billing, setBilling] = useState<Billing>("annual");
  const [audience, setAudience] = useState<"individual" | "business">("individual");

  return (
    <section className="mt-12">
      <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
        Plans for every workflow
      </h1>
      <p className="mt-2 text-sm text-hf-muted">
        From individuals to enterprise teams, find the right fit
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-between gap-4">
        <div role="tablist" className="flex gap-1 rounded-xl border border-hf-border bg-hf-surface p-1">
          {(["individual", "business"] as const).map((option) => (
            <button
              key={option}
              type="button"
              role="tab"
              aria-selected={audience === option}
              onClick={() => setAudience(option)}
              className={`rounded-lg px-4 py-2 text-sm font-medium capitalize transition-colors ${
                audience === option
                  ? "bg-hf-surface-4 text-hf-lime"
                  : "text-hf-muted hover:text-white"
              }`}
            >
              {option} plans
            </button>
          ))}
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <a
            href="#calculator"
            className="flex items-center gap-1.5 rounded-full border border-hf-border bg-hf-surface px-3.5 py-2 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
          >
            <Sparkles className="size-3.5" aria-hidden strokeWidth={1.75} />
            Not sure which plan?
          </a>
          <BillingToggle value={billing} onChange={setBilling} />
        </div>
      </div>

      {audience === "business" ? (
        <div className="mt-6 rounded-2xl border border-hf-border bg-hf-surface p-8 text-center">
          <h2 className="font-display text-xl font-bold tracking-tight text-white uppercase">
            Business plans
          </h2>
          <p className="mx-auto mt-2 max-w-md text-sm text-hf-muted">
            Seat-based pricing, shared asset libraries, SSO and invoicing. Talk to the team for a
            quote built around your volume.
          </p>
          <button
            type="button"
            className="mt-5 rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            Contact sales
          </button>
        </div>
      ) : (
        <>
          <div role="list" aria-label="Plans" className="mt-6 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {PLAN_FOOTNOTES.links.map((link) => (
              <a
                key={link}
                href="#"
                className="flex items-center gap-1 text-xs text-hf-muted transition-colors hover:text-white"
              >
                {link}
                <ArrowUpRight className="size-3" aria-hidden strokeWidth={1.75} />
              </a>
            ))}
          </div>

          <div className="mx-auto mt-5 max-w-3xl space-y-1.5 text-center">
            {PLAN_FOOTNOTES.disclaimers.map((line) => (
              <p key={line} className="text-[11px] leading-relaxed text-hf-dim">
                {line}
              </p>
            ))}
          </div>
        </>
      )}
    </section>
  );
}
