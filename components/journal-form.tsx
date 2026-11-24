"use client";

import { useActionState, useEffect, useRef } from "react";
import { addJournalEntryAction, type JournalState } from "@/app/actions/journal";
import { PendingButton } from "./pending-button";
import { Field, Input, Notice, Select, Textarea } from "./ui";

export function JournalForm() {
  const [state, action] = useActionState<JournalState, FormData>(addJournalEntryAction, undefined);
  const formRef = useRef<HTMLFormElement>(null);
  useEffect(() => {
    if (state?.ok) formRef.current?.reset();
  }, [state]);
  return (
    <form ref={formRef} action={action} className="space-y-4">
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <div className="grid gap-4 sm:grid-cols-[1fr_12rem]">
        <Field label="Title" htmlFor="j-title">
          <Input id="j-title" name="title" maxLength={120} required placeholder="What I noticed today" />
        </Field>
        <Field label="Kind" htmlFor="j-kind">
          <Select id="j-kind" name="kind" defaultValue="reflection">
            <option value="reflection">Reflection</option>
            <option value="practice">Practice</option>
            <option value="action">Wisdom in Action</option>
            <option value="insight">Insight</option>
          </Select>
        </Field>
      </div>
      <Field label="Entry" htmlFor="j-body">
        <Textarea id="j-body" name="body" rows={5} maxLength={8000} required placeholder="Write freely. Only you can see your journal." />
      </Field>
      <PendingButton pendingLabel="Saving…">Save entry</PendingButton>
    </form>
  );
}
