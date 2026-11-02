// Rules for booking slots, session chat windows, and volunteer-hour status.
import type { Database, HoursStatus, MentoringRequest } from "./types";

/** Every bookable slot is one hour long. */
export const SLOT_MINUTES = 60;
/** Chat stays open until this many days after the session ends. */
export const CHAT_DAYS_AFTER = 5;
/** How far ahead mentors can open slots / mentees can book. */
export const BOOKING_WINDOW_DAYS = 28;

const ACTIVE: MentoringRequest["status"][] = ["pending", "accepted", "completed"];

/** Slot start times (ISO) already taken by a pending/accepted/completed request for this mentor. */
export function takenSlots(db: Database, mentorId: string) {
  return new Set(db.requests.filter((r) => r.mentorId === mentorId && ACTIVE.includes(r.status)).map((r) => r.preferredAt));
}

/** Future, untaken slots a mentee can book with this mentor. */
export function openSlots(db: Database, mentorId: string, now = Date.now()) {
  const mentor = db.mentors.find((m) => m.id === mentorId);
  if (!mentor) return [];
  const taken = takenSlots(db, mentorId);
  return mentor.slots.filter((s) => new Date(s).getTime() > now && !taken.has(s)).sort();
}

export function sessionEnd(r: MentoringRequest) {
  return new Date(new Date(r.preferredAt).getTime() + (r.durationMinutes ?? SLOT_MINUTES) * 60_000);
}

export type ChatState =
  | { kind: "open"; closesAt: Date }
  | { kind: "not-yet"; reason: string }
  | { kind: "closed"; closedAt: Date | null; reason: string };

/** Chat opens once the mentor accepts and closes 5 days after the session ends. */
export function chatState(r: MentoringRequest, now = Date.now()): ChatState {
  if (r.status === "pending") return { kind: "not-yet", reason: "Chat opens once the mentor accepts your request." };
  if (r.status === "declined" || r.status === "canceled")
    return { kind: "closed", closedAt: null, reason: `This request was ${r.status}, so chat is closed.` };
  const closesAt = new Date(sessionEnd(r).getTime() + CHAT_DAYS_AFTER * 86_400_000);
  if (now > closesAt.getTime())
    return { kind: "closed", closedAt: closesAt, reason: `Chat closed ${CHAT_DAYS_AFTER} days after the session ended.` };
  return { kind: "open", closesAt };
}

/** Volunteer-hour status of a completed session, based on what the mentor submitted to the school. */
export function hoursStatus(db: Database, requestId: string): HoursStatus | "not-submitted" {
  const subs = db.hoursSubmissions.filter((s) => s.requestIds.includes(requestId));
  if (subs.some((s) => s.status === "approved")) return "approved";
  if (subs.some((s) => s.status === "pending")) return "pending";
  if (subs.some((s) => s.status === "rejected")) return "rejected";
  return "not-submitted";
}

/** "Riley Morgan" → "Riley M." — used for public reviews. */
export function shortName(name: string) {
  const [first, ...rest] = name.trim().split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]!.toUpperCase()}.` : first ?? "";
}

/** Local yyyy-mm-dd key for grouping slots by day. */
export function dayKey(d: Date) {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
