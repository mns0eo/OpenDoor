"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Check, GraduationCap, LogOut, RotateCcw, Shield, Sparkles, Users } from "lucide-react";
import { useStore } from "@/lib/store";
import { DEMO_ACCOUNTS, DEMO_PASSWORD } from "@/lib/seed";
import { cn } from "@/lib/utils";

const ICONS = { Mentee: GraduationCap, Mentor: Users, Admin: Shield } as const;

/** Floating "Switch demo user" control for live presentations. Demo mode only. */
export function DemoSwitcher() {
  const { user, actions, ready } = useStore();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => ref.current && !ref.current.contains(e.target as Node) && setOpen(false);
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  if (!ready) return null;

  const switchTo = (userId: string, label: string) => {
    actions.switchDemoUser(userId);
    setOpen(false);
    router.push(label === "Admin" ? "/admin" : "/dashboard");
  };

  return (
    <div ref={ref} className="fixed bottom-4 right-4 z-50 print:hidden">
      {open && (
        <div
          role="dialog"
          aria-label="Switch demo user"
          className="absolute bottom-14 right-0 w-[19rem] animate-fade-up rounded-2xl border border-line bg-white p-2 shadow-lift"
        >
          <div className="px-3 pb-2 pt-2">
            <p className="text-sm font-semibold text-navy">Switch demo user</p>
            <p className="text-xs text-ink-faint">
              Fictional accounts · password <code className="rounded bg-paper px-1">{DEMO_PASSWORD}</code>
            </p>
          </div>
          {DEMO_ACCOUNTS.map((a) => {
            const Icon = ICONS[a.label];
            const active = user?.id === a.userId;
            return (
              <button
                key={a.userId}
                type="button"
                onClick={() => switchTo(a.userId, a.label)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition-colors hover:bg-paper",
                  active && "bg-sky/60",
                )}
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-navy text-white">
                  <Icon className="h-4 w-4" aria-hidden />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-navy">{a.label}</span>
                  <span className="block truncate text-xs text-ink-muted">{a.description}</span>
                </span>
                {active && <Check className="h-4 w-4 text-teal" aria-label="Current user" />}
              </button>
            );
          })}
          <div className="my-1.5 h-px bg-line" />
          <div className="flex gap-1">
            {user && (
              <button
                type="button"
                onClick={() => {
                  actions.logout();
                  setOpen(false);
                  router.push("/");
                }}
                className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs text-ink-muted hover:bg-paper hover:text-navy"
              >
                <LogOut className="h-3.5 w-3.5" /> Log out
              </button>
            )}
            <button
              type="button"
              onClick={() => {
                if (!confirmReset) return setConfirmReset(true);
                actions.resetDemo();
                setConfirmReset(false);
                setOpen(false);
                router.refresh();
              }}
              onBlur={() => setConfirmReset(false)}
              className={cn(
                "flex flex-1 items-center justify-center gap-1.5 rounded-xl px-3 py-2 text-xs transition-colors",
                confirmReset ? "bg-red-50 text-red-700" : "text-ink-muted hover:bg-paper hover:text-navy",
              )}
            >
              <RotateCcw className="h-3.5 w-3.5" /> {confirmReset ? "Click again to reset" : "Reset demo data"}
            </button>
          </div>
        </div>
      )}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex h-11 items-center gap-2 rounded-full bg-navy pl-3 pr-4 text-sm font-medium text-white shadow-lift transition-transform hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2"
      >
        <Sparkles className="h-4 w-4 text-teal" aria-hidden />
        <span>Switch demo user</span>
        {user && <span className="hidden rounded-full bg-white/15 px-2 py-0.5 text-xs sm:inline">{user.name.split(" ")[0]}</span>}
      </button>
    </div>
  );
}
