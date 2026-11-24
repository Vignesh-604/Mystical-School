import assert from "node:assert/strict";
import { test } from "node:test";
import { and, eq } from "drizzle-orm";
import * as s from "../lib/db/schema";
import { chatAllowance, limitsFor, planFor, recordUsage, refundUsage } from "../lib/membership";
import { createOrder, fulfilOrder, PaymentError, subscriptionOrderRef } from "../lib/payments";
import { PLANS } from "../lib/plans";
import { freshDb, makeCourse, makeUser } from "./helpers";

const db = freshDb("payments");

test("buying a course enrols once, even if fulfilment runs twice", () => {
  const user = makeUser();
  const courseId = makeCourse();
  const order = createOrder({ userId: user, kind: "course", refId: courseId, description: "c", amountCents: 5000 });
  const first = fulfilOrder(order.id, user);
  const second = fulfilOrder(order.id, user);
  assert.equal(first.status, "paid");
  assert.equal(second.providerRef, first.providerRef);
  const enrolled = db.select().from(s.enrollments).where(and(eq(s.enrollments.userId, user), eq(s.enrollments.courseId, courseId))).all();
  assert.equal(enrolled.length, 1);
});

test("open orders are reused rather than duplicated", () => {
  const user = makeUser();
  const courseId = makeCourse();
  const a = createOrder({ userId: user, kind: "course", refId: courseId, description: "c", amountCents: 5000 });
  const b = createOrder({ userId: user, kind: "course", refId: courseId, description: "c", amountCents: 5000 });
  assert.equal(a.id, b.id);
});

test("only the order's owner can complete it", () => {
  const owner = makeUser();
  const order = createOrder({ userId: owner, kind: "course", refId: makeCourse(), description: "c", amountCents: 5000 });
  assert.throws(() => fulfilOrder(order.id, makeUser()), PaymentError);
});

test("membership upgrades the plan, and renewing extends the period", () => {
  const user = makeUser();
  assert.equal(planFor(user), "seeker");
  const { refId, amountCents } = subscriptionOrderRef("month");
  fulfilOrder(createOrder({ userId: user, kind: "subscription", refId, description: "m", amountCents }).id, user);
  assert.equal(planFor(user), "initiate");
  assert.equal(limitsFor(user).chatMessagesPerDay, PLANS.initiate.limits.chatMessagesPerDay);
  const firstEnd = db.select().from(s.subscriptions).where(eq(s.subscriptions.userId, user)).get()!.currentPeriodEnd.getTime();

  const again = createOrder({ userId: user, kind: "subscription", refId, description: "m2", amountCents });
  fulfilOrder(again.id, user);
  const subs = db.select().from(s.subscriptions).where(eq(s.subscriptions.userId, user)).all();
  assert.equal(subs.length, 1);
  assert.ok(subs[0]!.currentPeriodEnd.getTime() > firstEnd + 29 * 86_400_000);
});

test("free plan message allowance counts down and refunds work", () => {
  const user = makeUser();
  const limit = PLANS.seeker.limits.chatMessagesPerDay;
  assert.equal(chatAllowance(user).remaining, limit);
  const ids = Array.from({ length: limit }, () => recordUsage(user, "chat_message", 1));
  assert.equal(chatAllowance(user).remaining, 0);
  refundUsage(ids[0]!);
  assert.equal(chatAllowance(user).remaining, 1);
});

test("rejects invalid amounts", () => {
  assert.throws(() => createOrder({ userId: makeUser(), kind: "course", refId: makeCourse(), description: "c", amountCents: 0 }), PaymentError);
});
