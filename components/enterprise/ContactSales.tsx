"use client";

import { useState } from "react";
import { Check } from "lucide-react";
import { CONTACT_FIELDS, CONTACT_REASONS, CREDIT_TIERS, SALES_FEATURES } from "@/lib/enterprise/content";

export function ContactSales() {
  const [tier, setTier] = useState(CREDIT_TIERS[1].id);
  const [sent, setSent] = useState(false);

  return (
    <section id="contact-sales" className="mt-24 scroll-mt-20">
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]">
        <div>
          <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
            Contact our sales team
          </h2>
          <p className="mt-3 text-sm text-hf-muted">
            Tell us about your needs and we&apos;ll get back to you
          </p>

          <ul className="mt-6 space-y-2.5">
            {SALES_FEATURES.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5 text-sm text-white">
                <Check className="mt-0.5 size-4 shrink-0 text-hf-lime" aria-hidden strokeWidth={2.5} />
                {feature}
              </li>
            ))}
          </ul>

          <fieldset className="mt-8">
            <legend className="text-xs font-semibold tracking-wide text-hf-muted uppercase">
              Credit volume
            </legend>
            <div className="mt-3 space-y-2">
              {CREDIT_TIERS.map((option) => {
                const active = option.id === tier;
                return (
                  <button
                    key={option.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => setTier(option.id)}
                    className={`flex w-full items-center justify-between gap-3 rounded-xl border px-4 py-3 text-left transition-colors ${
                      active
                        ? "border-hf-lime/60 bg-hf-lime/10"
                        : "border-hf-border bg-hf-surface hover:border-hf-border"
                    }`}
                  >
                    <span>
                      <span className="flex items-center gap-2 text-sm font-medium text-white">
                        {option.label}
                        {option.featured ? (
                          <span className="rounded bg-hf-lime px-1.5 py-0.5 text-[10px] font-semibold text-black">
                            Popular
                          </span>
                        ) : null}
                      </span>
                      <span className="mt-0.5 block text-xs text-hf-dim">{option.seats}</span>
                    </span>
                    <span className={`text-xs ${active ? "text-hf-lime" : "text-hf-muted"}`}>
                      {option.credits}
                    </span>
                  </button>
                );
              })}
            </div>
          </fieldset>
        </div>

        <form
          className="rounded-2xl border border-hf-border bg-hf-surface p-5 sm:p-6"
          onSubmit={(event) => {
            event.preventDefault();
            setSent(true);
          }}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            {CONTACT_FIELDS.map((field) => (
              <div key={field.id} className={field.id === "website" ? "sm:col-span-2" : ""}>
                <label htmlFor={field.id} className="block text-xs text-hf-muted">
                  {field.label}
                </label>
                <input
                  id={field.id}
                  name={field.id}
                  type={field.type}
                  required={field.id !== "website"}
                  className="mt-1.5 w-full rounded-lg border border-hf-border bg-hf-surface-2 px-3 py-2.5 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
                />
              </div>
            ))}

            <div className="sm:col-span-2">
              <label htmlFor="reason" className="block text-xs text-hf-muted">
                What are you interested in
              </label>
              <select
                id="reason"
                name="reason"
                defaultValue={CONTACT_REASONS[0]}
                className="mt-1.5 w-full rounded-lg border border-hf-border bg-hf-surface-2 px-3 py-2.5 text-sm text-white focus:border-hf-lime/50 focus:outline-none"
              >
                {CONTACT_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            className="mt-6 w-full rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
          >
            Contact Sales
          </button>

          {sent ? (
            <p
              role="status"
              className="mt-3 rounded-lg bg-hf-lime/10 px-3 py-2.5 text-center text-xs text-hf-lime"
            >
              Thanks — a specialist will be in touch about the {CREDIT_TIERS.find((t) => t.id === tier)?.label} volume.
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
