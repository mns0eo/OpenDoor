import type { Metadata } from "next";
import { Suspense } from "react";
import { MentorDirectory } from "@/components/MentorDirectory";
import { Container, LoadingState, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Find a Mentor" };

export default function MentorsPage() {
  return (
    <Container>
      <PageHeader
        eyebrow="Mentor directory"
        title="Find a mentor who's been there."
        description="Every mentor is a reviewed member of The Village School community. Search by keyword or filter by what you're working on."
      />
      <Suspense fallback={<LoadingState label="Loading mentors…" />}>
        <MentorDirectory />
      </Suspense>
    </Container>
  );
}
