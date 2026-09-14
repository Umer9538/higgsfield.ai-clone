"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowLeft, Check, Tag } from "lucide-react";
import {
  GOALS,
  LANDING_ROUTE,
  LEVELS,
  MODELS,
  ROLES,
  STORAGE_KEY,
  markOnboardingCompleted,
  type Choice,
  type QuizAnswers,
} from "@/lib/onboarding/content";
import { useToast } from "@/components/ui/Toast";

const STEPS = 3;

function ChoiceCard({
  choice,
  selected,
  multi,
  onSelect,
}: {
  choice: Choice;
  selected: boolean;
  multi?: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role={multi ? "checkbox" : "radio"}
      aria-checked={selected}
      onClick={onSelect}
      className={`flex min-h-11 w-full flex-col items-start rounded-2xl border p-4 text-left transition-colors ${
        selected
          ? "border-hf-lime bg-hf-lime/10"
          : "border-hf-border bg-hf-surface-2 hover:border-hf-lime/40"
      }`}
    >
      <span className="flex w-full items-start justify-between gap-2">
        <span className="text-sm font-medium text-white">{choice.label}</span>
        <span
          className={`flex size-5 shrink-0 items-center justify-center border ${
            multi ? "rounded" : "rounded-full"
          } ${selected ? "border-hf-lime bg-hf-lime text-black" : "border-hf-border"}`}
        >
          {selected ? <Check className="size-3" aria-hidden strokeWidth={3} /> : null}
        </span>
      </span>
      <span className="mt-1 text-xs leading-relaxed text-hf-muted">{choice.description}</span>
    </button>
  );
}

export function Quiz() {
  const [step, setStep] = useState(0);
  const [role, setRole] = useState<string | null>(null);
  const [level, setLevel] = useState<string | null>(null);
  const [models, setModels] = useState<string[]>([]);
  const [goal, setGoal] = useState<string | null>(null);
  const [claimed, setClaimed] = useState(false);

  const router = useRouter();
  const { toast } = useToast();

  const canAdvance =
    (step === 0 && role !== null) ||
    (step === 1 && level !== null && models.length > 0) ||
    (step === 2 && goal !== null);

  const finish = () => {
    const answers: QuizAnswers = {
      hasCompletedOnboarding: true,
      role,
      level,
      models,
      goal,
      claimedDiscount: claimed,
      completedAt: new Date().toISOString(),
    };
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(answers));
    } catch {
      // Blocked storage just means preferences do not persist.
    }
    markOnboardingCompleted();
    toast("Profile saved — your workspace is personalised");
    router.push(LANDING_ROUTE);
  };

  return (
    <div className="flex min-h-dvh flex-col lg:flex-row">
      {/* Media half */}
      <div className="relative hidden lg:block lg:w-[38%]">
        <Image
          src={`/media/steps/${(step % 3) + 1}.jpg`}
          alt=""
          fill
          sizes="38vw"
          className="object-cover"
          priority
        />
      </div>

      <div className="flex flex-1 flex-col px-4 py-6 sm:px-8">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => (step === 0 ? router.push("/explore") : setStep(step - 1))}
            aria-label="Back"
            className="flex size-11 items-center justify-center rounded-full border border-hf-border text-hf-muted transition-colors hover:text-white"
          >
            <ArrowLeft className="size-4" aria-hidden strokeWidth={1.75} />
          </button>

          <ol className="flex flex-1 items-center justify-center gap-1.5" aria-label="Progress">
            {Array.from({ length: STEPS }).map((_, index) => (
              <li
                key={index}
                aria-current={index === step ? "step" : undefined}
                className={`h-1 w-8 rounded-full ${index <= step ? "bg-hf-lime" : "bg-hf-surface-4"}`}
              />
            ))}
          </ol>

          <span className="w-11 shrink-0 text-right text-xs text-hf-dim">
            {step + 1}/{STEPS}
          </span>
        </div>

        <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col justify-center py-10">
          {step === 0 ? (
            <>
              <h1 className="text-center font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                <span className="text-white">What do you make</span>
                <br />
                <span className="text-hf-muted">with Higgsfield?</span>
              </h1>
              <div role="radiogroup" aria-label="Primary workflow" className="mt-8 grid gap-3 sm:grid-cols-2">
                {ROLES.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    selected={role === choice.id}
                    onSelect={() => setRole(choice.id)}
                  />
                ))}
              </div>
              <p className="mt-8 text-center text-xs text-hf-dim">
                We&apos;ll tailor features and AI tools to your goals
              </p>
            </>
          ) : step === 1 ? (
            <>
              <h1 className="text-center font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                <span className="text-white">How experienced</span>
                <br />
                <span className="text-hf-muted">are you with AI?</span>
              </h1>
              <div role="radiogroup" aria-label="Experience level" className="mt-8 grid gap-3 sm:grid-cols-2">
                {LEVELS.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    selected={level === choice.id}
                    onSelect={() => setLevel(choice.id)}
                  />
                ))}
              </div>

              <h2 className="mt-10 text-center text-sm font-medium text-white">
                Which models do you want to start with?
              </h2>
              <div role="group" aria-label="Preferred models" className="mt-4 grid gap-3 sm:grid-cols-2">
                {MODELS.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    multi
                    selected={models.includes(choice.id)}
                    onSelect={() =>
                      setModels((prev) =>
                        prev.includes(choice.id)
                          ? prev.filter((id) => id !== choice.id)
                          : [...prev, choice.id],
                      )
                    }
                  />
                ))}
              </div>
              <p className="mt-8 text-center text-xs text-hf-dim">Choose as many options as you want</p>
            </>
          ) : (
            <>
              <h1 className="text-center font-display text-2xl leading-tight font-bold tracking-tight sm:text-3xl">
                <span className="text-white">What are you</span>
                <br />
                <span className="text-hf-muted">working toward?</span>
              </h1>
              <div role="radiogroup" aria-label="Goal" className="mt-8 grid gap-3 sm:grid-cols-2">
                {GOALS.map((choice) => (
                  <ChoiceCard
                    key={choice.id}
                    choice={choice}
                    selected={goal === choice.id}
                    onSelect={() => setGoal(choice.id)}
                  />
                ))}
              </div>

              <button
                type="button"
                aria-pressed={claimed}
                onClick={() => {
                  setClaimed(!claimed);
                  if (!claimed) toast("54% sign-up discount claimed");
                }}
                className={`mt-8 flex min-h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 py-4 text-sm transition-colors ${
                  claimed
                    ? "border-hf-lime bg-hf-lime/10 text-hf-lime"
                    : "border-dashed border-hf-border text-white hover:border-hf-lime/50"
                }`}
              >
                <Tag className="size-4" aria-hidden strokeWidth={1.75} />
                {claimed ? "54% sign-up discount claimed" : "Claim your 54% sign-up discount"}
                <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-bold text-white">
                  54% OFF
                </span>
              </button>
            </>
          )}
        </div>

        <div className="mx-auto w-full max-w-2xl pb-4">
          <button
            type="button"
            disabled={!canAdvance}
            onClick={() => (step === STEPS - 1 ? finish() : setStep(step + 1))}
            className="h-12 w-full rounded-xl bg-hf-lime text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep disabled:cursor-not-allowed disabled:bg-hf-lime-muted disabled:text-black/60"
          >
            {step === STEPS - 1 ? "Finish and start creating" : "Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
