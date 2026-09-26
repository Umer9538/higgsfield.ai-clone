import { SideRail } from "@/components/layout/SideRail";
import { TabBar } from "@/components/layout/TabBar";
import { TopBar } from "@/components/layout/TopBar";

/**
 * App chrome for every page except the full-screen onboarding quiz: a side
 * rail on desktop, a tab bar on phones, and a slim top bar for search and
 * the account. Pages render only their own content.
 */
export default function ShellLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SideRail />
      <div className="overflow-x-clip pb-tabbar md:pb-0 md:pl-rail">
        <TopBar />
        {children}
      </div>
      <TabBar />
    </>
  );
}
