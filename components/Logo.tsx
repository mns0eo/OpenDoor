import Link from "next/link";
import { cn } from "@/lib/utils";

/** OpenDoor mark: a doorway with the door swung open and light spilling through. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 32 32" className={cn("h-8 w-8", className)} aria-hidden>
      <rect width="32" height="32" rx="9" fill="#14213D" />
      <path d="M10 25V8.5A1.5 1.5 0 0 1 11.5 7h9A1.5 1.5 0 0 1 22 8.5V25" stroke="#E8F0FE" strokeWidth="1.8" fill="none" strokeLinecap="round" />
      <path d="M11.2 25 17.5 22.6V9.6L11.2 8.2Z" fill="#4A9D9A" />
      <circle cx="15.6" cy="16.6" r="0.95" fill="#E8F0FE" />
      <path d="M8 25h16" stroke="#E8F0FE" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export function Logo({ className, light }: { className?: string; light?: boolean }) {
  return (
    <Link href="/" className={cn("group inline-flex items-center gap-2.5", className)} aria-label="OpenDoor home">
      <LogoMark className="transition-transform duration-300 group-hover:-rotate-3" />
      <span className={cn("text-[19px] font-semibold tracking-tight", light ? "text-white" : "text-navy")}>
        Open<span className="text-teal">Door</span>
      </span>
    </Link>
  );
}
