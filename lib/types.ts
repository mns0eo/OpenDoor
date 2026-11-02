// OpenDoor domain model.
// These types are the contract between the UI and the data layer (lib/store.tsx).
// A future Supabase backend should map 1:1 onto these tables (see supabase/schema.sql).

export type CategoryId =
  | "academics"
  | "sat-college"
  | "entrepreneurship"
  | "leadership"
  | "sports"
  | "music"
  | "competitions"
  | "personal";

/** Where a user is in the mentor-approval pipeline. Only "approved" may act as a mentor. */
export type MentorStatus = "none" | "pending" | "approved" | "rejected";

/** Which dashboard a user is currently viewing. "mentor" requires mentorStatus === "approved". */
export type ActiveRole = "mentee" | "mentor";

export interface User {
  id: string;
  name: string;
  email: string;
  /** Demo mode only — NOT secure. Production uses Supabase Auth (no passwords stored by the app). */
  passwordHash: string;
  grade: string; // "9" | "10" | "11" | "12" | "Staff" | "Alumni"
  bio: string;
  interests: string;
  isAdmin: boolean;
  mentorStatus: MentorStatus;
  activeRole: ActiveRole;
  /** Fictional demo record (seed data). */
  isDemo: boolean;
  createdAt: string;
}

export type Availability = "available" | "limited" | "unavailable";
export type MeetingFormat = "online" | "in-person";

export interface MentorProfile {
  id: string;
  userId: string;
  name: string;
  grade: string;
  /** Primary area of expertise, e.g. "SAT Preparation". */
  headline: string;
  categories: CategoryId[];
  achievements: string[];
  /** One-to-two sentence card intro. */
  intro: string;
  bio: string;
  experience: string[];
  skills: string[];
  topics: string[];
  formats: MeetingFormat[];
  availability: Availability;
  availabilityNote: string;
  /** Only listed (approved) profiles appear in the public directory. */
  listed: boolean;
  isDemo: boolean;
  createdAt: string;
  // Future: introVideoUrl, resumeUrl, hourlyRate (paid sessions), verified badge.
}

export type RequestStatus = "pending" | "accepted" | "declined" | "completed" | "canceled";

export interface MentoringRequest {
  id: string;
  mentorId: string; // MentorProfile.id
  mentorUserId: string;
  menteeId: string; // User.id
  menteeName: string;
  category: CategoryId;
  helpWith: string;
  format: MeetingFormat;
  /** ISO datetime of the preferred session start. */
  preferredAt: string;
  notes: string;
  status: RequestStatus;
  mentorNote: string;
  /** Entered by the mentor when marking completed — "platform-recorded", not officially verified. */
  durationMinutes: number | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export type Helpful = "yes" | "somewhat" | "no";

export interface Feedback {
  id: string;
  requestId: string;
  mentorId: string;
  menteeId: string;
  rating: number; // 1–5
  helpful: Helpful;
  learned: string;
  improve: string;
  review: string;
  /** Mentee consents to the review being shown publicly in the future. Not displayed publicly in the MVP. */
  consentToShare: boolean;
  createdAt: string;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface MentorApplication {
  id: string;
  userId: string;
  name: string;
  grade: string;
  categories: CategoryId[];
  expertise: string;
  achievements: string;
  experience: string;
  motivation: string;
  topics: string;
  availability: string;
  formats: MeetingFormat[];
  status: ApplicationStatus;
  reviewNote: string;
  createdAt: string;
  reviewedAt: string | null;
}

export interface Database {
  version: number;
  users: User[];
  mentors: MentorProfile[];
  requests: MentoringRequest[];
  feedback: Feedback[];
  applications: MentorApplication[];
  /** Currently logged-in user (demo-mode session). */
  sessionUserId: string | null;
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
