"use client";

import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, Copy, Eraser } from "lucide-react";
import { BOOKING_WINDOW_DAYS, takenSlots } from "@/lib/sessions";
import { useStore } from "@/lib/store";
import type { MentorProfile } from "@/lib/types";
import { cn } from "@/lib/utils";
import { useToast } from "./Toast";
import { Button } from "./ui";

const HOURS = Array.from({ length: 15 }, (_, i) => 7 + i); // 7 AM – 9 PM starts

function startOfWeek(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  x.setDate(x.getDate() - x.getDay()); // Sunday
  return x;
}
function slotIso(day: Date, hour: number) {
  const x = new Date(day);
  x.setHours(hour, 0, 0, 0);
  return x.toISOString();
}
const hourLabel = (h: number) => `${h % 12 || 12}${h < 12 ? "a" : "p"}`;

/** Week grid where a mentor clicks cells to open or close 1-hour bookable slots. */
export function AvailabilityCalendar({ mentor }: { mentor: MentorProfile }) {
  const { db, actions } = useStore();
  const toast = useToast();
  const [week, setWeek] = useState(0); // 0 = this week
  const [drag, setDrag] = useState<null | "add" | "remove">(null);

  const now = Date.now();
  const maxWeek = Math.ceil(BOOKING_WINDOW_DAYS / 7);
  const weekStart = useMemo(() => {
    const s = startOfWeek(new Date());
    s.setDate(s.getDate() + week * 7);
    return s;
  }, [week]);
  const days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d;
  });

  const open = new Set(mentor.slots);
  const taken = db ? takenSlots(db, mentor.id) : new Set<string>();
  const bookingLimit = now + BOOKING_WINDOW_DAYS * 86_400_000;

  const save = (next: Set<string>, msg?: string) => {
    const res = actions.setSlots(Array.from(next));
    if (!res.ok) toast(res.error, "error");
    else if (msg) toast(msg);
  };

  const toggle = (iso: string, mode: "add" | "remove") => {
    const next = new Set(open);
    if (mode === "add") next.add(iso);
    else next.delete(iso);
    save(next);
  };

  const editable = (iso: string) => {
    const t = new Date(iso).getTime();
    return t > now && t <= bookingLimit && !taken.has(iso);
  };

  const weekSlots = days.flatMap((d) => HOURS.map((h) => slotIso(d, h)));
  const openThisWeek = weekSlots.filter((s) => open.has(s) && !taken.has(s) && new Date(s).getTime() > now).length;

  const copyForward = () => {
    const next = new Set(open);
    let added = 0;
    for (const s of weekSlots) {
      if (!open.has(s)) continue;
      for (let w = 1; w <= 3; w++) {
        const d = new Date(s);
        d.setDate(d.getDate() + 7 * w);
        const iso = d.toISOString();
        if (editable(iso) && !next.has(iso)) {
          next.add(iso);
          added++;
        }
      }
    }
    save(next, added ? `Copied this week's times to the next 3 weeks (${added} slots)` : "Nothing new to copy");
  };

  const clearWeek = () => {
    const next = new Set(open);
    weekSlots.filter(editable).forEach((s) => next.delete(s));
    save(next, "Cleared open times this week");
  };

  return (
    <div onMouseUp={() => setDrag(null)} onMouseLeave={() => setDrag(null)}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" className="w-9 px-0" aria-label="Previous week" disabled={week === 0} onClick={() => setWeek((w) => w - 1)}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <p className="min-w-[11rem] text-center text-sm font-medium text-navy">
            {days[0]!.toLocaleDateString("en-US", { month: "short", day: "numeric" })} – {days[6]!.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
          </p>
          <Button size="sm" variant="outline" className="w-9 px-0" aria-label="Next week" disabled={week >= maxWeek} onClick={() => setWeek((w) => w + 1)}>
            <ChevronRight className="h-4 w-4" />
          </Button>
          <span className="ml-1 text-xs text-ink-faint">{openThisWeek} open this week</span>
        </div>
        <div className="flex gap-2">
          <Button size="sm" variant="ghost" onClick={clearWeek}><Eraser className="h-4 w-4" /> Clear week</Button>
          <Button size="sm" variant="secondary" onClick={copyForward}><Copy className="h-4 w-4" /> Repeat for next 3 weeks</Button>
        </div>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-line bg-white">
        <table className="w-full min-w-[640px] table-fixed select-none border-collapse text-center text-xs">
          <thead>
            <tr>
              <th className="w-12 border-b border-line bg-paper" />
              {days.map((d) => {
                const today = d.toDateString() === new Date().toDateString();
                return (
                  <th key={d.toISOString()} className={cn("border-b border-l border-line bg-paper px-1 py-2 font-medium", today ? "text-teal-600" : "text-navy")}>
                    <span className="block text-[11px] uppercase text-ink-faint">{d.toLocaleDateString("en-US", { weekday: "short" })}</span>
                    <span className="text-sm">{d.getDate()}</span>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {HOURS.map((h) => (
              <tr key={h}>
                <th scope="row" className="border-t border-line bg-paper pr-2 text-right font-normal text-ink-faint">{hourLabel(h)}</th>
                {days.map((d) => {
                  const iso = slotIso(d, h);
                  const isTaken = taken.has(iso);
                  const isOpen = open.has(iso);
                  const canEdit = editable(iso);
                  const label = `${d.toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })} ${hourLabel(h)}m`;
                  return (
                    <td key={iso} className="border-l border-t border-line p-0.5">
                      <button
                        type="button"
                        disabled={!canEdit}
                        aria-pressed={isOpen}
                        aria-label={`${label}: ${isTaken ? "booked" : isOpen ? "open" : "closed"}`}
                        onMouseDown={() => {
                          if (!canEdit) return;
                          const mode = isOpen ? "remove" : "add";
                          setDrag(mode);
                          toggle(iso, mode);
                        }}
                        onMouseEnter={() => {
                          if (drag && canEdit && (drag === "add") !== isOpen) toggle(iso, drag);
                        }}
                        onKeyDown={(e) => {
                          if ((e.key === "Enter" || e.key === " ") && canEdit) {
                            e.preventDefault();
                            toggle(iso, isOpen ? "remove" : "add");
                          }
                        }}
                        className={cn(
                          "h-8 w-full rounded-md text-[10px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
                          isTaken
                            ? "cursor-not-allowed bg-navy text-white"
                            : isOpen
                              ? canEdit ? "bg-teal text-white hover:bg-teal-600" : "bg-teal/40 text-white"
                              : canEdit ? "hover:bg-sky" : "cursor-not-allowed bg-paper/60",
                        )}
                      >
                        {isTaken ? "Booked" : isOpen ? "Open" : ""}
                      </button>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap gap-4 text-xs text-ink-muted">
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-teal" /> Open for booking</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded bg-navy" /> Booked by a mentee</span>
        <span className="inline-flex items-center gap-1.5"><span className="h-3 w-3 rounded border border-line bg-white" /> Closed — click (or drag) to open</span>
      </div>
    </div>
  );
}
