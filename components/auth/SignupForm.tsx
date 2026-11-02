"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { GRADES } from "@/lib/categories";
import { validateSignup, type FieldErrors, type SignupInput } from "@/lib/validation";
import { cn } from "@/lib/utils";
import { AuthShell } from "./AuthShell";
import { Alert, Button, Field, Input, Select } from "../ui";
import { useToast } from "../Toast";

export function SignupForm() {
  const { actions, ready } = useStore();
  const router = useRouter();
  const toast = useToast();
  const [form, setForm] = useState<SignupInput>({ name: "", email: "", password: "", grade: "", initialRole: "mentee", agree: false });
  const [errors, setErrors] = useState<FieldErrors>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = <K extends keyof SignupInput>(k: K, v: SignupInput[K]) => {
    setForm((f) => ({ ...f, [k]: v }));
    if (errors[k]) setErrors((e) => ({ ...e, [k]: "" }));
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validateSignup(form);
    setErrors(errs);
    if (Object.values(errs).some(Boolean)) return;
    setLoading(true);
    const res = actions.signup(form);
    if (!res.ok) {
      setLoading(false);
      return setError(res.error);
    }
    toast(`Welcome to OpenDoor, ${res.data.name.split(" ")[0]}!`);
    router.push(form.initialRole === "mentor" ? "/become-a-mentor" : "/mentors");
  };

  return (
    <AuthShell
      title="Create your account"
      subtitle={
        <>
          Already have one?{" "}
          <Link href="/login" className="font-medium text-teal-600 hover:underline">Log in</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}

        <fieldset>
          <legend className="text-sm font-medium text-navy">I want to…</legend>
          <div className="mt-2 grid grid-cols-2 gap-3">
            {([
              { v: "mentee", title: "Find a mentor", body: "Get guidance from peers", Icon: GraduationCap },
              { v: "mentor", title: "Become a mentor", body: "Requires admin approval", Icon: Users },
            ] as const).map(({ v, title, body, Icon }) => (
              <label
                key={v}
                className={cn(
                  "flex cursor-pointer flex-col rounded-2xl border bg-white p-4 transition-all has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-teal",
                  form.initialRole === v ? "border-navy shadow-card" : "border-line hover:border-navy/30",
                )}
              >
                <input type="radio" name="role" value={v} checked={form.initialRole === v} onChange={() => set("initialRole", v)} className="sr-only" />
                <Icon className={cn("h-5 w-5", form.initialRole === v ? "text-teal" : "text-ink-faint")} aria-hidden />
                <span className="mt-3 text-sm font-semibold text-navy">{title}</span>
                <span className="text-xs text-ink-faint">{body}</span>
              </label>
            ))}
          </div>
          {form.initialRole === "mentor" && (
            <p className="mt-2 text-xs text-ink-muted">
              You&apos;ll start as a mentee and can switch to mentor mode once an administrator approves your application.
            </p>
          )}
        </fieldset>

        <Field label="Full name" htmlFor="name" error={errors.name} required>
          <Input id="name" autoComplete="name" value={form.name} invalid={!!errors.name} onChange={(e) => set("name", e.target.value)} />
        </Field>
        <Field label="Email" htmlFor="email" error={errors.email} required hint="Use your school email in production.">
          <Input id="email" type="email" autoComplete="email" value={form.email} invalid={!!errors.email} onChange={(e) => set("email", e.target.value)} />
        </Field>
        <div className="grid grid-cols-[1fr_8rem] gap-4">
          <Field label="Password" htmlFor="password" error={errors.password} required>
            <Input id="password" type="password" autoComplete="new-password" value={form.password} invalid={!!errors.password} onChange={(e) => set("password", e.target.value)} placeholder="8+ characters" />
          </Field>
          <Field label="Grade" htmlFor="grade" error={errors.grade} required>
            <Select id="grade" value={form.grade} invalid={!!errors.grade} onChange={(e) => set("grade", e.target.value)}>
              <option value="">Select</option>
              {GRADES.map((g) => <option key={g} value={g}>Grade {g}</option>)}
            </Select>
          </Field>
        </div>

        <div>
          <label className="flex items-start gap-3 text-sm text-ink-muted">
            <input type="checkbox" checked={form.agree} onChange={(e) => set("agree", e.target.checked)} className="mt-0.5 h-4 w-4 accent-teal" />
            <span>
              I&apos;m a member of The Village School community and agree to the{" "}
              <Link href="/guidelines" className="text-teal-600 underline-offset-2 hover:underline">community guidelines</Link>.
            </span>
          </label>
          {errors.agree && <p className="mt-1.5 text-sm text-red-700">{errors.agree}</p>}
        </div>

        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!ready}>Create account</Button>
      </form>
    </AuthShell>
  );
}
