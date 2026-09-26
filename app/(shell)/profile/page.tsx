import type { Metadata } from "next";
import { ProfileView } from "@/components/account/ProfileView";

export const metadata: Metadata = { title: "Profile — Higgsfield" };

export default function ProfilePage() {
  return (
    <main className="px-4">
      <ProfileView />
    </main>
  );
}
