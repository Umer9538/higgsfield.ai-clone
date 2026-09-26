import Link from "next/link";
import type { SurfaceId } from "@/lib/workspace/types";

export function SurfaceTabs({
  tabs,
  activeId,
}: {
  tabs: { id: SurfaceId; label: string }[];
  activeId: SurfaceId;
}) {
  return (
    <nav aria-label="Studio mode" className="-mb-px flex min-w-0 gap-5 self-stretch overflow-x-auto [scrollbar-width:none]">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Link
            key={tab.id}
            href={`/ai/${tab.id}`}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center border-b-2 text-sm font-medium transition-colors ${
              active
                ? "border-hf-accent text-white"
                : "border-transparent text-hf-muted hover:text-white"
            }`}
          >
            {tab.label}
          </Link>
        );
      })}
    </nav>
  );
}
