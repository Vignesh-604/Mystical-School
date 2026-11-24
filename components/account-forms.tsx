"use client";

import { useActionState } from "react";
import { deleteAccountAction, updateProfileAction, type AccountState } from "@/app/actions/account";
import { PendingButton } from "./pending-button";
import { Field, Input, Notice, Textarea } from "./ui";

export function ProfileForm({ name, location, bio }: { name: string; location: string | null; bio: string | null }) {
  const [state, action] = useActionState<AccountState, FormData>(updateProfileAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : state?.ok ? <Notice tone="sage">Profile saved.</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Name" htmlFor="p-name">
          <Input id="p-name" name="name" defaultValue={name} required maxLength={80} />
        </Field>
        <Field label="Location (optional)" htmlFor="p-location" hint="City or region, shown on your profile.">
          <Input id="p-location" name="location" defaultValue={location ?? ""} maxLength={80} />
        </Field>
      </div>
      <Field label="About you (optional)" htmlFor="p-bio" hint="A sentence or two other members will see.">
        <Textarea id="p-bio" name="bio" rows={3} defaultValue={bio ?? ""} maxLength={400} />
      </Field>
      <PendingButton variant="secondary" pendingLabel="Saving…">
        Save profile
      </PendingButton>
    </form>
  );
}

export function DeleteAccountForm() {
  const [state, action] = useActionState<AccountState, FormData>(deleteAccountAction, undefined);
  return (
    <form action={action} className="space-y-4">
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <p className="text-sm text-ink-2">
        This permanently deletes your account and everything in it: conversations with Sophia, your journal, course progress, bookings
        and community posts. It can&rsquo;t be undone.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Type DELETE to confirm" htmlFor="d-confirm">
          <Input id="d-confirm" name="confirm" autoComplete="off" required />
        </Field>
        <Field label="Your password" htmlFor="d-password">
          <Input id="d-password" name="password" type="password" autoComplete="current-password" required />
        </Field>
      </div>
      <PendingButton variant="danger" pendingLabel="Deleting…">
        Delete my account
      </PendingButton>
    </form>
  );
}
