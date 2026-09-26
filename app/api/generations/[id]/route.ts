import { deleteGeneration } from "@/lib/server/repository";
import { databaseGuard, fail, serverError } from "@/lib/server/http";
import { OWNER } from "@/lib/server/validate";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

/**
 * DELETE /api/generations/:id?owner=user:<handle>|device:<id>
 *   204 deleted · 400 no owner · 403 not the creator · 404 no such generation
 */
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = databaseGuard();
  if (blocked) return blocked;
  const { id } = await params;
  const owner = new URL(request.url).searchParams.get("owner");
  if (!owner || !OWNER.test(owner)) return fail(400, "invalid_owner", "owner is required");

  try {
    const outcome = await deleteGeneration(id, owner);
    if (outcome === "not_found") return fail(404, "not_found", "No generation with that id");
    if (outcome === "forbidden") return fail(403, "forbidden", "Only the creator can delete this generation");
    return new Response(null, { status: 204 });
  } catch (error) {
    return serverError(error, "DELETE /api/generations/:id");
  }
}
