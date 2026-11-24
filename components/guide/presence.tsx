"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/cn";
import { Geometry } from "../geometry";

export type PresenceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

/**
 * Sophia's visible presence: a seed-of-life mandala that breathes when idle,
 * ripples while listening, and swells with her voice while speaking.
 * `levelRef` (0–1) is read every frame, so audio levels never re-render React.
 */
export function Presence({
  state,
  levelRef,
  className,
}: {
  state: PresenceState;
  levelRef?: RefObject<number>;
  className?: string;
}) {
  const coreRef = useRef<HTMLDivElement>(null);
  const haloRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let raf = 0;
    let smooth = 0;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const tick = () => {
      const target = levelRef?.current ?? 0;
      smooth += (target - smooth) * 0.25;
      const s = reduce ? 1 : 1 + Math.min(0.18, smooth * 0.35);
      if (coreRef.current) coreRef.current.style.transform = `scale(${s.toFixed(3)})`;
      if (haloRef.current) haloRef.current.style.opacity = String(Math.min(1, 0.25 + smooth * 1.4).toFixed(2));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [levelRef]);

  const label = {
    idle: "Sophia is here",
    connecting: "Connecting to Sophia",
    listening: "Sophia is listening",
    thinking: "Sophia is reflecting",
    speaking: "Sophia is speaking",
  }[state];

  return (
    <div className={cn("relative aspect-square", className)} role="img" aria-label={label}>
      <div
        ref={haloRef}
        className="absolute inset-[8%] rounded-full opacity-30 blur-2xl transition-colors duration-700"
        style={{
          background:
            state === "listening"
              ? "radial-gradient(circle, color-mix(in oklab, var(--indigo) 45%, transparent), transparent 70%)"
              : "radial-gradient(circle, color-mix(in oklab, var(--gold) 45%, transparent), transparent 70%)",
        }}
      />
      <Geometry
        motif="flower"
        strokeWidth={0.6}
        className={cn(
          "absolute inset-0 text-gold/30",
          state === "connecting" || state === "thinking" ? "animate-[ms-spin_14s_linear_infinite]" : "animate-slow-spin",
        )}
      />
      <div ref={coreRef} className="absolute inset-[24%] transition-transform duration-75">
        <Geometry
          motif="seed"
          strokeWidth={1.1}
          className={cn(
            "size-full transition-colors duration-700",
            state === "listening" ? "text-indigo" : "text-gold",
            state === "idle" && "animate-breathe",
          )}
        />
      </div>
      {state === "listening" ? (
        <span className="absolute inset-[18%] animate-ping rounded-full border border-indigo/30 [animation-duration:2.4s]" />
      ) : null}
    </div>
  );
}
