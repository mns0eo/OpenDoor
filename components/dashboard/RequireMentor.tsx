"use client";

import { UserCheck } from "lucide-react";
import { useMyMentorProfile } from "@/lib/store";
import type { MentorProfile, User } from "@/lib/types";
import { RequireAuth } from "../RequireAuth";
import { ButtonLink, Container, EmptyState } from "../ui";

/** Guard for mentor-only pages: logged in + approved mentor with a profile. */
export function RequireMentor({ children }: { children: (user: User, mentor: MentorProfile) => React.ReactNode }) {
  return <RequireAuth>{(user) => <Inner user={user}>{children}</Inner>}</RequireAuth>;
}

function Inner({ user, children }: { user: User; children: (user: User, mentor: MentorProfile) => React.ReactNode }) {
  const mentor = useMyMentorProfile();
  if (user.mentorStatus !== "approved" || !mentor) {
    return (
      <Container className="py-20">
        <EmptyState
          icon={<UserCheck className="h-5 w-5" />}
          title="For approved mentors only"
          description="This page becomes available once your mentor application is approved."
          action={<ButtonLink href="/become-a-mentor">Apply to mentor</ButtonLink>}
        />
      </Container>
    );
  }
  return <>{children(user, mentor)}</>;
}
