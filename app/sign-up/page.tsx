import { redirect } from "next/navigation";
import { AuthShell } from "@/components/auth-shell";
import { SignUpForm } from "@/components/auth-forms";
import { currentUser } from "@/lib/auth/session";

export const metadata = { title: "Join" };

export default async function SignUpPage() {
  if (await currentUser()) redirect("/home");
  return (
    <AuthShell
      title="Begin your path"
      subtitle="Membership starts free: guidance from Sophia, the community, and every course and retreat to explore."
    >
      <SignUpForm />
    </AuthShell>
  );
}
