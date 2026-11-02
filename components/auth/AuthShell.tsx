import { CheckCircle2 } from "lucide-react";
import { LogoMark } from "../Logo";

export function AuthShell({ title, subtitle, children }: { title: string; subtitle: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="mx-auto grid max-w-6xl gap-10 px-5 py-12 sm:px-8 lg:grid-cols-2 lg:py-20">
      <div className="relative hidden overflow-hidden rounded-3xl bg-navy p-10 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-teal/30 blur-3xl" />
        <LogoMark className="relative h-12 w-12" />
        <div className="relative">
          <p className="text-3xl font-semibold leading-tight tracking-tight">No one navigates important decisions alone.</p>
          <ul className="mt-8 space-y-3 text-white/75">
            {["Peer mentors reviewed by an administrator", "Free for The Village School students", "Online or in-person sessions on campus"].map((t) => (
              <li key={t} className="flex items-center gap-3 text-sm">
                <CheckCircle2 className="h-4 w-4 text-teal" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-xs text-white/50">Demo mode — accounts are stored only in this browser.</p>
      </div>
      <div className="mx-auto w-full max-w-md animate-fade-up self-center">
        <h1 className="text-3xl font-semibold tracking-tight text-navy">{title}</h1>
        <div className="mt-2 text-ink-muted">{subtitle}</div>
        <div className="mt-8">{children}</div>
      </div>
    </div>
  );
}
