"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth/context";
import { clearGeneratedAssets, getGeneratedServerSnapshot, getGeneratedSnapshot, subscribeGenerated } from "@/lib/assets/store";
import { COMPLETED_KEY } from "@/lib/onboarding/content";
import { SANDBOX_KEY } from "@/lib/onboarding/sandbox";
import { setPreference, usePreferences } from "@/lib/ui/preferences";
import { toggleHud } from "@/components/ui/PerfHud";
import { useToast } from "@/components/ui/Toast";
import { SignedOut } from "./SignedOut";

/** Everything this app keeps in the browser — it sets no cookies at all. */
const STORED = [
  { key: "hf.auth", what: "Your sign-in (email and display name)" },
  { key: "hf.generatedAssets", what: "Generations saved on this device" },
  { key: "hf.onboarding", what: "Your starting preset from onboarding" },
  { key: "hf.onboardingCompleted", what: "Whether onboarding has been shown" },
  { key: "hf.prefs", what: "Preferences on this page" },
  { key: "hf.hud", what: "Whether the performance HUD is open" },
  { key: "hf.device", what: "A random id for this browser, so favourites work signed out" },
  { key: "hf.hiddenAssets", what: "Library items you have hidden" },
];

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-title`} className="scroll-mt-24 border-t border-hf-border py-8 first:border-t-0 first:pt-0">
      <h2 id={`${id}-title`} className="font-display text-xl font-bold tracking-[-0.025em] text-white">
        {title}
      </h2>
      <div className="mt-4 space-y-4">{children}</div>
    </section>
  );
}

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div className="min-w-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {hint ? <p className="mt-0.5 text-xs text-hf-dim">{hint}</p> : null}
      </div>
      {children}
    </div>
  );
}

const BUTTON =
  "press flex min-h-11 items-center rounded-[var(--radius-control)] border border-hf-border px-4 text-sm text-white hover:border-hf-accent/50";

export function SettingsView() {
  const { user, signOut, updateProfile } = useAuth();
  const { reducedMotion } = usePreferences();
  const generations = useSyncExternalStore(subscribeGenerated, getGeneratedSnapshot, getGeneratedServerSnapshot);
  const [name, setName] = useState<string | null>(null);
  const [confirmClear, setConfirmClear] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const nameValue = name ?? user?.displayName ?? "";

  return (
    <div className="mx-auto max-w-2xl py-10">
      <h1 className="mb-8 font-display text-3xl font-bold tracking-[-0.03em] text-white">Settings</h1>

      {user ? (
        <Section id="account" title="Account">
          <form
            onSubmit={(event) => {
              event.preventDefault();
              updateProfile({ displayName: nameValue });
              setName(null);
              toast("Display name saved");
            }}
            className="flex flex-wrap items-end gap-2"
          >
            <label className="min-w-0 flex-1">
              <span className="mb-1.5 block text-xs font-medium text-hf-dim">Display name</span>
              <input
                value={nameValue}
                maxLength={40}
                placeholder={user.handle}
                onChange={(event) => setName(event.target.value)}
                className="min-h-11 w-full rounded-[var(--radius-control)] border border-hf-border bg-hf-surface-2 px-3 text-sm text-white placeholder:text-hf-dim focus:border-hf-accent/50 focus:outline-none"
              />
            </label>
            <button type="submit" disabled={name === null} className={`${BUTTON} disabled:opacity-40`}>
              Save
            </button>
          </form>
          <Row label="Email" hint="Used to sign in">
            <span className="text-sm text-hf-muted">{user.email}</span>
          </Row>
          <Row label="Plan" hint="Credits and billing">
            <Link href="/pricing" className={BUTTON}>
              See plans
            </Link>
          </Row>
          <Row label="Sign out" hint="On this device">
            <button
              type="button"
              onClick={() => {
                signOut();
                toast("Signed out");
                router.push("/");
              }}
              className={`${BUTTON} hover:border-hf-danger hover:text-hf-danger`}
            >
              Sign out
            </button>
          </Row>
        </Section>
      ) : (
        <Section id="account" title="Account">
          <SignedOut page="account settings" />
        </Section>
      )}

      <Section id="preferences" title="Preferences">
        <Row label="Reduce motion" hint="Turns off page, card and sheet animation everywhere. Saved on this device.">
          <button
            type="button"
            role="switch"
            aria-checked={reducedMotion}
            aria-label="Reduce motion"
            onClick={() => setPreference("reducedMotion", !reducedMotion)}
            className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${reducedMotion ? "bg-hf-cyan" : "bg-hf-surface-4"}`}
          >
            {/* left-0 anchors it: without it an absolute child starts from the
                button's centred content, which put the "off" knob on the right */}
            <span
              data-knob
              className={`absolute top-1 left-0 size-5 rounded-full bg-white transition-transform ${reducedMotion ? "translate-x-6" : "translate-x-1"}`}
            />
          </button>
        </Row>
        <Row label="Performance HUD" hint="Live frame rate, Web Vitals and API latency. Shortcut: Shift + D.">
          <button type="button" onClick={toggleHud} className={BUTTON}>
            Toggle HUD
          </button>
        </Row>
        <Row label="Onboarding" hint="Build a new starting preset from scratch">
          <button
            type="button"
            onClick={() => {
              try {
                window.localStorage.removeItem(COMPLETED_KEY);
                window.localStorage.removeItem(SANDBOX_KEY);
              } catch {
                // blocked storage: onboarding still opens
              }
              router.push("/welcome-quiz");
            }}
            className={BUTTON}
          >
            Run again
          </button>
        </Row>
      </Section>

      <Section id="data" title="Your data">
        <p className="text-sm text-hf-muted">
          Higgsfield sets no cookies. In this browser&apos;s local storage it keeps only the items below.
          In the database it keeps the generations you run (a shared demo library) and your favourites.
        </p>
        <ul aria-label="Stored in this browser" className="divide-y divide-hf-border rounded-[var(--radius-media)] border border-hf-border">
          {STORED.map((item) => (
            <li key={item.key} className="flex flex-wrap items-center justify-between gap-2 px-4 py-3">
              <span className="text-sm text-white">{item.what}</span>
              <code className="font-mono text-[11px] text-hf-dim">{item.key}</code>
            </li>
          ))}
        </ul>
        <Row label="Saved generations" hint={`${generations.length} on this device`}>
          {confirmClear ? (
            <span className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  clearGeneratedAssets();
                  setConfirmClear(false);
                  toast("Saved generations cleared");
                }}
                className="press flex min-h-11 items-center rounded-[var(--radius-control)] bg-hf-danger px-4 text-sm font-semibold text-white"
              >
                Clear {generations.length}
              </button>
              <button type="button" onClick={() => setConfirmClear(false)} className={BUTTON}>
                Keep
              </button>
            </span>
          ) : (
            <button
              type="button"
              disabled={generations.length === 0}
              onClick={() => setConfirmClear(true)}
              className={`${BUTTON} hover:border-hf-danger hover:text-hf-danger disabled:opacity-40`}
            >
              Clear…
            </button>
          )}
        </Row>
      </Section>
    </div>
  );
}
