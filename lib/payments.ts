import { randomBytes } from "node:crypto";
import { and, desc, eq, gt, inArray, or, sql } from "drizzle-orm";
import { audit } from "./audit";
import { getDb } from "./db";
import { bookings, courses, enrollments, orders, retreatRooms, subscriptions, type Order, type OrderKind } from "./db/schema";
import { env } from "./env";
import { newId } from "./ids";
import { INITIATE_PRICES, type BillingInterval } from "./plans";

/**
 * Payment provider boundary. Only the local test provider exists today: it never
 * moves money. A Stripe provider would implement the same two steps (create a
 * checkout, confirm via webhook) and call `fulfilOrder` on success.
 */
export class PaymentError extends Error {}

export function createOrder(input: { userId: string; kind: OrderKind; refId: string; description: string; amountCents: number }) {
  if (env.paymentsProvider() !== "local-test") {
    throw new PaymentError("Only the local test payment provider is configured.");
  }
  if (!Number.isInteger(input.amountCents) || input.amountCents <= 0) throw new PaymentError("Invalid amount.");
  const db = getDb();
  // Reuse an open order for the same thing rather than piling up duplicates.
  const open = db
    .select()
    .from(orders)
    .where(
      and(
        eq(orders.userId, input.userId),
        eq(orders.kind, input.kind),
        eq(orders.refId, input.refId),
        eq(orders.status, "pending"),
        eq(orders.amountCents, input.amountCents),
      ),
    )
    .get();
  if (open) return open;
  const order = {
    id: newId("ord"),
    userId: input.userId,
    kind: input.kind,
    refId: input.refId,
    description: input.description,
    amountCents: input.amountCents,
    currency: "USD",
    status: "pending" as const,
    provider: "local-test",
  };
  db.insert(orders).values(order).run();
  audit(input.userId, "order.created", order.id, { kind: input.kind, amountCents: input.amountCents });
  return db.select().from(orders).where(eq(orders.id, order.id)).get()!;
}

export function checkoutUrl(order: Pick<Order, "id">) {
  return `/checkout/${order.id}`;
}

export function getOrderForUser(orderId: string, userId: string) {
  return getDb().select().from(orders).where(and(eq(orders.id, orderId), eq(orders.userId, userId))).get() ?? null;
}

/**
 * Marks an order paid and grants what was bought, in one transaction.
 * Safe to call twice: a paid order is returned unchanged.
 */
export function fulfilOrder(orderId: string, userId: string): Order {
  const db = getDb();
  const LAPSED = Symbol("lapsed");
  const result = db.transaction((tx): Order | typeof LAPSED => {
    const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order || order.userId !== userId) throw new PaymentError("Order not found.");
    if (order.status === "paid") return order;
    if (order.status !== "pending") throw new PaymentError("This order is no longer open.");

    const now = new Date();
    if (order.kind === "course") {
      const course = tx.select().from(courses).where(eq(courses.id, order.refId)).get();
      if (!course) throw new PaymentError("Course not found.");
      tx.insert(enrollments).values({ id: newId("enr"), userId, courseId: course.id, orderId: order.id }).onConflictDoNothing().run();
    } else if (order.kind === "retreat") {
      const booking = tx.select().from(bookings).where(eq(bookings.id, order.refId)).get();
      if (!booking || booking.userId !== userId) throw new PaymentError("Booking not found.");
      if (booking.status === "confirmed") {
        // Paying the remaining balance on a deposit booking.
        const paid = Math.min(booking.totalCents, booking.paidCents + order.amountCents);
        tx.update(bookings).set({ paidCents: paid }).where(eq(bookings.id, booking.id)).run();
      } else if (booking.status === "held" || booking.status === "expired") {
        if (booking.status === "expired" || !booking.holdExpiresAt || booking.holdExpiresAt < now) {
          // Hold lapsed: confirm only if the places are still free.
          const room = tx.select().from(retreatRooms).where(eq(retreatRooms.id, booking.roomId)).get();
          const taken = Number(
            tx
              .select({ n: sql<number>`coalesce(sum(${bookings.guests}), 0)` })
              .from(bookings)
              .where(
                and(
                  eq(bookings.roomId, booking.roomId),
                  sql`${bookings.id} != ${booking.id}`,
                  or(eq(bookings.status, "confirmed"), and(eq(bookings.status, "held"), gt(bookings.holdExpiresAt, now))),
                ),
              )
              .get()?.n ?? 0,
          );
          // Returned (not thrown) so the cancellation below isn't rolled back with the transaction.
          if (!room || room.capacity - taken < booking.guests) return LAPSED;
        }
        tx.update(bookings)
          .set({ status: "confirmed", confirmedAt: now, paidCents: Math.min(booking.totalCents, order.amountCents), orderId: order.id, holdExpiresAt: null })
          .where(eq(bookings.id, booking.id))
          .run();
      } else {
        throw new PaymentError("This booking was cancelled.");
      }
    } else if (order.kind === "subscription") {
      const interval = order.refId.split(":")[1] as BillingInterval;
      const days = interval === "year" ? 365 : 30;
      const current = tx
        .select()
        .from(subscriptions)
        .where(and(eq(subscriptions.userId, userId), eq(subscriptions.status, "active"), gt(subscriptions.currentPeriodEnd, now)))
        .orderBy(desc(subscriptions.currentPeriodEnd))
        .get();
      if (current) {
        const from = current.currentPeriodEnd > now ? current.currentPeriodEnd : now;
        tx.update(subscriptions)
          .set({ currentPeriodEnd: new Date(from.getTime() + days * 86_400_000), interval, cancelAtPeriodEnd: false, orderId: order.id })
          .where(eq(subscriptions.id, current.id))
          .run();
      } else {
        tx.insert(subscriptions)
          .values({
            id: newId("sub"),
            userId,
            plan: "initiate",
            interval,
            status: "active",
            currentPeriodEnd: new Date(now.getTime() + days * 86_400_000),
            orderId: order.id,
          })
          .run();
      }
    }

    tx.update(orders)
      .set({ status: "paid", paidAt: now, providerRef: `test_${randomBytes(8).toString("hex")}` })
      .where(eq(orders.id, order.id))
      .run();
    audit(userId, "order.paid", order.id, { kind: order.kind, amountCents: order.amountCents, provider: order.provider });
    return tx.select().from(orders).where(eq(orders.id, order.id)).get()!;
  });
  if (result === LAPSED) {
    db.transaction((tx) => {
      tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId)).run();
      const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
      if (order) tx.update(bookings).set({ status: "expired" }).where(and(eq(bookings.id, order.refId), eq(bookings.status, "held"))).run();
    });
    throw new PaymentError("Your hold expired and those places have since been taken. Nothing was charged.");
  }
  return result;
}

export function cancelOrder(orderId: string, userId: string) {
  const db = getDb();
  db.transaction((tx) => {
    const order = tx.select().from(orders).where(eq(orders.id, orderId)).get();
    if (!order || order.userId !== userId || order.status !== "pending") return;
    tx.update(orders).set({ status: "cancelled" }).where(eq(orders.id, orderId)).run();
    if (order.kind === "retreat") {
      tx.update(bookings).set({ status: "expired" }).where(and(eq(bookings.id, order.refId), eq(bookings.status, "held"))).run();
    }
  });
}

export function subscriptionOrderRef(interval: BillingInterval) {
  return { refId: `initiate:${interval}`, amountCents: INITIATE_PRICES[interval].cents };
}

export function myOrders(userId: string) {
  return getDb()
    .select()
    .from(orders)
    .where(and(eq(orders.userId, userId), inArray(orders.status, ["paid", "refunded"])))
    .orderBy(desc(orders.createdAt))
    .all();
}
