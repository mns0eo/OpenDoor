"use client";

import { usePathname, useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import type { ActiveRole } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Mentee ⇄ Mentor toggle. Only rendered for users whose mentor application is approved;
 * the store also rejects the switch for anyone else.
 */
export function RoleSwitch({ compact }: { compact?: boolean }) {
  const { user, actions } = useStore();
  const router = useRouter();
  const pathname = usePathname();
  if (!user || user.mentorStatus !== "approved") return null;

  const set = (role: ActiveRole) => {
    if (role === user.activeRole) return;
    const res = actions.setActiveRole(role);
    if (res.ok && !pathname.startsWith("/dashboard")) router.push("/dashboard");
  };

  return (
    <div
      role="radiogroup"
      aria-label="Active role"
      className={cn("inline-flex rounded-full border border-line bg-white p-0.5", compact ? "text-xs" : "text-sm")}
    >
      {(["mentee", "mentor"] as const).map((r) => (
        <button
          key={r}
          type="button"
          role="radio"
          aria-checked={user.activeRole === r}
          onClick={() => set(r)}
          className={cn(
            "rounded-full px-3 font-medium capitalize transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal",
            compact ? "py-1" : "py-1.5",
            user.activeRole === r ? "bg-navy text-white shadow-sm" : "text-ink-muted hover:text-navy",
          )}
        >
          {r}
        </button>
      ))}
    </div>
  );
}
