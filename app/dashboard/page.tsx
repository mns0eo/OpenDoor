"use client";

import { RequireAuth } from "@/components/RequireAuth";
import { RoleSwitch } from "@/components/RoleSwitch";
import { MenteeDashboard } from "@/components/dashboard/MenteeDashboard";
import { MentorDashboard } from "@/components/dashboard/MentorDashboard";
import { MentorNav } from "@/components/dashboard/MentorNav";
import { Alert, ButtonLink, Container, PageHeader } from "@/components/ui";

export default function DashboardPage() {
  return (
    <RequireAuth>
      {(user) => {
        const asMentor = user.activeRole === "mentor" && user.mentorStatus === "approved";
        return (
          <Container>
            <PageHeader
              eyebrow={asMentor ? "Mentor dashboard" : "Mentee dashboard"}
              title={`Hi, ${user.name.split(" ")[0]} 👋`}
              description={
                asMentor
                  ? "Review incoming requests, manage your sessions, and track your mentoring impact."
                  : "Track your mentoring requests, upcoming sessions, and past conversations."
              }
              actions={
                <>
                  {user.mentorStatus === "approved" && <RoleSwitch />}
                  {user.isAdmin && <ButtonLink href="/admin" variant="outline" size="sm">Open admin</ButtonLink>}
                </>
              }
            />
            {user.isAdmin && (
              <Alert tone="info" className="mb-8" title="You're signed in as an administrator">
                Use the admin console to review mentor applications, requests, and feedback.
              </Alert>
            )}
            {asMentor && <MentorNav />}
            {asMentor ? <MentorDashboard user={user} /> : <MenteeDashboard user={user} />}
          </Container>
        );
      }}
    </RequireAuth>
  );
}
