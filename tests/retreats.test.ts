import assert from "node:assert/strict";
import { test } from "node:test";
import { eq } from "drizzle-orm";
import * as s from "../lib/db/schema";
import { createOrder, fulfilOrder, PaymentError } from "../lib/payments";
import { BookingError, cancelBooking, getRetreat, holdBooking } from "../lib/retreats";
import { freshDb, makeRetreat, makeUser } from "./helpers";

const db = freshDb("retreats");
const contact = { phone: "+10000000" };

test("a hold reserves places and the last place can't be taken twice", () => {
  const { retreatId, roomId } = makeRetreat({ capacity: 3 });
  const a = makeUser("A");
  const b = makeUser("B");
  holdBooking({ userId: a, roomId, guests: 2, paymentPlan: "full", contact });
  holdBooking({ userId: b, roomId, guests: 1, paymentPlan: "full", contact });
  const c = makeUser("C");
  assert.throws(() => holdBooking({ userId: c, roomId, guests: 1, paymentPlan: "full", contact }), BookingError);
  const slug = db.select().from(s.retreats).where(eq(s.retreats.id, retreatId)).get()!.slug;
  assert.equal(getRetreat(slug)!.rooms[0]!.remaining, 0);
});

test("expired holds release their places", () => {
  const { roomId } = makeRetreat({ capacity: 1 });
  const a = makeUser();
  const held = holdBooking({ userId: a, roomId, guests: 1, paymentPlan: "full", contact });
  db.update(s.bookings).set({ holdExpiresAt: new Date(Date.now() - 1000) }).where(eq(s.bookings.id, held.bookingId)).run();
  const b = makeUser();
  assert.doesNotThrow(() => holdBooking({ userId: b, roomId, guests: 1, paymentPlan: "full", contact }));
});

test("paying for a lapsed hold fails cleanly if someone else took the place", () => {
  const { roomId } = makeRetreat({ capacity: 1 });
  const a = makeUser();
  const held = holdBooking({ userId: a, roomId, guests: 1, paymentPlan: "full", contact });
  const order = createOrder({ userId: a, kind: "retreat", refId: held.bookingId, description: "x", amountCents: held.totalCents });
  db.update(s.bookings).set({ holdExpiresAt: new Date(Date.now() - 1000) }).where(eq(s.bookings.id, held.bookingId)).run();
  const b = makeUser();
  holdBooking({ userId: b, roomId, guests: 1, paymentPlan: "full", contact });
  assert.throws(() => fulfilOrder(order.id, a), PaymentError);
  assert.equal(db.select().from(s.orders).where(eq(s.orders.id, order.id)).get()!.status, "cancelled");
});

test("deposit, then balance, then cancellation frees the room", () => {
  const { roomId } = makeRetreat({ capacity: 2 });
  const a = makeUser();
  const held = holdBooking({ userId: a, roomId, guests: 2, paymentPlan: "deposit", contact });
  const deposit = createOrder({ userId: a, kind: "retreat", refId: held.bookingId, description: "deposit", amountCents: 50000 });
  fulfilOrder(deposit.id, a);
  let booking = db.select().from(s.bookings).where(eq(s.bookings.id, held.bookingId)).get()!;
  assert.equal(booking.status, "confirmed");
  assert.equal(booking.paidCents, 50000);

  const balance = createOrder({ userId: a, kind: "retreat", refId: held.bookingId, description: "balance", amountCents: booking.totalCents - 50000 });
  fulfilOrder(balance.id, a);
  booking = db.select().from(s.bookings).where(eq(s.bookings.id, held.bookingId)).get()!;
  assert.equal(booking.paidCents, booking.totalCents);

  const other = makeUser();
  assert.throws(() => holdBooking({ userId: other, roomId, guests: 1, paymentPlan: "full", contact }), BookingError);
  cancelBooking(held.bookingId, a);
  assert.doesNotThrow(() => holdBooking({ userId: other, roomId, guests: 1, paymentPlan: "full", contact }));
});

test("guest count is limited per booking and retreats in the past can't be booked", () => {
  const { roomId } = makeRetreat({ capacity: 10, maxPerBooking: 2 });
  assert.throws(() => holdBooking({ userId: makeUser(), roomId, guests: 3, paymentPlan: "full", contact }), BookingError);
  const past = makeRetreat({ capacity: 10, startDate: "2000-01-01" });
  assert.throws(() => holdBooking({ userId: makeUser(), roomId: past.roomId, guests: 1, paymentPlan: "full", contact }), BookingError);
});

test("members can't cancel someone else's booking", () => {
  const { roomId } = makeRetreat({ capacity: 2 });
  const a = makeUser();
  const held = holdBooking({ userId: a, roomId, guests: 1, paymentPlan: "full", contact });
  assert.throws(() => cancelBooking(held.bookingId, makeUser()), BookingError);
});
