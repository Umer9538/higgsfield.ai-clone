import Link from "next/link";
import { Bell, Search } from "lucide-react";

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
  { key: "explore", label: "Explore", href: "/" },
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
  { key: "academy", label: "Academy" },
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

export function AppHeader({
  activeNav,
  variant = "app",
}: {
  activeNav?: string;
  variant?: "app" | "marketing";
}) {
  return (
    <header className="sticky top-0 z-50 h-header border-b border-hf-border bg-hf-black/95 backdrop-blur">
      <div className="flex h-header items-center gap-4 px-4">
        <Link href="/" aria-label="Higgsfield home" className="shrink-0">
          <span className="font-display text-lg font-bold tracking-tight text-white">hf</span>
        </Link>

        <nav
          aria-label="Main"
          className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
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

        <div className="flex shrink-0 items-center gap-3">
          <button type="button" aria-label="Search" className="text-hf-muted hover:text-white">
            <Search className="size-4" aria-hidden strokeWidth={1.75} />
          </button>

          <Link
            href="/pricing"
            aria-current={activeNav === "pricing" ? "page" : undefined}
            className="relative hidden items-center gap-1.5 rounded-full border border-hf-border px-3 py-1.5 text-sm text-white transition-colors hover:border-hf-lime/50 sm:flex"
          >
            Pricing
            <span className="rounded bg-hf-pink px-1.5 py-0.5 text-[10px] font-semibold text-white">
              54% OFF
            </span>
          </Link>

          {variant === "marketing" ? (
            <>
              <span className="hidden text-sm text-hf-muted sm:inline">Log in</span>
              <button
                type="button"
                className="rounded-full bg-hf-lime px-4 py-1.5 text-sm font-semibold text-black transition-colors hover:bg-hf-lime-deep"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                aria-label="Notifications"
                className="hidden text-hf-muted hover:text-white sm:block"
              >
                <Bell className="size-4" aria-hidden strokeWidth={1.75} />
              </button>
              <span className="size-7 rounded-full ring-2 ring-hf-lime" aria-hidden />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
