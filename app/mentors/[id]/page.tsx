"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Award,
  Briefcase,
  CalendarClock,
  FileText,
  MapPin,
  MessageCircle,
  MessageSquareQuote,
  PlayCircle,
  Sparkles,
  UserX,
  Video,
} from "lucide-react";
import { formatLabel } from "@/components/FormatPicker";
import { IntroVideoPlayer } from "@/components/IntroVideo";
import { ReviewCard } from "@/components/ReviewCard";
import { openSlots } from "@/lib/sessions";
import { formatDateTime } from "@/lib/utils";
import { AvailabilityIndicator } from "@/components/Availability";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Alert, Avatar, Badge, buttonClass, ButtonLink, Card, Container, DemoTag, EmptyState, LoadingState, Stars } from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { useStore } from "@/lib/store";

export default function MentorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const { db, user } = useStore();

  if (!db) return <LoadingState label="Loading profile…" />;

  const mentor = db.mentors.find((m) => m.id === id);
  const isOwner = mentor && user?.id === mentor.userId;
  const canSee = mentor && (mentor.listed || isOwner || user?.isAdmin);

  if (!mentor || !canSee) {
    return (
      <Container className="py-16">
        <EmptyState
          icon={<UserX className="h-5 w-5" />}
          title="Mentor not found"
          description="This profile doesn't exist or isn't publicly listed right now."
          action={<ButtonLink href="/mentors" variant="outline">Back to directory</ButtonLink>}
        />
      </Container>
    );
  }

  const completed = db.requests.filter((r) => r.mentorId === mentor.id && r.status === "completed").length;
  const unavailable = mentor.availability === "unavailable";
  const slots = openSlots(db, mentor.id);
  const publicReviews = db.feedback.filter((f) => f.mentorId === mentor.id && f.consentToShare && f.review).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const avg = publicReviews.length ? publicReviews.reduce((s, f) => s + f.rating, 0) / publicReviews.length : 0;
  const nameOf = (id: string) => db.users.find((u) => u.id === id)?.name ?? "Mentee";

  const requestCta = isOwner ? (
    <ButtonLink href="/dashboard/profile" variant="outline" className="w-full">Edit your profile</ButtonLink>
  ) : unavailable || slots.length === 0 ? (
    <span className={buttonClass("primary", "lg", "w-full opacity-50 cursor-not-allowed")} aria-disabled>
      {unavailable ? "Not taking requests" : "No open times right now"}
    </span>
  ) : (
    <Link href={`/mentors/${mentor.id}/request`} className={buttonClass("primary", "lg", "w-full")}>
      Request Mentoring
    </Link>
  );

  return (
    <Container className="pb-8 pt-8">
      <Link href="/mentors" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> All mentors
      </Link>

      {!mentor.listed && (
        <Alert tone="info" className="mt-4" title="This profile is not publicly listed">
          Only you{user?.isAdmin ? " (admin)" : ""} can see it.
        </Alert>
      )}

      {/* Header */}
      <section className="relative mt-6 overflow-hidden rounded-3xl border border-line bg-white shadow-card">
        <div className="h-28 bg-gradient-to-r from-navy via-navy-600 to-teal sm:h-36" />
        <div className="px-6 pb-8 sm:px-10">
          <Avatar name={mentor.name} seed={mentor.id} size="xl" className="-mt-12 ring-4 ring-white sm:-mt-14" />
          <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-3xl font-semibold tracking-tight text-navy">{mentor.name}</h1>
                  {mentor.isDemo && <DemoTag />}
                </div>
                <p className="mt-1 text-ink-muted">
                  Grade {mentor.grade} · <span className="font-medium text-teal-600">{mentor.headline}</span>
                </p>
              </div>
            </div>
            <AvailabilityIndicator value={mentor.availability} className="sm:pb-2" />
          </div>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-navy/90">{mentor.intro}</p>
          <div className="mt-5 flex flex-wrap gap-2">
            {mentor.categories.map((c) => (
              <Link key={c} href={`/mentors?category=${c}`} className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1.5 text-sm text-navy hover:bg-sky-200">
                <CategoryIcon id={c} className="h-3.5 w-3.5" />
                {CATEGORY_MAP[c].label}
              </Link>
            ))}
            {mentor.otherAreas.map((a) => (
              <span key={a} className="inline-flex items-center gap-1.5 rounded-full bg-sky px-3 py-1.5 text-sm text-navy">
                <Sparkles className="h-3.5 w-3.5" /> {a}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_340px]">
        {/* Main */}
        <div className="space-y-6">
          <Section title="Introduction video" icon={<PlayCircle className="h-4 w-4" />}>
            <IntroVideoPlayer videoId={mentor.introVideoId} name={mentor.name} />
          </Section>

          <Section title="About" icon={<MessageCircle className="h-4 w-4" />}>
            <p className="whitespace-pre-line leading-relaxed text-ink-muted">{mentor.bio || mentor.intro}</p>
          </Section>

          {mentor.achievements.length > 0 && (
            <Section title="Accomplishments" icon={<Award className="h-4 w-4" />}>
              <ul className="grid gap-3 sm:grid-cols-2">
                {mentor.achievements.map((a) => (
                  <li key={a} className="flex gap-3 rounded-xl bg-paper p-4 text-sm font-medium text-navy">
                    <Award className="h-4 w-4 shrink-0 text-teal" aria-hidden />
                    {a}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          {mentor.experience.length > 0 && (
            <Section title="Relevant experience" icon={<Briefcase className="h-4 w-4" />}>
              <ul className="space-y-2.5">
                {mentor.experience.map((e) => (
                  <li key={e} className="flex gap-3 text-[15px] text-ink-muted">
                    <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                    {e}
                  </li>
                ))}
              </ul>
            </Section>
          )}

          <div className="grid gap-6 sm:grid-cols-2">
            <Section title="Mentoring topics" icon={<Sparkles className="h-4 w-4" />}>
              <TagList items={mentor.topics} tone="sky" />
            </Section>
            <Section title="Skills & interests" icon={<Sparkles className="h-4 w-4" />}>
              {mentor.skills.length ? <TagList items={mentor.skills} tone="neutral" /> : <p className="text-sm text-ink-faint">Not added yet.</p>}
            </Section>
          </div>

          <Section title={`Reviews${publicReviews.length ? ` (${publicReviews.length})` : ""}`} icon={<MessageSquareQuote className="h-4 w-4" />}>
            {publicReviews.length === 0 ? (
              <p className="text-sm text-ink-faint">No public reviews yet.</p>
            ) : (
              <>
                <div className="mb-4 flex items-center gap-2">
                  <span className="text-2xl font-semibold text-navy">{avg.toFixed(1)}</span>
                  <Stars value={avg} />
                  <span className="text-xs text-ink-faint">from mentees who chose to share their review</span>
                </div>
                <ul className="space-y-3">
                  {publicReviews.map((f) => <ReviewCard key={f.id} f={f} menteeName={nameOf(f.menteeId)} mentorName={mentor.name} />)}
                </ul>
              </>
            )}
          </Section>

          <Section title="Résumé / portfolio" icon={<FileText className="h-4 w-4" />}>
            <MediaPlaceholder icon={<FileText className="h-6 w-6" />} title="Résumé uploads" />
          </Section>
        </div>

        {/* Sidebar */}
        <aside className="order-first lg:order-none lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <p className="font-semibold text-navy">Book a conversation</p>
            <p className="mt-1 text-sm text-ink-muted">Free for TVS students. {mentor.name.split(" ")[0]} will accept or suggest another time.</p>
            <div className="mt-5">{requestCta}</div>
            <dl className="mt-6 space-y-4 border-t border-line pt-5 text-sm">
              <div className="flex gap-3">
                <CalendarClock className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <div>
                  <dt className="font-medium text-navy">Open times</dt>
                  <dd className="text-ink-muted">
                    {slots.length ? <>{slots.length} in the next 4 weeks · next {formatDateTime(slots[0]!)}</> : "None open right now"}
                  </dd>
                  {mentor.availabilityNote && <dd className="text-xs text-ink-faint">Usually: {mentor.availabilityNote}</dd>}
                </div>
              </div>
              <div className="flex gap-3">
                {mentor.formats.includes("online") ? <Video className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden /> : <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />}
                <div>
                  <dt className="font-medium text-navy">Mentoring formats</dt>
                  <dd className="text-ink-muted">{formatLabel(mentor.formats)}</dd>
                </div>
              </div>
              <div className="flex gap-3">
                <Award className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
                <div>
                  <dt className="font-medium text-navy">Sessions completed</dt>
                  <dd className="text-ink-muted">{completed} on OpenDoor</dd>
                </div>
              </div>
            </dl>
          </Card>
          <p className="mt-4 px-2 text-xs leading-relaxed text-ink-faint">
            Mentors are students sharing their personal experience. Reviewed and approved by an OpenDoor administrator.
          </p>
        </aside>
      </div>
    </Container>
  );
}

function Section({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <Card as="section" className="p-6">
      <h2 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-ink-faint">
        <span className="text-teal">{icon}</span>
        {title}
      </h2>
      {children}
    </Card>
  );
}

function TagList({ items, tone }: { items: string[]; tone: "sky" | "neutral" }) {
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((t) => (
        <li key={t}>
          <Badge tone={tone} className="px-3 py-1 text-sm font-normal">{t}</Badge>
        </li>
      ))}
    </ul>
  );
}

function MediaPlaceholder({ icon, title }: { icon: React.ReactNode; title: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-line bg-paper py-8 text-center text-ink-faint">
      {icon}
      <p className="mt-2 text-sm font-medium text-ink-muted">{title}</p>
      <p className="text-xs">Coming soon</p>
    </div>
  );
}
