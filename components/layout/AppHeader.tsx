import Link from "next/link";
import { Bell, Search } from "lucide-react";
import { SURFACES } from "@/lib/workspace";
import type { SurfaceId } from "@/lib/workspace/types";

type NavItem =
  | { kind: "surface"; id: SurfaceId }
  | { kind: "static"; label: string; badge?: "New" | "Free" }
  | { kind: "divider" };

/** Mirrors the real app nav. Only the generate surfaces are wired up so far. */
const NAV: NavItem[] = [
  { kind: "static", label: "Explore" },
  { kind: "surface", id: "image" },
  { kind: "surface", id: "video" },
  { kind: "surface", id: "audio" },
  { kind: "static", label: "MCP" },
  { kind: "divider" },
  { kind: "static", label: "ChatGPT Plugin", badge: "New" },
  { kind: "static", label: "Genjutsu", badge: "Free" },
  { kind: "static", label: "Effects", badge: "Free" },
  { kind: "static", label: "Cinema Studio" },
  { kind: "static", label: "Marketing Studio" },
  { kind: "static", label: "Supercomputer" },
  { kind: "static", label: "3D Jutsu", badge: "New" },
  { kind: "surface", id: "edit" },
];

function Badge({ tone, children }: { tone: "New" | "Free"; children: React.ReactNode }) {
  return (
    <span
      className={`rounded px-1.5 py-0.5 text-[10px] leading-none font-semibold ${
        tone === "New" ? "bg-hf-lime text-black" : "bg-hf-lime/15 text-hf-lime"
      }`}
    >
      {children}
    </span>
  );
}

export function AppHeader({
  activeId,
  variant = "app",
}: {
  activeId?: SurfaceId;
  variant?: "app" | "marketing";
}) {
  return (
    <header className="sticky top-0 z-50 h-header border-b border-hf-border bg-hf-black/95 backdrop-blur">
      <div className="flex h-header items-center gap-4 px-4">
        <Link href="/" aria-label="Higgsfield home" className="shrink-0">
          <span className="font-display text-lg font-bold tracking-tight text-white">hf</span>
        </Link>

        <nav className="flex min-w-0 flex-1 items-center gap-4 overflow-x-auto text-sm whitespace-nowrap [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {NAV.map((item, index) => {
            if (item.kind === "divider") {
              return <span key={`divider-${index}`} className="h-4 w-px shrink-0 bg-hf-border" />;
            }

            if (item.kind === "surface") {
              const surface = SURFACES[item.id];
              const active = item.id === activeId;
              return (
                <Link
                  key={item.id}
                  href={`/ai/${item.id}`}
                  aria-current={active ? "page" : undefined}
                  className={`shrink-0 transition-colors ${
                    active ? "font-medium text-hf-lime" : "text-hf-muted hover:text-white"
                  }`}
                >
                  {surface.navLabel}
                </Link>
              );
            }

            return (
              <span
                key={item.label}
                title="Not built yet"
                className="flex shrink-0 items-center gap-1.5 text-hf-dim"
              >
                {item.label}
                {item.badge ? <Badge tone={item.badge}>{item.badge}</Badge> : null}
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
              <span className="size-7 rounded-full ring-2 ring-hf-lime" />
            </>
          )}
        </div>
      </div>
    </header>
  );
}
