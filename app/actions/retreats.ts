"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { requireUser } from "@/lib/auth/session";
import { getDb } from "@/lib/db";
import { bookings } from "@/lib/db/schema";
import { money } from "@/lib/format";
import { checkoutUrl, createOrder } from "@/lib/payments";
import { BookingError, bookingWithDetails, cancelBooking, depositCents, holdBooking } from "@/lib/retreats";

export type BookState = { error?: string } | undefined;

const schema = z.object({
  roomId: z.string().min(1, "Choose a room.").max(64),
  guests: z.coerce.number().int().min(1).max(8),
  paymentPlan: z.enum(["deposit", "full"]),
  phone: z.string().trim().min(5, "Please add a phone number we can reach you on.").max(40),
  dietary: z.string().trim().max(300).optional(),
  accessibility: z.string().trim().max(300).optional(),
  notes: z.string().trim().max(1000).optional(),
  guestNames: z.string().trim().max(300).optional(),
  agree: z.literal("on", { message: "Please confirm you've read the cancellation policy." }),
});

export async function bookRetreatAction(_prev: BookState, form: FormData): Promise<BookState> {
  const slug = String(form.get("slug") ?? "");
  const user = await requireUser(`/retreats/${slug}/book`);
  const parsed = schema.safeParse(Object.fromEntries(form.entries()));
  if (!parsed.success) return { error: parsed.error.issues[0]?.message };
  const d = parsed.data;

  let hold;
  try {
    hold = holdBooking({
      userId: user.id,
      roomId: d.roomId,
      guests: d.guests,
      paymentPlan: d.paymentPlan,
      contact: {
        phone: d.phone,
        dietary: d.dietary || undefined,
        accessibility: d.accessibility || undefined,
        notes: d.notes || undefined,
        guestNames: d.guestNames ? d.guestNames.split(",").map((s) => s.trim()).filter(Boolean).slice(0, 8) : undefined,
      },
    });
  } catch (err) {
    if (err instanceof BookingError) return { error: err.message };
    throw err;
  }

  const amount = d.paymentPlan === "deposit" ? depositCents(hold.totalCents, hold.retreat.depositPercent) : hold.totalCents;
  const order = createOrder({
    userId: user.id,
    kind: "retreat",
    refId: hold.bookingId,
    description: `${hold.retreat.title}: ${d.paymentPlan === "deposit" ? `${hold.retreat.depositPercent}% deposit` : "paid in full"}`,
    amountCents: amount,
  });
  redirect(checkoutUrl(order));
}

export async function payBalanceAction(form: FormData) {
  const user = await requireUser();
  const bookingId = String(form.get("bookingId") ?? "");
  const b = bookingWithDetails(bookingId);
  if (!b || b.booking.userId !== user.id || b.booking.status !== "confirmed") redirect("/account");
  const balance = b.booking.totalCents - b.booking.paidCents;
  if (balance <= 0) redirect(`/bookings/${b.booking.reference}`);
  const order = createOrder({
    userId: user.id,
    kind: "retreat",
    refId: b.booking.id,
    description: `${b.retreat.title}: remaining balance (${money(balance)})`,
    amountCents: balance,
  });
  redirect(checkoutUrl(order));
}

export async function cancelBookingAction(form: FormData) {
  const user = await requireUser();
  const reference = String(form.get("reference") ?? "");
  const b = getDb().select().from(bookings).where(eq(bookings.reference, reference)).get();
  if (!b || b.userId !== user.id) redirect("/account");
  try {
    cancelBooking(b.id, user.id);
  } catch {
    // Already cancelled or not cancellable: fall through to the booking page.
  }
  revalidatePath(`/bookings/${reference}`);
  redirect(`/bookings/${reference}?cancelled=1`);
}
