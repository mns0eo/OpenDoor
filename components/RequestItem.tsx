"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, MapPin, MessageSquareQuote, Video } from "lucide-react";
import { CATEGORY_MAP } from "@/lib/categories";
import type { MentoringRequest } from "@/lib/types";
import { cn, formatDateTime, formatHours } from "@/lib/utils";
import { CategoryIcon } from "./CategoryIcon";
import { Avatar, Card, StatusBadge } from "./ui";

/** A mentoring request/session, shown from either side. `actions` renders role-specific controls. */
export function RequestItem({
  request: r,
  mentorName,
  perspective,
  actions,
  footer,
}: {
  request: MentoringRequest;
  mentorName: string;
  perspective: "mentee" | "mentor" | "admin";
  actions?: React.ReactNode;
  footer?: React.ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const isPast = new Date(r.preferredAt).getTime() < Date.now();

  return (
    <Card as="li" className="list-none p-5 transition-shadow hover:shadow-lift">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
        {perspective === "mentor" ? <Avatar name={r.menteeName} seed={r.menteeId} /> : <Avatar name={mentorName} seed={r.mentorId} />}
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {perspective === "mentor" ? (
              <p className="font-semibold text-navy">{r.menteeName}</p>
            ) : (
              <p className="font-semibold text-navy">
                <Link href={`/mentors/${r.mentorId}`} className="hover:underline">{mentorName}</Link>
                {perspective === "admin" && <span className="font-normal text-ink-muted"> · mentee: {r.menteeName}</span>}
              </p>
            )}
            <StatusBadge status={r.status} />
            {r.status === "accepted" && isPast && (
              <span className="text-xs font-medium text-amber-700">Session time passed</span>
            )}
          </div>
          <div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
            <span className="inline-flex items-center gap-1.5">
              <CategoryIcon id={r.category} className="h-3.5 w-3.5 text-teal" />
              {CATEGORY_MAP[r.category].label}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 text-teal" aria-hidden />
              {formatDateTime(r.preferredAt)}
            </span>
            <span className="inline-flex items-center gap-1.5">
              {r.format === "online" ? <Video className="h-3.5 w-3.5 text-teal" aria-hidden /> : <MapPin className="h-3.5 w-3.5 text-teal" aria-hidden />}
              {r.format === "online" ? "Online" : "In person"}
            </span>
            {r.status === "completed" && r.durationMinutes != null && (
              <span className="font-medium text-navy">{formatHours(r.durationMinutes)} recorded</span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className={cn("mt-3 block w-full text-left text-[15px] leading-relaxed text-ink", !expanded && "line-clamp-2")}
            aria-expanded={expanded}
            title={expanded ? "Show less" : "Show more"}
          >
            {r.helpWith}
          </button>
          {expanded && r.notes && <p className="mt-2 text-sm text-ink-muted"><span className="font-medium text-navy">Notes:</span> {r.notes}</p>}
          {r.mentorNote && (
            <p className="mt-3 flex gap-2 rounded-xl bg-paper px-3 py-2 text-sm text-ink-muted">
              <MessageSquareQuote className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>
                <span className="font-medium text-navy">Mentor note:</span> {r.mentorNote}
              </span>
            </p>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-2 sm:flex-col sm:items-stretch">{actions}</div>}
      </div>
      {footer && <div className="mt-4 border-t border-line pt-4">{footer}</div>}
    </Card>
  );
}
