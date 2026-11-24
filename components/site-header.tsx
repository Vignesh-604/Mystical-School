import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { currentUser } from "@/lib/auth/session";
import { Geometry } from "./geometry";
import { MobileNav, NavLinks } from "./nav-links";
import { ThemeToggle } from "./theme-toggle";
import { Initials, LinkButton } from "./ui";

export const NAV = [
  { href: "/guide", label: "Sophia" },
  { href: "/courses", label: "Courses" },
  { href: "/retreats", label: "Retreats" },
  { href: "/community", label: "Community" },
];

export async function SiteHeader() {
  const user = await currentUser();
  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-6 px-4 sm:px-6">
        <Link href={user ? "/home" : "/"} className="flex items-center gap-2.5 text-ink" aria-label="Mystical School home">
          <Geometry motif="seed" className="size-7 text-gold" strokeWidth={1.4} />
          <span className="font-display text-[1.35rem] font-semibold tracking-tight">Mystical School</span>
        </Link>

        <nav aria-label="Main" className="hidden md:block">
          <NavLinks items={NAV} />
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <ThemeToggle />
          {user ? (
            <div className="hidden items-center gap-1 md:flex">
              {user.role === "admin" ? (
                <Link href="/admin" className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
                  Admin
                </Link>
              ) : null}
              <Link
                href="/account"
                className="flex items-center gap-2 rounded-full py-1 pl-1 pr-3 text-sm text-ink-2 hover:bg-surface-2"
              >
                <Initials name={user.name} className="size-7 text-xs" />
                <span className="max-w-32 truncate">{user.name.split(" ")[0]}</span>
              </Link>
              <form action={signOutAction}>
                <button className="rounded-full px-3 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-ink">
                  Sign out
                </button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <LinkButton href="/sign-in" variant="ghost" size="sm">
                Sign in
              </LinkButton>
              <LinkButton href="/sign-up" size="sm">
                Join free
              </LinkButton>
            </div>
          )}
          <MobileNav items={NAV} user={user ? { name: user.name, isAdmin: user.role === "admin" } : null} signOut={signOutAction} />
        </div>
      </div>
    </header>
  );
}
