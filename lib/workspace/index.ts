import type { Surface, SurfaceId } from "./types";
import { video } from "./surfaces/video";
import { edit } from "./surfaces/edit";
import { motionControl } from "./surfaces/motion-control";
import { audio } from "./surfaces/audio";
import { image } from "./surfaces/image";

export const SURFACES: Record<SurfaceId, Surface> = {
  video,
  image,
  audio,
  edit,
  "motion-control": motionControl,
};

export const SURFACE_IDS = Object.keys(SURFACES) as SurfaceId[];

export function getSurface(id: string): Surface | undefined {
  return SURFACE_IDS.includes(id as SurfaceId) ? SURFACES[id as SurfaceId] : undefined;
}

export type { Surface, SurfaceId, Field, Content, IconName } from "./types";
