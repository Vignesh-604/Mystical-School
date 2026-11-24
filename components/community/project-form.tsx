"use client";

import { useActionState } from "react";
import { createProjectAction, type FormState } from "@/app/actions/community";
import { STUDY_AREAS } from "@/lib/study-areas";
import { PendingButton } from "../pending-button";
import { Field, Input, Notice, Select, Textarea } from "../ui";

export function ProjectForm() {
  const [state, action] = useActionState<FormState, FormData>(createProjectAction, undefined);
  return (
    <form action={action} className="space-y-6">
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <Field label="Project title" htmlFor="title">
        <Input id="title" name="title" required maxLength={90} placeholder="e.g. Morning Stillness for Caregivers" />
      </Field>
      <Field label="One-line summary" htmlFor="summary">
        <Input id="summary" name="summary" required maxLength={200} placeholder="What it does, for whom." />
      </Field>
      <Field label="Subject" htmlFor="studyArea" hint="Which part of the school's teaching does this put into action?">
        <Select id="studyArea" name="studyArea" defaultValue="wisdom-in-action">
          {STUDY_AREAS.map((a) => (
            <option key={a.key} value={a.key}>
              {a.name}
            </option>
          ))}
        </Select>
      </Field>
      <Field label="Description" htmlFor="description" hint="What you'll do, where, how often, and how you'll know it helped.">
        <Textarea id="description" name="description" rows={6} required maxLength={4000} />
      </Field>
      <Field label="Help wanted (optional)" htmlFor="helpWanted">
        <Input id="helpWanted" name="helpWanted" maxLength={400} placeholder="e.g. someone to lead a sit once a fortnight" />
      </Field>
      <PendingButton size="lg" pendingLabel="Creating…">
        Create project
      </PendingButton>
    </form>
  );
}
