"use client";

import { useMemo, useState } from "react";
import { CalendarX2 } from "lucide-react";
import { dayKey } from "@/lib/sessions";
import { cn } from "@/lib/utils";

/** Mentee picks one of the mentor's open 1-hour slots, grouped by day. */
export function SlotPicker({ slots, value, onChange, invalid }: { slots: string[]; value: string; onChange: (slot: string) => void; invalid?: boolean }) {
  const byDay = useMemo(() => {
    const map = new Map<string, string[]>();
    for (const s of slots) {
      const k = dayKey(new Date(s));
      map.set(k, [...(map.get(k) ?? []), s]);
    }
    return Array.from(map.entries());
  }, [slots]);

  const initialDay = value ? dayKey(new Date(value)) : byDay[0]?.[0] ?? "";
  const [day, setDay] = useState(initialDay);
  const times = byDay.find(([k]) => k === day)?.[1] ?? [];

  if (byDay.length === 0) {
    return (
      <div className="flex flex-col items-center rounded-xl border border-dashed border-line bg-paper px-4 py-8 text-center">
        <CalendarX2 className="h-6 w-6 text-ink-faint" />
        <p className="mt-2 text-sm font-medium text-navy">No open times right now</p>
        <p className="text-xs text-ink-muted">This mentor hasn&apos;t opened any times in the next few weeks. Check back soon or try another mentor.</p>
      </div>
    );
  }

  return (
    <div className={cn("rounded-xl border bg-white p-3", invalid ? "border-red-300" : "border-line")}>
      <div className="flex gap-2 overflow-x-auto pb-2 [scrollbar-width:thin]" role="listbox" aria-label="Available days">
        {byDay.map(([k, list]) => {
          const d = new Date(list[0]!);
          const selected = k === day;
          return (
            <button
              key={k}
              type="button"
              role="option"
              aria-selected={selected}
              onClick={() => setDay(k)}
              className={cn(
                "flex w-[4.5rem] shrink-0 flex-col items-center rounded-xl border px-2 py-2 text-center transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                selected ? "border-navy bg-navy text-white" : "border-line bg-paper text-navy hover:border-navy/30",
              )}
            >
              <span className={cn("text-[11px] font-medium uppercase", selected ? "text-white/70" : "text-ink-faint")}>
                {d.toLocaleDateString("en-US", { weekday: "short" })}
              </span>
              <span className="text-lg font-semibold leading-tight">{d.getDate()}</span>
              <span className={cn("text-[11px]", selected ? "text-white/70" : "text-ink-faint")}>{d.toLocaleDateString("en-US", { month: "short" })}</span>
              <span className={cn("mt-1 text-[10px]", selected ? "text-teal" : "text-teal-600")}>{list.length} open</span>
            </button>
          );
        })}
      </div>
      <div className="mt-2 border-t border-line pt-3">
        <p className="mb-2 text-xs text-ink-faint">
          {new Date(times[0] ?? Date.now()).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })} · 1-hour sessions
        </p>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-4" role="radiogroup" aria-label="Available times">
          {times.map((s) => {
            const selected = s === value;
            return (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={selected}
                onClick={() => onChange(s)}
                className={cn(
                  "h-10 rounded-lg border text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                  selected ? "border-teal bg-teal text-white" : "border-line text-navy hover:border-teal hover:bg-teal-50",
                )}
              >
                {new Date(s).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
