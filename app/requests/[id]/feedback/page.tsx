"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, CheckCircle2, Lock, Star } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Avatar, Button, ButtonLink, Card, Container, EmptyState, Field, Textarea } from "@/components/ui";
import { CATEGORY_MAP } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { Helpful, MentoringRequest, User } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { validateFeedback, type FeedbackInput, type FieldErrors } from "@/lib/validation";

export default function FeedbackPage() {
  const { id } = useParams<{ id: string }>();
  return <RequireAuth>{(user) => <Gate id={id} user={user} />}</RequireAuth>;
}

function Gate({ id, user }: { id: string; user: User }) {
  const { db } = useStore();
  // Held here (not in the form) because submitting changes the store, which would otherwise
  // re-run the checks below and replace the thank-you screen with "already submitted".
  const [submittedTo, setSubmittedTo] = useState<string | null>(null);
  if (submittedTo) return <ThankYou mentorName={submittedTo} />;
  const r = db!.requests.find((x) => x.id === id);
  const back = <ButtonLink href="/dashboard" variant="outline">Back to dashboard</ButtonLink>;
  if (!r || r.menteeId !== user.id)
    return <Container className="py-16"><EmptyState icon={<Lock className="h-5 w-5" />} title="Session not found" description="Only the mentee of a session can leave feedback for it." action={back} /></Container>;
  if (r.status !== "completed")
    return <Container className="py-16"><EmptyState title="Feedback isn't open yet" description="You can leave feedback once your mentor marks the session completed." action={back} /></Container>;
  if (db!.feedback.some((f) => f.requestId === r.id))
    return <Container className="py-16"><EmptyState icon={<CheckCircle2 className="h-5 w-5" />} title="Thanks — feedback already submitted" description="You've already shared feedback for this session." action={back} /></Container>;
  const mentor = db!.mentors.find((m) => m.id === r.mentorId);
  const name = mentor?.name ?? "your mentor";
  return <FeedbackForm r={r} mentorName={name} onDone={() => setSubmittedTo(name)} />;
}

function ThankYou({ mentorName }: { mentorName: string }) {
  return (
    <Container className="max-w-xl py-16">
      <Card className="animate-fade-up p-10 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-teal" />
        <h1 className="mt-5 text-2xl font-semibold text-navy">Thank you for your review!</h1>
        <p className="mt-2 text-ink-muted">
          It helps {mentorName.split(" ")[0]} and the OpenDoor team make every session better. Your private feedback is visible only to administrators.
        </p>
        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/dashboard">Back to dashboard</ButtonLink>
          <ButtonLink href="/mentors" variant="outline">Find another mentor</ButtonLink>
        </div>
      </Card>
    </Container>
  );
}

const RATING_LABEL = ["", "Poor", "Fair", "Good", "Great", "Excellent"];

function FeedbackForm({ r, mentorName, onDone }: { r: MentoringRequest; mentorName: string; onDone: () => void }) {
  const { actions } = useStore();
  const [form, setForm] = useState<FeedbackInput>({ rating: 0, helpful: "", learned: "", improve: "", review: "", consentToShare: false });
  const [hover, setHover] = useState(0);
  const first = mentorName.split(" ")[0];
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);

  const set = <K extends keyof FeedbackInput>(k: K, v: FeedbackInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateFeedback(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return setError("Please complete the highlighted fields.");
    const res = actions.submitFeedback(r.id, form);
    if (!res.ok) return setError(res.error);
    onDone();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const shown = hover || form.rating;

  return (
    <Container className="max-w-2xl pb-10 pt-8">
      <Link href="/dashboard" className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy"><ArrowLeft className="h-4 w-4" /> Dashboard</Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy">Review your session</h1>
      <div className="mt-4 flex items-center gap-3 rounded-2xl border border-line bg-white p-4">
        <Avatar name={mentorName} seed={r.mentorId} size="sm" />
        <p className="text-sm text-ink-muted">
          <span className="font-medium text-navy">{mentorName}</span> · {CATEGORY_MAP[r.category].label} · {formatDateTime(r.preferredAt)}
        </p>
      </div>

      <Card className="mt-6 p-6 sm:p-8">
        <form onSubmit={submit} noValidate className="space-y-7">
          {error && <Alert tone="error">{error}</Alert>}

          <section className="space-y-6">
            <h2 className="text-lg font-semibold text-navy">Review for {first}</h2>
          <fieldset>
            <legend className="text-sm font-medium text-navy">Overall satisfaction<span className="ml-0.5 text-teal-600" aria-hidden>*</span></legend>
            <div className="mt-3 flex items-center gap-3">
              <div className="flex gap-1" role="radiogroup" aria-label="Rating" onMouseLeave={() => setHover(0)}>
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    role="radio"
                    aria-checked={form.rating === n}
                    aria-label={`${n} star${n > 1 ? "s" : ""} — ${RATING_LABEL[n]}`}
                    onMouseEnter={() => setHover(n)}
                    onClick={() => set("rating", n)}
                    className="rounded-lg p-1 transition-transform hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
                  >
                    <Star className={cn("h-9 w-9 transition-colors", n <= shown ? "fill-amber-400 text-amber-400" : "text-line")} />
                  </button>
                ))}
              </div>
              <span className="text-sm font-medium text-ink-muted">{RATING_LABEL[shown]}</span>
            </div>
            {errors.rating && <p className="mt-1.5 text-sm text-red-700">{errors.rating}</p>}
          </fieldset>

          <Field label={`Your review for ${first}`} htmlFor="review" error={errors.review} required hint="What was great? Would you recommend them? Your mentor can read and reply to it.">
            <Textarea id="review" rows={3} maxLength={1000} value={form.review} invalid={!!errors.review} onChange={(e) => set("review", e.target.value)} />
          </Field>

          <label className="flex items-start gap-3 rounded-xl bg-paper p-4 text-sm text-ink-muted">
            <input type="checkbox" checked={form.consentToShare} onChange={(e) => set("consentToShare", e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal" />
            <span>
              <span className="font-medium text-navy">Show my rating and review on {first}&apos;s public profile.</span> Optional. Only your first name and
              last initial are shown. If unchecked, only {first} and OpenDoor administrators can see it.
            </span>
          </label>
          </section>

          <section className="space-y-6 border-t border-line pt-7">
            <div>
              <h2 className="text-lg font-semibold text-navy">Private feedback</h2>
              <p className="text-sm text-ink-muted">Only OpenDoor administrators see this — it helps us improve the program.</p>
            </div>
          <fieldset>
            <legend className="text-sm font-medium text-navy">Was the session helpful?<span className="ml-0.5 text-teal-600" aria-hidden>*</span></legend>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {(["yes", "somewhat", "no"] as Helpful[]).map((h) => (
                <label key={h} className={cn("flex cursor-pointer items-center justify-center rounded-xl border px-3 py-2.5 text-sm capitalize transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal", form.helpful === h ? "border-navy bg-navy text-white" : "border-line bg-white text-ink-muted hover:border-navy/30")}>
                  <input type="radio" name="helpful" value={h} className="sr-only" checked={form.helpful === h} onChange={() => set("helpful", h)} />
                  {h}
                </label>
              ))}
            </div>
            {errors.helpful && <p className="mt-1.5 text-sm text-red-700">{errors.helpful}</p>}
          </fieldset>

          <Field label="What did you learn?" htmlFor="learned" error={errors.learned} required>
            <Textarea id="learned" rows={3} maxLength={1000} value={form.learned} invalid={!!errors.learned} onChange={(e) => set("learned", e.target.value)} />
          </Field>
          <Field label="What could be improved?" htmlFor="improve" hint="Optional">
            <Textarea id="improve" rows={2} maxLength={1000} value={form.improve} onChange={(e) => set("improve", e.target.value)} />
          </Field>
          </section>

          <div className="flex justify-end border-t border-line pt-6">
            <Button type="submit" size="lg">Submit feedback</Button>
          </div>
        </form>
      </Card>
    </Container>
  );
}
