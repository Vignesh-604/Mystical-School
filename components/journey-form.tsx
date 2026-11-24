"use client";

import { useActionState, useState } from "react";
import { saveJourneyAction, type JourneyState } from "@/app/actions/journey";
import { cn } from "@/lib/cn";
import { STUDY_AREAS } from "@/lib/study-areas";
import { Geometry } from "./geometry";
import { PendingButton } from "./pending-button";
import { Field, Input, Notice, Textarea } from "./ui";

const EXPERIENCE = [
  { value: "new", label: "New to this", detail: "Curious, and starting fresh" },
  { value: "some", label: "Some experience", detail: "I've read or tried a little" },
  { value: "practising", label: "Practising", detail: "I have a regular practice" },
  { value: "teaching", label: "Guiding others", detail: "I teach or hold space" },
];

export function JourneyForm({
  initial,
  returnTo,
  submitLabel = "Begin my path",
}: {
  initial?: { intention?: string | null; focusAreas?: string[]; experience?: string | null; traditions?: string | null };
  returnTo?: "account";
  submitLabel?: string;
}) {
  const [state, action] = useActionState<JourneyState, FormData>(saveJourneyAction, undefined);
  const [areas, setAreas] = useState<string[]>(initial?.focusAreas ?? []);

  function toggle(key: string) {
    setAreas((prev) => (prev.includes(key) ? prev.filter((k) => k !== key) : prev.length >= 3 ? prev : [...prev, key]));
  }

  return (
    <form action={action} className="space-y-10">
      {returnTo ? <input type="hidden" name="returnTo" value={returnTo} /> : null}
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}

      <Field
        label="What brings you to the school?"
        htmlFor="intention"
        hint="There's no right answer. A question you carry, a change you want, a feeling you can't name yet."
      >
        <Textarea
          id="intention"
          name="intention"
          rows={4}
          maxLength={600}
          required
          defaultValue={initial?.intention ?? ""}
          placeholder="I want to understand myself better and find more peace in how I respond to people…"
        />
      </Field>

      <fieldset>
        <legend className="text-sm font-medium text-ink">Where would you like to begin?</legend>
        <p className="mt-1 text-sm text-muted">Choose up to three. You can change these any time.</p>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
          {STUDY_AREAS.map((area) => {
            const on = areas.includes(area.key);
            const disabled = !on && areas.length >= 3;
            return (
              <label
                key={area.key}
                className={cn(
                  "group flex cursor-pointer items-start gap-3 rounded-xl border p-3.5 transition-colors",
                  on ? "border-gold bg-gold-soft/40" : "border-line bg-surface hover:border-line-strong",
                  disabled && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="checkbox"
                  name="focusAreas"
                  value={area.key}
                  checked={on}
                  disabled={disabled}
                  onChange={() => toggle(area.key)}
                  className="sr-only"
                />
                <Geometry motif={area.motif} className={cn("mt-0.5 size-8 shrink-0", on ? "text-gold" : "text-muted")} />
                <span>
                  <span className="block text-sm font-medium text-ink">{area.name}</span>
                  <span className="block text-xs text-muted">{area.short}</span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset>
        <legend className="text-sm font-medium text-ink">How familiar are these paths to you?</legend>
        <div className="mt-4 grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {EXPERIENCE.map((e) => (
            <label
              key={e.value}
              className="flex cursor-pointer flex-col rounded-xl border border-line bg-surface p-3.5 transition-colors hover:border-line-strong has-[:checked]:border-gold has-[:checked]:bg-gold-soft/40"
            >
              <input
                type="radio"
                name="experience"
                value={e.value}
                defaultChecked={initial?.experience === e.value}
                className="sr-only"
                required
              />
              <span className="text-sm font-medium text-ink">{e.label}</span>
              <span className="text-xs text-muted">{e.detail}</span>
            </label>
          ))}
        </div>
      </fieldset>

      <Field
        label="Traditions or practices in your life (optional)"
        htmlFor="traditions"
        hint="Sophia will honour these. The school never asks anyone to leave their own tradition."
      >
        <Input
          id="traditions"
          name="traditions"
          maxLength={300}
          defaultValue={initial?.traditions ?? ""}
          placeholder="e.g. raised Catholic, practise yoga, drawn to Sufi poetry"
        />
      </Field>

      <PendingButton size="lg" pendingLabel="Saving…">
        {submitLabel}
      </PendingButton>
    </form>
  );
}
