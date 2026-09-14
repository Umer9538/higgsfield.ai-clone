import type { Metadata } from "next";
import { Quiz } from "@/components/onboarding/Quiz";

export const metadata: Metadata = {
  title: "Creator Profile Quiz — Higgsfield",
  description: "Three minutes to personalise your Higgsfield workspace.",
};

export default function WelcomeQuizPage() {
  return <Quiz />;
}
