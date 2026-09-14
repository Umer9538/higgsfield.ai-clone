import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PageHeading } from "@/components/sections/Shared";
import { ACADEMY } from "@/lib/sections/content";
import { CourseGrid } from "@/components/sections/CourseGrid";
import { ActionButton } from "@/components/ui/ActionButton";

export const metadata: Metadata = {
  title: "Academy — Higgsfield",
  description: ACADEMY.sub,
};

export default function AcademyPage() {
  return (
    <>
      <AppHeader activeNav="academy" />
      <main className="mx-auto max-w-6xl px-4 py-12">
        <PageHeading
          eyebrow={ACADEMY.eyebrow}
          title={`${ACADEMY.headline[0]} ${ACADEMY.headline[1]}`}
          sub={ACADEMY.sub}
        />
        <ActionButton message="Free trial started — 180 hours of Academy unlocked" className="mt-6">
          {ACADEMY.cta}
        </ActionButton>

        <CourseGrid />
      </main>
      <SiteFooter />
    </>
  );
}
