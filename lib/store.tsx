"use client";

// ─────────────────────────────────────────────────────────────────────────────
// OpenDoor data layer — DEMO MODE (browser localStorage).
//
// Every read/write in the app goes through the `actions` below. To move to a
// real backend (Supabase), re-implement these functions with Supabase calls and
// keep the same signatures — the UI does not need to change. Authorization
// checks here mirror the Row Level Security policies in supabase/schema.sql.
// ─────────────────────────────────────────────────────────────────────────────

import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { buildSeed, DB_VERSION } from "./seed";
import type {
  ActiveRole,
  Database,
  Feedback,
  MentorApplication,
  MentorProfile,
  MentoringRequest,
  Result,
  User,
} from "./types";
import { demoHash, toList, uid } from "./utils";
import {
  combineDateTime,
  firstError,
  validateApplication,
  validateDuration,
  validateFeedback,
  validateRequest,
  validateSignup,
  type ApplicationInput,
  type FeedbackInput,
  type RequestInput,
  type SignupInput,
} from "./validation";

const STORAGE_KEY = "opendoor:db";

const ok = <T,>(data: T): Result<T> => ({ ok: true, data });
const fail = <T = never,>(error: string): Result<T> => ({ ok: false, error });

function load(): Database {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Database;
      if (parsed.version === DB_VERSION && Array.isArray(parsed.users)) return parsed;
    }
  } catch {
    /* corrupted or blocked storage → fall back to seed */
  }
  return buildSeed();
}

function save(db: Database) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch {
    /* storage full / private mode — app keeps working in memory */
  }
}

function useStoreImpl() {
  const [db, setDb] = useState<Database | null>(null);
  const ref = useRef<Database | null>(null);

  useEffect(() => {
    const initial = load();
    ref.current = initial;
    setDb(initial);
    save(initial);
    // Keep multiple tabs in sync (handy when demoing mentor + mentee side by side).
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY && e.newValue) {
        try {
          const next = JSON.parse(e.newValue) as Database;
          ref.current = next;
          setDb(next);
        } catch {
          /* ignore */
        }
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const commit = useCallback((next: Database) => {
    ref.current = next;
    setDb(next);
    save(next);
  }, []);

  const current = useCallback(() => {
    if (!ref.current) throw new Error("Store not ready");
    return ref.current;
  }, []);

  const me = useCallback((): User | null => {
    const d = ref.current;
    if (!d?.sessionUserId) return null;
    return d.users.find((u) => u.id === d.sessionUserId) ?? null;
  }, []);

  const now = () => new Date().toISOString();

  const actions = useMemo(
    () => ({
      // ── Auth ────────────────────────────────────────────────────────────────
      login(email: string, password: string): Result<User> {
        const d = current();
        const user = d.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
        if (!user || user.passwordHash !== demoHash(password)) return fail("Incorrect email or password.");
        commit({ ...d, sessionUserId: user.id });
        return ok(user);
      },

      signup(input: SignupInput): Result<User> {
        const err = firstError(validateSignup(input));
        if (err) return fail(err);
        const d = current();
        if (d.users.some((u) => u.email.toLowerCase() === input.email.trim().toLowerCase()))
          return fail("An account with this email already exists. Try logging in.");
        const user: User = {
          id: uid("u"),
          name: input.name.trim(),
          email: input.email.trim().toLowerCase(),
          passwordHash: demoHash(input.password),
          grade: input.grade,
          bio: "",
          interests: "",
          isAdmin: false,
          mentorStatus: "none",
          // Everyone starts as a mentee; mentors must be approved first.
          activeRole: "mentee",
          isDemo: false,
          createdAt: now(),
        };
        commit({ ...d, users: [...d.users, user], sessionUserId: user.id });
        return ok(user);
      },

      logout() {
        commit({ ...current(), sessionUserId: null });
      },

      /** Demo-only: instantly sign in as any user (powers the "Switch demo user" button). */
      switchDemoUser(userId: string | null) {
        commit({ ...current(), sessionUserId: userId });
      },

      setActiveRole(role: ActiveRole): Result<null> {
        const d = current();
        const u = me();
        if (!u) return fail("Please log in.");
        if (role === "mentor" && u.mentorStatus !== "approved")
          return fail("You can switch to mentor mode once your mentor application is approved.");
        commit({ ...d, users: d.users.map((x) => (x.id === u.id ? { ...x, activeRole: role } : x)) });
        return ok(null);
      },

      updateProfile(patch: Pick<User, "name" | "grade" | "bio" | "interests">): Result<null> {
        const d = current();
        const u = me();
        if (!u) return fail("Please log in.");
        if (patch.name.trim().length < 2) return fail("Please enter your full name.");
        if (patch.bio.length > 600) return fail("Bio must be under 600 characters.");
        const name = patch.name.trim();
        commit({
          ...d,
          users: d.users.map((x) => (x.id === u.id ? { ...x, ...patch, name } : x)),
          // keep denormalized names in sync
          mentors: d.mentors.map((m) => (m.userId === u.id ? { ...m, name, grade: patch.grade } : m)),
          requests: d.requests.map((r) => (r.menteeId === u.id ? { ...r, menteeName: name } : r)),
        });
        return ok(null);
      },

      updateMentorProfile(
        patch: Pick<MentorProfile, "headline" | "intro" | "bio" | "achievements" | "experience" | "skills" | "topics" | "categories" | "formats" | "availability" | "availabilityNote">,
      ): Result<null> {
        const d = current();
        const u = me();
        if (!u || u.mentorStatus !== "approved") return fail("Only approved mentors can edit a mentor profile.");
        if (patch.headline.trim().length < 3) return fail("Add your main area of expertise.");
        if (patch.intro.trim().length < 10) return fail("Add a short introduction (10+ characters).");
        if (patch.categories.length === 0) return fail("Pick at least one category.");
        if (patch.formats.length === 0) return fail("Pick at least one meeting format.");
        commit({ ...d, mentors: d.mentors.map((m) => (m.userId === u.id ? { ...m, ...patch } : m)) });
        return ok(null);
      },

      // ── Mentoring requests ─────────────────────────────────────────────────
      createRequest(input: RequestInput): Result<MentoringRequest> {
        const d = current();
        const u = me();
        if (!u) return fail("Please log in to request mentoring.");
        const mentor = d.mentors.find((m) => m.id === input.mentorId && m.listed);
        if (!mentor) return fail("This mentor isn't available.");
        if (mentor.userId === u.id) return fail("You can't request a session with yourself.");
        if (mentor.availability === "unavailable") return fail("This mentor isn't accepting requests right now.");
        const err = firstError(validateRequest(input));
        if (err) return fail(err);
        const when = combineDateTime(input.date, input.time)!;
        const r: MentoringRequest = {
          id: uid("r"),
          mentorId: mentor.id,
          mentorUserId: mentor.userId,
          menteeId: u.id,
          menteeName: u.name,
          category: input.category as MentoringRequest["category"],
          helpWith: input.helpWith.trim(),
          format: input.format as MentoringRequest["format"],
          preferredAt: when.toISOString(),
          notes: input.notes.trim(),
          status: "pending",
          mentorNote: "",
          durationMinutes: null,
          completedAt: null,
          createdAt: now(),
          updatedAt: now(),
        };
        commit({ ...d, requests: [r, ...d.requests] });
        return ok(r);
      },

      respondToRequest(id: string, decision: "accepted" | "declined", note = ""): Result<null> {
        const d = current();
        const u = me();
        const r = d.requests.find((x) => x.id === id);
        if (!u || !r || r.mentorUserId !== u.id) return fail("You can only respond to your own requests.");
        if (u.mentorStatus !== "approved") return fail("Only approved mentors can respond.");
        if (r.status !== "pending") return fail("This request has already been answered.");
        commit({
          ...d,
          requests: d.requests.map((x) =>
            x.id === id ? { ...x, status: decision, mentorNote: note.trim(), updatedAt: now() } : x,
          ),
        });
        return ok(null);
      },

      completeRequest(id: string, durationMinutes: number): Result<null> {
        const d = current();
        const u = me();
        const r = d.requests.find((x) => x.id === id);
        if (!u || !r || r.mentorUserId !== u.id) return fail("Only the mentor can mark this session completed.");
        if (r.status !== "accepted") return fail("Only accepted sessions can be marked completed.");
        const err = validateDuration(durationMinutes);
        if (err) return fail(err);
        commit({
          ...d,
          requests: d.requests.map((x) =>
            x.id === id ? { ...x, status: "completed", durationMinutes, completedAt: now(), updatedAt: now() } : x,
          ),
        });
        return ok(null);
      },

      cancelRequest(id: string): Result<null> {
        const d = current();
        const u = me();
        const r = d.requests.find((x) => x.id === id);
        if (!u || !r) return fail("Request not found.");
        const isParty = r.menteeId === u.id || r.mentorUserId === u.id;
        if (!isParty) return fail("You can only cancel your own sessions.");
        if (r.status !== "pending" && r.status !== "accepted") return fail("This request can no longer be canceled.");
        commit({
          ...d,
          requests: d.requests.map((x) => (x.id === id ? { ...x, status: "canceled", updatedAt: now() } : x)),
        });
        return ok(null);
      },

      // ── Feedback ───────────────────────────────────────────────────────────
      submitFeedback(requestId: string, input: FeedbackInput): Result<Feedback> {
        const d = current();
        const u = me();
        const r = d.requests.find((x) => x.id === requestId);
        if (!u || !r || r.menteeId !== u.id) return fail("Only the mentee of this session can leave feedback.");
        if (r.status !== "completed") return fail("Feedback opens after the mentor marks the session completed.");
        if (d.feedback.some((f) => f.requestId === requestId)) return fail("You've already submitted feedback for this session.");
        const err = firstError(validateFeedback(input));
        if (err) return fail(err);
        const f: Feedback = {
          id: uid("f"),
          requestId,
          mentorId: r.mentorId,
          menteeId: u.id,
          rating: input.rating,
          helpful: input.helpful as Feedback["helpful"],
          learned: input.learned.trim(),
          improve: input.improve.trim(),
          review: input.review.trim(),
          consentToShare: input.consentToShare,
          createdAt: now(),
        };
        commit({ ...d, feedback: [f, ...d.feedback] });
        return ok(f);
      },

      // ── Mentor applications ────────────────────────────────────────────────
      submitApplication(input: ApplicationInput): Result<MentorApplication> {
        const d = current();
        const u = me();
        if (!u) return fail("Please log in to apply.");
        if (u.mentorStatus === "approved") return fail("You're already an approved mentor.");
        if (d.applications.some((a) => a.userId === u.id && a.status === "pending"))
          return fail("You already have an application under review.");
        const err = firstError(validateApplication(input));
        if (err) return fail(err);
        const a: MentorApplication = {
          id: uid("a"),
          userId: u.id,
          name: input.name.trim(),
          grade: input.grade,
          categories: input.categories,
          expertise: input.expertise.trim(),
          achievements: input.achievements.trim(),
          experience: input.experience.trim(),
          motivation: input.motivation.trim(),
          topics: input.topics.trim(),
          availability: input.availability.trim(),
          formats: input.formats,
          status: "pending",
          reviewNote: "",
          createdAt: now(),
          reviewedAt: null,
        };
        commit({
          ...d,
          applications: [a, ...d.applications],
          users: d.users.map((x) => (x.id === u.id ? { ...x, mentorStatus: "pending" } : x)),
        });
        return ok(a);
      },

      // ── Admin ──────────────────────────────────────────────────────────────
      reviewApplication(id: string, decision: "approved" | "rejected", note = ""): Result<null> {
        const d = current();
        const u = me();
        if (!u?.isAdmin) return fail("Administrator access required.");
        const a = d.applications.find((x) => x.id === id);
        if (!a) return fail("Application not found.");
        if (a.status !== "pending") return fail("This application has already been reviewed.");
        const applicant = d.users.find((x) => x.id === a.userId);
        let mentors = d.mentors;
        if (decision === "approved") {
          const existing = d.mentors.find((m) => m.userId === a.userId);
          const profile: MentorProfile = {
            id: existing?.id ?? uid("m"),
            userId: a.userId,
            name: applicant?.name ?? a.name,
            grade: a.grade,
            headline: a.expertise,
            categories: a.categories,
            achievements: toList(a.achievements),
            intro: a.motivation.length > 160 ? a.motivation.slice(0, 157) + "…" : a.motivation,
            bio: a.motivation,
            experience: toList(a.experience),
            skills: [],
            topics: toList(a.topics),
            formats: a.formats,
            availability: "available",
            availabilityNote: a.availability,
            listed: true,
            isDemo: applicant?.isDemo ?? false,
            createdAt: existing?.createdAt ?? now(),
          };
          mentors = existing ? d.mentors.map((m) => (m.id === existing.id ? profile : m)) : [...d.mentors, profile];
        }
        commit({
          ...d,
          mentors,
          applications: d.applications.map((x) =>
            x.id === id ? { ...x, status: decision, reviewNote: note.trim(), reviewedAt: now() } : x,
          ),
          users: d.users.map((x) => (x.id === a.userId ? { ...x, mentorStatus: decision } : x)),
        });
        return ok(null);
      },

      setMentorListed(mentorId: string, listed: boolean): Result<null> {
        const d = current();
        if (!me()?.isAdmin) return fail("Administrator access required.");
        commit({ ...d, mentors: d.mentors.map((m) => (m.id === mentorId ? { ...m, listed } : m)) });
        return ok(null);
      },

      /** Restore the original fictional demo data (keeps you logged in as the same demo user if possible). */
      resetDemo() {
        const fresh = buildSeed();
        const keep = ref.current?.sessionUserId;
        commit({ ...fresh, sessionUserId: fresh.users.some((u) => u.id === keep) ? keep! : null });
      },
    }),
    [commit, current, me],
  );

  const user = db?.sessionUserId ? db.users.find((u) => u.id === db.sessionUserId) ?? null : null;
  return { db, ready: db !== null, user, actions };
}

type Store = ReturnType<typeof useStoreImpl>;
const StoreContext = createContext<Store | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const store = useStoreImpl();
  return <StoreContext.Provider value={store}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const s = useContext(StoreContext);
  if (!s) throw new Error("useStore must be used inside <StoreProvider>");
  return s;
}

/** The current user's mentor profile, if they are an approved mentor. */
export function useMyMentorProfile() {
  const { db, user } = useStore();
  if (!db || !user) return null;
  return db.mentors.find((m) => m.userId === user.id) ?? null;
}
