import type { Surface } from "@/lib/workspace/types";
import { ControlPanel } from "./ControlPanel";
import { ContentTabs } from "./ContentPane";
import { WorkspaceContent } from "./WorkspaceContent";
import { GenerationProvider } from "./generation";
import { DockBar } from "./DockBar";
import { TemplateGallery } from "./TemplateGallery";
import { WorkspaceProvider } from "./state";

/**
 * The generate workspace shell.
 *
 * Every surface renders through here; the only thing that differs is the
 * config it is handed.
 */
export function Workspace({ surface }: { surface: Surface }) {
  if (surface.layout === "dock") {
    return (
      <WorkspaceProvider fields={surface.fields}>
        <GenerationProvider kind={surface.result?.kind ?? "image"} surface={surface}>
          <div className="flex min-h-[calc(100dvh-var(--spacing-header))] flex-col">
            <div className="flex-1 px-4 py-12">
              <div className="flex min-h-[38dvh] items-center justify-center">
                <WorkspaceContent surface={surface} />
              </div>
              {surface.templates ? (
                <div className="mx-auto max-w-6xl">
                  <TemplateGallery templates={surface.templates} />
                </div>
              ) : null}
            </div>
            <DockBar surface={surface} />
          </div>
        </GenerationProvider>
      </WorkspaceProvider>
    );
  }

  return (
    <WorkspaceProvider fields={surface.fields}>
      <GenerationProvider kind={surface.result?.kind ?? "video"} surface={surface}>
        <div className="flex flex-col lg:flex-row">
          <ControlPanel surface={surface} />
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:h-[calc(100dvh-var(--spacing-header))] lg:p-8">
            <ContentTabs />
            <WorkspaceContent surface={surface} />
          </main>
        </div>
      </GenerationProvider>
    </WorkspaceProvider>
  );
}
