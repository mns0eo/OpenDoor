"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useMemo, useState } from "react";
import { ArrowLeft, CalendarCheck, CheckCircle2, MapPin, UserX, Video } from "lucide-react";
import { RequireAuth } from "@/components/RequireAuth";
import { Alert, Avatar, Button, ButtonLink, Card, Container, EmptyState, Field, Input, Select, Textarea } from "@/components/ui";
import { CATEGORIES, CATEGORY_MAP } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { MentoringRequest, MentorProfile, User } from "@/lib/types";
import { cn, formatDateTime } from "@/lib/utils";
import { validateRequest, type FieldErrors, type RequestInput } from "@/lib/validation";

function todayLocal() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

export default function RequestPage() {
  const { id } = useParams<{ id: string }>();
  return <RequireAuth>{(user) => <RequestGate mentorId={id} user={user} />}</RequireAuth>;
}

function RequestGate({ mentorId, user }: { mentorId: string; user: User }) {
  const { db } = useStore();
  const mentor = db!.mentors.find((m) => m.id === mentorId && m.listed);
  if (!mentor) {
    return (
      <Container className="py-16">
        <EmptyState icon={<UserX className="h-5 w-5" />} title="Mentor not found" description="This mentor isn't available for requests." action={<ButtonLink href="/mentors" variant="outline">Back to directory</ButtonLink>} />
      </Container>
    );
  }
  if (mentor.userId === user.id) {
    return (
      <Container className="py-16">
        <EmptyState title="That's your own profile" description="You can't request a session with yourself." action={<ButtonLink href="/mentors">Browse other mentors</ButtonLink>} />
      </Container>
    );
  }
  if (mentor.availability === "unavailable") {
    return (
      <Container className="py-16">
        <EmptyState title={`${mentor.name} isn't taking requests right now`} description={mentor.availabilityNote} action={<ButtonLink href="/mentors">Find another mentor</ButtonLink>} />
      </Container>
    );
  }
  return <RequestForm mentor={mentor} user={user} />;
}

function RequestForm({ mentor, user }: { mentor: MentorProfile; user: User }) {
  const { actions } = useStore();
  const [form, setForm] = useState<RequestInput>({
    mentorId: mentor.id,
    category: mentor.categories[0] ?? "",
    helpWith: "",
    format: mentor.formats.length === 1 ? mentor.formats[0]! : "",
    date: "",
    time: "",
    notes: "",
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<MentoringRequest | null>(null);
  const minDate = useMemo(todayLocal, []);

  const set = <K extends keyof RequestInput>(k: K, v: RequestInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k] || (k === "time" && errors.date)) setErrors((e) => ({ ...e, [k]: "", ...(k === "time" ? { date: "" } : {}) }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateRequest(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) {
      setError("Please fix the highlighted fields.");
      return;
    }
    setLoading(true);
    setError(null);
    // small delay so the loading state is visible during demos
    setTimeout(() => {
      const res = actions.createRequest(form);
      setLoading(false);
      if (!res.ok) return setError(res.error);
      setDone(res.data);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }, 450);
  };

  if (done) {
    return (
      <Container className="max-w-2xl py-16">
        <Card className="animate-fade-up p-8 text-center sm:p-12">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-teal-50">
            <CheckCircle2 className="h-7 w-7 text-teal" />
          </div>
          <h1 className="mt-6 text-2xl font-semibold text-navy">Request sent to {mentor.name}!</h1>
          <p className="mt-2 text-ink-muted">
            Your request is <span className="font-medium text-amber-700">pending</span>. You&apos;ll see it update on your dashboard when{" "}
            {mentor.name.split(" ")[0]} accepts or declines.
          </p>
          <dl className="mx-auto mt-8 max-w-sm space-y-2 rounded-2xl bg-paper p-5 text-left text-sm">
            <Row label="Category" value={CATEGORY_MAP[done.category].label} />
            <Row label="Preferred time" value={formatDateTime(done.preferredAt)} />
            <Row label="Format" value={done.format === "online" ? "Online" : "In person"} />
          </dl>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/dashboard">View my dashboard</ButtonLink>
            <ButtonLink href="/mentors" variant="outline">Browse more mentors</ButtonLink>
          </div>
        </Card>
      </Container>
    );
  }

  const categories = [...mentor.categories.map((c) => CATEGORY_MAP[c]), ...CATEGORIES.filter((c) => !mentor.categories.includes(c.id))];

  return (
    <Container className="max-w-5xl pb-10 pt-8">
      <Link href={`/mentors/${mentor.id}`} className="inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy">
        <ArrowLeft className="h-4 w-4" /> Back to {mentor.name}
      </Link>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight text-navy">Request mentoring</h1>
      <p className="mt-2 text-ink-muted">Tell {mentor.name.split(" ")[0]} what you&apos;d like help with. Requests are free and you can cancel anytime.</p>

      <div className="mt-8 grid gap-8 lg:grid-cols-[1fr_300px]">
        <Card className="p-6 sm:p-8">
          <form onSubmit={submit} noValidate className="space-y-6">
            {error && <Alert tone="error">{error}</Alert>}

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Selected mentor" htmlFor="mentor">
                <Input id="mentor" value={`${mentor.name} · ${mentor.headline}`} readOnly disabled />
              </Field>
              <Field label="Your name" htmlFor="mentee" hint="From your profile settings.">
                <Input id="mentee" value={user.name} readOnly disabled />
              </Field>
            </div>

            <Field label="Mentoring category" htmlFor="category" error={errors.category} required>
              <Select id="category" value={form.category} invalid={!!errors.category} onChange={(e) => set("category", e.target.value as RequestInput["category"])}>
                <option value="">Choose a category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                    {mentor.categories.includes(c.id) ? " · mentor's specialty" : ""}
                  </option>
                ))}
              </Select>
            </Field>

            <Field label="What do you need help with?" htmlFor="helpWith" error={errors.helpWith} required hint={`${form.helpWith.length}/1000 · Be specific — it helps your mentor prepare.`}>
              <Textarea id="helpWith" rows={5} maxLength={1000} value={form.helpWith} invalid={!!errors.helpWith} onChange={(e) => set("helpWith", e.target.value)} placeholder="e.g. I'm taking the SAT in March and keep running out of time on the reading section…" />
            </Field>

            <fieldset>
              <legend className="text-sm font-medium text-navy">
                Preferred meeting format<span className="ml-0.5 text-teal-600" aria-hidden>*</span>
              </legend>
              <div className="mt-2 grid gap-3 sm:grid-cols-2">
                {(["online", "in-person"] as const).map((f) => {
                  const offered = mentor.formats.includes(f);
                  const Icon = f === "online" ? Video : MapPin;
                  return (
                    <label
                      key={f}
                      className={cn(
                        "flex items-center gap-3 rounded-xl border bg-white px-4 py-3 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal",
                        !offered ? "cursor-not-allowed opacity-50" : "cursor-pointer",
                        form.format === f ? "border-navy shadow-card" : "border-line hover:border-navy/30",
                      )}
                    >
                      <input type="radio" name="format" className="sr-only" disabled={!offered} checked={form.format === f} onChange={() => set("format", f)} />
                      <Icon className={cn("h-5 w-5", form.format === f ? "text-teal" : "text-ink-faint")} aria-hidden />
                      <span className="text-sm">
                        <span className="block font-medium text-navy">{f === "online" ? "Online" : "In person"}</span>
                        <span className="text-xs text-ink-faint">{!offered ? "Not offered by this mentor" : f === "online" ? "Video call" : "On campus"}</span>
                      </span>
                    </label>
                  );
                })}
              </div>
              {errors.format && <p className="mt-1.5 text-sm text-red-700">{errors.format}</p>}
            </fieldset>

            <div className="grid gap-6 sm:grid-cols-2">
              <Field label="Preferred date" htmlFor="date" error={errors.date} required>
                <Input id="date" type="date" min={minDate} value={form.date} invalid={!!errors.date} onChange={(e) => set("date", e.target.value)} />
              </Field>
              <Field label="Preferred time" htmlFor="time" error={errors.time} required>
                <Input id="time" type="time" step={900} value={form.time} invalid={!!errors.time} onChange={(e) => set("time", e.target.value)} />
              </Field>
            </div>
            <p className="-mt-3 text-xs text-ink-faint">Mentor&apos;s general availability: {mentor.availabilityNote || "Flexible"}</p>

            <Field label="Additional notes" htmlFor="notes" error={errors.notes} hint="Optional — anything else your mentor should know.">
              <Textarea id="notes" rows={3} maxLength={500} value={form.notes} invalid={!!errors.notes} onChange={(e) => set("notes", e.target.value)} />
            </Field>

            <div className="flex flex-col-reverse gap-3 border-t border-line pt-6 sm:flex-row sm:justify-end">
              <ButtonLink href={`/mentors/${mentor.id}`} variant="ghost">Cancel</ButtonLink>
              <Button type="submit" size="lg" loading={loading}>
                <CalendarCheck className="h-4 w-4" /> Send request
              </Button>
            </div>
          </form>
        </Card>

        <aside className="lg:sticky lg:top-24 lg:self-start">
          <Card className="p-6">
            <div className="flex items-center gap-3">
              <Avatar name={mentor.name} seed={mentor.id} />
              <div>
                <p className="font-semibold text-navy">{mentor.name}</p>
                <p className="text-sm text-ink-muted">Grade {mentor.grade} · {mentor.headline}</p>
              </div>
            </div>
            <ul className="mt-5 space-y-2 border-t border-line pt-5 text-sm text-ink-muted">
              {mentor.topics.slice(0, 4).map((t) => (
                <li key={t} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {t}
                </li>
              ))}
            </ul>
          </Card>
          <p className="mt-4 px-2 text-xs leading-relaxed text-ink-faint">
            In-person sessions should take place on campus in a public space. See our{" "}
            <Link href="/guidelines#safety" className="underline">safety guidelines</Link>.
          </p>
        </aside>
      </div>
    </Container>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <dt className="text-ink-faint">{label}</dt>
      <dd className="text-right font-medium text-navy">{value}</dd>
    </div>
  );
}
