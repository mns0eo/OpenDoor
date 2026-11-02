"use client";

import Link from "next/link";
import { useState } from "react";
import { Clock, Hourglass, XCircle } from "lucide-react";
import type { User } from "@/lib/types";
import { cn } from "@/lib/utils";
import { Button, Card } from "../ui";

export function StatCard({ label, value, icon, hint, tone = "default" }: { label: string; value: React.ReactNode; icon: React.ReactNode; hint?: string; tone?: "default" | "navy" }) {
  return (
    <div className={cn("rounded-2xl border p-5 shadow-card", tone === "navy" ? "border-navy bg-navy text-white" : "border-line bg-white")}>
      <div className="flex items-center justify-between">
        <p className={cn("text-sm", tone === "navy" ? "text-white/70" : "text-ink-muted")}>{label}</p>
        <span className={cn("flex h-8 w-8 items-center justify-center rounded-lg", tone === "navy" ? "bg-white/10 text-teal" : "bg-sky text-navy")}>{icon}</span>
      </div>
      <p className={cn("mt-3 text-3xl font-semibold tracking-tight", tone === "navy" ? "text-white" : "text-navy")}>{value}</p>
      {hint && <p className={cn("mt-1 text-xs", tone === "navy" ? "text-white/60" : "text-ink-faint")}>{hint}</p>}
    </div>
  );
}

export function DashSection({ title, count, description, action, children }: { title: string; count?: number; description?: string; action?: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="animate-fade-up">
      <div className="mb-4 flex items-end justify-between gap-4">
        <div>
          <h2 className="flex items-center gap-2 text-lg font-semibold text-navy">
            {title}
            {count !== undefined && <span className="rounded-full bg-navy/5 px-2 py-0.5 text-xs font-medium text-ink-muted">{count}</span>}
          </h2>
          {description && <p className="mt-0.5 text-sm text-ink-muted">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </section>
  );
}

/** Two-step confirmation button for destructive actions. */
export function ConfirmButton({ onConfirm, children, confirmLabel = "Click to confirm", size = "sm" }: { onConfirm: () => void; children: React.ReactNode; confirmLabel?: string; size?: "sm" | "md" }) {
  const [armed, setArmed] = useState(false);
  return (
    <Button
      variant="danger"
      size={size}
      onClick={() => (armed ? (setArmed(false), onConfirm()) : setArmed(true))}
      onBlur={() => setArmed(false)}
    >
      {armed ? confirmLabel : children}
    </Button>
  );
}

export function Tabs<T extends string>({ value, onChange, tabs }: { value: T; onChange: (v: T) => void; tabs: { value: T; label: string; count?: number }[] }) {
  return (
    <div role="tablist" className="mb-4 flex gap-1 overflow-x-auto rounded-full border border-line bg-white p-1 [scrollbar-width:none]">
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          aria-selected={value === t.value}
          onClick={() => onChange(t.value)}
          className={cn(
            "flex shrink-0 items-center gap-1.5 rounded-full px-3.5 py-1.5 text-sm transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
            value === t.value ? "bg-navy text-white" : "text-ink-muted hover:text-navy",
          )}
        >
          {t.label}
          {t.count !== undefined && <span className={cn("text-xs", value === t.value ? "text-white/70" : "text-ink-faint")}>{t.count}</span>}
        </button>
      ))}
    </div>
  );
}

/** Shows where the user is in the mentor application pipeline. */
export function MentorStatusCard({ user }: { user: User }) {
  if (user.mentorStatus === "approved" || user.isAdmin) return null;
  const map = {
    none: {
      icon: <Clock className="h-5 w-5" />,
      title: "Want to give back?",
      body: "Share what you've learned. Apply to become a mentor — an administrator reviews every application.",
      cta: <Link href="/become-a-mentor" className="text-sm font-medium text-teal-600 hover:underline">Apply to mentor →</Link>,
    },
    pending: {
      icon: <Hourglass className="h-5 w-5" />,
      title: "Mentor application under review",
      body: "An administrator is reviewing your application. You can switch to mentor mode once you're approved.",
      cta: null,
    },
    rejected: {
      icon: <XCircle className="h-5 w-5" />,
      title: "Mentor application not approved",
      body: "Your application wasn't approved this time. You're welcome to strengthen it and apply again.",
      cta: <Link href="/become-a-mentor" className="text-sm font-medium text-teal-600 hover:underline">Apply again →</Link>,
    },
  }[user.mentorStatus];
  return (
    <Card className="p-5">
      <div className="flex gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">{map.icon}</span>
        <div>
          <p className="font-medium text-navy">{map.title}</p>
          <p className="mt-1 text-sm leading-relaxed text-ink-muted">{map.body}</p>
          {map.cta && <div className="mt-2">{map.cta}</div>}
        </div>
      </div>
    </Card>
  );
}
