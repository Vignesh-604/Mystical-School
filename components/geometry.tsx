import type { SVGProps } from "react";
import { cn } from "@/lib/cn";
import { studyArea, type GeometryMotif } from "@/lib/study-areas";

type Pt = [number, number];

function ring(count: number, distance: number, offsetDeg = 0): Pt[] {
  return Array.from({ length: count }, (_, i) => {
    const a = ((offsetDeg + (360 / count) * i) * Math.PI) / 180;
    return [Math.round(distance * Math.cos(a) * 100) / 100, Math.round(distance * Math.sin(a) * 100) / 100];
  });
}

function polygon(points: Pt[]) {
  return points.map((p) => p.join(",")).join(" ");
}

function triangle(size: number, up: boolean, dy = 0): string {
  const pts = ring(3, size, up ? -90 : 90).map(([x, y]) => [x, y + dy] as Pt);
  return polygon(pts);
}

const C = (props: { cx: number; cy: number; r: number; o?: number }) => (
  <circle cx={props.cx} cy={props.cy} r={props.r} opacity={props.o} vectorEffect="non-scaling-stroke" />
);

function Seed() {
  return (
    <>
      <C cx={0} cy={0} r={60} o={0.55} />
      <C cx={0} cy={0} r={30} />
      {ring(6, 30).map(([x, y], i) => (
        <C key={i} cx={x} cy={y} r={30} />
      ))}
      <C cx={0} cy={0} r={86} o={0.3} />
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
      <g clipPath="url(#ms-flower-clip)">
        {centers.map(([x, y], i) => (
          <C key={i} cx={x} cy={y} r={26} />
        ))}
      </g>
      <C cx={0} cy={0} r={78} />
      <C cx={0} cy={0} r={84} o={0.35} />
    </>
  );
}

function Vesica() {
  return (
    <>
      <C cx={-24} cy={0} r={48} />
      <C cx={24} cy={0} r={48} />
      <line x1={0} y1={-41.6} x2={0} y2={41.6} opacity={0.6} vectorEffect="non-scaling-stroke" />
      <line x1={-24} y1={0} x2={24} y2={0} opacity={0.6} vectorEffect="non-scaling-stroke" />
      <polygon points={polygon([[-24, 0], [24, 0], [0, -41.6]])} opacity={0.45} vectorEffect="non-scaling-stroke" />
      <polygon points={polygon([[-24, 0], [24, 0], [0, 41.6]])} opacity={0.45} vectorEffect="non-scaling-stroke" />
      <C cx={0} cy={0} r={86} o={0.3} />
    </>
  );
}

function Metatron() {
  const centers: Pt[] = [[0, 0], ...ring(6, 32, -90), ...ring(6, 64, -90)];
  const lines: [Pt, Pt][] = [];
  for (let i = 0; i < centers.length; i++)
    for (let j = i + 1; j < centers.length; j++) lines.push([centers[i]!, centers[j]!]);
  return (
    <>
      <g opacity={0.4}>
        {lines.map(([a, b], i) => (
          <line key={i} x1={a[0]} y1={a[1]} x2={b[0]} y2={b[1]} vectorEffect="non-scaling-stroke" />
        ))}
      </g>
      {centers.map(([x, y], i) => (
        <C key={i} cx={x} cy={y} r={14} />
      ))}
    </>
  );
}

function Triangles() {
  return (
    <>
      <C cx={0} cy={0} r={84} />
      <C cx={0} cy={0} r={90} o={0.35} />
      <polygon points={triangle(78, true, 6)} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(78, false, -6)} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(54, true, -4)} opacity={0.8} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(54, false, 4)} opacity={0.8} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(30, true, 3)} opacity={0.7} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(30, false, -3)} opacity={0.7} vectorEffect="non-scaling-stroke" />
      <circle cx={0} cy={0} r={2.5} fill="currentColor" />
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
      <polyline points={pts.join(" ")} vectorEffect="non-scaling-stroke" />
      {[22, 40, 62, 84].map((r, i) => (
        <C key={r} cx={0} cy={0} r={r} o={0.18 + i * 0.08} />
      ))}
    </>
  );
}

function Torus() {
  return (
    <>
      {ring(12, 30).map(([x, y], i) => (
        <C key={i} cx={x} cy={y} r={48} o={0.75} />
      ))}
      <C cx={0} cy={0} r={78} o={0.5} />
    </>
  );
}

function Hexagram() {
  return (
    <>
      <C cx={0} cy={0} r={84} />
      <polygon points={triangle(84, true)} vectorEffect="non-scaling-stroke" />
      <polygon points={triangle(84, false)} vectorEffect="non-scaling-stroke" />
      <polygon points={polygon(ring(6, 48.5, 0))} opacity={0.6} vectorEffect="non-scaling-stroke" />
      <C cx={0} cy={0} r={42} o={0.6} />
      <C cx={0} cy={0} r={90} o={0.3} />
    </>
  );
}

function Circles() {
  return (
    <>
      {[12, 24, 38, 54, 70, 86].map((r, i) => (
        <C key={r} cx={0} cy={0} r={r} o={1 - i * 0.12} />
      ))}
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

export function Geometry({
  motif,
  strokeWidth = 1,
  className,
  ...props
}: { motif: GeometryMotif; strokeWidth?: number } & SVGProps<SVGSVGElement>) {
  const Motif = MOTIFS[motif];
  return (
    <svg
      viewBox="-100 -100 200 200"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      aria-hidden
      className={className}
      {...props}
    >
      <Motif />
    </svg>
  );
}

const COVER_TONES = [
  "bg-[#1b1a33] text-[#d9b46a]",
  "bg-[#14232a] text-[#c9b37a]",
  "bg-[#2a1d24] text-[#dcae74]",
  "bg-[#1d2233] text-[#c7b9e8]",
];

/** Generated cover art for courses, retreats and projects: no stock photos. */
export function CoverArt({
  area,
  seed = "",
  className,
  children,
}: {
  area: string;
  seed?: string;
  className?: string;
  children?: React.ReactNode;
}) {
  const a = studyArea(area);
  let h = 0;
  for (const c of seed + a.key) h = (h * 33 + c.charCodeAt(0)) >>> 0;
  const tone = COVER_TONES[h % COVER_TONES.length];
  const rotate = (h % 6) * 15;
  return (
    <div className={cn("relative isolate overflow-hidden", tone, className)}>
      <div
        aria-hidden
        className="absolute inset-0 -z-10 opacity-70"
        style={{ background: "radial-gradient(120% 80% at 50% 0%, rgb(255 255 255 / 0.07), transparent 60%)" }}
      />
      <Geometry
        motif={a.motif}
        className="absolute left-1/2 top-1/2 h-[135%] opacity-[0.16]"
        style={{ transform: `translate(-50%, -50%) rotate(${rotate}deg)` }}
        strokeWidth={0.8}
      />
      <Geometry
        motif={a.motif}
        className="absolute left-1/2 top-1/2 h-[62%] -translate-x-1/2 -translate-y-1/2 opacity-90"
        strokeWidth={1.1}
      />
      {children ? <div className="relative">{children}</div> : null}
    </div>
  );
}
