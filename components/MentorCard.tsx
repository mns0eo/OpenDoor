import Link from "next/link";
import { ArrowRight, Award } from "lucide-react";
import type { MentorProfile } from "@/lib/types";
import { CATEGORY_MAP } from "@/lib/categories";
import { AvailabilityIndicator } from "./Availability";
import { CategoryIcon } from "./CategoryIcon";
import { Avatar, buttonClass, DemoTag } from "./ui";

export function MentorCard({ mentor }: { mentor: MentorProfile }) {
  return (
    <article className="group flex h-full flex-col rounded-2xl border border-line bg-white p-6 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lift">
      <div className="flex items-start gap-4">
        <Avatar name={mentor.name} seed={mentor.id} size="lg" />
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-lg font-semibold text-navy">{mentor.name}</h3>
          <p className="text-sm text-ink-muted">Grade {mentor.grade}</p>
          <AvailabilityIndicator value={mentor.availability} className="mt-1.5" />
        </div>
      </div>

      <p className="mt-5 text-xs font-medium uppercase tracking-wider text-teal-600">{mentor.headline}</p>

      {mentor.achievements.length > 0 && (
        <ul className="mt-2 space-y-1.5">
          {mentor.achievements.slice(0, 2).map((a) => (
            <li key={a} className="flex gap-2 text-sm font-medium text-navy">
              <Award className="mt-0.5 h-4 w-4 shrink-0 text-teal" aria-hidden />
              <span>{a}</span>
            </li>
          ))}
        </ul>
      )}

      <p className="mt-3 line-clamp-3 flex-1 text-sm leading-relaxed text-ink-muted">{mentor.intro}</p>

      <div className="mt-4 flex flex-wrap gap-1.5">
        {mentor.categories.map((c) => (
          <span key={c} className="inline-flex items-center gap-1 rounded-full bg-sky px-2.5 py-1 text-xs text-navy">
            <CategoryIcon id={c} className="h-3 w-3" />
            {CATEGORY_MAP[c].short}
          </span>
        ))}
        {mentor.otherAreas.map((a) => (
          <span key={a} className="inline-flex items-center rounded-full bg-sky px-2.5 py-1 text-xs text-navy">{a}</span>
        ))}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3 border-t border-line pt-4">
        {mentor.isDemo ? <DemoTag /> : <span />}
        <Link
          href={`/mentors/${mentor.id}`}
          className={buttonClass("primary", "sm")}
          aria-label={`View profile of ${mentor.name}`}
        >
          View Profile <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </div>
    </article>
  );
}
