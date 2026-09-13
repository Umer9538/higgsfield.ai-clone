import {
  AtSign,
  AudioLines,
  BarChart3,
  Clock,
  Frame,
  Gem,
  Image as ImageIcon,
  Music,
  Pencil,
  Plus,
  Proportions,
  SlidersHorizontal,
  Sparkles,
  Video,
  Volume2,
  type LucideIcon,
} from "lucide-react";
import type { IconName } from "@/lib/workspace/types";

const ICONS: Record<IconName, LucideIcon> = {
  image: ImageIcon,
  video: Video,
  audio: Music,
  sparkles: Sparkles,
  at: AtSign,
  volume: Volume2,
  clock: Clock,
  ratio: Proportions,
  quality: Gem,
  bitrate: AudioLines,
  sliders: SlidersHorizontal,
  plus: Plus,
  pencil: Pencil,
  model: BarChart3,
  frame: Frame,
};

export function Icon({ name, className }: { name: IconName; className?: string }) {
  const Component = ICONS[name];
  return <Component className={className} aria-hidden strokeWidth={1.75} />;
}
