"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/cn";

const BARS = 32;

/** A scrolling level meter for your microphone. Reads `levelRef` every frame; no re-renders. */
export function MicMeter({ levelRef, active, className }: { levelRef: RefObject<number>; active: boolean; className?: string }) {
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    const bars = Array.from(el.children) as HTMLElement[];
    const history = new Array(BARS).fill(0);
    let raf = 0;
    let last = 0;
    const tick = (t: number) => {
      if (t - last > 55) {
        last = t;
        history.shift();
        history.push(active ? Math.min(1, (levelRef.current ?? 0) * 1.15) : 0);
        for (let i = 0; i < BARS; i++) {
          const v = history[i]!;
          bars[i]!.style.transform = `scaleY(${Math.max(0.08, v).toFixed(3)})`;
          bars[i]!.style.opacity = String(0.35 + v * 0.65);
        }
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [levelRef, active]);

  return (
    <div ref={wrap} className={cn("flex h-10 items-center gap-[3px]", className)} aria-hidden>
      {Array.from({ length: BARS }, (_, i) => (
        <span key={i} className="h-full w-[3px] origin-center rounded-full bg-moss transition-transform duration-75" style={{ transform: "scaleY(0.08)" }} />
      ))}
    </div>
  );
}
