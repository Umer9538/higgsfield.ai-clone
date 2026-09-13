import type { Metadata } from "next";
import { AppHeader } from "@/components/layout/AppHeader";
import { SiteFooter } from "@/components/marketing/SiteFooter";
import { PluginPage } from "@/components/pages/PluginPage";

export const metadata: Metadata = {
  title: "MCP — Higgsfield",
  description: "Create stunning images and videos without leaving ChatGPT.",
};

export default function Page() {
  return (
    <>
      <AppHeader variant="marketing" activeNav="mcp" />
      <PluginPage />
      <SiteFooter />
    </>
  );
}
