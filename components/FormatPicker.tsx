"use client";

import { MapPin, Video, Shuffle } from "lucide-react";
import type { MeetingFormat } from "@/lib/types";
import { cn } from "@/lib/utils";

type Choice = "online" | "in-person" | "both";

const OPTIONS: { value: Choice; label: string; hint: string; Icon: typeof Video }[] = [
  { value: "online", label: "Online", hint: "Video call", Icon: Video },
  { value: "in-person", label: "In person", hint: "On campus", Icon: MapPin },
  { value: "both", label: "Both", hint: "Online or in person", Icon: Shuffle },
];

export function toChoice(formats: MeetingFormat[]): Choice | "" {
  if (formats.includes("online") && formats.includes("in-person")) return "both";
  return formats[0] ?? "";
}

export function fromChoice(c: Choice): MeetingFormat[] {
  return c === "both" ? ["online", "in-person"] : [c];
}

export function formatLabel(formats: MeetingFormat[]) {
  const c = toChoice(formats);
  return c === "both" ? "Online or in person" : c === "online" ? "Online" : c === "in-person" ? "In person" : "—";
}

/** Single choice: Online / In person / Both — stored as a MeetingFormat[]. */
export function FormatPicker({ value, onChange, name = "formats" }: { value: MeetingFormat[]; onChange: (v: MeetingFormat[]) => void; name?: string }) {
  const current = toChoice(value);
  return (
    <div className="grid gap-2 sm:grid-cols-3" role="radiogroup">
      {OPTIONS.map(({ value: v, label, hint, Icon }) => (
        <label
          key={v}
          className={cn(
            "flex cursor-pointer items-center gap-3 rounded-xl border bg-white px-3.5 py-2.5 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal",
            current === v ? "border-navy shadow-card" : "border-line hover:border-navy/30",
          )}
        >
          <input type="radio" name={name} className="sr-only" checked={current === v} onChange={() => onChange(fromChoice(v))} />
          <Icon className={cn("h-4 w-4 shrink-0", current === v ? "text-teal" : "text-ink-faint")} aria-hidden />
          <span className="text-sm">
            <span className="block font-medium text-navy">{label}</span>
            <span className="text-xs text-ink-faint">{hint}</span>
          </span>
        </label>
      ))}
    </div>
  );
}
