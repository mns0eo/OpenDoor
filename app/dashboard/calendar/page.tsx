"use client";

import { AvailabilityCalendar } from "@/components/AvailabilityCalendar";
import { MentorNav } from "@/components/dashboard/MentorNav";
import { RequireMentor } from "@/components/dashboard/RequireMentor";
import { Container, PageHeader } from "@/components/ui";

export default function CalendarPage() {
  return (
    <RequireMentor>
      {(_, mentor) => (
        <Container>
          <PageHeader
            eyebrow="Mentor tools"
            title="Your availability"
            description="Click (or click and drag) to open 1-hour times mentees can book. Mentees only see open times in the next 4 weeks. Changes save automatically."
          />
          <MentorNav />
          <AvailabilityCalendar mentor={mentor} />
        </Container>
      )}
    </RequireMentor>
  );
}
