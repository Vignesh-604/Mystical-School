"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { cn } from "@/lib/cn";

const reducedMotion = () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

type RevealTag = "div" | "li" | "section" | "article" | "span";

/** Fades, lifts and un-blurs its content as it scrolls into view (once). */
export function Reveal({
  children,
  as = "div",
  delay = 0,
  variant,
  className,
  style,
}: {
  children: ReactNode;
  as?: RevealTag;
  delay?: number;
  variant?: "scale" | "left" | "clip";
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLElement | null>(null);
  const [shown, setShown] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reducedMotion() || typeof IntersectionObserver === "undefined") {
      setShown(true);
      return;
    }
    const io = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShown(true);
          io.disconnect();
        }
      },
      { threshold: 0.12, rootMargin: "0px 0px -6% 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);
  const Tag = as as "div";
  return (
    <Tag
      ref={ref as React.Ref<HTMLDivElement>}
      className={cn("reveal", className)}
      data-in={shown}
      data-variant={variant}
      style={{ ["--delay" as string]: `${delay}ms`, ...style }}
    >
      {children}
    </Tag>
  );
}

/** Tilts toward the pointer in 3D, with a soft glare where the light lands. */
export function Tilt({ children, className, max = 5 }: { children: ReactNode; className?: string; max?: number }) {
  const ref = useRef<HTMLDivElement>(null);
  function move(e: React.PointerEvent) {
    const el = ref.current;
    if (!el || e.pointerType === "touch" || reducedMotion()) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width;
    const py = (e.clientY - r.top) / r.height;
    el.style.setProperty("--ry", `${((px - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--rx", `${(-(py - 0.5) * max * 2).toFixed(2)}deg`);
    el.style.setProperty("--gx", `${(px * 100).toFixed(1)}%`);
    el.style.setProperty("--gy", `${(py * 100).toFixed(1)}%`);
    el.dataset.active = "true";
  }
  function leave() {
    const el = ref.current;
    if (!el) return;
    el.style.setProperty("--rx", "0deg");
    el.style.setProperty("--ry", "0deg");
    el.dataset.active = "false";
  }
  return (
    <div ref={ref} className={cn("tilt relative", className)} onPointerMove={move} onPointerLeave={leave}>
      {children}
      <span className="tilt-glare" aria-hidden />
    </div>
  );
}

/**
 * The hero: a slowly drifting photograph with scroll parallax, a pool of warm light that
 * follows the pointer, and motes of light rising through it.
 */
export function HeroStage({ image, overlay, children, className }: { image: ReactNode; overlay?: ReactNode; children: ReactNode; className?: string }) {
  const root = useRef<HTMLDivElement>(null);
  const layer = useRef<HTMLDivElement>(null);
  const content = useRef<HTMLDivElement>(null);
  const pointer = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    if (reducedMotion()) return;
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const y = window.scrollY;
        const h = root.current?.offsetHeight ?? 800;
        if (y > h * 1.2) return;
        if (layer.current) layer.current.style.transform = `translate3d(0, ${(y * 0.28).toFixed(1)}px, 0)`;
        if (content.current) {
          content.current.style.transform = `translate3d(0, ${(y * 0.12).toFixed(1)}px, 0)`;
          content.current.style.opacity = String(Math.max(0, 1 - y / (h * 0.85)).toFixed(3));
        }
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  function move(e: React.PointerEvent) {
    const el = root.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    el.style.setProperty("--mx", `${e.clientX - r.left}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    pointer.current = { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  return (
    <div ref={root} className={cn("relative isolate overflow-hidden", className)} onPointerMove={move} onPointerLeave={() => (pointer.current = null)}>
      <div ref={layer} className="absolute inset-[-6%_0_-12%_0] -z-10 will-change-transform">
        <div className="kenburns absolute inset-0">{image}</div>
      </div>
      {overlay}
      <LightMotes pointer={pointer} className="pointer-events-none absolute inset-0 -z-10 size-full" />
      <div aria-hidden className="spotlight pointer-events-none absolute inset-0 -z-10" />
      <div ref={content} className="relative w-full will-change-transform">
        {children}
      </div>
    </div>
  );
}

type Mote = { x: number; y: number; z: number; vy: number; sway: number; phase: number; freq: number; tw: number; tws: number };

/** Motes of light drifting upward through sunbeams; they part gently around the pointer. */
export function LightMotes({ className, count = 48, pointer }: { className?: string; count?: number; pointer?: React.RefObject<{ x: number; y: number } | null> }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || reducedMotion()) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    let w = 0;
    let h = 0;

    const sprite = document.createElement("canvas");
    sprite.width = sprite.height = 64;
    const sctx = sprite.getContext("2d")!;
    const g = sctx.createRadialGradient(32, 32, 0, 32, 32, 32);
    g.addColorStop(0, "rgba(255,246,214,1)");
    g.addColorStop(0.18, "rgba(255,222,150,0.85)");
    g.addColorStop(0.45, "rgba(232,180,96,0.25)");
    g.addColorStop(1, "rgba(232,180,96,0)");
    sctx.fillStyle = g;
    sctx.fillRect(0, 0, 64, 64);

    const motes: Mote[] = [];
    const spawn = (anywhere: boolean): Mote => {
      const z = 0.35 + Math.random() * 0.65;
      return {
        x: Math.random() * w,
        y: anywhere ? Math.random() * h : h + 20,
        z,
        vy: (0.12 + Math.random() * 0.32) * z,
        sway: 6 + Math.random() * 22,
        phase: Math.random() * Math.PI * 2,
        freq: 0.0004 + Math.random() * 0.0009,
        tw: Math.random() * Math.PI * 2,
        tws: 0.01 + Math.random() * 0.03,
      };
    };

    const resize = () => {
      const r = canvas.getBoundingClientRect();
      // Keep motes spread across the whole stage when it grows or shrinks.
      if (w > 0 && h > 0 && motes.length) {
        const sx = r.width / w;
        const sy = r.height / h;
        for (const m of motes) {
          m.x *= sx;
          m.y *= sy;
        }
      }
      w = r.width;
      h = r.height;
      canvas.width = Math.round(w * dpr);
      canvas.height = Math.round(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (motes.length === 0 && w > 40 && h > 40) for (let i = 0; i < count; i++) motes.push(spawn(true));
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    let visible = true;
    const io = new IntersectionObserver(([e]) => {
      visible = Boolean(e?.isIntersecting);
      if (visible && !raf) raf = requestAnimationFrame(frame);
    });
    io.observe(canvas);

    let raf = 0;
    const frame = (t: number) => {
      if (!visible || document.hidden) {
        raf = 0;
        return;
      }
      ctx.clearRect(0, 0, w, h);
      ctx.globalCompositeOperation = "lighter";
      const p = pointer?.current;
      for (const m of motes) {
        m.y -= m.vy;
        m.tw += m.tws;
        let x = m.x + Math.sin(t * m.freq + m.phase) * m.sway;
        let y = m.y;
        if (p) {
          const dx = x - p.x;
          const dy = y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < 140 * 140) {
            const f = (1 - Math.sqrt(d2) / 140) * 26;
            const d = Math.sqrt(d2) || 1;
            x += (dx / d) * f;
            y += (dy / d) * f;
          }
        }
        if (m.y < -30) Object.assign(m, spawn(false));
        const size = (8 + 22 * m.z) * (0.85 + 0.15 * Math.sin(m.tw));
        ctx.globalAlpha = (0.25 + 0.55 * m.z) * (0.55 + 0.45 * Math.sin(m.tw));
        ctx.drawImage(sprite, x - size / 2, y - size / 2, size, size);
      }
      ctx.globalAlpha = 1;
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    const onVis = () => {
      if (!document.hidden && visible && !raf) raf = requestAnimationFrame(frame);
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      io.disconnect();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [count, pointer]);

  return <canvas ref={canvasRef} aria-hidden className={className} />;
}
