"use client";

import { useState } from "react";
import { Sparkles } from "lucide-react";
import { ArrowUpRight } from "lucide-react";
import { PLANS, PLAN_FOOTNOTES } from "@/lib/pricing/content";
import type { Plan } from "@/lib/pricing/content";
import { Modal } from "@/components/ui/Modal";
import { SmartLink } from "@/components/ui/SmartLink";
import { useToast } from "@/components/ui/Toast";
import { BillingToggle, type Billing } from "./BillingToggle";
import { PlanCard } from "./PlanCard";

export function PlanGrid() {
  const { toast } = useToast();
  const [billing, setBilling] = useState<Billing>("annual");
  const [audience, setAudience] = useState<"individual" | "business">("individual");
  const [chosen, setChosen] = useState<Plan | null>(null);

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
          <a
            href="/enterprise#contact-sales"
            className="mt-5 inline-block rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            Contact sales
          </a>
        </div>
      ) : (
        <>
          <div role="list" aria-label="Plans" className="mt-6 grid gap-4 lg:grid-cols-3">
            {PLANS.map((plan) => (
              <PlanCard key={plan.id} plan={plan} billing={billing} onSelect={setChosen} />
            ))}
          </div>

          <div className="mt-6 flex flex-wrap justify-center gap-6">
            {PLAN_FOOTNOTES.links.map((link) => (
              <SmartLink
                key={link}
                label={link}
                className="flex min-h-11 items-center gap-1 text-xs text-hf-muted transition-colors hover:text-white md:min-h-0"
              >
                {link}
                <ArrowUpRight className="size-3" aria-hidden strokeWidth={1.75} />
              </SmartLink>
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

      <Modal open={chosen !== null} onClose={() => setChosen(null)} title={`${chosen?.name ?? ""} plan selected`}>
        {chosen ? (
          <>
            <p className="text-sm leading-relaxed text-hf-muted">
              {chosen.name} at ${billing === "annual" ? chosen.annual : chosen.monthly}/month, billed{" "}
              {billing === "annual" ? "annually" : "monthly"}.
            </p>
            <button
              type="button"
              onClick={() => {
                toast(`${chosen.name} plan added to your cart`);
                setChosen(null);
              }}
              className="mt-5 w-full rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              Continue to checkout
            </button>
          </>
        ) : null}
      </Modal>
    </section>
  );
}
