"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { useToast } from "@/components/ui/Toast";
import { openCommandPalette } from "@/components/ui/CommandPalette";
import { useAuth } from "@/lib/auth/context";
import { AuthModal } from "@/components/auth/AuthModal";
import type { AuthMode } from "@/components/auth/AuthForm";
import { UserMenu } from "./UserMenu";
import { Logo } from "./Logo";

/**
 * What is left of the top bar once navigation moved to the rail: one way to
 * find anything, and the account. Nothing here competes with the page.
 */
export function TopBar() {
  const { toast } = useToast();
  const { isAuthenticated } = useAuth();
  const [authMode, setAuthMode] = useState<AuthMode | null>(null);

  return (
    <>
      {/* Layers: page sticky bars z-30/40 < top bar z-45 (its account menu
          must clear them) < rail, catalog and tab bar z-50 < sheets 60–80 <
          modals and HUD 90 < palette 95 < toasts 100. At z-40 it tied with
          Explore's sticky filter bar, which painted over the account menu. */}
      <header className="glass sticky top-0 z-[45] border-x-0 border-t-0">
        <div className="flex h-header items-center gap-3 px-4">
          <Link
            href="/"
            aria-label="Higgsfield home"
            className="flex min-h-11 shrink-0 items-center text-white md:hidden"
          >
            <Logo />
          </Link>

          <button
            type="button"
            aria-label="Search"
            onClick={openCommandPalette}
            className="press flex min-h-11 min-w-0 flex-1 items-center gap-2.5 rounded-[var(--radius-control)] border border-hf-border bg-hf-surface/70 px-3 text-sm text-hf-dim transition-colors hover:border-hf-accent/40 hover:text-hf-muted md:max-w-md"
          >
            <Search className="size-4 shrink-0" aria-hidden strokeWidth={1.75} />
            <span className="truncate">Search or jump to…</span>
            <kbd className="ml-auto hidden rounded bg-hf-surface-4 px-1.5 py-0.5 font-sans text-[11px] text-hf-muted sm:block">
              ⌘K
            </kbd>
          </button>

          <div className="ml-auto flex shrink-0 items-center gap-2">
            {isAuthenticated ? (
              <>
                <button
                  type="button"
                  aria-label="Notifications"
                  onClick={() => toast("No new notifications", "info")}
                  className="flex size-11 items-center justify-center rounded-[var(--radius-control)] text-hf-muted transition-colors hover:text-white"
                >
                  <Bell className="size-4" aria-hidden strokeWidth={1.75} />
                </button>
                <UserMenu />
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={() => setAuthMode("signin")}
                  className="hidden min-h-11 items-center px-2 text-sm text-hf-muted transition-colors hover:text-white sm:flex"
                >
                  Log in
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMode("signup")}
                  className="press flex min-h-11 items-center rounded-full bg-hf-accent px-4 text-sm font-semibold text-black transition-colors hover:bg-hf-accent-deep"
                >
                  Sign up
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Outside <header>: its backdrop-filter would contain this fixed overlay. */}
      <AuthModal open={authMode !== null} mode={authMode ?? "signin"} onClose={() => setAuthMode(null)} />
    </>
  );
}
