"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, Check, CheckCircle2, Clock, ExternalLink, Inbox, Info, X } from "lucide-react";
import { useStore, useMyMentorProfile } from "@/lib/store";
import type { Availability, MentoringRequest, User } from "@/lib/types";
import { formatHours } from "@/lib/utils";
import { validateDuration } from "@/lib/validation";
import { AvailabilityIndicator } from "../Availability";
import { RequestItem } from "../RequestItem";
import { useToast } from "../Toast";
import { Avatar, Button, buttonClass, Card, Chip, EmptyState, Input, Textarea } from "../ui";
import { ConfirmButton, DashSection, StatCard } from "./shared";

export function MentorDashboard({ user }: { user: User }) {
  const { db, actions } = useStore();
  const profile = useMyMentorProfile();
  const toast = useToast();
  if (!db) return null;

  const mine = db.requests.filter((r) => r.mentorUserId === user.id);
  const incoming = mine.filter((r) => r.status === "pending").sort((a, b) => a.preferredAt.localeCompare(b.preferredAt));
  const upcoming = mine.filter((r) => r.status === "accepted").sort((a, b) => a.preferredAt.localeCompare(b.preferredAt));
  const completed = mine.filter((r) => r.status === "completed").sort((a, b) => b.preferredAt.localeCompare(a.preferredAt));
  const totalMinutes = completed.reduce((s, r) => s + (r.durationMinutes ?? 0), 0);
  const mentorName = profile?.name ?? user.name;

  const notify = (res: { ok: boolean; error?: string }, msg: string) => toast(res.ok ? msg : res.error!, res.ok ? "success" : "error");

  const setAvailability = (a: Availability) => {
    if (!profile) return;
    notify(actions.updateMentorProfile({ ...profile, availability: a }), "Availability updated");
  };

  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_300px]">
      <div className="space-y-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Incoming" value={incoming.length} icon={<Inbox className="h-4 w-4" />} hint="Awaiting your reply" />
          <StatCard label="Upcoming" value={upcoming.length} icon={<CalendarCheck className="h-4 w-4" />} hint="Accepted sessions" />
          <StatCard label="Completed" value={completed.length} icon={<CheckCircle2 className="h-4 w-4" />} hint="Sessions mentored" />
          <StatCard tone="navy" label="Mentoring hours" value={formatHours(totalMinutes)} icon={<Clock className="h-4 w-4" />} hint="Platform-recorded" />
        </div>

        <DashSection title="Incoming requests" count={incoming.length} description="Accept or decline — mentees see your answer right away.">
          {incoming.length === 0 ? (
            <EmptyState icon={<Inbox className="h-5 w-5" />} title="You're all caught up" description="New mentoring requests will appear here." />
          ) : (
            <ul className="space-y-3">
              {incoming.map((r) => <IncomingRequest key={r.id} r={r} mentorName={mentorName} />)}
            </ul>
          )}
        </DashSection>

        <DashSection title="Upcoming sessions" count={upcoming.length} description="After you meet, mark the session completed and enter how long it lasted.">
          {upcoming.length === 0 ? (
            <EmptyState icon={<CalendarCheck className="h-5 w-5" />} title="No upcoming sessions" description="Accepted requests show up here." />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((r) => <UpcomingSession key={r.id} r={r} mentorName={mentorName} />)}
            </ul>
          )}
        </DashSection>

        <DashSection title="Completed sessions" count={completed.length}>
          {completed.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-5 w-5" />} title="No completed sessions yet" />
          ) : (
            <ul className="space-y-3">
              {completed.map((r) => <RequestItem key={r.id} request={r} mentorName={mentorName} perspective="mentor" />)}
            </ul>
          )}
        </DashSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        {profile && (
          <Card className="p-5">
            <div className="flex items-center gap-3">
              <Avatar name={profile.name} seed={profile.id} />
              <div className="min-w-0">
                <p className="truncate font-semibold text-navy">{profile.name}</p>
                <p className="truncate text-sm text-ink-muted">{profile.headline}</p>
              </div>
            </div>
            <div className="mt-4">
              <AvailabilityIndicator value={profile.availability} />
              <div className="mt-2 flex flex-wrap gap-1.5" role="group" aria-label="Set availability">
                {(["available", "limited", "unavailable"] as const).map((a) => (
                  <Chip key={a} selected={profile.availability === a} onClick={() => setAvailability(a)} className="h-8 px-3 text-xs capitalize">
                    {a === "unavailable" ? "Paused" : a}
                  </Chip>
                ))}
              </div>
            </div>
            <div className="mt-4 flex gap-2">
              <Link href="/dashboard/profile" className={buttonClass("outline", "sm", "flex-1")}>Edit profile</Link>
              <Link href={`/mentors/${profile.id}`} className={buttonClass("ghost", "sm")} aria-label="View public profile">
                <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </Card>
        )}
        <Card className="p-5">
          <p className="flex items-center gap-2 font-medium text-navy"><Clock className="h-4 w-4 text-teal" /> {formatHours(totalMinutes)} mentored</p>
          <p className="mt-2 flex gap-2 text-xs leading-relaxed text-ink-muted">
            <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            Hours are platform-recorded from the durations you enter when completing sessions. They are self-reported and
            have not been officially verified as volunteer hours.
          </p>
        </Card>
      </aside>
    </div>
  );
}

function IncomingRequest({ r, mentorName }: { r: MentoringRequest; mentorName: string }) {
  const { actions } = useStore();
  const toast = useToast();
  const [declining, setDeclining] = useState(false);
  const [note, setNote] = useState("");

  const respond = (d: "accepted" | "declined") => {
    const res = actions.respondToRequest(r.id, d, note);
    toast(res.ok ? (d === "accepted" ? `Accepted — ${r.menteeName.split(" ")[0]} will see it on their dashboard` : "Request declined") : res.error, res.ok ? "success" : "error");
  };

  return (
    <RequestItem
      request={r}
      mentorName={mentorName}
      perspective="mentor"
      actions={
        !declining && (
          <>
            <Button size="sm" variant="accent" onClick={() => respond("accepted")}><Check className="h-4 w-4" /> Accept</Button>
            <Button size="sm" variant="outline" onClick={() => setDeclining(true)}><X className="h-4 w-4" /> Decline</Button>
          </>
        )
      }
      footer={
        declining && (
          <div className="space-y-3">
            <label htmlFor={`note-${r.id}`} className="text-sm font-medium text-navy">Message to {r.menteeName.split(" ")[0]} (optional)</label>
            <Textarea id={`note-${r.id}`} rows={2} maxLength={300} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. I'm booked this week — try another mentor or request again next week!" />
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => setDeclining(false)}>Back</Button>
              <Button size="sm" variant="danger" onClick={() => respond("declined")}>Decline request</Button>
            </div>
          </div>
        )
      }
    />
  );
}

function UpcomingSession({ r, mentorName }: { r: MentoringRequest; mentorName: string }) {
  const { actions } = useStore();
  const toast = useToast();
  const [completing, setCompleting] = useState(false);
  const [minutes, setMinutes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const complete = (e: React.FormEvent) => {
    e.preventDefault();
    if (!minutes.trim()) return setError("Enter the session length in minutes.");
    const n = Number(minutes);
    const err = validateDuration(n);
    if (err) return setError(err);
    const res = actions.completeRequest(r.id, n);
    if (!res.ok) return setError(res.error);
    toast(`Session completed · ${formatHours(n)} recorded`);
  };

  return (
    <RequestItem
      request={r}
      mentorName={mentorName}
      perspective="mentor"
      actions={
        !completing && (
          <>
            <Button size="sm" onClick={() => setCompleting(true)}><CheckCircle2 className="h-4 w-4" /> Mark completed</Button>
            <ConfirmButton onConfirm={() => {
              const res = actions.cancelRequest(r.id);
              toast(res.ok ? "Session canceled" : res.error, res.ok ? "success" : "error");
            }} confirmLabel="Confirm cancel">Cancel</ConfirmButton>
          </>
        )
      }
      footer={
        completing && (
          <form onSubmit={complete} className="space-y-3" noValidate>
            <label htmlFor={`min-${r.id}`} className="block text-sm font-medium text-navy">How long was the session?</label>
            <div className="flex flex-wrap items-center gap-2">
              {[30, 45, 60, 90].map((m) => (
                <Chip key={m} selected={minutes === String(m)} onClick={() => { setMinutes(String(m)); setError(null); }} className="h-9">{m} min</Chip>
              ))}
              <div className="flex items-center gap-2">
                <Input id={`min-${r.id}`} type="number" inputMode="numeric" min={5} max={480} step={5} value={minutes} onChange={(e) => { setMinutes(e.target.value); setError(null); }} className="h-9 w-24" invalid={!!error} placeholder="mins" />
                <span className="text-sm text-ink-muted">minutes</span>
              </div>
            </div>
            {error && <p className="text-sm text-red-700" role="alert">{error}</p>}
            <p className="text-xs text-ink-faint">This is recorded as platform-recorded mentoring time (not officially verified).</p>
            <div className="flex justify-end gap-2">
              <Button size="sm" variant="ghost" onClick={() => { setCompleting(false); setError(null); }}>Back</Button>
              <Button size="sm" variant="accent" type="submit">Confirm completed</Button>
            </div>
          </form>
        )
      }
    />
  );
}
