import Link from "next/link";
import { Logo } from "./Logo";
import { Container } from "./ui";

const COLS = [
  {
    title: "Platform",
    links: [
      { href: "/mentors", label: "Find a Mentor" },
      { href: "/become-a-mentor", label: "Become a Mentor" },
      { href: "/#how-it-works", label: "How it works" },
      { href: "/#categories", label: "Categories" },
    ],
  },
  {
    title: "Account",
    links: [
      { href: "/login", label: "Log in" },
      { href: "/signup", label: "Create account" },
      { href: "/dashboard", label: "Dashboard" },
    ],
  },
  {
    title: "Community",
    links: [
      { href: "/guidelines", label: "Community guidelines" },
      { href: "/guidelines#privacy", label: "Privacy" },
      { href: "/guidelines#safety", label: "Safety" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="mt-24 bg-navy text-white/80">
      <Container className="grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo light />
          <p className="mt-4 text-sm leading-relaxed text-white/60">
            Make knowledge, experience, and guidance accessible to everyone. No one navigates important decisions alone.
          </p>
          <p className="mt-4 inline-flex rounded-full border border-white/15 px-3 py-1 text-xs text-white/70">
            Now piloting at The Village School · Houston, TX
          </p>
        </div>
        {COLS.map((c) => (
          <div key={c.title}>
            <p className="text-sm font-semibold text-white">{c.title}</p>
            <ul className="mt-4 space-y-2.5">
              {c.links.map((l) => (
                <li key={l.href}>
                  <Link href={l.href} className="text-sm text-white/60 transition-colors hover:text-white">
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Container>
      <div className="border-t border-white/10">
        <Container className="flex flex-col gap-2 py-6 text-xs text-white/50 sm:flex-row sm:justify-between">
          <p>© {new Date().getFullYear()} OpenDoor. MVP demo — all profiles and data shown are fictional.</p>
          <p>Mentoring hours count as volunteer hours only after school approval.</p>
        </Container>
      </div>
    </footer>
  );
}
