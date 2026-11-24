"use client";

import { useActionState } from "react";
import { createGatheringAction, type FormState } from "@/app/actions/community";
import { PendingButton } from "../pending-button";
import { Field, Input, Notice, Select, Textarea } from "../ui";
import { TzOffsetInput } from "./forms";

export function GatheringForm({
  places,
  defaultWhere,
  smartmeet,
}: {
  places: { value: string; label: string }[];
  defaultWhere?: string;
  smartmeet: boolean;
}) {
  const [state, action] = useActionState<FormState, FormData>(createGatheringAction, undefined);
  return (
    <form action={action} className="space-y-6">
      <TzOffsetInput />
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}
      <Field label="Title" htmlFor="title">
        <Input id="title" name="title" required maxLength={100} placeholder="e.g. Saturday morning sit" />
      </Field>
      <Field label="What will happen?" htmlFor="description">
        <Textarea id="description" name="description" rows={4} required maxLength={1500} />
      </Field>
      <div className="grid gap-4 sm:grid-cols-[1fr_10rem]">
        <Field label="Starts (your local time)" htmlFor="startsLocal">
          <Input id="startsLocal" name="startsLocal" type="datetime-local" required />
        </Field>
        <Field label="Length" htmlFor="durationMin">
          <Select id="durationMin" name="durationMin" defaultValue="60">
            {[20, 30, 45, 60, 75, 90, 120].map((m) => (
              <option key={m} value={m}>
                {m} min
              </option>
            ))}
          </Select>
        </Field>
      </div>
      <Field label="For" htmlFor="where">
        <Select id="where" name="where" defaultValue={defaultWhere ?? ""}>
          <option value="">The whole community</option>
          {places.map((p) => (
            <option key={p.value} value={p.value}>
              {p.label}
            </option>
          ))}
        </Select>
      </Field>
      <Field
        label={smartmeet ? "Meeting link (optional)" : "Meeting link"}
        htmlFor="link"
        hint={
          smartmeet
            ? "Leave empty and a SmartMeet room is created for you."
            : "Paste a link to your video room, or add it later. SmartMeet rooms aren't switched on in this local build."
        }
      >
        <Input id="link" name="link" type="url" placeholder="https://…" />
      </Field>
      <PendingButton size="lg" pendingLabel="Scheduling…">
        Schedule gathering
      </PendingButton>
    </form>
  );
}
