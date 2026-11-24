import Image from "next/image";
import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";

type Variant = "primary" | "secondary" | "ghost" | "gold" | "danger" | "light";
type Size = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-2 rounded-full font-medium tracking-[0.005em] transition-[background-color,color,border-color,box-shadow,transform] duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45 select-none whitespace-nowrap";
const variants: Record<Variant, string> = {
  primary: "shine bg-moss text-bg shadow-[0_1px_0_rgb(255_255_255/0.08)_inset,0_6px_16px_-8px_rgb(28_38_32/0.6)] hover:bg-moss-2 dark:text-night",
  secondary: "border border-line-strong bg-surface/70 text-ink hover:border-ink/40 hover:bg-surface",
  ghost: "text-ink-2 hover:bg-surface-2 hover:text-ink",
  gold: "shine bg-gold text-white shadow-[0_6px_16px_-8px_rgb(165_119_45/0.7)] hover:bg-gold-bright dark:text-night",
  danger: "border border-rose/40 text-rose hover:bg-rose-soft",
  light: "shine bg-[#fbf7ee] text-[#1c2620] hover:bg-white",
};
const sizes: Record<Size, string> = {
  sm: "h-9 px-4 text-sm",
  md: "h-11 px-5 text-[0.95rem]",
  lg: "h-13 px-7 text-base",
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
  return <div className={cn("rounded-[var(--radius-card)] border border-line bg-surface shadow-soft", className)} {...props} />;
}

type BadgeTone = "neutral" | "gold" | "sage" | "indigo" | "rose" | "moss";
const badgeTones: Record<BadgeTone, string> = {
  neutral: "bg-surface-2 text-ink-2",
  gold: "bg-gold-soft text-gold",
  sage: "bg-moss-soft text-moss",
  moss: "bg-moss-soft text-moss",
  indigo: "bg-moss-soft text-moss",
  rose: "bg-rose-soft text-rose",
};
export function Badge({ tone = "neutral", className, ...props }: ComponentProps<"span"> & { tone?: BadgeTone }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[0.72rem] font-semibold uppercase tracking-[0.08em]",
        badgeTones[tone],
        className,
      )}
      {...props}
    />
  );
}

const fieldBase =
  "w-full rounded-2xl border border-line-strong bg-surface px-4 text-[0.97rem] text-ink placeholder:text-muted/70 shadow-[var(--shadow-sm)] transition-[border-color,box-shadow] focus:border-moss focus:outline-none focus:ring-4 focus:ring-moss/10 disabled:opacity-60";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return <input className={cn(fieldBase, "h-12", className)} {...props} />;
}

export function Textarea({ className, ...props }: ComponentProps<"textarea">) {
  return <textarea className={cn(fieldBase, "py-3 leading-relaxed", className)} {...props} />;
}

export function Select({ className, ...props }: ComponentProps<"select">) {
  return <select className={cn(fieldBase, "h-12 pr-9", className)} {...props} />;
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
    <div className={cn("space-y-2", className)}>
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
    neutral: "border-line bg-surface-2/70",
    gold: "border-gold/25 bg-gold-soft/60",
    sage: "border-moss/20 bg-moss-soft/70",
    moss: "border-moss/20 bg-moss-soft/70",
    indigo: "border-moss/20 bg-moss-soft/70",
    rose: "border-rose/25 bg-rose-soft/70",
  };
  return (
    <div className={cn("rounded-2xl border px-4 py-3 text-sm leading-relaxed text-ink-2", tones[tone], className)} role="status">
      {title ? <p className="font-semibold text-ink">{title}</p> : null}
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
    <div className={cn("rounded-[var(--radius-card)] border border-dashed border-line-strong bg-surface/40 px-6 py-14 text-center", className)}>
      <span className="mx-auto mb-4 block size-2 rounded-full bg-gold-bright shadow-[0_0_18px_4px_rgb(201_154_74/0.35)]" />
      <p className="font-display text-3xl text-ink">{title}</p>
      {children ? <div className="mx-auto mt-2 max-w-md text-[0.95rem] text-muted">{children}</div> : null}
      {action ? <div className="mt-6">{action}</div> : null}
    </div>
  );
}

export function Eyebrow({ className, ...props }: ComponentProps<"p">) {
  return <p className={cn("kicker", className)} {...props} />;
}

export type PhotoKey = "hero" | "sophia" | "courses" | "retreat" | "community";

/**
 * Page opening: a kicker, a large serif title and a short summary.
 * With `photo`, the title sits beside a framed photograph.
 */
export function PageHeader({
  eyebrow,
  title,
  children,
  actions,
  photo,
  className,
}: {
  eyebrow?: string;
  title: ReactNode;
  children?: ReactNode;
  actions?: ReactNode;
  photo?: PhotoKey;
  className?: string;
}) {
  const text = (
    <div className="max-w-2xl">
      {eyebrow ? <Eyebrow>{eyebrow}</Eyebrow> : null}
      <h1 className="font-display mt-4 text-[2.75rem] leading-[1.02] text-ink sm:text-6xl">
        <span className="line-mask">
          <span style={{ ["--delay" as string]: "120ms" }}>{title}</span>
        </span>
      </h1>
      {children ? <div className="mt-5 text-[1.075rem] leading-relaxed text-muted">{children}</div> : null}
      {actions ? <div className="mt-7 flex flex-wrap gap-3">{actions}</div> : null}
    </div>
  );
  if (!photo) {
    return (
      <header className={cn("flex flex-col gap-6 border-b border-line pb-10 sm:flex-row sm:items-end sm:justify-between", className)}>
        {text}
      </header>
    );
  }
  return (
    <header className={cn("grid items-center gap-10 lg:grid-cols-[1.05fr_1fr]", className)}>
      {text}
      <div className="photo-in relative aspect-[4/3] overflow-hidden rounded-[1.75rem] shadow-lift lg:aspect-[5/4]">
        <Image src={`/edition/${photo}.webp`} alt="" fill priority sizes="(max-width: 1024px) 100vw, 45vw" className="kenburns object-cover" />
        <div aria-hidden className="absolute inset-0 rounded-[1.75rem] ring-1 ring-inset ring-black/5" />
      </div>
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
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) % 360;
  const tones = ["bg-gold-soft text-gold", "bg-moss-soft text-moss", "bg-surface-3 text-ink-2", "bg-[#e9dfe0] text-[#7a4b52] dark:bg-[#3a2a2c] dark:text-[#e0b8bd]"];
  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex size-9 shrink-0 items-center justify-center rounded-full font-display text-[0.95rem]",
        tones[h % tones.length],
        className,
      )}
    >
      {initials || "·"}
    </span>
  );
}

export function Container({ className, ...props }: ComponentProps<"div">) {
  return <div className={cn("mx-auto w-full max-w-[76rem] px-5 sm:px-8", className)} {...props} />;
}
