"use client";

import { useState } from "react";
import Link from "next/link";
import { Bell, Diamond, Menu, Search, Sparkles } from "lucide-react";
import { MobileNav } from "./MobileNav";
import { useToast } from "@/components/ui/Toast";
import { Logo } from "./Logo";

type Badge = "New" | "Free";

interface NavItem {
  key: string;
  label: string;
  href?: string;
  badge?: Badge;
  /** Renders a separator before this item */
  dividerBefore?: boolean;
}

/**
 * Mirrors the live app nav exactly, in order. Items without an href are
 * surfaces that have not been built yet and render as inert text.
 */
const NAV: NavItem[] = [
  { key: "explore", label: "Explore", href: "/explore" },
  { key: "image", label: "Image", href: "/ai/image" },
  { key: "video", label: "Video", href: "/ai/video" },
  { key: "audio", label: "Audio", href: "/ai/audio" },
  { key: "mcp", label: "MCP", href: "/mcp" },
  { key: "chatgpt-plugin", label: "ChatGPT Plugin", href: "/chatgpt-plugin", badge: "New", dividerBefore: true },
  { key: "genjutsu", label: "Genjutsu", href: "/ai/genjutsu", badge: "Free" },
  { key: "effects", label: "Effects", href: "/ai/effects", badge: "Free" },
  { key: "cinema-studio", label: "Cinema Studio", href: "/ai/cinema-studio" },
  { key: "marketing-studio", label: "Marketing Studio", href: "/ai/marketing-studio" },
  { key: "supercomputer", label: "Supercomputer", href: "/supercomputer" },
  { key: "3d-jutsu", label: "3D Jutsu", href: "/ai/3d-jutsu", badge: "New" },
  { key: "edit", label: "Edit", href: "/ai/edit" },
  { key: "academy", label: "Academy", href: "/academy" },
  { key: "community", label: "Community", href: "/community" },
  { key: "contests", label: "Contests", href: "/contests" },
  { key: "plugins", label: "Plugins", href: "/plugins" },
  { key: "canvas", label: "Canvas", href: "/canvas" },
  { key: "originals", label: "Originals", href: "/originals" },
];

/** Both badge styles are lime; New is a solid chip, Free a tinted one. */
function NavBadge({ tone }: { tone: Badge }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
        tone === "New" ? "bg-hf-lime text-black" : "bg-hf-lime/15 text-hf-lime"
      }`}
    >
      {tone}
    </span>
  );
}

export function AppHeader({ activeNav }: { activeNav?: string }) {
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const { toast } = useToast();

  return (
    <header className="sticky top-0 z-50 border-b border-hf-border bg-hf-black/95 backdrop-blur">
      <div className="flex h-header items-center gap-4 px-4">
        <Link
          href="/"
          aria-label="Higgsfield home"
          className="flex min-h-11 shrink-0 items-center text-white transition-opacity hover:opacity-80"
        >
          <Logo />
        </Link>

        <nav
          aria-label="Main"
          className="hidden min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm whitespace-nowrap md:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {NAV.map((item) => {
            const active = item.key === activeNav;
            const content = (
              <>
                <span>{item.label}</span>
                {item.badge ? <NavBadge tone={item.badge} /> : null}
              </>
            );

            if (!item.href) {
              return (
                <span
                  key={item.key}
                  title="Not built yet"
                  className="flex shrink-0 items-center gap-1.5 text-hf-dim"
                >
                  {content}
                </span>
              );
            }

            return (
              <span key={item.key} className="flex shrink-0 items-center gap-4">
                {item.dividerBefore ? <span className="h-4 w-px bg-hf-border" aria-hidden /> : null}
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex shrink-0 items-center gap-1.5 transition-colors ${
                    active ? "font-medium text-hf-lime" : "text-hf-muted hover:text-white"
                  }`}
                >
                  {content}
                </Link>
              </span>
            );
          })}
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-3 md:ml-0">
          <button
            type="button"
            aria-label="Open menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="flex size-11 items-center justify-center rounded-lg text-hf-muted transition-colors hover:text-white md:hidden"
          >
            <Menu className="size-5" aria-hidden strokeWidth={2} />
          </button>

          <button
            type="button"
            aria-label="Search"
            aria-expanded={searchOpen}
            onClick={() => setSearchOpen((prev) => !prev)}
            className="hidden size-11 items-center justify-center text-hf-muted transition-colors hover:text-white md:flex"
          >
            <Search className="size-4" aria-hidden strokeWidth={1.75} />
          </button>

          <Link
            href="/pricing"
            aria-current={activeNav === "pricing" ? "page" : undefined}
            className="relative hidden items-center gap-1.5 rounded-lg border border-hf-border bg-hf-surface px-3 py-1.5 text-sm font-medium text-white transition-colors hover:border-hf-lime/50 sm:flex"
          >
            <Diamond className="size-3.5" aria-hidden strokeWidth={1.75} />
            Pricing
            <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded bg-hf-pink px-1.5 py-0.5 text-[10px] leading-none font-bold whitespace-nowrap text-white">
              54% OFF
            </span>
          </Link>

          <Link
            href="/enterprise"
            aria-current={activeNav === "enterprise" ? "page" : undefined}
            className={`hidden items-center gap-1.5 text-sm transition-colors lg:flex ${
              activeNav === "enterprise" ? "font-medium text-hf-lime" : "text-hf-muted hover:text-white"
            }`}
          >
            <Sparkles className="size-3.5" aria-hidden strokeWidth={1.75} />
            Enterprise
          </Link>

          <Link
            href="/assets"
            aria-current={activeNav === "assets" ? "page" : undefined}
            className={`hidden items-center gap-1.5 text-sm transition-colors lg:flex ${
              activeNav === "assets" ? "font-medium text-hf-lime" : "text-hf-muted hover:text-white"
            }`}
          >
            <span className="size-4 rounded bg-hf-lime/70" aria-hidden />
            Assets
          </Link>

          <span className="hidden h-5 w-px bg-hf-border sm:block" aria-hidden />

          <button
            type="button"
            aria-label="Notifications"
            onClick={() => toast("No new notifications", "info")}
            className="hidden text-hf-muted transition-colors hover:text-white sm:block"
          >
            <Bell className="size-4" aria-hidden strokeWidth={1.75} />
          </button>

          <button
            type="button"
            aria-label="Account"
            onClick={() => toast("Account menu is not part of this rebuild", "info")}
            className="size-7 shrink-0 rounded-full bg-hf-surface-4 ring-2 ring-hf-lime"
          />
        </div>
      </div>

      <MobileNav
        open={menuOpen}
        onClose={() => setMenuOpen(false)}
        items={NAV}
        activeNav={activeNav}
      />

      {searchOpen ? (
        <div className="border-t border-hf-border px-4 py-3">
          <label className="mx-auto block max-w-xl">
            <span className="sr-only">Search Higgsfield</span>
            <input
              type="search"
              autoFocus
              placeholder="Search models, presets and creators"
              className="w-full rounded-lg border border-hf-border bg-hf-surface px-3 py-2 text-sm text-white placeholder:text-hf-dim focus:border-hf-lime/50 focus:outline-none"
            />
          </label>
        </div>
      ) : null}
    </header>
  );
}
