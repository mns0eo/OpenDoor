import type { Metadata } from "next";
import { Award, ClipboardCheck, FileText, Rocket } from "lucide-react";
import { MentorApplicationForm } from "@/components/MentorApplicationForm";
import { Container } from "@/components/ui";

export const metadata: Metadata = { title: "Become a Mentor" };

const EXAMPLES = [
  "Top 5% academically",
  "SAT 1550+",
  "Varsity athlete or captain",
  "All-State musician",
  "Student government leader",
  "Competition winner",
  "Ivy League / top-college admit",
  "Founder or entrepreneur",
];

const PROCESS = [
  { icon: FileText, title: "Apply", body: "Tell us about your achievements, experience, and what you'd like to help with. Takes about five minutes." },
  { icon: ClipboardCheck, title: "Admin review", body: "An OpenDoor administrator reviews every application to keep the community trustworthy." },
  { icon: Rocket, title: "Go live", body: "Once approved, your profile appears in the directory and you can switch to mentor mode." },
];

export default function BecomeMentorPage() {
  return (
    <>
      <section className="relative overflow-hidden border-b border-line bg-white">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top_right,black_20%,transparent_60%)]" />
        <Container className="relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:py-20">
          <div className="animate-fade-up">
            <p className="text-sm font-medium text-teal-600">Become a Mentor</p>
            <h1 className="mt-3 text-4xl font-semibold tracking-tight text-navy sm:text-5xl">Open the door for someone else.</h1>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              You&apos;ve learned things the hard way. Share them so the next student doesn&apos;t have to. Mentoring on OpenDoor
              builds leadership, communication, and real impact — on your schedule.
            </p>
            <a href="#apply" className="mt-8 inline-flex h-12 items-center rounded-full bg-navy px-6 font-medium text-white transition-colors hover:bg-navy-700">
              Start your application
            </a>
          </div>
          <div className="rounded-3xl border border-line bg-paper p-6 sm:p-8">
            <p className="flex items-center gap-2 font-semibold text-navy"><Award className="h-5 w-5 text-teal" /> What makes a great mentor</p>
            <p className="mt-2 text-sm text-ink-muted">
              Examples of experience we love to see. These are <em>examples, not requirements</em> — every application is reviewed individually.
            </p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {EXAMPLES.map((e) => (
                <li key={e} className="rounded-full border border-line bg-white px-3 py-1.5 text-sm text-navy">{e}</li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <Container className="py-16">
        <ol className="grid gap-6 md:grid-cols-3">
          {PROCESS.map((p, i) => (
            <li key={p.title} className="flex gap-4">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-navy text-white"><p.icon className="h-5 w-5" /></span>
              <div>
                <p className="text-xs font-medium text-ink-faint">Step {i + 1}</p>
                <p className="font-semibold text-navy">{p.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{p.body}</p>
              </div>
            </li>
          ))}
        </ol>
      </Container>

      <section id="apply" className="scroll-mt-20">
        <Container className="max-w-3xl">
          <MentorApplicationForm />
        </Container>
      </section>
    </>
  );
}
