"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Mail } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/ui/Toast";

export type AuthMode = "signin" | "signup";

const PROVIDERS = [
  { id: "google", label: "Continue with Google", mark: "G" },
  { id: "apple", label: "Continue with Apple", mark: "" },
  { id: "microsoft", label: "Continue with Microsoft", mark: "⊞" },
];

export function AuthForm({
  mode: initialMode,
  onDone,
}: {
  mode: AuthMode;
  onDone?: () => void;
}) {
  const [mode, setMode] = useState<AuthMode>(initialMode);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [stage, setStage] = useState<"form" | "forgot" | "code">("form");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const [busy, setBusy] = useState(false);

  const { signIn } = useAuth();
  const { toast } = useToast();
  const router = useRouter();

  const complete = (address: string) => {
    const account = signIn(address);
    toast(`Successfully signed in as ${account.handle}`);
    onDone?.();
    router.push(mode === "signup" ? "/welcome-quiz" : "/explore");
  };

  const submit = (event: React.FormEvent) => {
    event.preventDefault();
    setBusy(true);
    // No backend: resolve on the next tick so the pending state is observable.
    setTimeout(() => {
      setBusy(false);
      complete(email || "creator@higgsfield.ai");
    }, 350);
  };

  if (stage === "forgot" || stage === "code") {
    const filled = code.every((digit) => digit !== "");
    return (
      <div>
        <button
          type="button"
          onClick={() => setStage("form")}
          className="flex min-h-11 items-center gap-1.5 text-sm text-hf-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden strokeWidth={1.75} />
          Back
        </button>

        {stage === "forgot" ? (
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              setStage("code");
              toast("We sent a 6-digit code to your email", "info");
            }}
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Reset your password
            </h2>
            <p className="mt-2 text-sm text-hf-muted">
              Enter your email and we&apos;ll send a 6-digit verification code.
            </p>
            <label htmlFor="reset-email" className="mt-5 block text-xs text-hf-muted">
              Email
            </label>
            <input
              id="reset-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="mt-1.5 h-11 w-full rounded-lg border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
            />
            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-xl bg-hf-lime text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
            >
              Send code
            </button>
          </form>
        ) : (
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              complete(email || "creator@higgsfield.ai");
            }}
          >
            <h2 className="font-display text-xl font-bold tracking-tight text-white">
              Enter verification code
            </h2>
            <p className="mt-2 text-sm text-hf-muted">
              We sent a 6-digit code to {email || "your email"}.
            </p>

            <div className="mt-5 flex gap-2" role="group" aria-label="Verification code">
              {code.map((digit, index) => (
                <input
                  key={index}
                  aria-label={`Digit ${index + 1}`}
                  inputMode="numeric"
                  maxLength={1}
                  value={digit}
                  onChange={(event) => {
                    const next = [...code];
                    next[index] = event.target.value.replace(/\D/g, "").slice(0, 1);
                    setCode(next);
                    if (next[index] && index < 5) {
                      const sibling = event.target.parentElement?.children[index + 1];
                      (sibling as HTMLInputElement | undefined)?.focus();
                    }
                  }}
                  className="h-12 w-full rounded-lg border border-hf-border bg-hf-surface-2 text-center text-lg font-semibold text-white focus:border-hf-lime focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!filled}
              className="mt-5 h-11 w-full rounded-xl bg-hf-lime text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep disabled:cursor-not-allowed disabled:bg-hf-lime-muted disabled:text-black/60"
            >
              Verify and continue
            </button>
          </form>
        )}
      </div>
    );
  }

  return (
    <div>
      <h2 className="font-display text-xl font-bold tracking-tight text-white">
        {mode === "signin" ? "Welcome back" : "Create your account"}
      </h2>
      <p className="mt-2 text-sm text-hf-muted">
        {mode === "signin"
          ? "Sign in to pick up where you left off."
          : "Start generating in under a minute."}
      </p>

      <div className="mt-5 space-y-2">
        {PROVIDERS.map((provider) => (
          <button
            key={provider.id}
            type="button"
            onClick={() => complete(`${provider.id}.creator@higgsfield.ai`)}
            className="flex h-11 w-full items-center justify-center gap-2.5 rounded-xl bg-white text-sm font-medium text-black transition-opacity hover:opacity-90"
          >
            <span aria-hidden className="text-base leading-none">
              {provider.mark}
            </span>
            {provider.label}
          </button>
        ))}
      </div>

      <div className="my-5 flex items-center gap-3">
        <span className="h-px flex-1 bg-hf-border" />
        <span className="text-xs text-hf-dim">or</span>
        <span className="h-px flex-1 bg-hf-border" />
      </div>

      <form onSubmit={submit}>
        <label htmlFor="auth-email" className="block text-xs text-hf-muted">
          Email
        </label>
        <div className="relative mt-1.5">
          <Mail
            className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-hf-dim"
            aria-hidden
            strokeWidth={1.75}
          />
          <input
            id="auth-email"
            type="email"
            required
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@studio.com"
            className="h-11 w-full rounded-lg border border-hf-border bg-hf-surface-2 pr-3 pl-9 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
          />
        </div>

        <label htmlFor="auth-password" className="mt-4 block text-xs text-hf-muted">
          Password
        </label>
        <input
          id="auth-password"
          type="password"
          required
          minLength={6}
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="At least 6 characters"
          className="mt-1.5 h-11 w-full rounded-lg border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
        />

        {mode === "signin" ? (
          <button
            type="button"
            onClick={() => setStage("forgot")}
            className="mt-2 flex min-h-11 items-center text-xs text-hf-lime hover:underline"
          >
            Forgot password?
          </button>
        ) : null}

        <button
          type="submit"
          disabled={busy}
          className="mt-4 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-hf-lime text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep disabled:opacity-70"
        >
          {busy ? <Loader2 className="size-4 animate-spin motion-reduce:animate-none" aria-hidden /> : null}
          {mode === "signin" ? "Sign in" : "Create account"}
        </button>
      </form>

      <p className="mt-5 text-center text-sm text-hf-muted">
        {mode === "signin" ? "New to Higgsfield?" : "Already have an account?"}{" "}
        <button
          type="button"
          onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
          className="font-medium text-hf-lime hover:underline"
        >
          {mode === "signin" ? "Sign up" : "Sign in"}
        </button>
      </p>
    </div>
  );
}
