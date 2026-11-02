"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { GraduationCap, Shield, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/seed";
import { AuthShell } from "./AuthShell";
import { Alert, Button, Field, Input } from "../ui";

const ICONS = { Mentee: GraduationCap, Mentor: Users, Admin: Shield } as const;

/** Only allow internal redirects (prevents open-redirect via ?next=). */
function safeNext(next: string | null, fallback: string) {
  return next && next.startsWith("/") && !next.startsWith("//") ? next : fallback;
}

export function LoginForm() {
  const { actions, ready } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const submit = (e: React.FormEvent, creds?: { email: string; password: string }) => {
    e.preventDefault();
    const c = creds ?? { email, password };
    if (!c.email || !c.password) return setError("Please enter your email and password.");
    setLoading(true);
    setError(null);
    const res = actions.login(c.email, c.password);
    if (!res.ok) {
      setLoading(false);
      return setError(res.error);
    }
    router.push(safeNext(params.get("next"), res.data.isAdmin ? "/admin" : "/dashboard"));
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle={
        <>
          New to OpenDoor?{" "}
          <Link href="/signup" className="font-medium text-teal-600 hover:underline">Create an account</Link>
        </>
      }
    >
      <form onSubmit={submit} noValidate className="space-y-5">
        {error && <Alert tone="error">{error}</Alert>}
        <Field label="Email" htmlFor="email">
          <Input id="email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@school.org" />
        </Field>
        <Field label="Password" htmlFor="password">
          <Input id="password" type="password" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} />
        </Field>
        <Button type="submit" size="lg" className="w-full" loading={loading} disabled={!ready}>Log in</Button>
      </form>

      <div className="mt-10 rounded-2xl border border-line bg-white p-5">
        <p className="text-sm font-semibold text-navy">Demo accounts</p>
        <p className="mt-0.5 text-xs text-ink-faint">
          Fictional users · password <code className="rounded bg-paper px-1">{DEMO_PASSWORD}</code>. Click to sign in instantly.
        </p>
        <div className="mt-4 grid gap-2 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((a) => {
            const Icon = ICONS[a.label];
            return (
              <button
                key={a.userId}
                type="button"
                disabled={!ready}
                onClick={(e) => submit(e, { email: a.email, password: DEMO_PASSWORD })}
                className="flex flex-col items-start rounded-xl border border-line px-3 py-2.5 text-left transition-colors hover:border-teal hover:bg-teal-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <Icon className="h-4 w-4 text-teal" aria-hidden />
                <span className="mt-1.5 text-sm font-medium text-navy">{a.label}</span>
                <span className="truncate text-[11px] text-ink-faint">{a.email}</span>
              </button>
            );
          })}
        </div>
      </div>
    </AuthShell>
  );
}
