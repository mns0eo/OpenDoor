import type { Metadata } from "next";
import { Card, Container, PageHeader } from "@/components/ui";

export const metadata: Metadata = { title: "Community guidelines" };

const SECTIONS = [
  {
    id: "guidelines",
    title: "Community guidelines",
    points: [
      "Be respectful, patient, and kind. Mentoring is a two-way relationship.",
      "Mentors share their own experience — they are not teachers, counselors, or admissions officers.",
      "Never share another student's work, grades, or personal information.",
      "Academic integrity comes first: mentors help you learn, not complete assignments for you.",
    ],
  },
  {
    id: "safety",
    title: "Safety",
    points: [
      "Meet in person only on campus, in public spaces such as the library or a classroom.",
      "Online sessions should use school-approved tools.",
      "If anything feels uncomfortable, end the session and contact a teacher or the program administrator.",
      "Every mentor is reviewed and approved by an administrator before appearing in the directory.",
    ],
  },
  {
    id: "privacy",
    title: "Privacy",
    points: [
      "This MVP runs in demo mode: everything you enter is stored only in your own browser (localStorage).",
      "All mentor profiles shown in the demo are fictional. No real student information is used.",
      "Session feedback is visible to administrators only. Reviews are never shown publicly without consent.",
      "Mentoring hours are platform-recorded based on what mentors enter. They are not officially verified volunteer hours.",
    ],
  },
];

export default function GuidelinesPage() {
  return (
    <Container className="max-w-3xl">
      <PageHeader eyebrow="Trust & safety" title="Guidelines, safety & privacy" description="How we keep OpenDoor a safe, respectful place to learn from each other." />
      <div className="space-y-6">
        {SECTIONS.map((s) => (
          <Card key={s.id} as="section" className="scroll-mt-24 p-6 sm:p-8">
            <h2 id={s.id} className="text-xl font-semibold text-navy">{s.title}</h2>
            <ul className="mt-4 space-y-3">
              {s.points.map((p) => (
                <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-ink-muted">
                  <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-teal" />
                  {p}
                </li>
              ))}
            </ul>
          </Card>
        ))}
      </div>
    </Container>
  );
}
