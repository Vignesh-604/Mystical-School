import Link from "next/link";
import { Container, Eyebrow } from "@/components/ui";
import { requireAdmin } from "@/lib/auth/session";

const LINKS = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/bookings", label: "Bookings" },
  { href: "/admin/members", label: "Members" },
  { href: "/admin/reports", label: "Moderation" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requireAdmin();
  return (
    <Container className="py-10">
      <Eyebrow>School administration</Eyebrow>
      <nav aria-label="Admin" className="mt-3 flex flex-wrap gap-1 border-b border-line pb-3">
        {LINKS.map((l) => (
          <Link key={l.href} href={l.href} className="rounded-full px-3.5 py-1.5 text-sm text-ink-2 hover:bg-surface-2 hover:text-ink">
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="mt-8">{children}</div>
    </Container>
  );
}
