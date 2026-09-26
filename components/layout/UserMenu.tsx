"use client";

import { useEffect, useRef } from "react";
import { useExclusiveOverlay, useRouteScopedOpen } from "@/components/ui/overlay";
import Link from "next/link";
import { LogOut, Settings, Sparkles, User } from "lucide-react";
import { useAuth } from "@/lib/auth/context";
import { useToast } from "@/components/ui/Toast";

const LINKS = [
  { href: "/assets", label: "Profile", icon: User },
  { href: "/pricing", label: "Settings", icon: Settings },
  { href: "/welcome-quiz", label: "Onboarding", icon: Sparkles },
];

export function UserMenu() {
  const { user, signOut } = useAuth();
  const { toast } = useToast();
  const { open, toggle, close } = useRouteScopedOpen();
  useExclusiveOverlay("account-menu", open, close);
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onClick = (event: MouseEvent) => {
      if (!wrap.current?.contains(event.target as Node)) close();
    };
    const onKey = (event: KeyboardEvent) => event.key === "Escape" && close();
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, close]);

  return (
    <div ref={wrap} className="relative">
      <button
        type="button"
        aria-label="Account"
        aria-expanded={open}
        aria-haspopup="menu"
        onClick={toggle}
        className="flex size-9 items-center justify-center rounded-full bg-hf-surface-4 text-xs font-bold text-hf-accent-soft uppercase ring-2 ring-hf-accent"
      >
        {user?.handle.slice(0, 1) ?? "?"}
      </button>

      {open ? (
        <div
          role="menu"
          aria-label="Account menu"
          className="absolute top-full right-0 z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-hf-border bg-hf-surface-3 py-1 shadow-lg"
        >
          <p className="truncate border-b border-hf-border px-3 py-2.5 text-xs text-hf-dim">
            {user?.email}
          </p>

          {LINKS.map(({ href, label, icon: ItemIcon }) => (
            <Link
              key={label}
              href={href}
              role="menuitem"
              onClick={close}
              className="flex min-h-11 items-center gap-2.5 px-3 py-2.5 text-sm text-white transition-colors hover:bg-hf-surface-4"
            >
              <ItemIcon className="size-4 text-hf-dim" aria-hidden strokeWidth={1.75} />
              {label}
            </Link>
          ))}

          <button
            type="button"
            role="menuitem"
            onClick={() => {
              signOut();
              close();
              toast("Signed out");
            }}
            className="flex min-h-11 w-full items-center gap-2.5 border-t border-hf-border px-3 py-2.5 text-sm text-white transition-colors hover:bg-hf-surface-4"
          >
            <LogOut className="size-4 text-hf-dim" aria-hidden strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      ) : null}
    </div>
  );
}
