"use client";

import { useState } from "react";
import { ArrowUp, Plus, Sparkles, Wrench } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const FILTERS = ["All", "Marketing", "Explainer videos", "Apps", "Games"];

export function SuperComposer() {
  const [prompt, setPrompt] = useState("");
  const [filter, setFilter] = useState(FILTERS[0]);
  const [sent, setSent] = useState<string[]>([]);
  const { toast } = useToast();

  const send = () => {
    const text = prompt.trim();
    if (!text) {
      toast("Type something for the agent to work on", "info");
      return;
    }
    setSent((prev) => [...prev, text]);
    setPrompt("");
    toast("Sent to Supercomputer");
  };

  return (
    <>
      <div className="mx-auto mt-8 max-w-2xl rounded-2xl border border-hf-border bg-hf-surface-2 p-3">
        <input
          type="text"
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && send()}
          aria-label="Ask Supercomputer"
          placeholder="Turn my podcast into 9:16"
          className="w-full bg-transparent px-1 py-2 text-sm text-white placeholder:text-hf-dim focus:outline-none"
        />

        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            type="button"
            aria-label="Add attachment"
            onClick={() => toast("Attachments are not wired in this rebuild", "info")}
            className="flex size-8 items-center justify-center rounded-full bg-hf-surface-4 text-white transition-colors hover:bg-hf-border"
          >
            <Plus className="size-4" aria-hidden strokeWidth={2} />
          </button>

          <span className="flex items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface-3 px-2.5 py-1.5 text-xs text-white">
            Auto
            <span className="font-semibold text-hf-lime">Free</span>
          </span>

          <span className="ml-auto flex items-center gap-2">
            <span className="rounded-lg border border-hf-border px-2.5 py-1.5 text-xs text-hf-muted">
              Ask mode
            </span>
            <button
              type="button"
              aria-label="Send"
              onClick={send}
              className="flex size-8 items-center justify-center rounded-full bg-hf-lime text-black transition-colors hover:bg-hf-lime-deep"
            >
              <ArrowUp className="size-4" aria-hidden strokeWidth={2.5} />
            </button>
          </span>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-4 border-t border-hf-border pt-3 text-xs text-hf-muted">
          <span>No project</span>
          <span className="flex items-center gap-1.5">
            <Sparkles className="size-3.5" aria-hidden strokeWidth={1.75} />
            Skills
          </span>
          <span>Connectors</span>
          <span className="ml-auto flex items-center gap-1.5">
            <Wrench className="size-3.5" aria-hidden strokeWidth={1.75} />
            Try MCP
          </span>
        </div>
      </div>

      {sent.length > 0 ? (
        <ul aria-live="polite" className="mx-auto mt-4 max-w-2xl space-y-2">
          {sent.map((item, index) => (
            <li
              key={`${item}-${index}`}
              className="rounded-xl border border-hf-border bg-hf-surface px-4 py-3 text-sm text-white"
            >
              {item}
              <span className="mt-1 block text-xs text-hf-lime">Queued · Ask mode</span>
            </li>
          ))}
        </ul>
      ) : null}

      <h2 className="mt-20 text-center font-display text-xl leading-tight font-bold tracking-tight text-white uppercase sm:text-2xl">
        Build, generate, and market anything with skills,
        <br />
        connectors, and automation
      </h2>

      <div role="tablist" aria-label="Showcase filter" className="mt-6 flex flex-wrap justify-center gap-2">
        {FILTERS.map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={filter === item}
            onClick={() => setFilter(item)}
            className={`rounded-full px-3.5 py-1.5 text-sm transition-colors ${
              filter === item ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
            }`}
          >
            {item}
          </button>
        ))}
      </div>

      <p aria-live="polite" className="mt-3 text-center text-xs text-hf-dim">
        Showing {filter === "All" ? "all" : filter.toLowerCase()} projects
      </p>
    </>
  );
}
