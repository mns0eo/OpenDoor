"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { CategoryIcon } from "@/components/CategoryIcon";
import { MentorStatusCard } from "@/components/dashboard/shared";
import { RequireAuth } from "@/components/RequireAuth";
import { RoleSwitch } from "@/components/RoleSwitch";
import { useToast } from "@/components/Toast";
import { Alert, Avatar, Button, Card, Chip, Container, Field, Input, PageHeader, Select, Textarea } from "@/components/ui";
import { CATEGORIES, GRADES } from "@/lib/categories";
import { useMyMentorProfile, useStore } from "@/lib/store";
import type { Availability, CategoryId, MeetingFormat, MentorProfile, User } from "@/lib/types";
import { lines } from "@/lib/utils";

export default function ProfilePage() {
  return (
    <RequireAuth>
      {(user) => (
        <Container className="max-w-3xl">
          <Link href="/dashboard" className="mt-8 inline-flex items-center gap-1.5 text-sm text-ink-muted hover:text-navy">
            <ArrowLeft className="h-4 w-4" /> Dashboard
          </Link>
          <PageHeader eyebrow="Settings" title="Profile settings" description="Keep your information up to date so mentors and mentees know who you are." />
          <div className="space-y-8">
            <AccountForm user={user} />
            {user.mentorStatus === "approved" ? (
              <>
                <Card className="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="font-medium text-navy">Active role</p>
                    <p className="text-sm text-ink-muted">Switch between finding mentors and mentoring others.</p>
                  </div>
                  <RoleSwitch />
                </Card>
                <MentorProfileForm />
              </>
            ) : (
              <MentorStatusCard user={user} />
            )}
          </div>
        </Container>
      )}
    </RequireAuth>
  );
}

function AccountForm({ user }: { user: User }) {
  const { actions } = useStore();
  const toast = useToast();
  const [form, setForm] = useState({ name: user.name, grade: user.grade, bio: user.bio, interests: user.interests });
  const [error, setError] = useState<string | null>(null);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const res = actions.updateProfile(form);
    if (!res.ok) return setError(res.error);
    setError(null);
    toast("Profile saved");
  };

  const grades = GRADES.includes(user.grade) ? GRADES : [...GRADES, user.grade];

  return (
    <Card as="section" className="p-6 sm:p-8">
      <div className="flex items-center gap-4">
        <Avatar name={form.name || user.name} seed={user.id} size="lg" />
        <div>
          <h2 className="text-lg font-semibold text-navy">Account</h2>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
      </div>
      <form onSubmit={save} className="mt-6 space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <div className="grid gap-5 sm:grid-cols-[1fr_10rem]">
          <Field label="Full name" htmlFor="pname" required>
            <Input id="pname" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </Field>
          <Field label="Grade" htmlFor="pgrade">
            <Select id="pgrade" value={form.grade} onChange={(e) => setForm({ ...form, grade: e.target.value })}>
              {grades.map((g) => <option key={g} value={g}>{/^\d+$/.test(g) ? `Grade ${g}` : g}</option>)}
            </Select>
          </Field>
        </div>
        <Field label="About you" htmlFor="pbio" hint={`${form.bio.length}/600`}>
          <Textarea id="pbio" rows={3} maxLength={600} value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} placeholder="A sentence or two about you and your goals." />
        </Field>
        <Field label="Interests" htmlFor="pint" hint="Comma-separated, e.g. SAT prep, robotics, soccer">
          <Input id="pint" value={form.interests} onChange={(e) => setForm({ ...form, interests: e.target.value })} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit">Save changes</Button>
        </div>
      </form>
    </Card>
  );
}

function MentorProfileForm() {
  const profile = useMyMentorProfile();
  const { actions } = useStore();
  const toast = useToast();
  const [form, setForm] = useState(() => toForm(profile));
  const [error, setError] = useState<string | null>(null);
  if (!profile || !form) return null;

  const set = <K extends keyof NonNullable<typeof form>>(k: K, v: NonNullable<typeof form>[K]) => setForm({ ...form, [k]: v });
  const toggle = <T extends string>(list: T[], v: T) => (list.includes(v) ? list.filter((x) => x !== v) : [...list, v]);

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const res = actions.updateMentorProfile({
      headline: form.headline.trim(),
      intro: form.intro.trim(),
      bio: form.bio.trim(),
      achievements: lines(form.achievements),
      experience: lines(form.experience),
      skills: lines(form.skills),
      topics: lines(form.topics),
      categories: form.categories,
      formats: form.formats,
      availability: form.availability,
      availabilityNote: form.availabilityNote.trim(),
    });
    if (!res.ok) return setError(res.error);
    setError(null);
    toast("Mentor profile updated");
  };

  return (
    <Card as="section" className="p-6 sm:p-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold text-navy">Mentor profile</h2>
          <p className="text-sm text-ink-muted">This is what mentees see in the directory.</p>
        </div>
        <Link href={`/mentors/${profile.id}`} className="inline-flex items-center gap-1 text-sm font-medium text-teal-600 hover:underline">
          View public profile <ExternalLink className="h-3.5 w-3.5" />
        </Link>
      </div>
      <form onSubmit={save} className="mt-6 space-y-5" noValidate>
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Area of expertise" htmlFor="mhead" required>
          <Input id="mhead" value={form.headline} onChange={(e) => set("headline", e.target.value)} placeholder="e.g. SAT Preparation" />
        </Field>
        <Field label="Short introduction" htmlFor="mintro" required hint="Shown on your directory card (1–2 sentences).">
          <Textarea id="mintro" rows={2} maxLength={220} value={form.intro} onChange={(e) => set("intro", e.target.value)} />
        </Field>
        <Field label="Biography" htmlFor="mbio">
          <Textarea id="mbio" rows={4} maxLength={1200} value={form.bio} onChange={(e) => set("bio", e.target.value)} />
        </Field>
        <div className="grid gap-5 sm:grid-cols-2">
          <Field label="Accomplishments" htmlFor="mach" hint="One per line">
            <Textarea id="mach" rows={4} value={form.achievements} onChange={(e) => set("achievements", e.target.value)} />
          </Field>
          <Field label="Relevant experience" htmlFor="mexp" hint="One per line">
            <Textarea id="mexp" rows={4} value={form.experience} onChange={(e) => set("experience", e.target.value)} />
          </Field>
          <Field label="Mentoring topics" htmlFor="mtop" hint="One per line">
            <Textarea id="mtop" rows={4} value={form.topics} onChange={(e) => set("topics", e.target.value)} />
          </Field>
          <Field label="Skills & interests" htmlFor="mskill" hint="One per line">
            <Textarea id="mskill" rows={4} value={form.skills} onChange={(e) => set("skills", e.target.value)} />
          </Field>
        </div>
        <fieldset>
          <legend className="text-sm font-medium text-navy">Mentoring categories</legend>
          <div className="mt-2 flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <Chip key={c.id} selected={form.categories.includes(c.id)} onClick={() => set("categories", toggle<CategoryId>(form.categories, c.id))}>
                <CategoryIcon id={c.id} className="h-3.5 w-3.5" /> {c.label}
              </Chip>
            ))}
          </div>
        </fieldset>
        <div className="grid gap-5 sm:grid-cols-2">
          <fieldset>
            <legend className="text-sm font-medium text-navy">Formats</legend>
            <div className="mt-2 flex gap-2">
              {(["online", "in-person"] as const).map((f) => (
                <Chip key={f} selected={form.formats.includes(f)} onClick={() => set("formats", toggle<MeetingFormat>(form.formats, f))}>
                  {f === "online" ? "Online" : "In person"}
                </Chip>
              ))}
            </div>
          </fieldset>
          <Field label="Availability status" htmlFor="mavail">
            <Select id="mavail" value={form.availability} onChange={(e) => set("availability", e.target.value as Availability)}>
              <option value="available">Available</option>
              <option value="limited">Limited availability</option>
              <option value="unavailable">Not taking requests (paused)</option>
            </Select>
          </Field>
        </div>
        <Field label="General availability" htmlFor="mnote" hint="e.g. Weekday afternoons after 3:30 PM">
          <Input id="mnote" value={form.availabilityNote} onChange={(e) => set("availabilityNote", e.target.value)} />
        </Field>
        <div className="flex justify-end">
          <Button type="submit">Save mentor profile</Button>
        </div>
      </form>
    </Card>
  );
}

function toForm(p: MentorProfile | null) {
  if (!p) return null;
  return {
    headline: p.headline,
    intro: p.intro,
    bio: p.bio,
    achievements: p.achievements.join("\n"),
    experience: p.experience.join("\n"),
    skills: p.skills.join("\n"),
    topics: p.topics.join("\n"),
    categories: p.categories,
    formats: p.formats,
    availability: p.availability,
    availabilityNote: p.availabilityNote,
  };
}
