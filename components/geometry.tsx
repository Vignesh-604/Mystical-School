import Image from "next/image";
import type { SVGProps } from "react";
import { cn } from "@/lib/cn";
import { studyArea, type GeometryMotif } from "@/lib/study-areas";
import type { PhotoKey } from "./ui";

type Pt = [number, number];

function ring(count: number, distance: number, offsetDeg = 0): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const a = ((offsetDeg + (360 / count) * i) * Math.PI) / 180;
    return [Math.round(distance * Math.cos(a) * 100) / 100, Math.round(distance * Math.sin(a) * 100) / 100];
  });
}
const polygon = (points: Pt[]) => points.map((p) => p.join(",")).join(" ");
const triangle = (size: number, up: boolean, dy = 0) => polygon(ring(3, size, up ? -90 : 90).map(([x, y]) => [x, y + dy] as Pt));
const C = (p: { cx: number; cy: number; r: number; o?: number }) => (
  <circle cx={p.cx} cy={p.cy} r={p.r} opacity={p.o} vectorEffect="non-scaling-stroke" pathLength={1} />
);
const V = { vectorEffect: "non-scaling-stroke" as const, pathLength: 1 };

function Seed() {
  return (
    <>
      <C cx={0} cy={0} r={60} o={0.5} />
      <C cx={0} cy={0} r={30} />
      {ring(6, 30).map(([x, y], i) => <C key={i} cx={x} cy={y} r={30} />)}
    </>
  );
}
function Flower() {
  const centers: Pt[] = [[0, 0], ...ring(6, 26), ...ring(6, 52), ...ring(6, 26 * Math.sqrt(3), 30)];
  return (
    <>
      <defs>
        <clipPath id="ms-flower-clip">
          <circle cx={0} cy={0} r={78} />
        </clipPath>
      </defs>
      <g clipPath="url(#ms-flower-clip)">{centers.map(([x, y], i) => <C key={i} cx={x} cy={y} r={26} />)}</g>
      <C cx={0} cy={0} r={78} />
    </>
  );
}
function Vesica() {
  return (
    <>
      <C cx={-24} cy={0} r={48} />
      <C cx={24} cy={0} r={48} />
      <line x1={0} y1={-41.6} x2={0} y2={41.6} opacity={0.6} {...V} />
      <polygon points={polygon([[-24, 0], [24, 0], [0, -41.6]])} opacity={0.5} {...V} />
      <polygon points={polygon([[-24, 0], [24, 0], [0, 41.6]])} opacity={0.5} {...V} />
    </>
  );
}
function Metatron() {
  const centers: Pt[] = [[0, 0], ...ring(6, 32, -90), ...ring(6, 64, -90)];
  const lines: [Pt, Pt][] = [];
  for (let i = 0; i < centers.length; i++) for (let j = i + 1; j < centers.length; j++) lines.push([centers[i]!, centers[j]!]);
  return (
    <>
      <g opacity={0.35}>{lines.map(([a, b], i) => <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} {...V} />)}</g>
      {centers.map(([x, y], i) => <C key={i} cx={x} cy={y} r={13} />)}
    </>
  );
}
function Triangles() {
  return (
    <>
      <C cx={0} cy={0} r={84} />
      <polygon points={triangle(78, true, 6)} {...V} />
      <polygon points={triangle(78, false, -6)} {...V} />
      <polygon points={triangle(52, true, -4)} opacity={0.8} {...V} />
      <polygon points={triangle(52, false, 4)} opacity={0.8} {...V} />
      <polygon points={triangle(28, true, 3)} opacity={0.7} {...V} />
      <circle cx={0} cy={0} r={2.6} fill="currentColor" />
    </>
  );
}
function Spiral() {
  const phi = (1 + Math.sqrt(5)) / 2;
  const b = Math.log(phi) / (Math.PI / 2);
  const pts: string[] = [];
  for (let t = 0; t <= Math.PI * 4.5; t += 0.05) {
    const r = 1.2 * Math.exp(b * t);
    pts.push(`${(r * Math.cos(t)).toFixed(2)},${(r * Math.sin(t)).toFixed(2)}`);
  }
  return (
    <>
      <polyline points={pts.join(" ")} {...V} />
      {[40, 62, 84].map((r, i) => <C key={r} cx={0} cy={0} r={r} o={0.25 + i * 0.12} />)}
    </>
  );
}
function Torus() {
  return (
    <>
      {ring(12, 30).map(([x, y], i) => <C key={i} cx={x} cy={y} r={48} o={0.7} />)}
    </>
  );
}
function Hexagram() {
  return (
    <>
      <C cx={0} cy={0} r={84} />
      <polygon points={triangle(84, true)} {...V} />
      <polygon points={triangle(84, false)} {...V} />
      <C cx={0} cy={0} r={42} o={0.6} />
    </>
  );
}
function Circles() {
  return (
    <>
      {[14, 28, 44, 62, 82].map((r, i) => <C key={r} cx={0} cy={0} r={r} o={1 - i * 0.15} />)}
      <circle cx={0} cy={0} r={3} fill="currentColor" />
    </>
  );
}

const MOTIFS: Record<GeometryMotif, () => React.JSX.Element> = {
  seed: Seed,
  flower: Flower,
  vesica: Vesica,
  metatron: Metatron,
  triangles: Triangles,
  spiral: Spiral,
  torus: Torus,
  hexagram: Hexagram,
  circles: Circles,
};

export function Geometry({ motif, strokeWidth = 1, className, ...props }: { motif: GeometryMotif; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const Motif = MOTIFS[motif];
  return (
    <svg viewBox="-100 -100 200 200" fill="none" stroke="currentColor" strokeWidth={strokeWidth} aria-hidden className={className} {...props}>
      <Motif />
    </svg>
  );
}

/** One deep, earthy binding colour per subject, like a well-made book series. */
const BINDINGS: Record<string, { bg: string; line: string }> = {
  "self-knowledge": { bg: "#2f4a3b", line: "#ead9b0" },
  consciousness: { bg: "#363a55", line: "#e5dcc2" },
  "universal-principles": { bg: "#4b5737", line: "#efdfb6" },
  meditation: { bg: "#2c4c52", line: "#e8e0c6" },
  "spiritual-wisdom": { bg: "#673d38", line: "#f1d8b2" },
  "holistic-wellbeing": { bg: "#765534", line: "#f4e2c0" },
  "sacred-geometry": { bg: "#232e37", line: "#dcb874" },
  ethics: { bg: "#563b4f", line: "#eed8bd" },
  "wisdom-in-action": { bg: "#87582c", line: "#f8e6c3" },
};

/** Which photograph suits each retreat; anything else gets a book-style cover. */
const RETREAT_PHOTOS: Record<string, PhotoKey> = {
  "seven-days-of-silence": "retreat",
  "geometry-in-stone": "sophia",
  "wisdom-in-action-monteverde": "hero",
  "temple-and-forest-koyasan": "community",
};
export function retreatPhoto(slug: string): PhotoKey | undefined {
  return RETREAT_PHOTOS[slug];
}

/**
 * Cover art for courses, projects and retreats. With `photo`, a photograph under a soft
 * veil; otherwise a bound cover in the subject's colour with a fine-line emblem.
 */
export function CoverArt({
  area,
  seed = "",
  photo,
  label = true,
  drift = false,
  className,
  children,
}: {
  area: string;
  seed?: string;
  photo?: PhotoKey;
  label?: boolean;
  /** Slow Ken Burns drift for large hero photographs. */
  drift?: boolean;
  className?: string;
  children?: React.ReactNode;
}) {
  const a = studyArea(area);
  const binding = BINDINGS[a.key] ?? BINDINGS["self-knowledge"]!;
  let h = 0;
  for (const c of seed + a.key) h = (h * 33 + c.charCodeAt(0)) >>> 0;

  if (photo) {
    return (
      <div className={cn("relative isolate overflow-hidden bg-night", className)}>
        <Image src={`/edition/${photo}.webp`} alt="" fill sizes="(max-width: 768px) 100vw, 50vw" className={cn("-z-10 object-cover", drift ? "kenburns" : "lift-img")} />
        <div aria-hidden className="photo-veil absolute inset-0 -z-10" />
        {children ? <div className="relative h-full">{children}</div> : null}
      </div>
    );
  }

  return (
    <div className={cn("relative isolate overflow-hidden", className)} style={{ background: binding.bg, color: binding.line }}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "radial-gradient(120% 90% at 30% 0%, rgb(255 255 255 / 0.12), transparent 55%), radial-gradient(90% 70% at 100% 100%, rgb(0 0 0 / 0.25), transparent 60%)" }}
      />
      <div aria-hidden className="absolute inset-3 -z-10 rounded-[0.6rem] border border-current opacity-30" />
      <Geometry
        motif={a.motif}
        strokeWidth={0.7}
        className="lift-img absolute left-1/2 top-1/2 h-[150%] -z-10 opacity-[0.1]"
        style={{ transform: `translate(-50%, -50%) rotate(${(h % 6) * 15}deg)` }}
      />
      <Geometry motif={a.motif} strokeWidth={1} className="geo-draw geo-turn absolute left-1/2 top-1/2 h-[46%] -translate-x-1/2 -translate-y-1/2 -z-10 opacity-90" />
      {label ? (
        <p className="absolute inset-x-0 top-6 -z-10 text-center text-[0.62rem] font-semibold uppercase tracking-[0.28em] opacity-80">{a.name}</p>
      ) : null}
      {children ? <div className="relative h-full">{children}</div> : null}
    </div>
  );
}
