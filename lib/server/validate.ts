import "server-only";
import { SURFACE_IDS } from "@/lib/workspace";
import type { NewFavorite, NewGeneration } from "./types";

/**
 * Request validation. Everything that reaches Firestore has a known type and
 * a bounded size, and media must be one of this app's own files: the library
 * is shared, so an arbitrary URL here would put any content into it.
 */
type Result<T> = { ok: true; value: T } | { ok: false; error: string };

const MEDIA = /^\/media\/[a-z0-9][a-z0-9/_.-]*\.(mp4|webm|jpe?g|png|webp)$/i;
/**
 * Owner ids: a safe character set, not a fixed format. The app itself sends
 * "user:<handle>" or "device:<uuid>", but the API accepted any owner string
 * before validation existed, and tightening that would break its callers.
 */
export const OWNER = /^[a-z0-9:._-]{1,80}$/i;
const ITEM_ID = /^[a-z0-9:_.-]{1,120}$/i;
const KINDS = new Set(["video", "image", "audio"]);

function text(value: unknown, field: string, max: number, required = true): Result<string | undefined> {
  if (value === undefined || value === null || value === "") {
    return required ? { ok: false, error: `${field} is required` } : { ok: true, value: undefined };
  }
  if (typeof value !== "string") return { ok: false, error: `${field} must be a string` };
  const trimmed = value.trim();
  if (required && !trimmed) return { ok: false, error: `${field} is required` };
  if (trimmed.length > max) return { ok: false, error: `${field} must be at most ${max} characters` };
  return { ok: true, value: trimmed };
}

export function validateGeneration(body: Partial<NewGeneration>): Result<NewGeneration> {
  const prompt = text(body.prompt, "prompt", 2000);
  if (!prompt.ok) return prompt;
  const model = text(body.model, "model", 80);
  if (!model.ok) return model;
  const src = text(body.src, "src", 300);
  if (!src.ok) return src;
  if (!MEDIA.test(src.value!)) return { ok: false, error: "src must be a /media/ file on this site" };
  const poster = text(body.poster, "poster", 300, false);
  if (!poster.ok) return poster;
  if (poster.value && !MEDIA.test(poster.value)) return { ok: false, error: "poster must be a /media/ file on this site" };
  const spec = text(body.spec, "spec", 120, false);
  if (!spec.ok) return spec;

  const surface = body.surface ?? "video";
  if (!(SURFACE_IDS as string[]).includes(surface)) return { ok: false, error: "surface is not a known studio" };
  const kind = body.kind ?? "video";
  if (!KINDS.has(kind)) return { ok: false, error: "kind must be video, image or audio" };
  if (body.owner !== undefined && (typeof body.owner !== "string" || !OWNER.test(body.owner))) {
    return { ok: false, error: "owner may only use letters, digits and : . _ -" };
  }

  return {
    ok: true,
    value: {
      prompt: prompt.value!,
      model: model.value!,
      surface,
      kind,
      src: src.value!,
      poster: poster.value,
      spec: spec.value ?? "",
      owner: body.owner,
    },
  };
}

export function validateFavorite(body: Partial<NewFavorite>): Result<NewFavorite> {
  if (typeof body.itemId !== "string" || !ITEM_ID.test(body.itemId)) {
    return { ok: false, error: "itemId is required" };
  }
  const title = text(body.title, "title", 200, false);
  if (!title.ok) return title;
  const owner = body.owner ?? "anonymous";
  if (typeof owner !== "string" || !OWNER.test(owner)) {
    return { ok: false, error: "owner may only use letters, digits and : . _ -" };
  }
  return { ok: true, value: { itemId: body.itemId, title: title.value ?? body.itemId, owner } };
}

/** Pages are bounded: an unbounded ?limit= is an unbounded Firestore read bill. */
export function clampLimit(raw: string | null, fallback = 50, max = 100) {
  const n = Number(raw ?? fallback);
  return Number.isFinite(n) ? Math.min(max, Math.max(1, Math.floor(n))) : fallback;
}
