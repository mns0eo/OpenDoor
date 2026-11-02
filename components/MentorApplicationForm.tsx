"use client";

import { useState } from "react";
import { CheckCircle2, Hourglass, LogIn } from "lucide-react";
import { CATEGORIES, GRADES } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { CategoryId, MeetingFormat, User } from "@/lib/types";
import { formatDate } from "@/lib/utils";
import { validateApplication, type ApplicationInput, type FieldErrors } from "@/lib/validation";
import { CategoryIcon } from "./CategoryIcon";
import { Alert, Button, ButtonLink, Card, Chip, Field, Input, Select, Skeleton, Textarea } from "./ui";

export function MentorApplicationForm() {
  const { db, user, ready } = useStore();
  if (!ready || !db) return <Skeleton className="h-96" />;

  if (!user) {
    return (
      <Card className="p-8 text-center sm:p-12">
        <LogIn className="mx-auto h-8 w-8 text-teal" />
        <h2 className="mt-4 text-2xl font-semibold text-navy">Log in to apply</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">Create a free account (or log in) first — your application is linked to your profile.</p>
        <div className="mt-6 flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink href="/signup">Create account</ButtonLink>
          <ButtonLink href="/login?next=/become-a-mentor%23apply" variant="outline">Log in</ButtonLink>
        </div>
      </Card>
    );
  }

  if (user.mentorStatus === "approved") {
    return (
      <Card className="p-8 text-center sm:p-12">
        <CheckCircle2 className="mx-auto h-8 w-8 text-teal" />
        <h2 className="mt-4 text-2xl font-semibold text-navy">You&apos;re already an approved mentor</h2>
        <p className="mt-2 text-ink-muted">Switch to mentor mode from your dashboard to manage requests.</p>
        <ButtonLink href="/dashboard" className="mt-6">Go to dashboard</ButtonLink>
      </Card>
    );
  }

  const pending = db.applications.find((a) => a.userId === user.id && a.status === "pending");
  if (pending) {
    return (
      <Card className="p-8 text-center sm:p-12">
        <Hourglass className="mx-auto h-8 w-8 text-amber-500" />
        <h2 className="mt-4 text-2xl font-semibold text-navy">Application under review</h2>
        <p className="mx-auto mt-2 max-w-md text-ink-muted">
          You applied on {formatDate(pending.createdAt)} to mentor in <span className="font-medium text-navy">{pending.expertise}</span>. An
          administrator will review it soon. Once approved, you&apos;ll appear in the directory and can switch to mentor mode.
        </p>
        <ButtonLink href="/dashboard" variant="outline" className="mt-6">Back to dashboard</ButtonLink>
      </Card>
    );
  }

  return <ApplicationForm user={user} rejected={user.mentorStatus === "rejected"} />;
}

function ApplicationForm({ user, rejected }: { user: User; rejected: boolean }) {
  const { actions } = useStore();
  const [form, setForm] = useState<ApplicationInput>({
    name: user.name,
    grade: GRADES.includes(user.grade) ? user.grade : "",
    categories: [],
    expertise: "",
    achievements: "",
    experience: "",
    motivation: "",
    topics: "",
    availability: "",
    formats: ["online", "in-person"],
  });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof ApplicationInput>(k: K, v: ApplicationInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };
  const toggle = <T extends string>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateApplication(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return setError("Please complete the highlighted fields.");
    setLoading(true);
    setError(null);
    setTimeout(() => {
      const res = actions.submitApplication(form);
      setLoading(false);
      if (!res.ok) setError(res.error);
      else document.getElementById("apply")?.scrollIntoView({ behavior: "smooth" });
    }, 450);
  };

  const ta = (k: keyof ApplicationInput, label: string, hint: string, rows = 3, placeholder?: string) => (
    <Field label={label} htmlFor={k} error={errors[k]} hint={hint} required>
      <Textarea id={k} rows={rows} maxLength={1000} value={form[k] as string} invalid={!!errors[k]} onChange={(e) => set(k, e.target.value as never)} placeholder={placeholder} />
    </Field>
  );

  return (
    <Card className="p-6 sm:p-10">
      <h2 className="text-2xl font-semibold text-navy">Mentor application</h2>
      <p className="mt-1 text-ink-muted">Your application will be marked <span className="font-medium text-amber-700">Pending Review</span> until an administrator approves it.</p>
      {rejected && (
        <Alert tone="info" className="mt-5" title="Applying again">Your previous application wasn&apos;t approved. Feel free to add more detail this time.</Alert>
      )}
      <form onSubmit={submit} noValidate className="mt-8 space-y-6">
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-6 sm:grid-cols-[1fr_10rem]">
          <Field label="Name" htmlFor="name" error={errors.name} required>
            <Input id="name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
          </Field>
          <Field label="Grade" htmlFor="grade" error={errors.grade} required>
            <Select id="grade" value={form.grade} invalid={!!errors.grade} onChange={(e) => set("grade", e.target.value)}>
              <option value="">Select</option>
              {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </Select>
          </Field>
        </div>

        <Field label="Main area of expertise" htmlFor="expertise" error={errors.expertise} required hint="Shown as your headline, e.g. “SAT Preparation” or “Varsity Soccer”.">
          <Input id="expertise" value={form.expertise} invalid={!!errors.expertise} onChange={(e) => set("expertise", e.target.value)} />
        </Field>

        <fieldset>
          <legend className="text-sm font-medium text-navy">Mentoring areas<span className="ml-0.5 text-teal-600" aria-hidden>*</span></legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} selected={form.categories.includes(c.id)} onClick={() => set("categories", toggle<CategoryId>(form.categories, c.id))}>
                <CategoryIcon id={c.id} className="h-3.5 w-3.5" /> {c.label}
              </Chip>
            ))}
          </div>
          {errors.categories && <p className="mt-1.5 text-sm text-red-700">{errors.categories}</p>}
        </fieldset>

        {ta("achievements", "Relevant achievements", "One per line — awards, scores, titles, results.", 4, "e.g. SAT 1560\nDECA State finalist")}
        {ta("experience", "Past experience", "Tutoring, coaching, leading a club, helping friends — anything relevant.", 3)}
        {ta("motivation", "Why do you want to be a mentor?", "A few sentences. This may be used as your profile introduction.", 3)}
        {ta("topics", "Topics you can help with", "One per line or comma-separated.", 3, "e.g. Study planning, AP Biology, Science Olympiad")}

        <div className="grid gap-6 sm:grid-cols-2">
          <Field label="General availability" htmlFor="availability" error={errors.availability} required>
            <Input id="availability" value={form.availability} invalid={!!errors.availability} onChange={(e) => set("availability", e.target.value)} placeholder="e.g. Weekday afternoons" />
          </Field>
          <fieldset>
            <legend className="text-sm font-medium text-navy">Formats<span className="ml-0.5 text-teal-600" aria-hidden>*</span></legend>
            <div className="mt-2 flex gap-2">
              {(["online", "in-person"] as const).map((f) => (
                <Chip key={f} selected={form.formats.includes(f)} onClick={() => set("formats", toggle<MeetingFormat>(form.formats, f))}>
                  {f === "online" ? "Online" : "In person"}
                </Chip>
              ))}
            </div>
            {errors.formats && <p className="mt-1.5 text-sm text-red-700">{errors.formats}</p>}
          </fieldset>
        </div>

        <div className="flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-ink-faint">By applying you agree to follow the community guidelines and safety rules.</p>
          <Button type="submit" size="lg" loading={loading}>Submit application</Button>
        </div>
      </form>
    </Card>
  );
}
