"use client";

import { useCallback, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles, Wand2 } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { markOnboardingCompleted } from "@/lib/onboarding/content";
import {
  MEDIUMS,
  SANDBOX_KEY,
  TAG_GROUPS,
  buildPrompt,
  mediumById,
  presetSettings,
  promptParts,
  studioUrl,
  surprise,
  type MediumId,
  type Picks,
  type SandboxAnswers,
} from "@/lib/onboarding/sandbox";
import { RenderPreview } from "./RenderPreview";

const STEPS = ["Medium", "Prompt", "Render", "Open"];

/** The same spring as the rest of the app's sheets: stiffness 300, damping 30. */
const SPRING = { type: "spring", stiffness: 300, damping: 30 } as const;

/**
 * Onboarding as a sandbox: instead of answering questions about yourself,
 * you make something. Pick a medium, build a prompt from tags, watch a test
 * frame render, then open the matching studio with that exact prompt and
 * those controls already set.
 */
export function Sandbox() {
  const router = useRouter();
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [mediumId, setMediumId] = useState<MediumId | null>(null);
  const [subject, setSubject] = useState("");
  const [subjectEdited, setSubjectEdited] = useState(false);
  const [picks, setPicks] = useState<Picks>({});
  const [runId, setRunId] = useState(0);
  const [rendered, setRendered] = useState(false);

  const medium = mediumId ? mediumById(mediumId) : null;
  const prompt = buildPrompt(subject, picks);
  const settings = medium ? presetSettings(medium, picks) : [];

  const go = (next: number) => {
    setDirection(next > step ? 1 : -1);
    if (next === 2) {
      setRendered(false);
      setRunId((id) => id + 1);
    }
    setStep(next);
  };

  const chooseMedium = (id: MediumId) => {
    setMediumId(id);
    // Offer a subject to start from, unless you have already written your own
    if (!subjectEdited) setSubject(mediumById(id).subjects[0]);
    go(1);
  };

  const onRendered = useCallback(() => setRendered(true), []);

  const open = () => {
    if (!medium) return;
    const answers: SandboxAnswers = {
      hasCompletedOnboarding: true,
      medium: medium.id,
      subject,
      picks,
      prompt,
      settings,
      completedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(SANDBOX_KEY, JSON.stringify(answers));
    } catch {
      // Blocked storage: the preset still travels in the URL
    }
    markOnboardingCompleted();
    router.push(studioUrl(medium, prompt, settings));
  };

  const active = step === 2 && rendered ? 3 : step;

  return (
    <div className="flex min-h-dvh flex-col bg-hf-black">
      <header className="flex items-center gap-4 px-4 py-4 sm:px-8">
        <Link href="/" aria-label="Higgsfield home" className="flex min-h-11 items-center text-white">
          <Logo />
        </Link>
        <ol aria-label="Progress" className="mx-auto flex items-center gap-2">
          {STEPS.map((label, index) => (
            <li
              key={label}
              aria-current={index === active ? "step" : undefined}
              className={`flex items-center gap-2 text-xs ${index <= active ? "text-white" : "text-hf-dim"}`}
            >
              <span
                className={`h-1 w-8 rounded-full transition-opacity sm:w-10 ${index <= active ? "bg-hf-accent" : "bg-hf-surface-4"}`}
              />
              <span className="hidden sm:inline">{label}</span>
            </li>
          ))}
        </ol>
        <Link
          href="/explore"
          className="flex min-h-11 items-center px-2 text-sm text-hf-muted transition-colors hover:text-white"
        >
          Skip for now
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col px-4 pt-4 pb-10 sm:px-8">
        <AnimatePresence mode="wait" custom={direction} initial={false}>
          <motion.section
            key={step}
            custom={direction}
            initial={reduce ? { opacity: 0 } : { opacity: 0, x: direction * 48 }}
            animate={{ opacity: 1, x: 0 }}
            exit={reduce ? { opacity: 0 } : { opacity: 0, x: direction * -48 }}
            transition={reduce ? { duration: 0 } : SPRING}
            className="flex flex-1 flex-col"
          >
            {step === 0 ? (
              <>
                <h1 className="text-center font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
                  What are you creating today?
                </h1>
                <p className="mt-2 text-center text-sm text-hf-muted">
                  Pick one. You&apos;ll make a test frame in the next minute.
                </p>
                <div role="radiogroup" aria-label="What are you creating today?" className="mt-8 grid gap-3 sm:grid-cols-2">
                  {MEDIUMS.map((item) => {
                    const selected = item.id === mediumId;
                    return (
                      <button
                        key={item.id}
                        type="button"
                        role="radio"
                        aria-checked={selected}
                        onClick={() => chooseMedium(item.id)}
                        className={`press group relative overflow-hidden rounded-[var(--radius-panel)] border text-left ${
                          selected
                            ? "border-hf-accent shadow-[0_0_0_1px_var(--color-hf-accent),0_18px_48px_-18px_color-mix(in_srgb,var(--color-hf-accent)_70%,transparent)]"
                            : "border-hf-border hover:border-hf-accent/50"
                        }`}
                      >
                        <span className="relative block aspect-[16/9]">
                          <Image src={item.still} alt="" fill sizes="(max-width: 640px) 100vw, 360px" className="object-cover" />
                          <span className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent" />
                        </span>
                        <span className="absolute inset-x-0 bottom-0 p-4">
                          <span className="block font-display text-lg font-bold tracking-[-0.02em] text-white">{item.label}</span>
                          <span className="mt-0.5 block text-xs text-white/75">{item.description}</span>
                          <span className="mt-2 block text-[11px] text-hf-accent-soft">Opens in {item.studioLabel}</span>
                        </span>
                      </button>
                    );
                  })}
                </div>
              </>
            ) : null}

            {step === 1 && medium ? (
              <>
                <h1 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
                  Build your prompt
                </h1>
                <p className="mt-2 text-sm text-hf-muted">Tap tags to add them. The prompt writes itself as you go.</p>

                <div className="mt-6 flex flex-wrap items-end gap-2">
                  <label className="min-w-0 flex-1">
                    <span className="mb-1.5 block text-xs font-medium text-hf-dim">What&apos;s in the shot?</span>
                    <input
                      value={subject}
                      onChange={(event) => {
                        setSubject(event.target.value);
                        setSubjectEdited(true);
                      }}
                      className="min-h-11 w-full rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none"
                    />
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const next = surprise(medium);
                      setSubject(next.subject);
                      setPicks(next.picks);
                    }}
                    className="press flex min-h-11 items-center gap-2 rounded-[var(--radius-control)] border border-hf-accent/40 bg-hf-accent/10 px-4 text-sm font-medium text-hf-accent-soft hover:bg-hf-accent/20"
                  >
                    <Sparkles className="size-4" aria-hidden strokeWidth={2} />
                    Surprise me
                  </button>
                </div>

                <div className="mt-6 space-y-5">
                  {TAG_GROUPS.map((group) => (
                    <div key={group.id}>
                      <p id={`group-${group.id}`} className="mb-2 text-xs font-medium text-hf-dim">
                        {group.label}
                      </p>
                      <div role="radiogroup" aria-labelledby={`group-${group.id}`} className="flex flex-wrap gap-2">
                        {group.tags.map((tag) => {
                          const on = picks[group.id] === tag.id;
                          return (
                            <button
                              key={tag.id}
                              type="button"
                              role="radio"
                              aria-checked={on}
                              // Tapping the chosen tag again clears the group
                              onClick={() => setPicks((prev) => ({ ...prev, [group.id]: on ? undefined : tag.id }))}
                              className={`press flex min-h-11 items-center rounded-full border px-4 text-sm transition-colors sm:min-h-9 ${
                                on
                                  ? "border-hf-cyan bg-hf-cyan/15 text-white"
                                  : "border-hf-border text-hf-muted hover:border-hf-cyan/50 hover:text-white"
                              }`}
                            >
                              {tag.label}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="gradient-border mt-6 rounded-[var(--radius-panel)] p-4">
                  <p className="text-xs font-medium text-hf-dim">Live prompt</p>
                  <output data-live-prompt aria-live="polite" className="mt-1.5 block text-base leading-relaxed text-white">
                    {promptParts(subject, picks).map((part, index) => (
                      <span key={index}>
                        {index > 0 ? <span className="text-hf-dim">, </span> : null}
                        <span className={part.tag ? "text-hf-cyan" : ""}>{part.text}</span>
                      </span>
                    ))}
                  </output>
                  {settings.length > 0 ? (
                    <ul aria-label="Studio settings" className="mt-3 flex flex-wrap gap-1.5">
                      {settings.map(([key, value]) => (
                        <li key={key} className="rounded-md bg-hf-surface-4 px-2 py-1 font-mono text-[11px] text-hf-muted">
                          {key} <span className="text-white">{value}</span>
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>

                <div className="mt-8 flex gap-2">
                  <button
                    type="button"
                    onClick={() => go(0)}
                    aria-label="Back"
                    className="press flex size-12 items-center justify-center rounded-[var(--radius-control)] border border-hf-border text-hf-muted hover:text-white"
                  >
                    <ArrowLeft className="size-4" aria-hidden strokeWidth={2} />
                  </button>
                  <button
                    type="button"
                    disabled={!subject.trim()}
                    onClick={() => go(2)}
                    className="press glow flex h-12 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] bg-hf-accent text-sm font-semibold text-black hover:bg-hf-accent-hover disabled:cursor-not-allowed disabled:bg-hf-accent-muted disabled:text-black/60"
                  >
                    <Wand2 className="size-4" aria-hidden strokeWidth={2} />
                    Render a test frame
                  </button>
                </div>
              </>
            ) : null}

            {step === 2 && medium ? (
              <>
                <h1 className="font-display text-3xl leading-tight font-bold tracking-[-0.03em] text-white sm:text-4xl">
                  {rendered ? "Your first frame" : "Rendering…"}
                </h1>
                <p className="mt-2 text-sm text-hf-muted">
                  {rendered
                    ? `Graded and framed from your tags. Open ${medium.studioLabel} to generate the real thing.`
                    : "Three seconds. Watch it develop."}
                </p>

                <div className="mt-6">
                  <RenderPreview still={medium.still} picks={picks} runId={runId} onDone={onRendered} />
                </div>

                <p className="mt-4 text-sm leading-relaxed text-white">{prompt}</p>

                {rendered ? (
                  <motion.div
                    initial={reduce ? false : { opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={reduce ? { duration: 0 } : SPRING}
                    className="mt-6 space-y-3"
                  >
                    <button
                      type="button"
                      onClick={open}
                      className="press glow flex h-12 w-full items-center justify-center gap-2 rounded-[var(--radius-control)] bg-hf-accent text-sm font-semibold text-black hover:bg-hf-accent-hover"
                    >
                      Open Workspace with This Preset
                      <ArrowRight className="size-4" aria-hidden strokeWidth={2.25} />
                    </button>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => go(1)}
                        className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hf-border text-sm text-white hover:border-hf-accent/50"
                      >
                        <ArrowLeft className="size-4" aria-hidden strokeWidth={2} />
                        Edit prompt
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setRendered(false);
                          setRunId((id) => id + 1);
                        }}
                        className="press flex min-h-11 flex-1 items-center justify-center gap-2 rounded-[var(--radius-control)] border border-hf-border text-sm text-white hover:border-hf-accent/50"
                      >
                        <RotateCcw className="size-4" aria-hidden strokeWidth={2} />
                        Render again
                      </button>
                    </div>
                  </motion.div>
                ) : null}
              </>
            ) : null}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
