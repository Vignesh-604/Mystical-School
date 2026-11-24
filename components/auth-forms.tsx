"use client";

import Link from "next/link";
import { useActionState } from "react";
import { signInAction, signUpAction, type AuthState } from "@/app/actions/auth";
import { PendingButton } from "./pending-button";
import { Field, Input, Notice } from "./ui";

export function SignInForm({ next }: { next?: string }) {
  const [state, action] = useActionState<AuthState, FormData>(signInAction, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      {next ? <input type="hidden" name="next" value={next} /> : null}
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} />
      </Field>
      <Field label="Password" htmlFor="password">
        <Input id="password" name="password" type="password" autoComplete="current-password" required />
      </Field>
      <PendingButton className="w-full" size="lg" pendingLabel="Signing in…">
        Sign in
      </PendingButton>
      <p className="text-center text-sm text-muted">
        New here?{" "}
        <Link href="/sign-up" className="font-medium text-ink underline decoration-gold/50 underline-offset-4">
          Create a free account
        </Link>
      </p>
    </form>
  );
}

export function SignUpForm() {
  const [state, action] = useActionState<AuthState, FormData>(signUpAction, undefined);
  return (
    <form action={action} className="space-y-5" noValidate>
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <Field label="Your name" htmlFor="name" hint="Shown to other members in the community.">
        <Input id="name" name="name" autoComplete="name" required maxLength={80} defaultValue={state?.fields?.name} />
      </Field>
      <Field label="Email" htmlFor="email">
        <Input id="email" name="email" type="email" autoComplete="email" required defaultValue={state?.fields?.email} />
      </Field>
      <Field label="Password" htmlFor="password" hint="At least 10 characters.">
        <Input id="password" name="password" type="password" autoComplete="new-password" required minLength={10} />
      </Field>
      <PendingButton className="w-full" size="lg" pendingLabel="Creating your account…">
        Begin as a Seeker, free
      </PendingButton>
      <p className="text-center text-sm text-muted">
        Already a member?{" "}
        <Link href="/sign-in" className="font-medium text-ink underline decoration-gold/50 underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}
