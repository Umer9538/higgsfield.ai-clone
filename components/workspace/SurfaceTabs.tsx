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
    <nav className="flex gap-5 overflow-x-auto border-b border-hf-border px-4">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <Link
            key={tab.id}
            href={`/ai/${tab.id}`}
            aria-current={active ? "page" : undefined}
            className={`-mb-px shrink-0 border-b-2 py-3.5 text-sm font-medium transition-colors ${
              active
                ? "border-hf-lime text-white"
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
