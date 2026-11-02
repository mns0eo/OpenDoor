export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}${Date.now().toString(36).slice(-4)}`;
}

/**
 * DEMO-MODE ONLY password hash (FNV-1a). This is NOT secure and exists only so the
 * local demo doesn't keep plain-text passwords in localStorage. In production,
 * authentication is handled by Supabase Auth and the app never stores passwords.
 */
export function demoHash(input: string) {
  let h = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return "fnv1a_" + (h >>> 0).toString(16);
}

export function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
}

const AVATAR_TONES = [
  "from-navy to-navy-600 text-white",
  "from-teal to-teal-600 text-white",
  "from-sky-200 to-sky text-navy",
  "from-[#c9d6ea] to-[#e9eef7] text-navy",
  "from-[#2f4a6e] to-[#4A9D9A] text-white",
  "from-[#dfeceb] to-[#bfdcda] text-navy",
];
export function avatarTone(seed: string) {
  let n = 0;
  for (let i = 0; i < seed.length; i++) n = (n + seed.charCodeAt(i)) % 997;
  return AVATAR_TONES[n % AVATAR_TONES.length]!;
}

export function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

export function formatHours(minutes: number) {
  if (minutes > 0 && minutes < 60) return `${minutes} min`;
  const h = minutes / 60;
  return `${Number.isInteger(h) ? h : h.toFixed(1)} hr${h === 1 ? "" : "s"}`;
}

export function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.trim());
}

/** One entry per line (used by "one per line" form fields). */
export function lines(text: string) {
  return text
    .split("\n")
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
}

/**
 * Turns free text from an application ("a; b; c", one per line, or "a, b, c") into a list.
 * Commas only split when there is no other separator, and only ", " (so "$2,400" stays intact).
 */
export function toList(text: string) {
  const parts = text
    .split(/\n|;/)
    .map((s) => s.trim().replace(/^[-•*]\s*/, ""))
    .filter(Boolean);
  if (parts.length === 1) return parts[0]!.split(/,\s+/).map((s) => s.trim()).filter(Boolean);
  return parts;
}
