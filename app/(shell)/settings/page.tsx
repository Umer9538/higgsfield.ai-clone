import type { Metadata } from "next";
import { SettingsView } from "@/components/account/SettingsView";

export const metadata: Metadata = { title: "Settings — Higgsfield" };

export default function SettingsPage() {
  return (
    <main className="px-4">
      <SettingsView />
    </main>
  );
}
