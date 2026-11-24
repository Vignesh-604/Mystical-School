import { MapPin } from "lucide-react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Eyebrow, Initials } from "@/components/ui";
import { requireUser } from "@/lib/auth/session";
import { memberProfile } from "@/lib/community";
import { relativeTime, shortDate } from "@/lib/format";

export const metadata = { title: "Member" };

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  // Profiles are visible to signed-in members only. Emails are never shown.
  await requireUser();
  const { id } = await params;
  const data = memberProfile(id);
  if (!data) notFound();
  const { user, circles, projects, recent } = data;

  return (
    <Container className="max-w-3xl py-14">
      <div className="flex items-center gap-5">
        <Initials name={user.name} className="size-20 text-2xl" />
        <div>
          <h1 className="font-display text-4xl font-semibold">{user.name}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-muted">
            {user.location ? (
              <span className="inline-flex items-center gap-1">
                <MapPin className="size-3.5" /> {user.location}
              </span>
            ) : null}
            <span>Member since {shortDate(user.createdAt)}</span>
          </p>
        </div>
      </div>
      {user.bio ? <p className="mt-6 text-lg leading-relaxed text-ink-2">{user.bio}</p> : null}

      <div className="mt-10 grid gap-8 sm:grid-cols-2">
        <section>
          <Eyebrow>Circles</Eyebrow>
          <ul className="mt-3 flex flex-wrap gap-2">
            {circles.length ? (
              circles.map((c) => (
                <li key={c.slug}>
                  <Link href={`/community/circles/${c.slug}`} className="rounded-full border border-line-strong px-3 py-1 text-sm hover:bg-surface-2">
                    {c.name}
                  </Link>
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">None yet</li>
            )}
          </ul>
        </section>
        <section>
          <Eyebrow>Projects</Eyebrow>
          <ul className="mt-3 space-y-1.5">
            {projects.length ? (
              projects.map((p) => (
                <li key={p.slug}>
                  <Link href={`/community/projects/${p.slug}`} className="text-sm text-ink hover:underline">
                    {p.title}
                  </Link>
                  {p.role === "lead" ? <span className="text-xs text-muted"> · lead</span> : null}
                </li>
              ))
            ) : (
              <li className="text-sm text-muted">None yet</li>
            )}
          </ul>
        </section>
      </div>

      {recent.length ? (
        <section className="mt-10">
          <Eyebrow>Recently shared</Eyebrow>
          <ul className="mt-3 space-y-3">
            {recent.map((p) => (
              <li key={p.id} className="rounded-2xl border border-line bg-surface p-4">
                <p className="text-xs text-muted">
                  <Link href={`/community/circles/${p.circleSlug}#${p.id}`} className="hover:underline">
                    {p.circleName}
                  </Link>{" "}
                  · {relativeTime(p.createdAt)}
                </p>
                <p className="mt-1 line-clamp-3 text-ink-2">{p.body}</p>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Container>
  );
}
