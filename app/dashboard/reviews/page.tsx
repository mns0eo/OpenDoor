"use client";

import { MessageSquareQuote } from "lucide-react";
import { MentorNav } from "@/components/dashboard/MentorNav";
import { RequireMentor } from "@/components/dashboard/RequireMentor";
import { ReviewCard } from "@/components/ReviewCard";
import { Card, Container, EmptyState, PageHeader, Stars } from "@/components/ui";
import { useStore } from "@/lib/store";

export default function ReviewsPage() {
  const { db } = useStore();
  return (
    <RequireMentor>
      {(_, mentor) => {
        const reviews = db!.feedback.filter((f) => f.mentorId === mentor.id).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
        const avg = reviews.length ? reviews.reduce((s, f) => s + f.rating, 0) / reviews.length : 0;
        const name = (id: string) => db!.users.find((u) => u.id === id)?.name ?? "Mentee";
        return (
          <Container>
            <PageHeader eyebrow="Mentor tools" title="Reviews" description="What mentees said after your sessions. Reply to thank them or follow up — replies to public reviews appear on your profile." />
            <MentorNav />
            <div className="grid gap-8 lg:grid-cols-[1fr_260px]">
              {reviews.length === 0 ? (
                <EmptyState icon={<MessageSquareQuote className="h-5 w-5" />} title="No reviews yet" description="Mentees can leave a review after you mark a session completed." />
              ) : (
                <ul className="space-y-4">
                  {reviews.map((f) => <ReviewCard key={f.id} f={f} menteeName={name(f.menteeId)} mentorName={mentor.name} canReply showVisibility />)}
                </ul>
              )}
              <Card className="h-fit p-5">
                <p className="text-sm text-ink-muted">Average rating</p>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-3xl font-semibold text-navy">{avg ? avg.toFixed(1) : "—"}</span>
                  {avg > 0 && <Stars value={avg} />}
                </div>
                <p className="mt-1 text-xs text-ink-faint">{reviews.length} review{reviews.length === 1 ? "" : "s"} · {reviews.filter((f) => f.consentToShare).length} public</p>
                <p className="mt-4 text-xs leading-relaxed text-ink-faint">Only reviews the mentee chose to make public appear on your profile.</p>
              </Card>
            </div>
          </Container>
        );
      }}
    </RequireMentor>
  );
}
