"use client";

import { useState } from "react";
import {
  BarChart3,
  CalendarCheck,
  Check,
  ClipboardList,
  Clock,
  Eye,
  EyeOff,
  Inbox,
  MessageSquareText,
  ShieldCheck,
  Star,
  UserCheck,
  Users,
  X,
} from "lucide-react";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { Database, MentorApplication, RequestStatus } from "@/lib/types";
import { cn, formatDate, formatDateTime, formatHours } from "@/lib/utils";
import { ConfirmButton, StatCard, Tabs } from "../dashboard/shared";
import { RequestItem } from "../RequestItem";
import { useToast } from "../Toast";
import { Avatar, Badge, Button, Card, Container, EmptyState, PageHeader, Stars, StatusBadge, Textarea } from "../ui";

type Tab = "overview" | "applications" | "users" | "requests" | "feedback" | "mentors";

export function AdminConsole() {
  const { db } = useStore();
  const [tab, setTab] = useState<Tab>("overview");
  if (!db) return null;
  const pendingApps = db.applications.filter((a) => a.status === "pending").length;

  return (
    <Container>
      <PageHeader
        eyebrow="Admin console"
        title="OpenDoor administration"
        description="Review mentor applications, monitor mentoring activity, and read session feedback."
        actions={<Badge tone="navy" className="px-3 py-1"><ShieldCheck className="h-3.5 w-3.5" /> Administrator</Badge>}
      />
      <Tabs<Tab>
        value={tab}
        onChange={setTab}
        tabs={[
          { value: "overview", label: "Overview" },
          { value: "applications", label: "Applications", count: pendingApps },
          { value: "users", label: "Users", count: db.users.length },
          { value: "requests", label: "Requests", count: db.requests.length },
          { value: "feedback", label: "Feedback", count: db.feedback.length },
          { value: "mentors", label: "Mentors", count: db.mentors.length },
        ]}
      />
      <div className="mt-6 animate-fade-in" key={tab}>
        {tab === "overview" && <Overview db={db} goTo={setTab} />}
        {tab === "applications" && <Applications db={db} />}
        {tab === "users" && <UsersTable db={db} />}
        {tab === "requests" && <Requests db={db} />}
        {tab === "feedback" && <FeedbackList db={db} />}
        {tab === "mentors" && <Mentors db={db} />}
      </div>
    </Container>
  );
}

// ── Overview ────────────────────────────────────────────────────────────────
function Overview({ db, goTo }: { db: Database; goTo: (t: Tab) => void }) {
  const count = (s: RequestStatus) => db.requests.filter((r) => r.status === s).length;
  const minutes = db.requests.reduce((s, r) => s + (r.status === "completed" ? r.durationMinutes ?? 0 : 0), 0);
  const avg = db.feedback.length ? db.feedback.reduce((s, f) => s + f.rating, 0) / db.feedback.length : 0;
  const answered = count("accepted") + count("completed") + count("declined");
  const acceptRate = answered ? Math.round(((count("accepted") + count("completed")) / answered) * 100) : 0;
  const pendingApps = db.applications.filter((a) => a.status === "pending");
  const byCat = CATEGORIES.map((c) => ({ c, n: db.requests.filter((r) => r.category === c.id).length })).sort((a, b) => b.n - a.n);
  const maxCat = Math.max(1, ...byCat.map((x) => x.n));
  const statuses: RequestStatus[] = ["pending", "accepted", "completed", "declined", "canceled"];
  const statusColor: Record<RequestStatus, string> = {
    pending: "bg-amber-400", accepted: "bg-emerald-500", completed: "bg-navy", declined: "bg-red-400", canceled: "bg-ink-faint",
  };

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <StatCard label="Registered users" value={db.users.length} icon={<Users className="h-4 w-4" />} hint={`${db.users.filter((u) => !u.isDemo).length} created in this browser`} />
        <StatCard label="Listed mentors" value={db.mentors.filter((m) => m.listed).length} icon={<UserCheck className="h-4 w-4" />} hint={`${pendingApps.length} application(s) pending`} />
        <StatCard label="Mentoring requests" value={db.requests.length} icon={<Inbox className="h-4 w-4" />} hint={`${acceptRate}% acceptance rate`} />
        <StatCard tone="navy" label="Platform-recorded hours" value={formatHours(minutes)} icon={<Clock className="h-4 w-4" />} hint={`${count("completed")} completed sessions · not officially verified`} />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="p-6 lg:col-span-2">
          <p className="flex items-center gap-2 font-semibold text-navy"><BarChart3 className="h-4 w-4 text-teal" /> Requests by category</p>
          <ul className="mt-5 space-y-3">
            {byCat.map(({ c, n }) => (
              <li key={c.id} className="grid grid-cols-[10rem_1fr_2rem] items-center gap-3 text-sm">
                <span className="truncate text-ink-muted">{c.label}</span>
                <span className="h-2.5 overflow-hidden rounded-full bg-paper">
                  <span className="block h-full rounded-full bg-teal transition-all" style={{ width: `${(n / maxCat) * 100}%` }} />
                </span>
                <span className="text-right font-medium text-navy">{n}</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-6">
          <p className="flex items-center gap-2 font-semibold text-navy"><CalendarCheck className="h-4 w-4 text-teal" /> Request status</p>
          <div className="mt-5 flex h-3 overflow-hidden rounded-full bg-paper" aria-hidden>
            {statuses.map((s) => (
              <span key={s} className={statusColor[s]} style={{ width: `${(count(s) / Math.max(1, db.requests.length)) * 100}%` }} />
            ))}
          </div>
          <ul className="mt-4 space-y-2 text-sm">
            {statuses.map((s) => (
              <li key={s} className="flex items-center justify-between">
                <span className="flex items-center gap-2 capitalize text-ink-muted"><span className={cn("h-2.5 w-2.5 rounded-full", statusColor[s])} /> {s}</span>
                <span className="font-medium text-navy">{count(s)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-6 border-t border-line pt-4">
            <p className="text-sm text-ink-muted">Average session rating</p>
            <div className="mt-1 flex items-center gap-2">
              <span className="text-2xl font-semibold text-navy">{avg ? avg.toFixed(1) : "—"}</span>
              {avg > 0 && <Stars value={avg} />}
              <span className="text-xs text-ink-faint">({db.feedback.length})</span>
            </div>
          </div>
        </Card>
      </div>

      {pendingApps.length > 0 && (
        <Card className="flex flex-col gap-4 border-amber-200 bg-amber-50/60 p-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-3">
            <ClipboardList className="mt-0.5 h-5 w-5 text-amber-700" />
            <div>
              <p className="font-medium text-navy">{pendingApps.length} mentor application{pendingApps.length > 1 ? "s" : ""} awaiting review</p>
              <p className="text-sm text-ink-muted">{pendingApps.map((a) => a.name).join(", ")}</p>
            </div>
          </div>
          <Button size="sm" onClick={() => goTo("applications")}>Review now</Button>
        </Card>
      )}
    </div>
  );
}

// ── Applications ───────────────────────────────────────────────────────────
function Applications({ db }: { db: Database }) {
  const [view, setView] = useState<"pending" | "reviewed">("pending");
  const list = db.applications
    .filter((a) => (view === "pending" ? a.status === "pending" : a.status !== "pending"))
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  return (
    <div>
      <div className="mb-4 flex gap-2">
        {(["pending", "reviewed"] as const).map((v) => (
          <button key={v} onClick={() => setView(v)} className={cn("rounded-full px-3 py-1 text-sm capitalize", view === v ? "bg-sky font-medium text-navy" : "text-ink-muted hover:text-navy")}>
            {v}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<ClipboardList className="h-5 w-5" />} title={view === "pending" ? "No applications waiting" : "No reviewed applications yet"} description={view === "pending" ? "New mentor applications will appear here for review." : undefined} />
      ) : (
        <ul className="space-y-4">{list.map((a) => <ApplicationCard key={a.id} a={a} />)}</ul>
      )}
    </div>
  );
}

function ApplicationCard({ a }: { a: MentorApplication }) {
  const { actions } = useStore();
  const toast = useToast();
  const [note, setNote] = useState("");
  const decide = (d: "approved" | "rejected") => {
    const res = actions.reviewApplication(a.id, d, note);
    toast(res.ok ? (d === "approved" ? `${a.name} approved — now listed in the directory` : `${a.name}'s application rejected`) : res.error, res.ok ? "success" : "error");
  };
  return (
    <Card as="li" className="list-none p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <Avatar name={a.name} seed={a.userId} />
          <div>
            <p className="font-semibold text-navy">{a.name} <span className="font-normal text-ink-muted">· Grade {a.grade}</span></p>
            <p className="text-sm font-medium text-teal-600">{a.expertise}</p>
          </div>
        </div>
        <div className="text-right">
          <Badge tone={a.status === "pending" ? "amber" : a.status === "approved" ? "green" : "red"}>
            {a.status === "pending" ? "Pending review" : a.status === "approved" ? "Approved" : "Rejected"}
          </Badge>
          <p className="mt-1 text-xs text-ink-faint">Applied {formatDate(a.createdAt)}</p>
        </div>
      </div>
      <div className="mt-4 flex flex-wrap gap-1.5">
        {a.categories.map((c) => <Badge key={c} tone="sky">{CATEGORY_MAP[c].label}</Badge>)}
        {a.formats.map((f) => <Badge key={f}>{f === "online" ? "Online" : "In person"}</Badge>)}
      </div>
      <dl className="mt-5 grid gap-4 text-sm sm:grid-cols-2">
        {([
          ["Achievements", a.achievements],
          ["Past experience", a.experience],
          ["Motivation", a.motivation],
          ["Topics", a.topics],
          ["Availability", a.availability],
        ] as const).map(([k, v]) => (
          <div key={k} className={cn("rounded-xl bg-paper p-3", k === "Motivation" && "sm:col-span-2")}>
            <dt className="text-xs font-medium uppercase tracking-wider text-ink-faint">{k}</dt>
            <dd className="mt-1 whitespace-pre-line text-ink">{v}</dd>
          </div>
        ))}
      </dl>
      {a.status === "pending" ? (
        <div className="mt-5 space-y-3 border-t border-line pt-5">
          <label htmlFor={`rn-${a.id}`} className="text-sm font-medium text-navy">Review note (optional, internal)</label>
          <Textarea id={`rn-${a.id}`} rows={2} value={note} onChange={(e) => setNote(e.target.value)} />
          <div className="flex justify-end gap-2">
            <ConfirmButton size="md" onConfirm={() => decide("rejected")} confirmLabel="Confirm reject"><X className="h-4 w-4" /> Reject</ConfirmButton>
            <Button variant="accent" onClick={() => decide("approved")}><Check className="h-4 w-4" /> Approve mentor</Button>
          </div>
        </div>
      ) : (
        a.reviewNote && <p className="mt-4 text-sm text-ink-muted"><span className="font-medium text-navy">Review note:</span> {a.reviewNote}</p>
      )}
    </Card>
  );
}

// ── Users ──────────────────────────────────────────────────────────────────
function UsersTable({ db }: { db: Database }) {
  const statusTone = { none: "neutral", pending: "amber", approved: "green", rejected: "red" } as const;
  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="border-b border-line bg-paper text-xs uppercase tracking-wider text-ink-faint">
            <tr>
              <th className="px-5 py-3 font-medium">User</th>
              <th className="px-5 py-3 font-medium">Grade</th>
              <th className="px-5 py-3 font-medium">Roles</th>
              <th className="px-5 py-3 font-medium">Mentor status</th>
              <th className="px-5 py-3 font-medium">Requests</th>
              <th className="px-5 py-3 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-line">
            {[...db.users].sort((a, b) => a.name.localeCompare(b.name)).map((u) => {
              const n = db.requests.filter((r) => r.menteeId === u.id || r.mentorUserId === u.id).length;
              return (
                <tr key={u.id} className="hover:bg-paper/60">
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <Avatar name={u.name} seed={u.id} size="sm" />
                      <div>
                        <p className="font-medium text-navy">{u.name} {u.isDemo && <span className="text-xs font-normal text-amber-700">(demo)</span>}</p>
                        <p className="text-xs text-ink-faint">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 text-ink-muted">{u.grade}</td>
                  <td className="px-5 py-3">
                    <div className="flex flex-wrap gap-1">
                      {u.isAdmin && <Badge tone="navy">Admin</Badge>}
                      <Badge>Mentee</Badge>
                      {u.mentorStatus === "approved" && <Badge tone="teal">Mentor</Badge>}
                    </div>
                  </td>
                  <td className="px-5 py-3"><Badge tone={statusTone[u.mentorStatus]} className="capitalize">{u.mentorStatus}</Badge></td>
                  <td className="px-5 py-3 text-ink-muted">{n}</td>
                  <td className="px-5 py-3 text-ink-muted">{formatDate(u.createdAt)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

// ── Requests ───────────────────────────────────────────────────────────────
function Requests({ db }: { db: Database }) {
  const [filter, setFilter] = useState<"all" | RequestStatus>("all");
  const list = db.requests.filter((r) => filter === "all" || r.status === filter).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const name = (id: string) => db.mentors.find((m) => m.id === id)?.name ?? "Mentor";
  return (
    <div>
      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "accepted", "completed", "declined", "canceled"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)} className={cn("rounded-full px-3 py-1 text-sm capitalize", filter === s ? "bg-sky font-medium text-navy" : "text-ink-muted hover:text-navy")}>
            {s}
          </button>
        ))}
      </div>
      {list.length === 0 ? (
        <EmptyState icon={<Inbox className="h-5 w-5" />} title="No requests" />
      ) : (
        <ul className="space-y-3">{list.map((r) => <RequestItem key={r.id} request={r} mentorName={name(r.mentorId)} perspective="admin" />)}</ul>
      )}
    </div>
  );
}

// ── Feedback ───────────────────────────────────────────────────────────────
function FeedbackList({ db }: { db: Database }) {
  if (db.feedback.length === 0)
    return <EmptyState icon={<MessageSquareText className="h-5 w-5" />} title="No feedback yet" description="Mentees can leave feedback after a session is marked completed." />;
  const helpful = { yes: "Yes", somewhat: "Somewhat", no: "No" };
  return (
    <div>
      <p className="mb-4 text-sm text-ink-muted">Feedback is private to administrators. Reviews are never shown publicly without the mentee&apos;s consent.</p>
      <ul className="grid gap-4 lg:grid-cols-2">
        {[...db.feedback].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).map((f) => {
          const mentor = db.mentors.find((m) => m.id === f.mentorId);
          const mentee = db.users.find((u) => u.id === f.menteeId);
          const req = db.requests.find((r) => r.id === f.requestId);
          return (
            <Card as="li" key={f.id} className="list-none p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-semibold text-navy">{mentor?.name ?? "Mentor"} <span className="font-normal text-ink-muted">← {mentee?.name ?? "Mentee"}</span></p>
                  <p className="text-xs text-ink-faint">{req ? `${CATEGORY_MAP[req.category].label} · ${formatDateTime(req.preferredAt)}` : ""}</p>
                </div>
                <Stars value={f.rating} />
              </div>
              <div className="mt-3 flex flex-wrap gap-1.5">
                <Badge tone={f.helpful === "yes" ? "green" : f.helpful === "somewhat" ? "amber" : "red"}>Helpful: {helpful[f.helpful]}</Badge>
                <Badge tone={f.consentToShare ? "teal" : "neutral"}>{f.consentToShare ? "Consented to public display" : "Private — no consent"}</Badge>
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div><dt className="inline font-medium text-navy">Learned: </dt><dd className="inline text-ink-muted">{f.learned}</dd></div>
                {f.improve && <div><dt className="inline font-medium text-navy">Could improve: </dt><dd className="inline text-ink-muted">{f.improve}</dd></div>}
                {f.review && <blockquote className="mt-2 rounded-xl bg-paper p-3 italic text-ink">&ldquo;{f.review}&rdquo;</blockquote>}
              </dl>
            </Card>
          );
        })}
      </ul>
    </div>
  );
}

// ── Mentors ────────────────────────────────────────────────────────────────
function Mentors({ db }: { db: Database }) {
  const { actions } = useStore();
  const toast = useToast();
  return (
    <ul className="grid gap-3 md:grid-cols-2">
      {[...db.mentors].sort((a, b) => a.name.localeCompare(b.name)).map((m) => {
        const done = db.requests.filter((r) => r.mentorId === m.id && r.status === "completed");
        const ratings = db.feedback.filter((f) => f.mentorId === m.id);
        const avg = ratings.length ? ratings.reduce((s, f) => s + f.rating, 0) / ratings.length : 0;
        return (
          <Card as="li" key={m.id} className="flex list-none items-center gap-4 p-4">
            <Avatar name={m.name} seed={m.id} />
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium text-navy">{m.name}</p>
              <p className="truncate text-xs text-ink-muted">{m.headline} · {done.length} sessions · {formatHours(done.reduce((s, r) => s + (r.durationMinutes ?? 0), 0))}{avg ? ` · ★ ${avg.toFixed(1)}` : ""}</p>
            </div>
            <Button
              size="sm"
              variant={m.listed ? "outline" : "secondary"}
              onClick={() => {
                const res = actions.setMentorListed(m.id, !m.listed);
                toast(res.ok ? (m.listed ? `${m.name} hidden from directory` : `${m.name} listed in directory`) : res.error, res.ok ? "success" : "error");
              }}
              aria-label={m.listed ? `Hide ${m.name} from directory` : `List ${m.name} in directory`}
            >
              {m.listed ? <><Eye className="h-4 w-4" /> Listed</> : <><EyeOff className="h-4 w-4" /> Hidden</>}
            </Button>
          </Card>
        );
      })}
      <li className="list-none md:col-span-2"><p className="flex items-center gap-1.5 text-xs text-ink-faint"><Star className="h-3 w-3" /> Ratings are visible to admins only.</p></li>
    </ul>
  );
}
