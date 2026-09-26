import type { Metadata } from "next";
import { Sandbox } from "@/components/onboarding/Sandbox";

export const metadata: Metadata = {
  title: "Make your first frame — Higgsfield",
  description: "Pick a medium, build a prompt, watch a test frame render, and open a studio set up for it.",
};

export default function OnboardingPage() {
  return <Sandbox />;
}
