import type { Surface } from "@/lib/workspace/types";
import { GenerationProvider } from "./generation";
import { WorkspaceProvider } from "./state";
import { Studio } from "./Studio";

/**
 * The generate workspace. Every surface renders through here; the only thing
 * that differs is the config it is handed.
 */
export function Workspace({ surface }: { surface: Surface }) {
  return (
    <WorkspaceProvider surface={surface}>
      <GenerationProvider kind={surface.result?.kind ?? (surface.dock ? "image" : "video")} surface={surface}>
        <Studio surface={surface} />
      </GenerationProvider>
    </WorkspaceProvider>
  );
}
