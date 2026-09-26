"use client";

import { useState } from "react";
import { ArrowLeft } from "lucide-react";
import { useToast } from "@/components/ui/Toast";

/**
 * Forgot password: request a code by email, then enter the six digits. Owns
 * its own stage and digits; the form only knows whether recovery is open.
 */
export function PasswordRecovery({
  email,
  setEmail,
  onBack,
  onVerified,
}: {
  email: string;
  setEmail: (value: string) => void;
  onBack: () => void;
  onVerified: (address: string) => void;
}) {
  const [stage, setStage] = useState<"request" | "code">("request");
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const { toast } = useToast();

    const filled = code.every((digit) => digit !== "");
    return (
      <div>
        <button
          type="button"
          onClick={onBack}
          className="flex min-h-11 items-center gap-1.5 text-sm text-hf-muted transition-colors hover:text-white"
        >
          <ArrowLeft className="size-4" aria-hidden strokeWidth={1.75} />
          Back
        </button>

        {stage === "request" ? (
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
              className="mt-1.5 h-11 w-full rounded-lg border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none"
            />
            <button
              type="submit"
              className="mt-5 h-11 w-full rounded-2xl bg-hf-accent text-sm font-semibold text-black transition-colors hover:bg-hf-accent-hover"
            >
              Send code
            </button>
          </form>
        ) : (
          <form
            className="mt-4"
            onSubmit={(event) => {
              event.preventDefault();
              onVerified(email || "creator@higgsfield.ai");
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
                  className="h-12 w-full rounded-lg border border-hf-border bg-hf-surface-2 text-center text-lg font-semibold text-white focus:border-hf-accent focus:outline-none"
                />
              ))}
            </div>

            <button
              type="submit"
              disabled={!filled}
              className="mt-5 h-11 w-full rounded-2xl bg-hf-accent text-sm font-semibold text-black transition-colors hover:bg-hf-accent-hover disabled:cursor-not-allowed disabled:bg-hf-accent-muted disabled:text-black/60"
            >
              Verify and continue
            </button>
          </form>
        )}
      </div>
    );
}
