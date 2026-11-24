"use client";

import { useEffect, useRef, type RefObject } from "react";
import { cn } from "@/lib/cn";

export type PresenceState = "idle" | "connecting" | "listening" | "thinking" | "speaking";

const LABELS: Record<PresenceState, string> = {
  idle: "Sophia is here",
  connecting: "Connecting to Sophia",
  listening: "Sophia is listening",
  thinking: "Sophia is reflecting",
  speaking: "Sophia is speaking",
};

/**
 * Sophia's presence: a lantern of light. It breathes when idle, turns moss-green and
 * ripples while listening, and swells with her voice. `levelRef` (0–1) is read every
 * frame, so audio levels never re-render React.
 */
export function Presence({ state, levelRef, className }: { state: PresenceState; levelRef?: RefObject<number>; className?: string }) {
  const node = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = node.current;
    if (!el || !levelRef) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    let smooth = 0;
    const tick = () => {
      smooth += ((levelRef.current ?? 0) - smooth) * 0.22;
      el.style.setProperty("--level", smooth.toFixed(3));
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      el.style.removeProperty("--level");
    };
  }, [levelRef]);

  return (
    <div ref={node} className={cn("orb", className)} data-state={state} role="img" aria-label={LABELS[state]}>
      <span className="orb__halo" />
      <span className="orb__ring orb__ring--1" />
      <span className="orb__ring orb__ring--2" />
      {state === "listening" ? (
        <>
          <span className="orb__ripple" />
          <span className="orb__ripple" />
        </>
      ) : null}
      <span className="orb__core" />
    </div>
  );
}
