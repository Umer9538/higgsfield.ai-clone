"use client";

import { useState } from "react";
import { BookOpen, Check, Copy, Download, RefreshCw } from "lucide-react";
import { Modal } from "@/components/ui/Modal";
import { PLUGINS } from "@/lib/sections/content";
import { useToast } from "@/components/ui/Toast";

export function PluginDirectory() {
  const [host, setHost] = useState(PLUGINS.hosts[1].id);
  const [installed, setInstalled] = useState<string[]>(
    PLUGINS.hosts.filter((h) => h.installed).map((h) => h.id),
  );
  const [client, setClient] = useState(PLUGINS.bridge.clients[0]);
  const [copied, setCopied] = useState(false);
  const [details, setDetails] = useState<(typeof PLUGINS.hosts)[number] | null>(null);
  const [connected, setConnected] = useState(false);
  const { toast } = useToast();

  const active = PLUGINS.hosts.find((h) => h.id === host) ?? PLUGINS.hosts[0];

  const toggle = (id: string) =>
    setInstalled((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const copyUrl = async () => {
    try {
      await navigator.clipboard.writeText(PLUGINS.bridge.url);
    } catch {
      // Clipboard may be blocked; the confirmation still reflects intent.
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <>
      <section className="rounded-2xl border border-hf-border bg-gradient-to-br from-hf-surface-3 to-hf-black p-6 sm:p-8">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-hf-lime/15 px-2.5 py-1 text-[11px] font-semibold text-hf-lime">
          <span className="size-1.5 rounded-full bg-hf-lime" aria-hidden />
          {PLUGINS.status}
        </span>
        <h1 className="mt-4 font-display text-3xl leading-tight font-bold tracking-tight text-white uppercase sm:text-4xl">
          {PLUGINS.headline[0]}
          <br />
          <span className="text-hf-lime">{active.name}</span>
        </h1>
        <button
          type="button"
          onClick={() => {
            if (!installed.includes(active.id)) toggle(active.id);
            toast(`${active.name} plugin installed`);
          }}
          className="mt-6 flex items-center gap-2 rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
        >
          <Download className="size-4" aria-hidden strokeWidth={2} />
          {PLUGINS.cta}
        </button>
      </section>

      <section className="mt-10">
        <h2 className="font-display text-lg font-bold tracking-tight text-white uppercase">
          Integrations
        </h2>
        <ul role="list" aria-label="Integrations" className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {PLUGINS.hosts.map((item) => {
            const isInstalled = installed.includes(item.id);
            const selected = item.id === host;
            return (
              <li key={item.id}>
                <div
                  className={`rounded-2xl border p-4 transition-colors ${
                    selected ? "border-hf-lime/50 bg-hf-lime/5" : "border-hf-border bg-hf-surface"
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => setHost(item.id)}
                    aria-pressed={selected}
                    className="flex w-full items-center gap-3 text-left"
                  >
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-hf-surface-4 text-xs font-bold text-white">
                      {item.name.slice(0, 2)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-medium text-white">
                        {item.name}
                      </span>
                      <span className="block text-xs text-hf-dim">{item.vendor}</span>
                    </span>
                  </button>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => toggle(item.id)}
                      aria-label={`${isInstalled ? "Uninstall" : "Install"} ${item.name}`}
                      className={`flex min-h-11 flex-1 items-center justify-center gap-1.5 rounded-lg px-3 text-xs font-semibold transition-colors md:min-h-0 md:py-2 ${
                        isInstalled
                          ? "bg-hf-lime/15 text-hf-lime"
                          : "bg-hf-surface-4 text-white hover:bg-hf-border"
                      }`}
                    >
                      {isInstalled ? (
                        <>
                          <Check className="size-3.5" aria-hidden strokeWidth={3} />
                          Installed
                        </>
                      ) : (
                        "Install"
                      )}
                    </button>

                    <button
                      type="button"
                      aria-label={`Details for ${item.name}`}
                      onClick={() => setDetails(item)}
                      className="flex min-h-11 items-center justify-center rounded-lg border border-hf-border px-3 text-xs text-white transition-colors hover:border-hf-lime/50 md:min-h-0 md:py-2"
                    >
                      Details
                    </button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-12 rounded-2xl border border-hf-border bg-hf-surface p-6">
        <h2 className="font-display text-lg font-bold tracking-tight text-white uppercase">
          {PLUGINS.bridge.title}
        </h2>

        <div role="tablist" aria-label="Agent client" className="mt-4 flex gap-1">
          {PLUGINS.bridge.clients.map((name) => (
            <button
              key={name}
              type="button"
              role="tab"
              aria-selected={client === name}
              onClick={() => setClient(name)}
              className={`rounded-lg px-3.5 py-2 text-sm transition-colors ${
                client === name ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
              }`}
            >
              {name}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 rounded-xl border border-hf-border bg-hf-surface-2 px-3 py-2.5">
          <code className="min-w-0 flex-1 truncate font-mono text-xs text-hf-lime">
            {PLUGINS.bridge.url}
          </code>
          <button
            type="button"
            onClick={copyUrl}
            aria-label="Copy bridge URL"
            className="flex shrink-0 items-center gap-1.5 rounded-lg bg-hf-surface-4 px-2.5 py-1.5 text-xs text-white transition-colors hover:bg-hf-border"
          >
            {copied ? (
              <Check className="size-3.5 text-hf-lime" aria-hidden strokeWidth={3} />
            ) : (
              <Copy className="size-3.5" aria-hidden strokeWidth={1.75} />
            )}
            {copied ? "Copied" : "Copy"}
          </button>
        </div>

        <ol className="mt-4 space-y-2">
          {PLUGINS.bridge.steps.map((step, index) => (
            <li key={step} className="flex gap-3 text-sm text-hf-muted">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-[11px] text-hf-lime">
                {index + 1}
              </span>
              {step}
            </li>
          ))}
        </ol>

        <p className="mt-4 rounded-xl bg-hf-surface-2 px-4 py-3 text-sm text-hf-muted italic">
          “{PLUGINS.bridge.example}”
        </p>

        <div className="mt-4 flex flex-wrap items-center gap-3 border-t border-hf-border pt-4">
          <span className="text-sm font-medium text-white">Connector</span>
          <span
            className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
              connected ? "bg-hf-lime/15 text-hf-lime" : "bg-hf-surface-4 text-hf-dim"
            }`}
          >
            {connected ? "Connected" : "Not connected"}
          </span>

          <button
            type="button"
            role="switch"
            aria-checked={connected}
            aria-label={`${client} connector`}
            onClick={() => {
              setConnected(!connected);
              toast(connected ? `${client} connector disabled` : `${client} connector enabled`);
            }}
            className={`relative ml-auto h-6 w-11 shrink-0 rounded-full transition-colors ${
              connected ? "bg-hf-lime" : "bg-hf-surface-4"
            }`}
          >
            <span
              className={`absolute top-0.5 size-5 rounded-full bg-white transition-[left] ${
                connected ? "left-[22px]" : "left-0.5"
              }`}
            />
          </button>
        </div>
      </section>

      <Modal open={details !== null} onClose={() => setDetails(null)} title={details?.name ?? ""}>
        {details ? (
          <>
            <p className="text-sm leading-relaxed text-hf-muted">{details.blurb}</p>

            <dl className="mt-5 grid grid-cols-2 gap-3">
              {[
                ["Vendor", details.vendor],
                ["Version", details.version],
                ["Requires", details.requires],
                ["Status", installed.includes(details.id) ? "Installed" : "Not installed"],
              ].map(([term, value]) => (
                <div key={term} className="rounded-lg bg-hf-surface-2 px-3 py-2">
                  <dt className="text-xs text-hf-dim">{term}</dt>
                  <dd className="mt-0.5 text-sm font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>

            <div className="mt-5 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => {
                  toggle(details.id);
                  toast(
                    installed.includes(details.id)
                      ? `${details.name} uninstalled`
                      : `${details.name} installed`,
                  );
                }}
                className="flex min-h-11 flex-1 items-center justify-center rounded-xl bg-hf-lime px-4 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
              >
                {installed.includes(details.id) ? "Uninstall" : "Install"}
              </button>
              <button
                type="button"
                onClick={() => toast(`${details.name} is up to date`, "info")}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-hf-border px-4 text-sm text-white transition-colors hover:border-hf-lime/50"
              >
                <RefreshCw className="size-4" aria-hidden strokeWidth={1.75} />
                Check for updates
              </button>
              <button
                type="button"
                onClick={() => toast("Opening the plugin documentation", "info")}
                className="flex min-h-11 items-center gap-1.5 rounded-xl border border-hf-border px-4 text-sm text-white transition-colors hover:border-hf-lime/50"
              >
                <BookOpen className="size-4" aria-hidden strokeWidth={1.75} />
                Docs
              </button>
            </div>
          </>
        ) : null}
      </Modal>
    </>
  );
}
