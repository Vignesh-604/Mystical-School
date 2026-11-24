"use client";

import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { cn } from "@/lib/cn";

type Item = { href: string; label: string };

function isActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(href + "/");
}

export function NavLinks({ items }: { items: Item[] }) {
  const pathname = usePathname();
  return (
    <ul className="flex items-center gap-1">
      {items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href}>
            <Link
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={cn(
                "rounded-full px-3.5 py-1.5 text-[0.95rem] transition-colors",
                active ? "bg-surface-2 text-ink" : "text-muted hover:text-ink",
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
  const pathname = usePathname();
  useEffect(() => setOpen(false), [pathname]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const linkClass = "block rounded-xl px-4 py-3 text-lg text-ink hover:bg-surface-2";
  return (
    <div className="md:hidden">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label={open ? "Close menu" : "Open menu"}
        className="inline-flex size-10 items-center justify-center rounded-full text-ink hover:bg-surface-2"
      >
        {open ? <X className="size-5" /> : <Menu className="size-5" />}
      </button>
      {open ? (
        <div id="mobile-menu" className="fixed inset-x-0 top-16 z-40 border-b border-line bg-bg px-4 pb-6 pt-2 shadow-soft">
          <nav aria-label="Main">
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={cn(linkClass, isActive(pathname, item.href) && "bg-surface-2")}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
          <div className="mt-4 border-t border-line pt-4">
            {user ? (
              <div className="space-y-1">
                <Link href="/home" className={linkClass}>
                  Your path
                </Link>
                <Link href="/account" className={linkClass}>
                  Account
                </Link>
                {user.isAdmin ? (
                  <Link href="/admin" className={linkClass}>
                    Admin
                  </Link>
                ) : null}
                <form action={signOut}>
                  <button className={cn(linkClass, "w-full text-left text-muted")}>Sign out</button>
                </form>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <Link href="/sign-in" className="rounded-full border border-line-strong py-3 text-center text-ink">
                  Sign in
                </Link>
                <Link href="/sign-up" className="rounded-full bg-ink py-3 text-center text-bg">
                  Join free
                </Link>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
