import { Launchpad } from "@/components/home/Launchpad";
import { SiteFooter } from "@/components/marketing/SiteFooter";

export default function Home() {
  return (
    <>
      <main className="mx-auto max-w-[1600px] px-4 pb-16">
        <Launchpad />
      </main>
      <SiteFooter />
    </>
  );
}
