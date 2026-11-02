import Link from "next/link";
import {
  ArrowRight,
  Award,
  CalendarCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
  MessageSquareText,
  Search,
  ShieldCheck,
  Sparkles,
  Star,
  TrendingUp,
  UserCheck,
} from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { FeaturedMentors } from "@/components/FeaturedMentors";
import { Avatar, ButtonLink, Container } from "@/components/ui";

const STEPS = [
  { icon: Search, title: "Find your mentor", body: "Browse peers who have excelled in exactly what you're working toward. Filter by category or search by keyword." },
  { icon: MessageSquareText, title: "Request a session", body: "Share what you need help with, pick online or in person, and suggest a time that works for you." },
  { icon: CalendarCheck, title: "Meet and talk", body: "Your mentor accepts, and you meet. Real advice from someone who was in your shoes a year or two ago." },
  { icon: TrendingUp, title: "Grow and give back", body: "Leave feedback, track your progress — and when you're ready, open the door for someone else." },
];

const MENTOR_BENEFITS = [
  { icon: HeartHandshake, title: "Make a real difference", body: "Help a younger student skip the trial-and-error you went through." },
  { icon: Award, title: "Build leadership experience", body: "Mentoring sharpens communication, empathy, and teaching skills colleges look for." },
  { icon: Clock, title: "Record your impact", body: "Completed sessions are logged as platform-recorded mentoring hours on your dashboard." },
  { icon: Sparkles, title: "Grow your own expertise", body: "Explaining what you know is the fastest way to master it." },
];

export default function LandingPage() {
  return (
    <>
      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        <div className="bg-grid pointer-events-none absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_70%)]" />
        <div className="pointer-events-none absolute -right-40 -top-40 h-[32rem] w-[32rem] rounded-full bg-sky blur-3xl" />
        <div className="pointer-events-none absolute -left-32 top-64 h-72 w-72 rounded-full bg-teal/10 blur-3xl" />
        <Container className="relative grid items-center gap-14 pb-20 pt-14 sm:pt-20 lg:grid-cols-[1.1fr_0.9fr] lg:pb-28">
          <div className="animate-fade-up">
            <p className="inline-flex items-center gap-2 rounded-full border border-line bg-white px-3 py-1 text-xs font-medium text-ink-muted shadow-sm">
              <span className="h-1.5 w-1.5 rounded-full bg-teal" />
              Now piloting at The Village School · Houston
            </p>
            <h1 className="mt-6 text-[2.6rem] font-semibold leading-[1.05] tracking-tight text-navy sm:text-6xl">
              Your Next Opportunity Starts With a{" "}
              <span className="relative whitespace-nowrap text-teal">
                Conversation.
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 300 12" fill="none" aria-hidden>
                  <path d="M2 9C60 3 140 2 298 7" stroke="#4A9D9A" strokeOpacity=".35" strokeWidth="3" strokeLinecap="round" />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted">
              OpenDoor connects you with students who&apos;ve already done what you&apos;re aiming for — aced the SAT, made varsity,
              started a business, led student government. Peer mentoring that&apos;s personal, practical, and free.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink href="/mentors" size="lg">
                Find a Mentor <ArrowRight className="h-4 w-4" />
              </ButtonLink>
              <ButtonLink href="/become-a-mentor" size="lg" variant="outline">
                Become a Mentor
              </ButtonLink>
            </div>
            <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-line pt-6">
              {[
                ["8", "Mentoring areas"],
                ["100%", "Admin-reviewed mentors"],
                ["$0", "For students"],
              ].map(([v, l]) => (
                <div key={l}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-2xl font-semibold tracking-tight text-navy">{v}</dd>
                  <dd className="mt-0.5 text-xs text-ink-faint">{l}</dd>
                </div>
              ))}
            </dl>
          </div>

          <HeroVisual />
        </Container>
      </section>

      {/* ── Value strip ──────────────────────────────────────────────────── */}
      <section className="border-y border-line bg-white">
        <Container className="grid gap-8 py-12 md:grid-cols-3">
          {[
            { icon: UserCheck, title: "Mentors who've been there", body: "Peers with proven achievements — not generic advice from strangers." },
            { icon: ShieldCheck, title: "Reviewed for trust", body: "Every mentor is reviewed and approved by a program administrator." },
            { icon: Sparkles, title: "Beyond tutoring", body: "From college essays to tryouts to your first startup idea." },
          ].map((v) => (
            <div key={v.title} className="flex gap-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky text-navy">
                <v.icon className="h-5 w-5" aria-hidden />
              </div>
              <div>
                <p className="font-medium text-navy">{v.title}</p>
                <p className="mt-1 text-sm leading-relaxed text-ink-muted">{v.body}</p>
              </div>
            </div>
          ))}
        </Container>
      </section>

      {/* ── How it works ─────────────────────────────────────────────────── */}
      <section id="how-it-works" className="scroll-mt-20 py-24">
        <Container>
          <SectionIntro eyebrow="How OpenDoor works" title="From question to conversation in minutes." />
          <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {STEPS.map((s, i) => (
              <li key={s.title} className="group relative rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
                <div className="flex items-center justify-between">
                  <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy text-white">
                    <s.icon className="h-5 w-5" aria-hidden />
                  </div>
                  <span className="text-sm font-medium text-ink-faint">0{i + 1}</span>
                </div>
                <h3 className="mt-6 text-lg font-semibold text-navy">{s.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-ink-muted">{s.body}</p>
              </li>
            ))}
          </ol>
        </Container>
      </section>

      {/* ── Categories ───────────────────────────────────────────────────── */}
      <section id="categories" className="scroll-mt-20 bg-white py-24">
        <Container>
          <SectionIntro
            eyebrow="Mentoring categories"
            title="Guidance for every part of student life."
            body="Not just tutoring. Find a mentor for the goals that matter most to you right now."
          />
          <div className="mt-14 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {CATEGORIES.map((c) => (
              <Link
                key={c.id}
                href={`/mentors?category=${c.id}`}
                className="group flex flex-col rounded-2xl border border-line bg-paper p-6 transition-all duration-300 hover:-translate-y-1 hover:border-teal/40 hover:bg-white hover:shadow-lift focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white text-teal-600 shadow-sm transition-colors group-hover:bg-teal group-hover:text-white">
                  <CategoryIcon id={c.id} className="h-5 w-5" />
                </div>
                <h3 className="mt-5 font-semibold text-navy">{c.label}</h3>
                <p className="mt-1.5 flex-1 text-sm leading-relaxed text-ink-muted">{c.description}</p>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-teal-600">
                  Browse mentors <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </section>

      {/* ── Featured mentors ─────────────────────────────────────────────── */}
      <section className="py-24">
        <Container>
          <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
            <SectionIntro eyebrow="Meet the mentors" title="Students who've opened doors — ready to open yours." align="left" />
            <ButtonLink href="/mentors" variant="outline" className="shrink-0">
              View all mentors <ArrowRight className="h-4 w-4" />
            </ButtonLink>
          </div>
          <div className="mt-12">
            <FeaturedMentors />
          </div>
        </Container>
      </section>

      {/* ── Become a mentor ──────────────────────────────────────────────── */}
      <section className="px-4 sm:px-6">
        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-3xl bg-navy px-6 py-16 text-white sm:px-12 lg:px-16">
          <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-teal/30 blur-3xl" />
          <div className="relative grid gap-12 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <p className="text-sm font-medium text-teal">For mentors</p>
              <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
                You worked hard to get here. Help someone else get there faster.
              </h2>
              <p className="mt-4 leading-relaxed text-white/70">
                If you&apos;ve excelled academically, athletically, artistically, or as a leader, your experience is valuable. Apply in
                five minutes — an administrator reviews every application.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <ButtonLink href="/become-a-mentor" variant="accent" size="lg">
                  Become a Mentor <ArrowRight className="h-4 w-4" />
                </ButtonLink>
              </div>
            </div>
            <ul className="grid gap-4 sm:grid-cols-2">
              {MENTOR_BENEFITS.map((b) => (
                <li key={b.title} className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 backdrop-blur-sm">
                  <b.icon className="h-5 w-5 text-teal" aria-hidden />
                  <p className="mt-4 font-medium">{b.title}</p>
                  <p className="mt-1.5 text-sm leading-relaxed text-white/60">{b.body}</p>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* ── Final CTA ────────────────────────────────────────────────────── */}
      <section className="py-24">
        <Container className="text-center">
          <h2 className="mx-auto max-w-2xl text-3xl font-semibold tracking-tight text-navy sm:text-4xl">
            No one should navigate important decisions alone.
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-ink-muted">
            Join the OpenDoor pilot at The Village School and start your first conversation this week.
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <ButtonLink href="/signup" size="lg">Create your free account</ButtonLink>
            <ButtonLink href="/mentors" size="lg" variant="secondary">Browse mentors</ButtonLink>
          </div>
        </Container>
      </section>
    </>
  );
}

function SectionIntro({ eyebrow, title, body, align = "center" }: { eyebrow: string; title: string; body?: string; align?: "center" | "left" }) {
  return (
    <div className={align === "center" ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <p className="text-sm font-medium text-teal-600">{eyebrow}</p>
      <h2 className="mt-3 text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{title}</h2>
      {body && <p className="mt-4 leading-relaxed text-ink-muted">{body}</p>}
    </div>
  );
}

/** Decorative product preview — a mentor card plus status toasts. Purely illustrative. */
function HeroVisual() {
  return (
    <div className="relative mx-auto w-full max-w-md animate-fade-up [animation-delay:150ms] lg:max-w-none" aria-hidden>
      <div className="absolute -left-6 top-[44%] z-10 hidden rotate-[-4deg] items-center gap-2 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift sm:flex">
        <CheckCircle2 className="h-5 w-5 text-teal" />
        <div>
          <p className="text-sm font-medium text-navy">Request accepted</p>
          <p className="text-xs text-ink-faint">Thu · 4:00 PM · Library</p>
        </div>
      </div>

      <div className="relative ml-auto rounded-3xl border border-line bg-white p-6 shadow-lift sm:w-[84%]">
        <div className="flex items-start gap-4">
          <Avatar name="Alex Kim" seed="m_alex" size="lg" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <p className="text-lg font-semibold text-navy">Alex Kim</p>
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-700">
                <span className="h-2 w-2 rounded-full bg-emerald-500" /> Available
              </span>
            </div>
            <p className="text-sm text-ink-muted">Grade 12 · SAT Preparation</p>
          </div>
        </div>
        <div className="mt-5 rounded-2xl bg-paper p-4">
          <p className="text-xs font-medium uppercase tracking-wider text-ink-faint">Key achievement</p>
          <p className="mt-1 font-medium text-navy">SAT 1570 · National Merit Semifinalist</p>
        </div>
        <p className="mt-4 text-sm leading-relaxed text-ink-muted">
          &ldquo;I went from a 1380 to a 1570 in five months. I&apos;ll help you build a study plan that actually sticks.&rdquo;
        </p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {["SAT strategies", "Study planning", "Test day"].map((t) => (
            <span key={t} className="rounded-full bg-sky px-2.5 py-1 text-xs text-navy">{t}</span>
          ))}
        </div>
        <div className="mt-6 flex items-center justify-between border-t border-line pt-4">
          <span className="inline-flex items-center gap-1 text-sm text-ink-muted">
            <Star className="h-4 w-4 fill-amber-400 text-amber-400" /> Demo profile
          </span>
          <span className="rounded-full bg-navy px-4 py-2 text-sm font-medium text-white">Request Mentoring</span>
        </div>
      </div>

      <div className="absolute -bottom-6 right-4 hidden rotate-[3deg] items-center gap-3 rounded-2xl border border-line bg-white px-4 py-3 shadow-lift sm:flex">
        <div className="flex -space-x-2">
          <Avatar name="Sophia Lee" seed="m_sophia" size="sm" className="ring-2 ring-white" />
          <Avatar name="Emma Chen" seed="m_emma" size="sm" className="ring-2 ring-white" />
          <Avatar name="Marcus Johnson" seed="m_marcus" size="sm" className="ring-2 ring-white" />
        </div>
        <p className="text-xs text-ink-muted">
          <span className="font-semibold text-navy">11 mentors</span> in the demo
        </p>
      </div>
    </div>
  );
}
