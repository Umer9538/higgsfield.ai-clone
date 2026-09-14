"use client";

import { useState } from "react";
import { ArrowUpRight, Code2, Tag } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

const CLIENTS = ["ChatGPT", "Claude", "Grok Bot", "Cursor", "Claude Code", "OpenClaw", "Hermes"];
const TRANSPORTS = ["MCP", "CLI"];

/** Step content is a function of the selected client and transport. */
function stepsFor(client: string, transport: string) {
  if (transport === "CLI") {
    return [
      {
        title: `Install the CLI for ${client}`,
        body: "Install globally, then authenticate once. The CLI keeps its own credentials, so it works in CI and headless shells.",
        code: ["npm i -g @higgsfield/cli", "higgsfield login"],
        cta: "Copy install command",
      },
      {
        title: "Generate from the terminal",
        body: `Point ${client} at the CLI, or call it directly from a script. Outputs land in your asset library.`,
        code: ['higgsfield generate video \\', '  --model seedance-2.5 \\', '  --prompt "neon alley, rain slick"'],
        cta: "Copy generate command",
      },
    ];
  }

  return [
    {
      title: `Add Higgsfield plugin to ${client}`,
      body: `Open ${client}, go to Settings \u2192 Connectors, and add a custom connector pointing at the Higgsfield MCP server.`,
      code: ["https://bridge.higgsfield.ai/mcp"],
      cta: "Add Higgsfield plugin",
    },
    {
      title: "Connect and start creating",
      body: `After signing in, ask ${client} to generate an image or video and it will call the Higgsfield tools directly.`,
      code: null,
      cta: "Start creating",
    },
  ];
}

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
  const steps = stepsFor(client, transport);

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
          {steps.map((step, index) => (
            <div key={step.title} className="flex flex-col justify-between bg-hf-surface p-6">
              <div>
                <span className="flex size-6 items-center justify-center rounded-full bg-hf-surface-4 text-xs text-hf-muted">
                  {index + 1}
                </span>
                <h2 className="mt-4 text-base font-medium text-white">{step.title}</h2>
                <p className="mt-2 text-sm leading-relaxed text-hf-muted">{step.body}</p>

                {step.code ? (
                  <pre
                    data-step-code
                    className="mt-4 overflow-x-auto rounded-lg border border-hf-border bg-hf-black px-3 py-2.5 font-mono text-[11px] leading-relaxed text-hf-lime"
                  >
                    {step.code.join("\n")}
                  </pre>
                ) : null}
              </div>
              <button
                type="button"
                onClick={() => {
                  if (step.code) {
                    void navigator.clipboard.writeText(step.code.join("\n")).catch(() => {});
                    toast(`Copied for ${client}`);
                  } else {
                    toast("Opening your workspace", "info");
                  }
                }}
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
        <a
          href="https://github.com/higgsfield-ai"
          target="_blank"
          rel="noopener noreferrer"
          className="flex min-h-11 items-center gap-1.5 transition-colors hover:text-white md:min-h-0"
        >
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
