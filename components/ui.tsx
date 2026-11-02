// OpenDoor design system — small, reusable primitives. Keep styling decisions here.
import Link from "next/link";
import { forwardRef } from "react";
import { AlertCircle, CheckCircle2, Info, Loader2, Star } from "lucide-react";
import type { RequestStatus } from "@/lib/types";
import { avatarTone, cn, initials } from "@/lib/utils";

// ── Layout ────────────────────────────────────────────────────────────────
export function Container({ className, children }: { className?: string; children: React.ReactNode }) {
  return <div className={cn("mx-auto w-full max-w-6xl px-5 sm:px-8", className)}>{children}</div>;
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string;
  title: string;
  description?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-4 pb-8 pt-10 sm:flex-row sm:items-end sm:justify-between sm:pt-14">
      <div className="max-w-2xl animate-fade-up">
        {eyebrow && <p className="mb-2 text-sm font-medium text-teal-600">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight text-navy sm:text-4xl">{title}</h1>
        {description && <p className="mt-3 text-base leading-relaxed text-ink-muted">{description}</p>}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap gap-2">{actions}</div>}
    </div>
  );
}

// ── Buttons ───────────────────────────────────────────────────────────────
type Variant = "primary" | "secondary" | "ghost" | "accent" | "danger" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-navy text-white hover:bg-navy-700 shadow-sm",
  accent: "bg-teal text-white hover:bg-teal-600 shadow-sm",
  secondary: "bg-sky text-navy hover:bg-sky-200",
  outline: "border border-line bg-white text-navy hover:border-navy/30 hover:bg-paper",
  ghost: "text-navy hover:bg-navy/5",
  danger: "border border-red-200 bg-white text-red-700 hover:bg-red-50",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-sm gap-1.5",
  md: "h-11 px-5 text-[15px] gap-2",
  lg: "h-12 px-6 text-base gap-2",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(
    "inline-flex select-none items-center justify-center rounded-full font-medium transition-all duration-200",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-2 focus-visible:ring-offset-paper",
    "disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98]",
    variants[variant],
    sizes[size],
    className,
  );
}

export const Button = forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: Variant; size?: Size; loading?: boolean }
>(function Button({ variant, size, loading, className, children, disabled, type = "button", ...rest }, ref) {
  return (
    <button ref={ref} type={type} disabled={disabled || loading} className={buttonClass(variant, size, className)} {...rest}>
      {loading && <Loader2 className="h-4 w-4 animate-spin" aria-hidden />}
      {children}
    </button>
  );
});

export function ButtonLink({
  href,
  variant,
  size,
  className,
  children,
}: {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={buttonClass(variant, size, className)}>
      {children}
    </Link>
  );
}

// ── Surfaces ──────────────────────────────────────────────────────────────
export function Card({ className, children, as: As = "div" }: { className?: string; children: React.ReactNode; as?: "div" | "section" | "article" | "li" }) {
  return <As className={cn("rounded-2xl border border-line bg-white shadow-card", className)}>{children}</As>;
}

export function Badge({
  children,
  tone = "neutral",
  className,
}: {
  children: React.ReactNode;
  tone?: "neutral" | "teal" | "navy" | "sky" | "amber" | "red" | "green";
  className?: string;
}) {
  const tones = {
    neutral: "bg-paper text-ink-muted border-line",
    teal: "bg-teal-50 text-teal-600 border-teal/20",
    navy: "bg-navy text-white border-navy",
    sky: "bg-sky text-navy border-sky-200",
    amber: "bg-amber-50 text-amber-800 border-amber-200",
    red: "bg-red-50 text-red-700 border-red-200",
    green: "bg-emerald-50 text-emerald-700 border-emerald-200",
  } as const;
  return (
    <span className={cn("inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium", tones[tone], className)}>
      {children}
    </span>
  );
}

export function DemoTag({ className }: { className?: string }) {
  return (
    <Badge tone="amber" className={className}>
      Demo profile · fictional
    </Badge>
  );
}

const STATUS_STYLE: Record<RequestStatus, { label: string; tone: "amber" | "green" | "red" | "navy" | "neutral" }> = {
  pending: { label: "Pending", tone: "amber" },
  accepted: { label: "Accepted", tone: "green" },
  declined: { label: "Declined", tone: "red" },
  completed: { label: "Completed", tone: "navy" },
  canceled: { label: "Canceled", tone: "neutral" },
};
export function StatusBadge({ status }: { status: RequestStatus }) {
  const s = STATUS_STYLE[status];
  return <Badge tone={s.tone}>{s.label}</Badge>;
}

export function Avatar({ name, seed, size = "md", className }: { name: string; seed?: string; size?: "sm" | "md" | "lg" | "xl"; className?: string }) {
  const sz = { sm: "h-9 w-9 text-xs", md: "h-12 w-12 text-sm", lg: "h-16 w-16 text-lg", xl: "h-24 w-24 text-2xl" }[size];
  return (
    <div
      aria-hidden
      className={cn("flex shrink-0 items-center justify-center rounded-full bg-gradient-to-br font-semibold tracking-wide", avatarTone(seed ?? name), sz, className)}
    >
      {initials(name)}
    </div>
  );
}

export function Stars({ value, size = 16, className }: { value: number; size?: number; className?: string }) {
  return (
    <span className={cn("inline-flex items-center gap-0.5", className)} aria-label={`${value} out of 5 stars`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star key={i} width={size} height={size} className={i <= Math.round(value) ? "fill-amber-400 text-amber-400" : "text-line"} aria-hidden />
      ))}
    </span>
  );
}

// ── Feedback states ───────────────────────────────────────────────────────
export function Alert({ tone = "info", title, children, className }: { tone?: "info" | "success" | "error"; title?: string; children?: React.ReactNode; className?: string }) {
  const map = {
    info: { cls: "border-sky-200 bg-sky/60 text-navy", Icon: Info },
    success: { cls: "border-emerald-200 bg-emerald-50 text-emerald-800", Icon: CheckCircle2 },
    error: { cls: "border-red-200 bg-red-50 text-red-800", Icon: AlertCircle },
  }[tone];
  return (
    <div role={tone === "error" ? "alert" : "status"} className={cn("flex gap-3 rounded-xl border px-4 py-3 text-sm animate-fade-in", map.cls, className)}>
      <map.Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5 opacity-90")}>{children}</div>}
      </div>
    </div>
  );
}

export function EmptyState({ icon, title, description, action }: { icon?: React.ReactNode; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-line bg-white/60 px-6 py-12 text-center">
      {icon && <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-sky text-navy">{icon}</div>}
      <p className="font-medium text-navy">{title}</p>
      {description && <p className="mt-1 max-w-sm text-sm text-ink-muted">{description}</p>}
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}

export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-[40vh] flex-col items-center justify-center gap-3 text-ink-muted" role="status" aria-live="polite">
      <Loader2 className="h-6 w-6 animate-spin text-teal" aria-hidden />
      <span className="text-sm">{label}</span>
    </div>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-navy/[0.06]", className)} />;
}

// ── Forms ─────────────────────────────────────────────────────────────────
export function Field({
  label,
  htmlFor,
  error,
  hint,
  required,
  children,
  className,
}: {
  label: string;
  htmlFor?: string;
  error?: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={htmlFor} className="text-sm font-medium text-navy">
        {label}
        {required && <span className="ml-0.5 text-teal-600" aria-hidden>*</span>}
      </label>
      {children}
      {error ? (
        <p id={htmlFor ? `${htmlFor}-error` : undefined} className="text-sm text-red-700">
          {error}
        </p>
      ) : hint ? (
        <p className="text-xs text-ink-faint">{hint}</p>
      ) : null}
    </div>
  );
}

const inputBase =
  "w-full rounded-xl border bg-white px-3.5 text-[15px] text-ink placeholder:text-ink-faint transition-colors focus:outline-none focus:ring-2 focus:ring-teal/40 focus:border-teal disabled:bg-paper";

export const Input = forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement> & { invalid?: boolean }>(
  function Input({ className, invalid, ...rest }, ref) {
    return (
      <input
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && rest.id ? `${rest.id}-error` : undefined}
        className={cn(inputBase, "h-11", invalid ? "border-red-300" : "border-line", className)}
        {...rest}
      />
    );
  },
);

export const Textarea = forwardRef<HTMLTextAreaElement, React.TextareaHTMLAttributes<HTMLTextAreaElement> & { invalid?: boolean }>(
  function Textarea({ className, invalid, rows = 4, ...rest }, ref) {
    return (
      <textarea
        ref={ref}
        rows={rows}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && rest.id ? `${rest.id}-error` : undefined}
        className={cn(inputBase, "py-2.5 leading-relaxed", invalid ? "border-red-300" : "border-line", className)}
        {...rest}
      />
    );
  },
);

export const Select = forwardRef<HTMLSelectElement, React.SelectHTMLAttributes<HTMLSelectElement> & { invalid?: boolean }>(
  function Select({ className, invalid, children, ...rest }, ref) {
    return (
      <select
        ref={ref}
        aria-invalid={invalid || undefined}
        aria-describedby={invalid && rest.id ? `${rest.id}-error` : undefined}
        className={cn(inputBase, "h-11 appearance-none bg-[length:16px] bg-[right_0.9rem_center] bg-no-repeat pr-10", invalid ? "border-red-300" : "border-line", className)}
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%235f6470' stroke-width='2'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E\")",
        }}
        {...rest}
      >
        {children}
      </select>
    );
  },
);

/** Toggle-chip used for multi-select (categories, formats) and filters. */
export function Chip({
  selected,
  onClick,
  children,
  className,
}: {
  selected?: boolean;
  onClick?: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      aria-pressed={selected}
      onClick={onClick}
      className={cn(
        "inline-flex h-9 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-sm transition-all",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal focus-visible:ring-offset-1",
        selected ? "border-navy bg-navy text-white" : "border-line bg-white text-ink-muted hover:border-navy/30 hover:text-navy",
        className,
      )}
    >
      {children}
    </button>
  );
}
