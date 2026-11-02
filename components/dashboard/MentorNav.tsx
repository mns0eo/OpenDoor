"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { CalendarDays, ClipboardCheck, LayoutDashboard, MessageSquareQuote, UserRound } from "lucide-react";
import { cn } from "@/lib/utils";

const LINKS = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/dashboard/calendar", label: "Calendar", icon: CalendarDays },
  { href: "/dashboard/hours", label: "Volunteer hours", icon: ClipboardCheck },
  { href: "/dashboard/reviews", label: "Reviews", icon: MessageSquareQuote },
  { href: "/dashboard/profile", label: "Profile", icon: UserRound },
];

/** Sub-navigation shown on mentor pages. */
export function MentorNav() {
  const pathname = usePathname();
  return (
    <nav aria-label="Mentor" className="mb-8 flex gap-1 overflow-x-auto border-b border-line [scrollbar-width:none]">
      {LINKS.map(({ href, label, icon: Icon }) => {
        const active = pathname === href;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "-mb-px flex shrink-0 items-center gap-2 border-b-2 px-3.5 py-2.5 text-sm transition-colors",
              active ? "border-navy font-medium text-navy" : "border-transparent text-ink-muted hover:text-navy",
            )}
          >
            <Icon className="h-4 w-4" aria-hidden /> {label}
          </Link>
        );
      })}
    </nav>
  );
}
