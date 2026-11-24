import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignInForm } from "@/components/auth-forms";
import { currentUser, safeNext } from "@/lib/auth/session";

export const metadata = { title: "Sign in" };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string }> }) {
  const { next } = await searchParams;
  if (await currentUser()) redirect(safeNext(next));
  return (
    <AuthShell title="Welcome back" subtitle="Continue where you left off on your path.">
      <SignInForm next={next ? safeNext(next) : undefined} />
    </AuthShell>
  );
}
