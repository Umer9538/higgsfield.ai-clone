import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { Workspace } from "@/components/workspace/Workspace";
import { SURFACE_IDS, getSurface } from "@/lib/workspace";

export function generateStaticParams() {
  return SURFACE_IDS.map((surface) => ({ surface }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ surface: string }>;
}): Promise<Metadata> {
  const { surface: id } = await params;
  const surface = getSurface(id);
  if (!surface) return { title: "Not found" };
  return { title: `${surface.label} — Higgsfield` };
}

export default async function SurfacePage({
  params,
}: {
  params: Promise<{ surface: string }>;
}) {
  const { surface: id } = await params;
  const surface = getSurface(id);
  if (!surface) notFound();

  return (
    <>
      <AppHeader activeNav={surface.id} />
      <Workspace surface={surface} />
    </>
  );
}
