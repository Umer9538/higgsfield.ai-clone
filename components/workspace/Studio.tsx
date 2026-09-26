"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useToast } from "@/components/ui/Toast";
import { PanelRightClose, PanelRightOpen, SlidersHorizontal } from "lucide-react";
import type { Surface } from "@/lib/workspace/types";
import { HistoryStrip } from "./HistoryStrip";
import { Inspector } from "./Inspector";
import { PromptBar } from "./PromptBar";
import { SurfaceTabs } from "./SurfaceTabs";
import { TemplateGallery } from "./TemplateGallery";
import { useRegisterStudio } from "./useRegisterStudio";
import { WorkspaceContent } from "./WorkspaceContent";

/**
 * One studio layout for every generator: the canvas takes the room, the
 * prompt bar is pinned beneath it, and settings sit in an inspector on the
 * right — collapsible on desktop, a bottom sheet on phones.
 */
export function Studio({ surface }: { surface: Surface }) {
  const [collapsed, setCollapsed] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const closeSheet = useCallback(() => setSheetOpen(false), []);
  useRegisterStudio(surface);

  // Arriving from the onboarding sandbox: say what was carried over, once
  const params = useSearchParams();
  const { toast } = useToast();
  const announced = useRef(false);
  useEffect(() => {
    if (announced.current || params.get("from") !== "onboarding") return;
    announced.current = true;
    const count = params.getAll("set").length;
    toast(`Your preset is loaded — prompt${count ? ` and ${count} settings` : ""} from onboarding`);
  }, [params, toast]);

  return (
    <div className="flex lg:h-[calc(100dvh-var(--spacing-header))]">
      <section aria-label={`${surface.label} canvas`} className="flex min-w-0 flex-1 flex-col">
        <div className="flex min-h-14 items-center gap-3 border-b border-hf-border px-4">
          {surface.tabGroup ? (
            <SurfaceTabs tabs={surface.tabGroup} activeId={surface.id} />
          ) : (
            <p className="truncate text-sm font-medium text-white">{surface.label}</p>
          )}

          <button
            type="button"
            aria-expanded={sheetOpen}
            aria-controls="studio-settings"
            onClick={() => setSheetOpen(true)}
            className="press ml-auto flex min-h-11 shrink-0 items-center gap-2 rounded-[var(--radius-control)] border border-hf-border px-3 text-sm text-white lg:hidden"
          >
            <SlidersHorizontal className="size-4" aria-hidden strokeWidth={1.75} />
            Settings
          </button>
          <button
            type="button"
            aria-expanded={!collapsed}
            aria-controls="studio-settings"
            onClick={() => setCollapsed((prev) => !prev)}
            className="press ml-auto hidden min-h-9 shrink-0 items-center gap-2 rounded-[var(--radius-control)] px-3 text-sm text-hf-muted transition-colors hover:bg-hf-surface-3 hover:text-white lg:flex"
          >
            {collapsed ? (
              <PanelRightOpen className="size-4" aria-hidden strokeWidth={1.75} />
            ) : (
              <PanelRightClose className="size-4" aria-hidden strokeWidth={1.75} />
            )}
            {collapsed ? "Show settings" : "Hide settings"}
          </button>
        </div>

        {/* Focusable: on desktop this is its own scroll area, and keyboard
            users must be able to scroll it even when it holds no controls */}
        <main tabIndex={0} aria-label={`${surface.label} preview`} className="flex-1 px-4 py-8 sm:px-6 lg:overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl">
            <WorkspaceContent surface={surface} />
            {surface.templates ? <TemplateGallery templates={surface.templates} /> : null}
          </div>
        </main>

        {/* Pinned above the phone tab bar; in normal flow at the foot of the
            fixed-height desktop column. */}
        <div className="sticky bottom-tabbar z-30 bg-gradient-to-t from-hf-black from-60% to-transparent px-4 pt-3 pb-2 sm:pt-6 md:bottom-0 lg:static lg:px-6">
          <div className="mx-auto max-w-4xl">
            <PromptBar surface={surface} />
            <HistoryStrip />
          </div>
        </div>
      </section>

      <Inspector
        surface={surface}
        collapsed={collapsed}
        sheetOpen={sheetOpen}
        onCloseSheet={closeSheet}
      />
    </div>
  );
}
