"use client";

import { useActionState, useMemo, useState } from "react";
import { bookRetreatAction, type BookState } from "@/app/actions/retreats";
import { cn } from "@/lib/cn";
import { PendingButton } from "./pending-button";
import { Field, Input, Notice, Select, Textarea } from "./ui";

type Room = { id: string; name: string; description: string; priceCents: number; remaining: number; maxGuestsPerBooking: number };

function usd(cents: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", minimumFractionDigits: cents % 100 ? 2 : 0 }).format(cents / 100);
}

export function BookingForm({ slug, rooms, depositPercent, policy }: { slug: string; rooms: Room[]; depositPercent: number; policy: string }) {
  const [state, action] = useActionState<BookState, FormData>(bookRetreatAction, undefined);
  const firstOpen = rooms.find((r) => r.remaining > 0);
  const [roomId, setRoomId] = useState(firstOpen?.id ?? "");
  const [guests, setGuests] = useState(1);
  const [plan, setPlan] = useState<"deposit" | "full">("deposit");

  const room = rooms.find((r) => r.id === roomId);
  const maxGuests = room ? Math.min(room.maxGuestsPerBooking, room.remaining) : 1;
  const total = room ? room.priceCents * Math.min(guests, maxGuests) : 0;
  const deposit = Math.round((total * depositPercent) / 100);
  const guestOptions = useMemo(() => Array.from({ length: Math.max(1, maxGuests) }, (_, i) => i + 1), [maxGuests]);

  return (
    <form action={action} className="space-y-10">
      <input type="hidden" name="slug" value={slug} />
      {state?.error ? <Notice tone="rose">{state.error}</Notice> : null}

      <fieldset>
        <legend className="font-display text-2xl font-semibold">1. Choose a room</legend>
        <div className="mt-4 grid gap-3">
          {rooms.map((r) => {
            const full = r.remaining <= 0;
            return (
              <label
                key={r.id}
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border p-4 transition-colors",
                  roomId === r.id ? "border-gold bg-gold-soft/30" : "border-line bg-surface hover:border-line-strong",
                  full && "cursor-not-allowed opacity-50",
                )}
              >
                <input
                  type="radio"
                  name="roomId"
                  value={r.id}
                  checked={roomId === r.id}
                  disabled={full}
                  onChange={() => {
                    setRoomId(r.id);
                    setGuests(1);
                  }}
                  className="mt-1 size-4 accent-[var(--gold)]"
                />
                <span className="flex-1">
                  <span className="flex items-baseline justify-between gap-3">
                    <span className="font-medium text-ink">{r.name}</span>
                    <span className="font-medium text-ink">{usd(r.priceCents)}</span>
                  </span>
                  <span className="mt-0.5 block text-sm text-muted">{r.description}</span>
                  <span className="mt-1 block text-xs text-muted">
                    {full ? "Fully booked" : `${r.remaining} ${r.remaining === 1 ? "place" : "places"} left · price per guest`}
                  </span>
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="font-display text-2xl font-semibold">2. Guests and contact</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Guests" htmlFor="guests">
            <Select id="guests" name="guests" value={Math.min(guests, maxGuests)} onChange={(e) => setGuests(Number(e.target.value))}>
              {guestOptions.map((n) => (
                <option key={n} value={n}>
                  {n} {n === 1 ? "guest" : "guests"}
                </option>
              ))}
            </Select>
          </Field>
          <Field label="Phone" htmlFor="phone" hint="For travel updates only.">
            <Input id="phone" name="phone" type="tel" autoComplete="tel" required maxLength={40} />
          </Field>
        </div>
        {guests > 1 ? (
          <Field label="Other guests' names" htmlFor="guestNames" hint="Separate names with commas.">
            <Input id="guestNames" name="guestNames" maxLength={300} />
          </Field>
        ) : null}
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Dietary needs (optional)" htmlFor="dietary">
            <Input id="dietary" name="dietary" maxLength={300} placeholder="e.g. vegan, nut allergy" />
          </Field>
          <Field label="Accessibility needs (optional)" htmlFor="accessibility">
            <Input id="accessibility" name="accessibility" maxLength={300} placeholder="e.g. step-free room" />
          </Field>
        </div>
        <Field label="Anything else the hosts should know? (optional)" htmlFor="notes">
          <Textarea id="notes" name="notes" rows={3} maxLength={1000} />
        </Field>
      </fieldset>

      <fieldset>
        <legend className="font-display text-2xl font-semibold">3. Payment</legend>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {(
            [
              ["deposit", `Pay a ${depositPercent}% deposit`, `${usd(deposit)} today, ${usd(total - deposit)} later`],
              ["full", "Pay in full", `${usd(total)} today`],
            ] as const
          ).map(([value, label, detail]) => (
            <label
              key={value}
              className={cn(
                "flex cursor-pointer flex-col rounded-xl border p-4",
                plan === value ? "border-gold bg-gold-soft/30" : "border-line bg-surface hover:border-line-strong",
              )}
            >
              <input type="radio" name="paymentPlan" value={value} checked={plan === value} onChange={() => setPlan(value)} className="sr-only" />
              <span className="font-medium text-ink">{label}</span>
              <span className="text-sm text-muted">{detail}</span>
            </label>
          ))}
        </div>
        <details className="mt-4 rounded-xl border border-line bg-surface px-4 py-3 text-sm text-ink-2">
          <summary className="cursor-pointer font-medium text-ink">Cancellation policy</summary>
          <p className="mt-2 leading-relaxed">{policy}</p>
        </details>
        <label className="mt-4 flex items-start gap-2 text-sm text-ink-2">
          <input type="checkbox" name="agree" required className="mt-0.5 size-4 accent-[var(--gold)]" />
          I&rsquo;ve read the cancellation policy, and I&rsquo;ll arrange travel insurance.
        </label>
      </fieldset>

      <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-muted">Due today</p>
          <p className="font-display text-3xl font-semibold">{usd(plan === "deposit" ? deposit : total)}</p>
          <p className="text-xs text-muted">Total {usd(total)}</p>
        </div>
        <PendingButton size="lg" disabled={!room || room.remaining <= 0} pendingLabel="Holding your places…">
          Continue to checkout
        </PendingButton>
      </div>
    </form>
  );
}
