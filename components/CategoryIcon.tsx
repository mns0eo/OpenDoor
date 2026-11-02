import { BookOpen, Dumbbell, GraduationCap, Lightbulb, Megaphone, Music, Sprout, Trophy, type LucideProps } from "lucide-react";
import type { CategoryId } from "@/lib/types";

const ICONS: Record<CategoryId, React.ComponentType<LucideProps>> = {
  academics: BookOpen,
  "sat-college": GraduationCap,
  entrepreneurship: Lightbulb,
  leadership: Megaphone,
  sports: Dumbbell,
  music: Music,
  competitions: Trophy,
  personal: Sprout,
};

export function CategoryIcon({ id, ...props }: { id: CategoryId } & LucideProps) {
  const Icon = ICONS[id];
  return <Icon aria-hidden {...props} />;
}
