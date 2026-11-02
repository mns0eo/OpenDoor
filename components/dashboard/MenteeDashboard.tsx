"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarCheck, CheckCircle2, Hourglass, Inbox, MessageSquareHeart, Search, Star } from "lucide-react";
import { useStore } from "@/lib/store";
import type { RequestStatus, User } from "@/lib/types";
import { RequestItem } from "../RequestItem";
import { useToast } from "../Toast";
import { Avatar, buttonClass, ButtonLink, Card, EmptyState } from "../ui";
import { ConfirmButton, DashSection, MentorStatusCard, StatCard, Tabs } from "./shared";

type Filter = "all" | RequestStatus;

export function MenteeDashboard({ user }: { user: User }) {
  const { db, actions } = useStore();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("all");
  if (!db) return null;

  const now = Date.now();
  const mine = db.requests.filter((r) => r.menteeId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const mentorName = (id: string) => db.mentors.find((m) => m.id === id)?.name ?? "Mentor";
  const hasFeedback = (id: string) => db.feedback.some((f) => f.requestId === id);

  const upcoming = mine.filter((r) => r.status === "accepted").sort((a, b) => a.preferredAt.localeCompare(b.preferredAt));
  const past = mine.filter((r) => r.status === "completed").sort((a, b) => b.preferredAt.localeCompare(a.preferredAt));
  const needsFeedback = past.filter((r) => !hasFeedback(r.id));
  const filtered = filter === "all" ? mine : mine.filter((r) => r.status === filter);
  const count = (s: RequestStatus) => mine.filter((r) => r.status === s).length;

  const cancel = (id: string) => {
    const res = actions.cancelRequest(id);
    toast(res.ok ? "Request canceled" : res.error, res.ok ? "success" : "error");
  };

  const cancelBtn = (id: string) => <ConfirmButton onConfirm={() => cancel(id)} confirmLabel="Confirm cancel">Cancel</ConfirmButton>;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
      <div className="min-w-0 space-y-12">
        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard label="Pending" value={count("pending")} icon={<Hourglass className="h-4 w-4" />} hint="Awaiting mentor reply" />
          <StatCard label="Upcoming" value={upcoming.filter((r) => new Date(r.preferredAt).getTime() >= now).length} icon={<CalendarCheck className="h-4 w-4" />} hint="Accepted sessions" />
          <StatCard label="Completed" value={past.length} icon={<CheckCircle2 className="h-4 w-4" />} hint="Sessions finished" />
          <StatCard label="Reviews to write" value={needsFeedback.length} icon={<Star className="h-4 w-4" />} hint="Help mentors improve" />
        </div>

        {needsFeedback.length > 0 && (
          <Card className="border-teal/30 bg-teal-50/60 p-5">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex gap-3">
                <MessageSquareHeart className="mt-0.5 h-5 w-5 shrink-0 text-teal-600" />
                <div>
                  <p className="font-medium text-navy">How did your session{needsFeedback.length > 1 ? "s" : ""} go?</p>
                  <p className="text-sm text-ink-muted">
                    Share quick feedback on your session with {mentorName(needsFeedback[0]!.mentorId)}
                    {needsFeedback.length > 1 ? ` and ${needsFeedback.length - 1} more` : ""}. Your mentor can read and reply.
                  </p>
                </div>
              </div>
              <ButtonLink href={`/requests/${needsFeedback[0]!.id}/feedback`} variant="accent" size="sm" className="shrink-0">
                Leave review
              </ButtonLink>
            </div>
          </Card>
        )}

        <DashSection title="Upcoming sessions" count={upcoming.length} description="Requests your mentor has accepted.">
          {upcoming.length === 0 ? (
            <EmptyState icon={<CalendarCheck className="h-5 w-5" />} title="No upcoming sessions" description="When a mentor accepts your request, it will show up here." />
          ) : (
            <ul className="space-y-3">
              {upcoming.map((r) => (
                <RequestItem key={r.id} request={r} mentorName={mentorName(r.mentorId)} perspective="mentee" actions={cancelBtn(r.id)} />
              ))}
            </ul>
          )}
        </DashSection>

        <DashSection
          title="My mentoring requests"
          count={mine.length}
          action={<ButtonLink href="/mentors" variant="outline" size="sm"><Search className="h-3.5 w-3.5" /> New request</ButtonLink>}
        >
          <Tabs<Filter>
            value={filter}
            onChange={setFilter}
            tabs={[
              { value: "all", label: "All", count: mine.length },
              { value: "pending", label: "Pending", count: count("pending") },
              { value: "accepted", label: "Accepted", count: count("accepted") },
              { value: "completed", label: "Completed", count: count("completed") },
              { value: "declined", label: "Declined", count: count("declined") },
              { value: "canceled", label: "Canceled", count: count("canceled") },
            ]}
          />
          {mine.length === 0 ? (
            <EmptyState
              icon={<Inbox className="h-5 w-5" />}
              title="You haven't requested any sessions yet"
              description="Find a mentor who's done what you're working toward and send your first request."
              action={<ButtonLink href="/mentors">Find a Mentor</ButtonLink>}
            />
          ) : filtered.length === 0 ? (
            <EmptyState title={`No ${filter} requests`} />
          ) : (
            <ul className="space-y-3">
              {filtered.map((r) => (
                <RequestItem
                  key={r.id}
                  request={r}
                  mentorName={mentorName(r.mentorId)}
                  perspective="mentee"
                  actions={
                    r.status === "pending" || r.status === "accepted" ? cancelBtn(r.id) :
                    r.status === "completed" && !hasFeedback(r.id) ? <ButtonLink href={`/requests/${r.id}/feedback`} variant="accent" size="sm">Leave review</ButtonLink> :
                    undefined
                  }
                />
              ))}
            </ul>
          )}
        </DashSection>

        <DashSection title="Past sessions" count={past.length}>
          {past.length === 0 ? (
            <EmptyState icon={<CheckCircle2 className="h-5 w-5" />} title="No completed sessions yet" description="Sessions appear here after your mentor marks them completed." />
          ) : (
            <ul className="space-y-3">
              {past.map((r) => (
                <RequestItem
                  key={r.id}
                  request={r}
                  mentorName={mentorName(r.mentorId)}
                  perspective="mentee"
                  actions={
                    hasFeedback(r.id) ? (
                      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-700"><CheckCircle2 className="h-4 w-4" /> Review sent</span>
                    ) : (
                      <ButtonLink href={`/requests/${r.id}/feedback`} variant="accent" size="sm">Leave review</ButtonLink>
                    )
                  }
                />
              ))}
            </ul>
          )}
        </DashSection>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
        <Card className="p-5">
          <div className="flex items-center gap-3">
            <Avatar name={user.name} seed={user.id} />
            <div className="min-w-0">
              <p className="truncate font-semibold text-navy">{user.name}</p>
              <p className="text-sm text-ink-muted">{/^\d+$/.test(user.grade) ? `Grade ${user.grade}` : user.grade} · Mentee</p>
            </div>
          </div>
          {user.interests && <p className="mt-4 text-sm text-ink-muted"><span className="font-medium text-navy">Interests:</span> {user.interests}</p>}
          <Link href="/dashboard/profile" className={buttonClass("outline", "sm", "mt-4 w-full")}>Profile settings</Link>
        </Card>
        <MentorStatusCard user={user} />
      </aside>
    </div>
  );
}
