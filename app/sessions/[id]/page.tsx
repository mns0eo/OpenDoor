"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { ArrowLeft, CalendarClock, Lock, MapPin, Video } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { ChatPanel } from "@/components/ChatPanel";
import { RequireAuth } from "@/components/RequireAuth";
import { Avatar, ButtonLink, Card, Container, EmptyState, StatusBadge } from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { formatDateTime, formatHours } from "@/lib/utils";

export default function SessionPage() {
  const { id } = useParams<{ id: string }>();
  return <RequireAuth>{(user) => <Session id={id} user={user} />}</RequireAuth>;
}

function Session({ id, user }: { id: string; user: User }) {
  const { db } = useStore();
  const r = db!.requests.find((x) => x.id === id);
  const allowed = r && (r.menteeId === user.id || r.mentorUserId === user.id || user.isAdmin);
  if (!r || !allowed) {
    return (
      <Container className="py-16">
        <EmptyState icon={<Lock className="h-5 w-5" />} title="Session not found" description="Only the mentor and mentee of a session can open it." action={<ButtonLink href="/dashboard" variant="outline">Back to dashboard</ButtonLink>} />
      </Container>
    );
  }
  const mentor = db!.mentors.find((m) => m.id === r.mentorId);
  const mentorName = mentor?.name ?? "Mentor";
  const isMentor = user.id === r.mentorUserId;
  const other = isMentor ? { name: r.menteeName, seed: r.menteeId, role: "Mentee" } : { name: mentorName, seed: r.mentorId, role: "Mentor" };

  return (
    <Container className="max-w-5xl pb-10 pt-8">
      <Link href={user.isAdmin && !isMentor && user.id !== r.menteeId ? "/admin" : "/dashboard"} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back
      </Link>
      <div className="mt-6 grid gap-6 lg:grid-cols-[300px_1fr]">
        <Card className="h-fit p-5">
          <div className="flex items-center gap-3">
            <Avatar name={other.name} seed={other.seed} />
            <div>
              <p className="text-xs text-ink-faint">{other.role}</p>
              <p className="font-semibold text-navy">{other.name}</p>
            </div>
          </div>
          <dl className="mt-5 space-y-3 border-t border-line pt-4 text-sm">
            <div className="flex items-center justify-between"><dt className="text-ink-faint">Status</dt><dd><StatusBadge status={r.status} /></dd></div>
            <div className="flex gap-2"><CategoryIcon id={r.category} className="mt-0.5 h-4 w-4 text-teal" /><dd>{CATEGORY_MAP[r.category].label}</dd></div>
            <div className="flex gap-2"><CalendarClock className="mt-0.5 h-4 w-4 text-teal" /><dd>{formatDateTime(r.preferredAt)} · 1 hr</dd></div>
            <div className="flex gap-2">
              {r.format === "online" ? <Video className="mt-0.5 h-4 w-4 text-teal" /> : <MapPin className="mt-0.5 h-4 w-4 text-teal" />}
              <dd>{r.format === "online" ? "Online" : "In person (on campus)"}</dd>
            </div>
            {r.status === "completed" && r.durationMinutes != null && <div className="text-ink-muted">{formatHours(r.durationMinutes)} recorded</div>}
          </dl>
          <div className="mt-4 rounded-xl bg-paper p-3 text-sm text-ink-muted">
            <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Request</p>
            <p className="mt-1 text-ink">{r.helpWith}</p>
            {r.notes && <p className="mt-2"><span className="font-medium text-navy">Notes:</span> {r.notes}</p>}
          </div>
        </Card>
        <ChatPanel request={r} user={user} mentorName={mentorName} />
      </div>
    </Container>
  );
}
