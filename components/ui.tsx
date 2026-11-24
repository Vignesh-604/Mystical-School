import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium transition-colors disabled:pointer-events-none disabled:opacity-50 select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "bg-ink text-bg hover:bg-ink-2",
  secondary: "border border-line-strong bg-surface text-ink hover:bg-surface-2",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  gold: "bg-gold text-white hover:bg-gold-ink dark:text-[#1a1408]",
  danger: "border border-rose/40 text-rose hover:bg-rose-soft",
};
const sizes: Record<Size, string> = {
  sm: "h-8 px-3.5 text-sm",
  md: "h-10 px-5 text-[0.95rem]",
  lg: "h-12 px-7 text-base",
};

export function buttonClass(variant: Variant = "primary", size: Size = "md", className?: string) {
  return cn(base, variants[variant], sizes[size], className);
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<"button"> & { variant?: Variant; size?: Size }) {
  return <button className={buttonClass(variant, size, className)} {...props} />;
}

export function LinkButton({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ComponentProps<typeof Link> & { variant?: Variant; size?: Size }) {
  return <Link className={buttonClass(variant, size, className)} {...props} />;
}

export function Card({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("rounded-2xl border border-line bg-surface shadow-soft", className)} {...props} />;
}

type BadgeTone = "neutral" | "gold" | "sage" | "indigo" | "rose";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  gold: "bg-gold-soft text-gold-ink",
  sage: "bg-sage-soft text-sage",
  indigo: "bg-indigo-soft text-indigo",
  rose: "bg-rose-soft text-rose",
};
export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium", badgeTones[tone], className)}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded-xl border border-line-strong bg-surface px-3.5 text-[0.95rem] text-ink placeholder:text-muted/70 transition-colors focus:border-gold focus:outline-none focus:ring-2 focus:ring-gold/20 disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-11", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "h-11 pr-8", className)} {...props} />;
}

export function Field({
  label,
  hint,
  error,
  htmlFor,
  children,
  className,
}: {
  label: string;
  hint?: ReactNode;
  error?: string;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <label htmlFor={htmlFor} className="block text-sm font-medium text-ink">
        {label}
      </label>
      {children}
      {error ? (
        <p className="text-sm text-rose" role="alert">
          {error}
        </p>
      ) : hint ? (
        <p className="text-sm text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

export function Notice({
  tone = "neutral",
  title,
  children,
  className,
}: {
  tone?: BadgeTone;
  title?: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  const tones: Record<BadgeTone, string> = {
    neutral: "border-line bg-surface-2/60",
    gold: "border-gold/30 bg-gold-soft/50",
    sage: "border-sage/30 bg-sage-soft/60",
    indigo: "border-indigo/25 bg-indigo-soft/60",
    rose: "border-rose/30 bg-rose-soft/60",
  };
  return (
    <div className={cn("rounded-xl border px-4 py-3 text-sm text-ink-2", tones[tone], className)} role="status">
      {title ? <p className="font-medium text-ink">{title}</p> : null}
      {children ? <div className={title ? "mt-1" : ""}>{children}</div> : null}
    </div>
  );
}

export function EmptyState({
  title,
  children,
  action,
  className,
}: {
  title: string;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("rounded-2xl border border-dashed border-line-strong px-6 py-12 text-center", className)}>
      <p className="font-display text-2xl text-ink">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-sm text-muted">{children}</div> : null}
      {action ? <div className="mt-5">{action}</div> : null}
    </div>
  );
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("text-xs font-semibold uppercase tracking-[0.18em] text-gold", className)} {...props} />;
}

export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <header className={cn("flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="max-w-2xl">
        {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
        <h1 className="font-display mt-2 text-4xl font-semibold leading-[1.05] text-ink sm:text-5xl">{title}</h1>
        {children ? <div className="mt-3 text-[1.05rem] leading-relaxed text-muted">{children}</div> : null}
      </div>
      {actions ? <div className="flex shrink-0 gap-2">{actions}</div> : null}
    </header>
  );
}

export function Initials({ name, className }: { name: string; className?: string }) {
  const initials = name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]!.toUpperCase())
    .join("");
  // Stable hue from the name, kept within the palette's warm/indigo range.
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  const tones = ["bg-gold-soft text-gold-ink", "bg-indigo-soft text-indigo", "bg-sage-soft text-sage", "bg-surface-2 text-ink-2"];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full text-sm font-semibold",
        tones[h % tones.length],
        className,
      )}
    >
      {initials || "·"}
    </span>
  );
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-6xl px-4 sm:px-6", className)} {...props} />;
}
