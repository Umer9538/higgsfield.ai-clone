import { AppHeader } from "@/components/layout/AppHeader";
import { PromoBar } from "@/components/marketing/PromoBar";
import { Hero } from "@/components/marketing/Hero";
import { ProductRail } from "@/components/marketing/ProductRail";
import { EffectsGrid } from "@/components/marketing/EffectsGrid";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function Home() {
  return (
    <>
      <PromoBar />
      <AppHeader variant="marketing" activeNav="explore" />
      <main className="mx-auto max-w-[1800px] pb-4">
        <Hero />
        <ProductRail />
        <EffectsGrid />
      </main>
      <SiteFooter />
    </>
  );
}
