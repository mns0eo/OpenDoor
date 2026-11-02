import type { Availability } from "@/lib/types";
import { cn } from "@/lib/utils";

const MAP: Record<Availability, { label: string; dot: string; text: string }> = {
  available: { label: "Available", dot: "bg-emerald-500", text: "text-emerald-700" },
  limited: { label: "Limited availability", dot: "bg-amber-400", text: "text-amber-700" },
  unavailable: { label: "Not taking requests", dot: "bg-ink-faint", text: "text-ink-faint" },
};

export function AvailabilityIndicator({ value, className }: { value: Availability; className?: string }) {
  const m = MAP[value];
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", m.text, className)}>
      <span className="relative flex h-2 w-2">
        {value === "available" && <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-50" />}
        <span className={cn("relative inline-flex h-2 w-2 rounded-full", m.dot)} />
      </span>
      {m.label}
    </span>
  );
}

export const AVAILABILITY_LABEL: Record<Availability, string> = {
  available: MAP.available.label,
  limited: MAP.limited.label,
  unavailable: MAP.unavailable.label,
};
