"use client";

import { useState } from "react";
import { ArrowUpRight, Code2, Tag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const CLIENTS = ["ChatGPT", "Claude", "Grok Bot", "Cursor", "Claude Code", "OpenClaw", "Hermes"];
const TRANSPORTS = ["MCP", "CLI"];

const STEPS = [
  {
    title: "Add Higgsfield plugin to ChatGPT",
    body: "Find Higgsfield in the Plugins Directory or click the button below. Then click Add and sign in",
    cta: "Add Higgsfield plugin",
  },
  {
    title: "Connect and start creating",
    body: "After signing in, ask ChatGPT to generate an image or video",
    cta: "Start creating",
  },
];

const HOW_IT_WORKS = [
  { title: "Connect once", body: "Authorise Higgsfield in your client of choice. The connection persists across sessions." },
  { title: "Call the tools", body: "Your assistant gets image, video and audio generation as callable tools with the same models as the web app." },
  { title: "Assets land in one place", body: "Everything generated through MCP appears in your Higgsfield asset library, ready to edit." },
];

/** MCP and ChatGPT Plugin are the same page on the real site, reached from two nav items. */
export function PluginPage() {
  const [client, setClient] = useState(CLIENTS[0]);
  const [transport, setTransport] = useState(TRANSPORTS[0]);
  const { toast } = useToast();

  return (
    <main className="mx-auto max-w-5xl px-4 py-14">
      <div className="text-center">
        <div className="mx-auto flex w-fit items-center -space-x-3">
          {["#1f2937", "#111827", "#ffffff", "#d1fe17", "#1f2937", "#b91c1c", "#ea580c"].map(
            (colour, index) => (
              <span
                key={colour + index}
                className={`size-11 rounded-2xl border border-black/40 ${index === 3 ? "z-10 scale-115" : ""}`}
                style={{ backgroundColor: colour }}
                aria-hidden
              />
            ),
          )}
        </div>

        <h1 className="mt-8 font-display text-3xl font-bold tracking-tight text-hf-lime uppercase sm:text-4xl lg:text-5xl">
          Higgsfield plugin for ChatGPT
        </h1>
        <p className="mt-3 text-sm text-hf-muted sm:text-base">
          Create stunning images and videos without leaving ChatGPT
        </p>

        <p className="mx-auto mt-6 flex w-fit flex-wrap items-center justify-center gap-2 rounded-xl bg-hf-lime/10 px-4 py-3 text-sm text-hf-lime">
          <Tag className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
          Connect MCP &amp; access 3-day free trial plan with 100 credits
          <span className="rounded bg-hf-lime px-2 py-0.5 text-[11px] font-bold text-black italic">
            FREE 100 CREDITS
          </span>
        </p>
      </div>

      <section className="mt-10 overflow-hidden rounded-2xl border border-hf-border bg-hf-surface">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-hf-border p-3">
          <div role="tablist" aria-label="Client" className="flex flex-wrap gap-1">
            {CLIENTS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={client === name}
                onClick={() => setClient(name)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  client === name ? "bg-white text-black" : "text-hf-muted hover:text-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>

          <div role="tablist" aria-label="Transport" className="flex gap-1">
            {TRANSPORTS.map((name) => (
              <button
                key={name}
                type="button"
                role="tab"
                aria-selected={transport === name}
                onClick={() => setTransport(name)}
                className={`rounded-full px-3 py-1.5 text-sm transition-colors ${
                  transport === name ? "bg-hf-surface-4 text-white" : "text-hf-dim hover:text-white"
                }`}
              >
                {name}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-px bg-hf-border sm:grid-cols-2">
          {STEPS.map((step, index) => (
            <div key={step.title} className="flex flex-col justify-between bg-hf-surface p-6">
              <div>
                <span className="flex size-6 items-center justify-center rounded-full bg-hf-surface-4 text-xs text-hf-muted">
                  {index + 1}
                </span>
                <h2 className="mt-4 text-base font-medium text-white">
                  {index === 0 ? `Add Higgsfield plugin to ${client}` : step.title}
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-hf-muted">{step.body}</p>
              </div>
              <button
                type="button"
                onClick={() =>
                  toast(index === 0 ? `Higgsfield plugin added to ${client}` : "Opening your workspace")
                }
                className="mt-8 flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-black transition-opacity hover:opacity-90"
              >
                {step.cta}
                {index === 0 ? <ArrowUpRight className="size-4" aria-hidden strokeWidth={2} /> : null}
              </button>
            </div>
          ))}
        </div>
      </section>

      <p className="mt-5 flex flex-wrap items-center justify-center gap-4 text-xs text-hf-muted">
        If you are using Claude Code or Codex, it&apos;s better to use the CLI
        <a href="#" className="flex items-center gap-1.5 transition-colors hover:text-white">
          <Code2 className="size-3.5" aria-hidden strokeWidth={1.75} />
          GitHub
        </a>
      </p>

      <section className="mt-20">
        <h2 className="text-center font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
          How does MCP work?
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-3">
          {HOW_IT_WORKS.map((item, index) => (
            <div key={item.title} className="rounded-2xl border border-hf-border bg-hf-surface p-5">
              <span className="font-display text-sm font-bold text-hf-lime">0{index + 1}</span>
              <h3 className="mt-3 text-sm font-medium text-white">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-hf-muted">{item.body}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
