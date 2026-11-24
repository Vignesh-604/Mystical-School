import Link from "next/link";
import { signOutAction } from "@/app/actions/auth";
import { currentUser } from "@/lib/auth/session";
import { Wordmark } from "./logo";
import { MobileNav, NavLinks } from "./nav-links";
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
    <header className="sticky top-0 z-40 border-b border-line/70 bg-bg/80 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-[4.5rem] max-w-[76rem] items-center gap-4 px-5 sm:px-8 lg:grid lg:grid-cols-[1fr_auto_1fr]">
        <Link href={user ? "/home" : "/"} className="justify-self-start text-ink" aria-label="Mystical School home">
          <Wordmark markClassName="text-moss" />
        </Link>

        <nav aria-label="Main" className="hidden lg:block">
          <NavLinks items={NAV} />
        </nav>

        <div className="ml-auto flex items-center gap-1.5 justify-self-end">
          {user ? (
            <div className="hidden items-center gap-1.5 lg:flex">
              {user.role === "admin" ? (
                <Link href="/admin" className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-ink">
                  Admin
                </Link>
              ) : null}
              <Link href="/account" className="flex items-center gap-2.5 rounded-full py-1 pl-1 pr-3.5 text-sm text-ink-2 transition-colors hover:bg-surface-2">
                <Initials name={user.name} className="size-8 text-sm" />
                <span className="max-w-32 truncate font-medium">{user.name.split(" ")[0]}</span>
              </Link>
              <form action={signOutAction}>
                <button className="rounded-full px-3 py-2 text-sm text-muted transition-colors hover:text-ink">Sign out</button>
              </form>
            </div>
          ) : (
            <div className="hidden items-center gap-2 lg:flex">
              <Link href="/sign-in" className="rounded-full px-4 py-2 text-sm font-medium text-ink-2 transition-colors hover:text-ink">
                Sign in
              </Link>
              <LinkButton href="/sign-up" size="sm">
                Begin free
              </LinkButton>
            </div>
          )}
          <MobileNav items={NAV} user={user ? { name: user.name, isAdmin: user.role === "admin" } : null} signOut={signOutAction} />
        </div>
      </div>
    </header>
  );
}
