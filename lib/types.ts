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
  /** Custom mentoring areas typed under "Other". */
  otherAreas: string[];
  /** Intro video id (demo: stored in this browser's IndexedDB; production: Supabase Storage). */
  introVideoId: string | null;
  /** Bookable 1-hour slots the mentor opened on their calendar (ISO start times). */
  slots: string[];
  /** Only listed (approved) profiles appear in the public directory. */
  listed: boolean;
  isDemo: boolean;
  createdAt: string;
  // Future: resumeUrl, hourlyRate (paid sessions).
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
  /** Mentee consents to the written review + rating being shown on the mentor's public profile. */
  consentToShare: boolean;
  /** Mentor's public reply to the review. */
  mentorReply: string;
  mentorReplyAt: string | null;
  createdAt: string;
}

export interface Achievement {
  text: string;
  /** Grade in which it was achieved: "9"–"12" or "Before 9". */
  grade: string;
}

export interface Message {
  id: string;
  requestId: string;
  senderId: string;
  body: string;
  createdAt: string;
}

export type HoursStatus = "pending" | "approved" | "rejected";

/** A batch of completed sessions a mentor sends to the school for volunteer-hour verification. */
export interface HoursSubmission {
  id: string;
  mentorUserId: string;
  requestIds: string[];
  totalMinutes: number;
  note: string;
  status: HoursStatus;
  reviewerNote: string;
  createdAt: string;
  reviewedAt: string | null;
}

export type ApplicationStatus = "pending" | "approved" | "rejected";

export interface MentorApplication {
  id: string;
  userId: string;
  name: string;
  grade: string;
  categories: CategoryId[];
  /** Free-text area typed under "Other". */
  otherArea: string;
  expertise: string;
  achievements: Achievement[];
  experience: string;
  motivation: string;
  topics: string;
  availability: string;
  formats: MeetingFormat[];
  introVideoId: string | null;
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
  messages: Message[];
  hoursSubmissions: HoursSubmission[];
  /** Currently logged-in user (demo-mode session). */
  sessionUserId: string | null;
}

export type Result<T = undefined> = { ok: true; data: T } | { ok: false; error: string };
