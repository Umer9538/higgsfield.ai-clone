"use client";

import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { ENTERPRISE_FAQS } from "@/lib/enterprise/content";

export function EnterpriseFaq() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section className="mt-24">
      <h2 className="text-center font-display text-2xl font-bold tracking-tight text-white sm:text-3xl">
        Still have questions?
      </h2>
      <p className="mt-2 text-center text-sm text-hf-muted">
        We&apos;ve answered the most frequently asked questions
      </p>

      <ul className="mx-auto mt-8 max-w-2xl space-y-2.5">
        {ENTERPRISE_FAQS.map((faq, index) => {
          const expanded = open === index;
          return (
            <li key={faq.question} className="overflow-hidden rounded-xl bg-hf-surface-3">
              <h3>
                <button
                  type="button"
                  aria-expanded={expanded}
                  aria-controls={`ent-faq-${index}`}
                  onClick={() => setOpen(expanded ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
                >
                  <span className="text-sm font-medium text-white">{faq.question}</span>
                  <ChevronDown
                    className={`size-4 shrink-0 text-hf-muted transition-transform ${expanded ? "rotate-180 text-hf-lime" : ""}`}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                </button>
              </h3>
              {expanded ? (
                <div id={`ent-faq-${index}`} className="px-5 pb-4">
                  <p className="text-sm leading-relaxed text-hf-muted">{faq.answer}</p>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
