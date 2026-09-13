import type { Surface } from "@/lib/workspace/types";
import { ControlPanel } from "./ControlPanel";
import { ContentPane, ContentTabs } from "./ContentPane";
import { DockBar } from "./DockBar";
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
        <div className="flex min-h-[calc(100dvh-var(--spacing-header))] flex-col">
          <div className="flex flex-1 items-center justify-center px-4 py-12">
            <ContentPane content={surface.content} />
          </div>
          <DockBar surface={surface} />
        </div>
      </WorkspaceProvider>
    );
  }

  return (
    <WorkspaceProvider fields={surface.fields}>
      <div className="flex flex-col lg:flex-row">
        <ControlPanel surface={surface} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:h-[calc(100dvh-var(--spacing-header))] lg:p-8">
          <ContentTabs />
          <ContentPane content={surface.content} />
        </main>
      </div>
    </WorkspaceProvider>
  );
}
