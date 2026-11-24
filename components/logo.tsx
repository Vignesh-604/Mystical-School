import { useId } from "react";
import { cn } from "@/lib/cn";

const R = 17;
const PETALS = Array.from({ length: 6 }, (_, i) => {
  const a = ((-90 + 60 * i) * Math.PI) / 180;
  const x = (32 + R * Math.cos(a)).toFixed(2);
  const y = (32 + R * Math.sin(a)).toFixed(2);
  return `M32 32A${R} ${R} 0 0 1 ${x} ${y}A${R} ${R} 0 0 1 32 32Z`;
});

/**
 * The rosette: six petals drawn from overlapping circles, the oldest sacred-geometry
 * flower, found in Roman, Celtic, Islamic and Indian art alike. It blooms on load
 * and turns gently on hover (see .logo-* in globals.css).
 */
export function LogoMark({ className, tile = false, animate = true }: { className?: string; tile?: boolean; animate?: boolean }) {
  const id = useId().replace(/:/g, "");
  return (
    <svg viewBox="0 0 64 64" aria-hidden className={cn("logo-mark shrink-0 overflow-visible", animate && "logo-animate", className)}>
      <defs>
        <linearGradient id={`petal-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#f0cd82" />
          <stop offset="1" stopColor="#bf8f47" />
        </linearGradient>
      </defs>
      {tile ? <rect width="64" height="64" rx="15" fill="var(--moss)" /> : null}
      <g className="logo-rosette" fill={`url(#petal-${id})`}>
        {PETALS.map((d, i) => (
          <path key={i} d={d} className="logo-petal" style={{ ["--i" as string]: i }} />
        ))}
      </g>
      <circle className="logo-ring" cx="32" cy="32" r="21.2" fill="none" stroke={tile ? "var(--bg)" : "currentColor"} strokeWidth="2.4" pathLength={1} />
      <circle cx="32" cy="32" r="2.5" fill={tile ? "var(--moss)" : "var(--bg)"} />
    </svg>
  );
}

export function Wordmark({ className, markClassName }: { className?: string; markClassName?: string }) {
  return (
    <span className={cn("logo-hover inline-flex items-center gap-3.5", className)}>
      <LogoMark className={cn("size-12", markClassName)} />
      <span className="font-display text-[2rem] leading-none tracking-[-0.01em]">Mystical School</span>
    </span>
  );
}
