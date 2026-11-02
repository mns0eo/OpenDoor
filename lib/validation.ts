// Pure validation helpers shared by forms (field-level errors) and the store (final check).
import type { CategoryId, Helpful, MeetingFormat } from "./types";
import { isValidEmail } from "./utils";

export type FieldErrors = Record<string, string>;

export interface SignupInput {
  name: string;
  email: string;
  password: string;
  grade: string;
  initialRole: "mentee" | "mentor";
  agree: boolean;
}

export function validateSignup(i: SignupInput): FieldErrors {
  const e: FieldErrors = {};
  if (i.name.trim().length < 2) e.name = "Please enter your full name.";
  if (!isValidEmail(i.email)) e.email = "Please enter a valid email address.";
  if (i.password.length < 8) e.password = "Password must be at least 8 characters.";
  if (!i.grade) e.grade = "Please select your grade.";
  if (!i.agree) e.agree = "Please confirm you are part of the TVS community.";
  return e;
}

export interface RequestInput {
  mentorId: string;
  category: CategoryId | "";
  helpWith: string;
  format: MeetingFormat | "";
  date: string; // yyyy-mm-dd
  time: string; // HH:mm
  notes: string;
}

/** Combines local date + time inputs into a Date (or null if incomplete/invalid). */
export function combineDateTime(date: string, time: string): Date | null {
  if (!date || !time) return null;
  const d = new Date(`${date}T${time}`);
  return Number.isNaN(d.getTime()) ? null : d;
}

export function validateRequest(i: RequestInput, now = new Date()): FieldErrors {
  const e: FieldErrors = {};
  if (!i.category) e.category = "Choose a mentoring category.";
  if (i.helpWith.trim().length < 15) e.helpWith = "Tell your mentor a bit more (at least 15 characters).";
  if (i.helpWith.length > 1000) e.helpWith = "Please keep this under 1,000 characters.";
  if (!i.format) e.format = "Choose online or in person.";
  if (!i.date) e.date = "Choose a preferred date.";
  if (!i.time) e.time = "Choose a preferred time.";
  const when = combineDateTime(i.date, i.time);
  if (i.date && i.time) {
    if (!when) e.date = "That date doesn't look right.";
    else if (when.getTime() <= now.getTime()) e.date = "Please pick a date and time in the future.";
  }
  if (i.notes.length > 500) e.notes = "Please keep notes under 500 characters.";
  return e;
}

export interface ApplicationInput {
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
}

export function validateApplication(i: ApplicationInput): FieldErrors {
  const e: FieldErrors = {};
  if (i.name.trim().length < 2) e.name = "Please enter your name.";
  if (!i.grade) e.grade = "Please select your grade.";
  if (i.categories.length === 0) e.categories = "Pick at least one mentoring area.";
  if (i.expertise.trim().length < 3) e.expertise = "Describe your main area of expertise.";
  if (i.achievements.trim().length < 10) e.achievements = "List at least one relevant achievement.";
  if (i.experience.trim().length < 10) e.experience = "Share some relevant experience (at least 10 characters).";
  if (i.motivation.trim().length < 20) e.motivation = "Tell us why you want to mentor (at least 20 characters).";
  if (i.topics.trim().length < 3) e.topics = "List topics you can help with.";
  if (i.availability.trim().length < 3) e.availability = "Let mentees know when you're generally free.";
  if (i.formats.length === 0) e.formats = "Choose at least one meeting format.";
  return e;
}

export interface FeedbackInput {
  rating: number;
  helpful: Helpful | "";
  learned: string;
  improve: string;
  review: string;
  consentToShare: boolean;
}

export function validateFeedback(i: FeedbackInput): FieldErrors {
  const e: FieldErrors = {};
  if (!(i.rating >= 1 && i.rating <= 5)) e.rating = "Please choose a rating from 1 to 5 stars.";
  if (!i.helpful) e.helpful = "Let us know if the session was helpful.";
  if (i.learned.trim().length < 5) e.learned = "Share at least one thing you learned.";
  if (i.review.length > 1000) e.review = "Please keep your review under 1,000 characters.";
  return e;
}

export function validateDuration(minutes: number): string | null {
  if (!Number.isFinite(minutes) || !Number.isInteger(minutes)) return "Enter a whole number of minutes.";
  if (minutes < 5) return "Sessions must be at least 5 minutes.";
  if (minutes > 480) return "Sessions can't be longer than 8 hours (480 minutes).";
  return null;
}

export function firstError(e: FieldErrors): string | null {
  const k = Object.keys(e)[0];
  return k ? e[k]! : null;
}
