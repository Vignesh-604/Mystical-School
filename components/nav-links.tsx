"use client";

import { ArrowUpRight, Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1 rounded-full border border-line/80 bg-surface/60 p-1 shadow-[var(--shadow-sm)]">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "block rounded-full px-4 py-1.5 text-[0.92rem] transition-colors duration-300",
                active ? "bg-moss text-bg dark:text-night" : "text-ink-2 hover:bg-surface-2 hover:text-ink",
              )}
            >
              {item.label}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}

/**
 * Full-screen menu for phones and tablets. Rendered into <body> through a portal:
 * the header's backdrop blur would otherwise trap a fixed overlay inside the header.
 */
export function MobileNav({
  items,
  user,
  signOut,
}: {
  items: Item[];
  user: { name: string; isAdmin: boolean } | null;
  signOut: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  useEffect(() => setMounted(true), []);
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    const onResize = () => window.innerWidth >= 1024 && setOpen(false);
    window.addEventListener("keydown", onKey);
    window.addEventListener("resize", onResize);
    document.documentElement.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("resize", onResize);
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const sheet = (
    <div id="mobile-menu" className="fixed inset-x-0 bottom-0 top-[4.5rem] z-50 overflow-y-auto bg-bg lg:hidden">
      <div className="mx-auto max-w-xl px-6 pb-12 pt-6">
        <nav aria-label="Main">
          <ul className="border-t border-line">
            {items.map((item, i) => (
              <li key={item.href} className="menu-item border-b border-line" style={{ ["--i" as string]: i }}>
                <Link href={item.href} className="group flex items-center justify-between py-5">
                  <span className={cn("font-display text-[2.6rem] leading-none transition-colors", isActive(pathname, item.href) ? "text-moss" : "text-ink group-hover:text-moss")}>
                    {item.label}
                  </span>
                  <ArrowUpRight className="size-6 text-gold transition-transform duration-300 group-hover:rotate-45" />
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div className="menu-item mt-8" style={{ ["--i" as string]: items.length }}>
          {user ? (
            <div className="grid gap-2">
              <Link href="/home" className="rounded-2xl border border-line bg-surface px-5 py-4 text-ink">
                Your path
              </Link>
              <Link href="/account" className="rounded-2xl border border-line bg-surface px-5 py-4 text-ink">
                Account
              </Link>
              {user.isAdmin ? (
                <Link href="/admin" className="rounded-2xl border border-line bg-surface px-5 py-4 text-ink">
                  Admin
                </Link>
              ) : null}
              <form action={signOut}>
                <button className="w-full rounded-2xl px-5 py-4 text-left text-muted">Sign out</button>
              </form>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              <Link href="/sign-in" className="rounded-full border border-line-strong py-3.5 text-center font-medium text-ink">
                Sign in
              </Link>
              <Link href="/sign-up" className="rounded-full bg-moss py-3.5 text-center font-medium text-bg dark:text-night">
                Begin free
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  return (
    <div className="lg:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-11 items-center justify-center rounded-full border border-line bg-surface/80 text-ink transition-colors hover:bg-surface"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open && mounted ? createPortal(sheet, document.body) : null}
    </div>
  );
}
