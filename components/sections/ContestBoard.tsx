"use client";

import { useEffect, useState } from "react";
import { AlertCircle, Trophy } from "lucide-react";
import { RailHeading } from "./Shared";
import { CONTESTS } from "@/lib/sections/content";
import { useToast } from "@/components/ui/Toast";

function useCountdown(deadline: string) {
  // Start at null so server and first client render agree, then fill in.
  const [left, setLeft] = useState<number | null>(null);

  useEffect(() => {
    const target = new Date(deadline).getTime();
    const tick = () => setLeft(Math.max(0, target - Date.now()));
    tick();
    const timer = setInterval(tick, 1000);
    return () => clearInterval(timer);
  }, [deadline]);

  return left;
}

function Segment({ value, unit }: { value: string; unit: string }) {
  return (
    <div className="min-w-[64px] rounded-xl border border-hf-border bg-hf-surface-2 px-3 py-2 text-center">
      <p className="font-display text-xl leading-none font-bold text-white tabular-nums">{value}</p>
      <p className="mt-1 text-[10px] text-hf-dim">{unit}</p>
    </div>
  );
}

export function ContestBoard() {
  const [tab, setTab] = useState(CONTESTS.tabs[0]);
  const left = useCountdown(CONTESTS.active.deadline);
  const [entered, setEntered] = useState(false);
  const { toast } = useToast();

  const days = left === null ? "--" : String(Math.floor(left / 86400000)).padStart(2, "0");
  const hours = left === null ? "--" : String(Math.floor((left % 86400000) / 3600000)).padStart(2, "0");
  const minutes = left === null ? "--" : String(Math.floor((left % 3600000) / 60000)).padStart(2, "0");
  const seconds = left === null ? "--" : String(Math.floor((left % 60000) / 1000)).padStart(2, "0");

  return (
    <>
      <div role="tablist" aria-label="Contest sections" className="flex flex-wrap gap-1">
        {CONTESTS.tabs.map((item) => {
          const active = tab === item;
          return (
            <button
              key={item}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setTab(item)}
              className={`rounded-lg px-3.5 py-2 text-sm font-medium transition-colors ${
                active ? "bg-hf-surface-4 text-hf-lime" : "text-hf-muted hover:text-white"
              }`}
            >
              {item}
            </button>
          );
        })}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-3 rounded-xl border border-hf-lime/30 bg-hf-lime/5 px-4 py-3">
        <AlertCircle className="size-4 shrink-0 text-hf-lime" aria-hidden strokeWidth={2} />
        <span className="text-sm font-medium text-white">{CONTESTS.notice.label}</span>
        <span className="text-xs text-hf-muted">{CONTESTS.notice.body}</span>
        <button
          type="button"
          onClick={() => toast("Final cut upload opened")}
          className="ml-auto shrink-0 rounded-lg border border-hf-border px-3 py-1.5 text-xs text-white transition-colors hover:border-hf-lime/50 hover:text-hf-lime"
        >
          {CONTESTS.notice.cta}
        </button>
      </div>

      {tab === "Timeline" ? (
        <section className="mt-8">
          <RailHeading title="Timeline" />
          <ol className="mt-4 space-y-3">
            {CONTESTS.timeline.map((entry, index) => (
              <li
                key={entry.label}
                className="flex items-center gap-4 rounded-xl border border-hf-border bg-hf-surface px-4 py-3.5"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-hf-surface-4 text-xs text-hf-lime">
                  {index + 1}
                </span>
                <span className="text-sm font-medium text-white">{entry.label}</span>
                <span className="ml-auto text-sm text-hf-muted">{entry.date}</span>
              </li>
            ))}
          </ol>
        </section>
      ) : tab === "Rules" ? (
        <section className="mt-8">
          <RailHeading title="Rules" />
          <ul className="mt-4 space-y-2.5 text-sm leading-relaxed text-hf-muted">
            {[
              "Films must be created inside Higgsfield and submitted as a festival project.",
              "Any story, any genre. Runtime between 60 seconds and 12 minutes.",
              "Entrants keep full commercial rights to their work.",
              "One submission per creator; teams must nominate a single entrant.",
              "Final cuts may be updated until the extended deadline of Sep 14.",
            ].map((rule) => (
              <li key={rule} className="flex gap-2.5">
                <span className="mt-2 size-1.5 shrink-0 rounded-full bg-hf-lime" aria-hidden />
                {rule}
              </li>
            ))}
          </ul>
        </section>
      ) : (
        <>
          <section className="mt-8 overflow-hidden rounded-2xl border border-hf-border bg-gradient-to-br from-[#1a1405] via-hf-surface to-hf-black p-6 sm:p-8">
            <h2 className="font-display text-2xl font-bold tracking-tight text-white uppercase sm:text-3xl">
              {CONTESTS.active.title}
            </h2>
            <p className="mt-2 text-sm text-hf-muted">{CONTESTS.active.tagline}</p>

            <p className="mt-6 font-display text-4xl font-bold tracking-tight text-hf-lime sm:text-5xl">
              {CONTESTS.active.prizePool}
            </p>
            <p className="text-xs text-hf-muted">
              {CONTESTS.active.prizeLabel} · {CONTESTS.active.window}
            </p>

            <div className="mt-6">
              <p className="text-xs text-hf-dim">Submissions close in</p>
              <div className="mt-2 flex flex-wrap gap-2" aria-live="polite">
                <Segment value={days} unit="days" />
                <Segment value={hours} unit="hours" />
                <Segment value={minutes} unit="minutes" />
                <Segment value={seconds} unit="seconds" />
              </div>
            </div>

            <button
              type="button"
              onClick={() => setEntered(true)}
              className="mt-6 rounded-xl bg-hf-lime px-5 py-3 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              {entered ? "Festival project created" : CONTESTS.active.cta}
            </button>
          </section>

          <section className="mt-12">
            <RailHeading title="Prize pool" />
            <ul className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {CONTESTS.prizes.map((prize, index) => (
                <li
                  key={prize.place}
                  className={`rounded-2xl border p-5 ${
                    index === 0 ? "border-hf-lime/40 bg-hf-lime/5" : "border-hf-border bg-hf-surface"
                  }`}
                >
                  <Trophy
                    className={`size-4 ${index === 0 ? "text-hf-lime" : "text-hf-dim"}`}
                    aria-hidden
                    strokeWidth={1.75}
                  />
                  <p className="mt-3 font-display text-2xl font-bold tracking-tight text-white">
                    {prize.amount}
                  </p>
                  <p className="mt-1 text-xs text-hf-muted">{prize.place}</p>
                </li>
              ))}
            </ul>
          </section>

          <section className="mt-12">
            <RailHeading title="Past challenges" />
            <ul className="mt-4 grid gap-3 sm:grid-cols-3">
              {CONTESTS.past.map((contest) => (
                <li
                  key={contest.title}
                  className="rounded-2xl border border-hf-border bg-hf-surface p-5 opacity-80"
                >
                  <span className="rounded bg-hf-surface-4 px-1.5 py-0.5 text-[10px] text-hf-dim">
                    {contest.status}
                  </span>
                  <h3 className="mt-3 text-sm font-semibold text-white">{contest.title}</h3>
                  <p className="mt-1 text-xs text-hf-muted">
                    {contest.prize} · {contest.winners}
                  </p>
                </li>
              ))}
            </ul>
          </section>
        </>
      )}
    </>
  );
}
