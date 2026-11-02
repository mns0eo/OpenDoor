"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { ShieldAlert } from "lucide-react";
import { useStore } from "@/lib/store";
import type { User } from "@/lib/types";
import { ButtonLink, Container, EmptyState, LoadingState } from "./ui";

/**
 * Client-side route guard for demo mode.
 * In production, protected data must ALSO be enforced server-side (Supabase RLS) —
 * a client guard alone only hides UI.
 */
export function RequireAuth({
  children,
  admin,
}: {
  children: (user: User) => React.ReactNode;
  admin?: boolean;
}) {
  const { ready, user } = useStore();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) router.replace(`/login?next=${encodeURIComponent(pathname)}`);
  }, [ready, user, router, pathname]);

  if (!ready || !user) return <LoadingState label={ready ? "Redirecting to log in…" : "Loading…"} />;

  if (admin && !user.isAdmin) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<ShieldAlert className="h-5 w-5" />}
          title="Administrators only"
          description="You don't have permission to view this page. If you think this is a mistake, contact the OpenDoor program coordinator."
          action={<ButtonLink href="/dashboard">Go to your dashboard</ButtonLink>}
        />
      </Container>
    );
  }

  return <>{children(user)}</>;
}
