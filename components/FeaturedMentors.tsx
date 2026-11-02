"use client";

import { useStore } from "@/lib/store";
import { MentorCard } from "./MentorCard";
import { Skeleton } from "./ui";

export function FeaturedMentors() {
  const { db } = useStore();
  if (!db) {
    return (
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => <Skeleton key={i} className="h-80" />)}
      </div>
    );
  }
  const featured = ["m_alex", "m_sophia", "m_emma"]
    .map((id) => db.mentors.find((m) => m.id === id && m.listed))
    .filter((m): m is NonNullable<typeof m> => Boolean(m));
  const list = featured.length ? featured : db.mentors.filter((m) => m.listed).slice(0, 3);
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {list.map((m) => <MentorCard key={m.id} mentor={m} />)}
    </div>
  );
}
