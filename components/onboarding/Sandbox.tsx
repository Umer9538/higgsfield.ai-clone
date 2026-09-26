"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { Logo } from "@/components/layout/Logo";
import { markOnboardingCompleted } from "@/lib/onboarding/content";
import {
  SANDBOX_KEY,
  buildPrompt,
  mediumById,
  presetSettings,
  studioUrl,
  surprise,
  type MediumId,
  type Picks,
  type SandboxAnswers,
} from "@/lib/onboarding/sandbox";
import { usePreferences } from "@/lib/ui/preferences";
import { BuilderStep } from "./steps/BuilderStep";
import { MediumStep } from "./steps/MediumStep";
import { RenderStep } from "./steps/RenderStep";
import { SPRING } from "./steps/motion";

const STEPS = ["Medium", "Prompt", "Render", "Open"];

/**
 * Onboarding as a sandbox: instead of answering questions about yourself,
 * you make something. Pick a medium, build a prompt from tags, watch a test
 * frame render, then open the matching studio with that exact prompt and
 * those controls already set.
 */
export function Sandbox() {
  const router = useRouter();
  // Motion's hook reads only the OS setting, and its springs run in JS where
  // the global CSS rule cannot reach; the in-app Settings toggle counts too
  const osReduce = useReducedMotion();
  const { reducedMotion } = usePreferences();
  const reduce = Boolean(osReduce || reducedMotion);
  // Spoken on tag changes only; the prompt itself is not a live region,
  // which re-read the whole prompt on every keystroke
  const [announcement, setAnnouncement] = useState("");
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
            {step === 0 ? <MediumStep mediumId={mediumId} chooseMedium={chooseMedium} /> : null}

            {step === 1 && medium ? (
              <BuilderStep
                subject={subject}
                picks={picks}
                settings={settings}
                announcement={announcement}
                onSubjectChange={(value) => {
                  setSubject(value);
                  setSubjectEdited(true);
                }}
                onSurprise={() => {
                  const next = surprise(medium);
                  setSubject(next.subject);
                  setPicks(next.picks);
                  setAnnouncement(`Prompt filled: ${buildPrompt(next.subject, next.picks)}`);
                }}
                onToggleTag={(group, tag) => {
                  // Tapping the chosen tag again clears the group
                  const on = picks[group.id] === tag.id;
                  setPicks((prev) => ({ ...prev, [group.id]: on ? undefined : tag.id }));
                  setAnnouncement(on ? `Removed ${tag.label}` : `Added ${tag.label}: ${tag.words}`);
                }}
                onBack={() => go(0)}
                onRender={() => go(2)}
              />
            ) : null}

            {step === 2 && medium ? (
              <RenderStep
                medium={medium}
                picks={picks}
                prompt={prompt}
                runId={runId}
                rendered={rendered}
                reduce={reduce}
                onRendered={onRendered}
                onOpen={open}
                onEdit={() => go(1)}
                onRerender={() => {
                  setRendered(false);
                  setRunId((id) => id + 1);
                }}
              />
            ) : null}
          </motion.section>
        </AnimatePresence>
      </main>
    </div>
  );
}
