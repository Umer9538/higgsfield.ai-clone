import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PricingPromo } from "@/components/pricing/PricingPromo";
import { PlanGrid } from "@/components/pricing/PlanGrid";
import { Calculator } from "@/components/pricing/Calculator";
import { ComparisonMatrix } from "@/components/pricing/ComparisonMatrix";
import { Faq } from "@/components/pricing/Faq";

export const metadata: Metadata = {
  title: "Pricing — Higgsfield",
  description: "Plans for every workflow. From individuals to enterprise teams, find the right fit.",
};

export default function PricingPage() {
  return (
    <>
      <AppHeader activeNav="pricing" />
      <main id="top" className="mx-auto max-w-6xl px-4 pt-6 pb-16">
        <PricingPromo />
        <PlanGrid />
        <Calculator />
        <ComparisonMatrix />
        <Faq />
      </main>
      <SiteFooter />
    </>
  );
}
