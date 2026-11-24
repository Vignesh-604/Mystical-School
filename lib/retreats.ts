import { and, asc, eq, gt, gte, inArray, lt, or, sql } from "drizzle-orm";
import { audit } from "./audit";
import { getDb, type DB } from "./db";
import { bookings, retreatRooms, retreats, type BookingContact } from "./db/schema";
import { bookingReference, newId } from "./ids";

export const HOLD_MINUTES = 30;

type Tx = Parameters<Parameters<DB["transaction"]>[0]>[0];

/** Guests counted against capacity: confirmed bookings plus unexpired holds. */
function takenByRoom(db: DB | Tx, roomIds: string[], excludeBookingId?: string): Map<string, number> {
  if (roomIds.length === 0) return new Map();
  const now = new Date();
  const rows = db
    .select({ roomId: bookings.roomId, taken: sql<number>`coalesce(sum(${bookings.guests}), 0)` })
    .from(bookings)
    .where(
      and(
        inArray(bookings.roomId, roomIds),
        or(eq(bookings.status, "confirmed"), and(eq(bookings.status, "held"), gt(bookings.holdExpiresAt, now))),
        excludeBookingId ? sql`${bookings.id} != ${excludeBookingId}` : undefined,
      ),
    )
    .groupBy(bookings.roomId)
    .all();
  return new Map(rows.map((r) => [r.roomId, Number(r.taken)]));
}

export function expireStaleHolds() {
  getDb()
    .update(bookings)
    .set({ status: "expired" })
    .where(and(eq(bookings.status, "held"), lt(bookings.holdExpiresAt, new Date())))
    .run();
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export function listRetreats() {
  const db = getDb();
  const rows = db
    .select()
    .from(retreats)
    .where(and(eq(retreats.published, true), gte(retreats.endDate, todayIso())))
    .orderBy(asc(retreats.startDate))
    .all();
  const rooms = rows.length
    ? db.select().from(retreatRooms).where(inArray(retreatRooms.retreatId, rows.map((r) => r.id))).all()
    : [];
  const taken = takenByRoom(db, rooms.map((r) => r.id));
  return rows.map((r) => {
    const own = rooms.filter((room) => room.retreatId === r.id);
    const capacity = own.reduce((n, room) => n + room.capacity, 0);
    const remaining = own.reduce((n, room) => n + Math.max(0, room.capacity - (taken.get(room.id) ?? 0)), 0);
    const fromCents = own.length ? Math.min(...own.map((room) => room.priceCents)) : 0;
    return { ...r, capacity, remaining, fromCents };
  });
}

export type RetreatListItem = ReturnType<typeof listRetreats>[number];

export function getRetreat(slug: string) {
  const db = getDb();
  const retreat = db.select().from(retreats).where(and(eq(retreats.slug, slug), eq(retreats.published, true))).get();
  if (!retreat) return null;
  const rooms = db.select().from(retreatRooms).where(eq(retreatRooms.retreatId, retreat.id)).orderBy(asc(retreatRooms.position)).all();
  const taken = takenByRoom(db, rooms.map((r) => r.id));
  return {
    retreat,
    rooms: rooms.map((room) => ({ ...room, remaining: Math.max(0, room.capacity - (taken.get(room.id) ?? 0)) })),
  };
}

export function depositCents(totalCents: number, depositPercent: number) {
  return Math.round((totalCents * depositPercent) / 100);
}

export class BookingError extends Error {}

/**
 * Places a 30-minute hold on spots in a room. Runs in one SQLite transaction
 * (writes are serialised), so two members can never take the last place twice.
 */
export function holdBooking(input: {
  userId: string;
  roomId: string;
  guests: number;
  paymentPlan: "deposit" | "full";
  contact: BookingContact;
}) {
  const db = getDb();
  return db.transaction((tx) => {
    const room = tx.select().from(retreatRooms).where(eq(retreatRooms.id, input.roomId)).get();
    if (!room) throw new BookingError("That room option no longer exists.");
    const retreat = tx.select().from(retreats).where(eq(retreats.id, room.retreatId)).get();
    if (!retreat || !retreat.published) throw new BookingError("This retreat isn't open for booking.");
    if (retreat.startDate <= todayIso()) throw new BookingError("This retreat has already begun.");
    if (!Number.isInteger(input.guests) || input.guests < 1 || input.guests > room.maxGuestsPerBooking) {
      throw new BookingError(`This room takes up to ${room.maxGuestsPerBooking} ${room.maxGuestsPerBooking === 1 ? "guest" : "guests"} per booking.`);
    }

    // Release this member's own earlier holds on the same retreat, so retrying doesn't block them.
    tx.update(bookings)
      .set({ status: "expired" })
      .where(and(eq(bookings.userId, input.userId), eq(bookings.retreatId, retreat.id), eq(bookings.status, "held")))
      .run();

    const taken = takenByRoom(tx, [room.id]).get(room.id) ?? 0;
    const remaining = room.capacity - taken;
    if (remaining < input.guests) {
      throw new BookingError(remaining <= 0 ? "Sorry, this room is now full." : `Only ${remaining} ${remaining === 1 ? "place is" : "places are"} left in this room.`);
    }

    const id = newId("bkg");
    const totalCents = room.priceCents * input.guests;
    tx.insert(bookings)
      .values({
        id,
        reference: bookingReference(),
        userId: input.userId,
        retreatId: retreat.id,
        roomId: room.id,
        guests: input.guests,
        status: "held",
        paymentPlan: input.paymentPlan,
        totalCents,
        contact: input.contact,
        holdExpiresAt: new Date(Date.now() + HOLD_MINUTES * 60 * 1000),
      })
      .run();
    return { bookingId: id, retreat, room, totalCents };
  });
}

export function bookingWithDetails(bookingId: string) {
  const db = getDb();
  return (
    db
      .select({ booking: bookings, retreat: retreats, room: retreatRooms })
      .from(bookings)
      .innerJoin(retreats, eq(retreats.id, bookings.retreatId))
      .innerJoin(retreatRooms, eq(retreatRooms.id, bookings.roomId))
      .where(eq(bookings.id, bookingId))
      .get() ?? null
  );
}

export function myBookings(userId: string) {
  return getDb()
    .select({ booking: bookings, retreat: retreats, room: retreatRooms })
    .from(bookings)
    .innerJoin(retreats, eq(retreats.id, bookings.retreatId))
    .innerJoin(retreatRooms, eq(retreatRooms.id, bookings.roomId))
    .where(and(eq(bookings.userId, userId), inArray(bookings.status, ["confirmed", "cancelled", "held"])))
    .orderBy(asc(retreats.startDate))
    .all()
    .filter((r) => r.booking.status !== "held" || (r.booking.holdExpiresAt && r.booking.holdExpiresAt > new Date()));
}

/** Member cancels a booking. Refunds are handled by the school (test mode: recorded only). */
export function cancelBooking(bookingId: string, userId: string) {
  const db = getDb();
  return db.transaction((tx) => {
    const b = tx.select().from(bookings).where(eq(bookings.id, bookingId)).get();
    if (!b || b.userId !== userId) throw new BookingError("Booking not found.");
    if (b.status === "cancelled") return b;
    if (b.status !== "confirmed" && b.status !== "held") throw new BookingError("This booking can't be cancelled.");
    tx.update(bookings).set({ status: "cancelled", cancelledAt: new Date() }).where(eq(bookings.id, bookingId)).run();
    audit(userId, "booking.cancelled", bookingId, { reference: b.reference, paidCents: b.paidCents });
    return b;
  });
}
