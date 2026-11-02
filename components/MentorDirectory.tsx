"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { Search, SearchX, X } from "lucide-react";
import { CATEGORIES } from "@/lib/categories";
import { useStore } from "@/lib/store";
import type { CategoryId, MentorProfile } from "@/lib/types";
import { CategoryIcon } from "./CategoryIcon";
import { MentorCard } from "./MentorCard";
import { Button, Chip, EmptyState, Skeleton } from "./ui";

function matches(m: MentorProfile, q: string) {
  if (!q) return true;
  const hay = [m.name, m.headline, m.intro, m.bio, ...m.otherAreas, ...m.achievements, ...m.topics, ...m.skills, ...m.experience]
    .join(" ")
    .toLowerCase();
  return q
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean)
    .every((w) => hay.includes(w));
}

const AVAIL_RANK = { available: 0, limited: 1, unavailable: 2 } as const;

export function MentorDirectory() {
  const { db } = useStore();
  const params = useSearchParams();
  const router = useRouter();
  const initialCat = params.get("category") as CategoryId | null;
  const [query, setQuery] = useState(params.get("q") ?? "");
  const [category, setCategory] = useState<CategoryId | null>(
    initialCat && CATEGORIES.some((c) => c.id === initialCat) ? initialCat : null,
  );
  const [availableOnly, setAvailableOnly] = useState(false);

  const setCat = (c: CategoryId | null) => {
    setCategory(c);
    const sp = new URLSearchParams(params.toString());
    if (c) sp.set("category", c);
    else sp.delete("category");
    router.replace(`/mentors${sp.toString() ? `?${sp}` : ""}`, { scroll: false });
  };

  const results = useMemo(() => {
    if (!db) return [];
    return db.mentors
      .filter((m) => m.listed)
      .filter((m) => !category || m.categories.includes(category))
      .filter((m) => !availableOnly || m.availability !== "unavailable")
      .filter((m) => matches(m, query.trim()))
      .sort((a, b) => AVAIL_RANK[a.availability] - AVAIL_RANK[b.availability] || a.name.localeCompare(b.name));
  }, [db, category, availableOnly, query]);

  const hasFilters = Boolean(query || category || availableOnly);
  const clear = () => {
    setQuery("");
    setAvailableOnly(false);
    setCat(null);
  };

  return (
    <div className="animate-fade-up">
      {/* Controls */}
      <div className="sticky top-16 z-20 -mx-5 border-b border-line/70 bg-paper/90 px-5 pb-4 pt-2 backdrop-blur-md sm:-mx-8 sm:px-8">
        <div className="flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <span className="sr-only">Search mentors</span>
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-faint" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, skill, or achievement — e.g. “SAT”, “violin”, “pitch”"
              className="h-12 w-full rounded-full border border-line bg-white pl-11 pr-4 text-[15px] shadow-sm placeholder:text-ink-faint focus:border-teal focus:outline-none focus:ring-2 focus:ring-teal/40"
            />
          </label>
          <label className="inline-flex h-12 cursor-pointer select-none items-center gap-2.5 rounded-full border border-line bg-white px-4 text-sm text-navy shadow-sm">
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => setAvailableOnly(e.target.checked)}
              className="h-4 w-4 rounded accent-teal"
            />
            Accepting requests
          </label>
        </div>
        <div className="mt-3 flex gap-2 overflow-x-auto pb-1 [scrollbar-width:none]" role="group" aria-label="Filter by category">
          <Chip selected={!category} onClick={() => setCat(null)}>All</Chip>
          {CATEGORIES.map((c) => (
            <Chip key={c.id} selected={category === c.id} onClick={() => setCat(category === c.id ? null : c.id)}>
              <CategoryIcon id={c.id} className="h-3.5 w-3.5" />
              {c.label}
            </Chip>
          ))}
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 flex items-center justify-between text-sm text-ink-muted" aria-live="polite">
        <p>
          {db ? (
            <>
              <span className="font-medium text-navy">{results.length}</span> mentor{results.length === 1 ? "" : "s"}
              {category && <> in {CATEGORIES.find((c) => c.id === category)?.label}</>}
            </>
          ) : (
            "Loading…"
          )}
        </p>
        {hasFilters && (
          <button onClick={clear} className="inline-flex items-center gap-1 rounded-full px-2 py-1 hover:text-navy">
            <X className="h-3.5 w-3.5" /> Clear filters
          </button>
        )}
      </div>

      <div className="mt-4">
        {!db ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-80" />)}
          </div>
        ) : results.length === 0 ? (
          <EmptyState
            icon={<SearchX className="h-5 w-5" />}
            title="No mentors match your search"
            description="Try a different keyword or remove a filter. New mentors join as applications are approved."
            action={<Button variant="outline" onClick={clear}>Clear filters</Button>}
          />
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {results.map((m) => <MentorCard key={m.id} mentor={m} />)}
          </div>
        )}
      </div>
    </div>
  );
}
