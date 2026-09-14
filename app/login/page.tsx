import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { AuthForm } from "@/components/auth/AuthForm";

export const metadata: Metadata = {
  title: "Log in — Higgsfield",
  description: "Access your Higgsfield workspace.",
};

export default function Page() {
  return (
    <>
      <AppHeader />
      <main className="mx-auto flex min-h-[calc(100dvh-var(--spacing-header))] max-w-md flex-col justify-center px-4 py-12">
        <div className="rounded-2xl border border-hf-border bg-hf-surface p-6 sm:p-8">
          <AuthForm mode="signin" />
        </div>
        <p className="mt-5 text-center text-xs leading-relaxed text-hf-dim">
          This rebuild uses mock authentication. Nothing is verified and every route stays
          publicly accessible whether you sign in or not.
        </p>
      </main>
    </>
  );
}
