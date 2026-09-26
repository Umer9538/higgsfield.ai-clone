import { Compass, FolderOpen, Gem, GraduationCap, Sparkles, type LucideIcon } from "lucide-react";
import type { SectionKey } from "@/lib/nav";

const ICONS: Record<SectionKey, LucideIcon> = {
  create: Sparkles,
  explore: Compass,
  assets: FolderOpen,
  learn: GraduationCap,
  pricing: Gem,
};

export function SectionIcon({ section, className = "size-5" }: { section: SectionKey; className?: string }) {
  const LucideIcon = ICONS[section];
  return <LucideIcon className={className} aria-hidden strokeWidth={1.75} />;
}
