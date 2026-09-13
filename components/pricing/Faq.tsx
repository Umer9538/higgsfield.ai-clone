"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { FAQS } from "@/lib/pricing/content";

export function Faq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mt-20">
      <div className="flex justify-center">
        <button
          type="button"
          className="rounded-lg border border-hf-border bg-hf-surface px-4 py-2 text-sm text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          Compare Features
        </button>
      </div>

      <h2 className="mt-10 text-center font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Frequently Asked Questions
      </h2>

      <ul className="mx-auto mt-8 max-w-2xl space-y-2.5">
        {FAQS.map((faq, index) => {
          const expanded = open === index;
          return (
            <li key={faq.question} className="overflow-hidden rounded-xl bg-hf-surface-3">
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`faq-panel-${index}`}
                  id={`faq-trigger-${index}`}
                  onClick={() => setOpen(expanded ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-hf-muted transition-transform ${
                      expanded ? "rotate-180 text-hf-lime" : ""
                    }`}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                </button>
              </h3>
              {expanded ? (
                <div
                  id={`faq-panel-${index}`}
                  role="region"
                  aria-labelledby={`faq-trigger-${index}`}
                  className="px-5 pb-4"
                >
                  <p className="text-sm leading-relaxed text-hf-muted">{faq.answer}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>

      <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
        <span className="text-sm text-hf-muted">Are you ready?</span>
        <a
          href="#top"
          className="rounded-lg bg-hf-lime px-4 py-2 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
        >
          Choose your plan
        </a>
      </div>
    </section>
  );
}
