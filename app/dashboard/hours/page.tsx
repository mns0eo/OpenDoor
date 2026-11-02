"use client";

import { useState } from "react";
import { CheckCircle2, Clock, Printer, Send, ShieldCheck, XCircle } from "lucide-react";
import { MentorNav } from "@/components/dashboard/MentorNav";
import { RequireMentor } from "@/components/dashboard/RequireMentor";
import { StatCard } from "@/components/dashboard/shared";
import { useToast } from "@/components/Toast";
import { Alert, Badge, Button, Card, Container, EmptyState, PageHeader, Textarea } from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { hoursStatus } from "@/lib/sessions";
import { useStore } from "@/lib/store";
import type { MentorProfile, User } from "@/lib/types";
import { cn, formatDate, formatDateTime, formatHours } from "@/lib/utils";

const STATUS = {
  "not-submitted": { label: "Not submitted", tone: "neutral" as const },
  pending: { label: "Pending school review", tone: "amber" as const },
  approved: { label: "Verified by school", tone: "green" as const },
  rejected: { label: "Not approved", tone: "red" as const },
};

export default function HoursPage() {
  return <RequireMentor>{(user, mentor) => <Hours user={user} mentor={mentor} />}</RequireMentor>;
}

function Hours({ user, mentor }: { user: User; mentor: MentorProfile }) {
  const { db, actions } = useStore();
  const toast = useToast();
  const [selected, setSelected] = useState<string[]>([]);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  const completed = db!.requests.filter((r) => r.mentorUserId === user.id && r.status === "completed").sort((a, b) => b.preferredAt.localeCompare(a.preferredAt));
  const status = (id: string) => hoursStatus(db!, id);
  const submittable = completed.filter((r) => ["not-submitted", "rejected"].includes(status(r.id)));
  const sum = (st: string) => completed.filter((r) => status(r.id) === st).reduce((s, r) => s + (r.durationMinutes ?? 0), 0);
  const total = completed.reduce((s, r) => s + (r.durationMinutes ?? 0), 0);
  const submissions = db!.hoursSubmissions.filter((s) => s.mentorUserId === user.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const selectedMinutes = completed.filter((r) => selected.includes(r.id)).reduce((s, r) => s + (r.durationMinutes ?? 0), 0);

  const toggle = (id: string) => setSelected((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  const submit = () => {
    const res = actions.submitHours(selected, note);
    if (!res.ok) return setError(res.error);
    setSelected([]);
    setNote("");
    setError(null);
    toast(`Sent ${formatHours(res.data.totalMinutes)} to the school for review`);
  };

  return (
    <Container>
      <div className="print:hidden">
        <PageHeader
          eyebrow="Mentor tools"
          title="Volunteer hours"
          description="Send your completed sessions to The Village School. A school administrator reviews them and can approve them as volunteer hours."
          actions={<Button variant="outline" size="sm" onClick={() => window.print()}><Printer className="h-4 w-4" /> Print activity report</Button>}
        />
        <MentorNav />
      </div>

      {/* Print-only header */}
      <div className="hidden print:block">
        <p className="text-sm">OpenDoor · The Village School</p>
        <h1 className="mt-1 text-2xl font-semibold">Mentoring activity report — {mentor.name} (Grade {mentor.grade})</h1>
        <p className="mt-1 text-sm">Generated {formatDate(new Date().toISOString())}. Durations are entered by the mentor; “Verified” means approved by a school administrator in OpenDoor.</p>
      </div>

      <div className="grid grid-cols-2 gap-4 md:grid-cols-4 print:mt-4">
        <StatCard label="Total recorded" value={formatHours(total)} icon={<Clock className="h-4 w-4" />} hint={`${completed.length} completed sessions`} />
        <StatCard tone="navy" label="Verified by school" value={formatHours(sum("approved"))} icon={<ShieldCheck className="h-4 w-4" />} hint="Approved volunteer hours" />
        <StatCard label="Pending review" value={formatHours(sum("pending"))} icon={<Send className="h-4 w-4" />} hint="Sent to the school" />
        <StatCard label="Not submitted" value={formatHours(sum("not-submitted") + sum("rejected"))} icon={<XCircle className="h-4 w-4" />} hint="Ready to send" />
      </div>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Completed sessions</h2>
        <p className="mt-0.5 text-sm text-ink-muted print:hidden">Select the sessions to send to the school.</p>
        {completed.length === 0 ? (
          <div className="mt-4"><EmptyState icon={<Clock className="h-5 w-5" />} title="No completed sessions yet" description="Mark a session completed from your dashboard to record its hours." /></div>
        ) : (
          <Card className="mt-4 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[640px] text-left text-sm">
                <thead className="border-b border-line bg-paper text-xs uppercase tracking-wider text-ink-faint">
                  <tr>
                    <th className="w-10 px-4 py-3 print:hidden"><span className="sr-only">Select</span></th>
                    <th className="px-4 py-3 font-medium">Date</th>
                    <th className="px-4 py-3 font-medium">Mentee</th>
                    <th className="px-4 py-3 font-medium">Topic</th>
                    <th className="px-4 py-3 font-medium">Duration</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  {completed.map((r) => {
                    const st = status(r.id);
                    const can = st === "not-submitted" || st === "rejected";
                    return (
                      <tr key={r.id} className={cn(selected.includes(r.id) && "bg-sky/40")}>
                        <td className="px-4 py-3 print:hidden">
                          <input type="checkbox" className="h-4 w-4 accent-teal" disabled={!can} checked={selected.includes(r.id)} onChange={() => toggle(r.id)} aria-label={`Select session on ${formatDate(r.preferredAt)}`} />
                        </td>
                        <td className="px-4 py-3 text-ink-muted">{formatDateTime(r.preferredAt)}</td>
                        <td className="px-4 py-3 font-medium text-navy">{r.menteeName}</td>
                        <td className="px-4 py-3 text-ink-muted">{CATEGORY_MAP[r.category].label}</td>
                        <td className="px-4 py-3 text-ink-muted">{formatHours(r.durationMinutes ?? 0)}</td>
                        <td className="px-4 py-3"><Badge tone={STATUS[st].tone}>{STATUS[st].label}</Badge></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {submittable.length > 0 && (
          <Card className="mt-4 p-5 print:hidden">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1">
                <label htmlFor="hours-note" className="text-sm font-medium text-navy">Note to the school (optional)</label>
                <Textarea id="hours-note" rows={2} maxLength={500} value={note} onChange={(e) => setNote(e.target.value)} placeholder="e.g. Weekly SAT study sessions with two sophomores." className="mt-1.5" />
              </div>
              <Button onClick={submit} disabled={selected.length === 0}>
                <Send className="h-4 w-4" /> Send {selected.length ? `${formatHours(selectedMinutes)} ` : ""}to school
              </Button>
            </div>
            {error && <Alert tone="error" className="mt-3">{error}</Alert>}
          </Card>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-lg font-semibold text-navy">Submission history</h2>
        {submissions.length === 0 ? (
          <p className="mt-2 text-sm text-ink-muted">Nothing sent yet.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {submissions.map((s) => (
              <Card as="li" key={s.id} className="list-none p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="font-medium text-navy">
                    {formatHours(s.totalMinutes)} · {s.requestIds.length} session{s.requestIds.length > 1 ? "s" : ""}
                    <span className="ml-2 text-sm font-normal text-ink-faint">sent {formatDate(s.createdAt)}</span>
                  </p>
                  <Badge tone={s.status === "approved" ? "green" : s.status === "pending" ? "amber" : "red"}>
                    {s.status === "approved" ? <><CheckCircle2 className="h-3 w-3" /> Verified</> : s.status === "pending" ? "Pending review" : "Not approved"}
                  </Badge>
                </div>
                {s.note && <p className="mt-2 text-sm text-ink-muted">Your note: {s.note}</p>}
                {s.reviewerNote && <p className="mt-1 text-sm text-ink-muted"><span className="font-medium text-navy">School:</span> {s.reviewerNote}</p>}
              </Card>
            ))}
          </ul>
        )}
      </section>
    </Container>
  );
}
